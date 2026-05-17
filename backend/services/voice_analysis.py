import os
import json
import anthropic
from dotenv import load_dotenv
from services.twitter_fetch import preprocess_tweets, format_tweets_for_prompt

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ── Cache (file-based for now, swap for Redis in prod) ────────────────────

def _cache_path(handle: str) -> str:
    return f"/tmp/echo_voice_{handle.lower()}.json"

def load_cached_profile(handle: str) -> dict | None:
    path = _cache_path(handle)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return None

def save_cached_profile(handle: str, profile: dict) -> None:
    with open(_cache_path(handle), "w") as f:
        json.dump(profile, f)

def bust_cache(handle: str) -> None:
    path = _cache_path(handle)
    if os.path.exists(path):
        os.remove(path)


# ── Prompts ───────────────────────────────────────────────────────────────

ANALYSIS_SYSTEM = """You are an expert at analyzing writing style and social media voice.
Study a creator's tweets and extract the precise patterns that make their voice unique.
Be specific — vague descriptions produce generic output.
Your analysis directly controls how an AI ghostwriter will write for this person."""

ANALYSIS_PROMPT = """Study these tweets from @{handle} and build their voice profile.

{tweet_block}

Return a JSON object with exactly these fields:

{{
  "archetype": "one short label e.g. 'Dry Founder', 'Crypto Degen', 'Builder Poet', 'Tech Educator'",

  "summary": "3-4 sentences describing their voice precisely. Include sentence structure they prefer,
               humor style if any, topics they gravitate to, and how they open tweets.
               Be specific enough that an AI cannot default to generic content.",

  "hook_patterns": [
    "3 specific ways they open tweets, each with a brief example"
  ],

  "phrases_they_use": ["5-8 actual phrases, words, or constructions they repeat"],

  "phrases_to_avoid": ["5 phrases that would sound unlike them — corporate speak, AI tells, etc."],

  "topics": ["6-8 topics they write about most"],

  "tone_scores": {{
    "formality": 0,
    "humor": 0,
    "vulnerability": 0,
    "technical_depth": 0,
    "contrarianism": 0
  }},

  "tweet_structures": [
    "3 structural patterns they use e.g. 'One bold claim. Short follow-up. Emoji.'"
  ],

  "what_performs_best": "one paragraph on what their highest-engagement tweets have in common"
}}

Return only valid JSON. No markdown fences."""


# ── Main function ─────────────────────────────────────────────────────────

async def analyze_voice(handle: str, tweets: list[dict]) -> dict:
    preprocessed = preprocess_tweets(tweets)
    tweet_block = format_tweets_for_prompt(preprocessed)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=ANALYSIS_SYSTEM,
        messages=[{
            "role": "user",
            "content": ANALYSIS_PROMPT.format(handle=handle, tweet_block=tweet_block),
        }],
    )

    profile = json.loads(response.content[0].text)
    profile["handle"] = handle
    profile["tweets_analyzed"] = preprocessed["total_analyzed"]
    return profile


# ── Feedback loop ─────────────────────────────────────────────────────────

FEEDBACK_PROMPT = """A ghostwriter has been generating tweets for @{handle}.
The user rejected tweets with these reasons (most frequent first):

{rejection_summary}

Their current NEVER WRITE list is:
{current_avoid}

Update the NEVER WRITE list to incorporate these rejections.
Add specific patterns, not vague rules.
Return only the updated list as a JSON array of strings."""

def update_voice_from_feedback(voice_profile: dict, rejection_tags: list[str]) -> dict:
    from collections import Counter
    counts = Counter(rejection_tags)
    rejection_summary = "\n".join(
        f"- '{tag}' × {n}" for tag, n in counts.most_common()
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": FEEDBACK_PROMPT.format(
                handle=voice_profile["handle"],
                rejection_summary=rejection_summary,
                current_avoid=", ".join(voice_profile.get("phrases_to_avoid", [])),
            ),
        }],
    )

    voice_profile["phrases_to_avoid"] = json.loads(response.content[0].text)
    return voice_profile
