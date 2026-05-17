import os
import httpx
from dotenv import load_dotenv

load_dotenv()

BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")


async def get_user_id(handle: str) -> str:
    handle = handle.lstrip("@")
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"https://api.twitter.com/2/users/by/username/{handle}",
            headers={"Authorization": f"Bearer {BEARER_TOKEN}"},
        )
        r.raise_for_status()
        return r.json()["data"]["id"]


async def fetch_tweets(handle: str, max_tweets: int = 200) -> list[dict]:
    user_id = await get_user_id(handle)
    tweets = []
    pagination_token = None

    async with httpx.AsyncClient() as client:
        while len(tweets) < max_tweets:
            params = {
                "max_results": 100,
                "tweet.fields": "public_metrics,created_at,text",
                "exclude": "retweets,replies",
            }
            if pagination_token:
                params["pagination_token"] = pagination_token

            r = await client.get(
                f"https://api.twitter.com/2/users/{user_id}/tweets",
                headers={"Authorization": f"Bearer {BEARER_TOKEN}"},
                params=params,
            )
            r.raise_for_status()
            data = r.json()

            batch = data.get("data", [])
            if not batch:
                break

            for t in batch:
                if len(t["text"]) < 20:
                    continue
                m = t.get("public_metrics", {})
                tweets.append({
                    "text": t["text"],
                    "likes": m.get("like_count", 0),
                    "replies": m.get("reply_count", 0),
                    "retweets": m.get("retweet_count", 0),
                    "impressions": m.get("impression_count", 0),
                    "created_at": t["created_at"],
                })

            pagination_token = data.get("meta", {}).get("next_token")
            if not pagination_token:
                break

    return tweets[:max_tweets]


def preprocess_tweets(tweets: list[dict]) -> dict:
    for t in tweets:
        impr = t["impressions"] or 1
        t["eng_score"] = (
            (t["likes"] * 3) + (t["replies"] * 5) + (t["retweets"] * 2)
        ) / impr * 1000

    ranked = sorted(tweets, key=lambda x: x["eng_score"], reverse=True)
    recent = sorted(tweets, key=lambda x: x["created_at"], reverse=True)[:20]

    seen, top_performers = set(), []
    for t in ranked:
        key = t["text"][:40]
        if key not in seen:
            seen.add(key)
            top_performers.append(t)
        if len(top_performers) == 30:
            break

    return {
        "top_performers": top_performers,
        "recent": recent,
        "total_analyzed": len(tweets),
        "avg_likes": sum(t["likes"] for t in tweets) / len(tweets) if tweets else 0,
    }


def format_tweets_for_prompt(preprocessed: dict) -> str:
    lines = ["=== TOP PERFORMING TWEETS ===\n"]
    for t in preprocessed["top_performers"]:
        lines.append(f"[❤️{t['likes']} 💬{t['replies']} 🔁{t['retweets']}]  {t['text']}\n")
    lines.append("\n=== RECENT TWEETS ===\n")
    for t in preprocessed["recent"]:
        lines.append(f"{t['text']}\n")
    return "\n".join(lines)
