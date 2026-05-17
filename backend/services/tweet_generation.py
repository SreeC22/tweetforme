import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ── System prompt built from voice profile ────────────────────────────────

def build_system_prompt(voice_profile: dict) -> str:
    return f"""You are a ghostwriter for @{voice_profile['handle']}. Write exactly like them.

WHO THEY ARE:
{voice_profile['summary']}

HOW THEY OPEN TWEETS:
{chr(10).join(f'- {p}' for p in voice_profile['hook_patterns'])}

PHRASES THEY USE: {', '.join(voice_profile['phrases_they_use'])}

NEVER WRITE: {', '.join(voice_profile['phrases_to_avoid'])}

THEIR TWEET STRUCTURES:
{chr(10).join(f'- {s}' for s in voice_profile['tweet_structures'])}

WHAT PERFORMS BEST FOR THEM:
{voice_profile['what_performs_best']}

RULES:
- Stay under 260 characters unless writing a thread opener (ends with ↓ or 🧵)
- First person only
- Match their energy exactly — not more polished, not more casual
- Mirror their punctuation habits, capitalization style, and emoji density
- Never use em dashes
- Never start with "I think" or "Hot take:"
- Never sound like a LinkedIn post"""


GENERATION_PROMPT = """Generate {count} tweets for @{handle} this week.

Categories to cover: {categories}
Target audiences: {demographics}

{material_section}

Examples of their best-performing tweets (for tone reference):
{example_tweets}

Return a JSON array:
[
  {{
    "text": "the tweet text",
    "category": "tech | crypto | writing | humor | personal | science | fandom",
    "hook_type": "what makes the opening work",
    "why_it_fits": "one sentence on why this sounds like them"
  }}
]

Vary hook styles and structures across the batch.
Include at least one thread opener and one question.
Return only valid JSON. No markdown fences."""


# ── Main generation function ──────────────────────────────────────────────

async def generate_tweets(
    voice_profile: dict,
    categories: list[str],
    demographics: list[str],
    top_performers: list[dict],
    material: str | None = None,
    count: int = 7,
) -> list[dict]:

    system_prompt = build_system_prompt(voice_profile)

    example_block = "\n".join(
        f'- "{t["text"]}"'
        for t in sorted(top_performers, key=lambda x: x["eng_score"], reverse=True)[:10]
    )

    material_section = (
        f"Use this as source material:\n{material}"
        if material
        else "No specific material — generate from their usual topics and voice."
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": GENERATION_PROMPT.format(
                handle=voice_profile["handle"],
                count=count,
                categories=", ".join(categories),
                demographics=", ".join(demographics),
                material_section=material_section,
                example_tweets=example_block,
            ),
        }],
    )

    return json.loads(response.content[0].text)
