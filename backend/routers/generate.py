from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.twitter_fetch import fetch_tweets, preprocess_tweets
from services.voice_analysis import analyze_voice, load_cached_profile, save_cached_profile
from services.tweet_generation import generate_tweets

router = APIRouter(prefix="/generate", tags=["generation"])


class GenerateRequest(BaseModel):
    handle: str
    categories: list[str] = ["tech", "humor", "personal"]
    demographics: list[str] = ["Tech Twitter", "Startup founders"]
    material: str | None = None
    count: int = 7
    bust_cache: bool = False


@router.post("/")
async def generate(req: GenerateRequest):
    handle = req.handle.lstrip("@")

    # 1. Fetch tweets from Twitter
    tweets = await fetch_tweets(handle, max_tweets=200)
    if not tweets:
        raise HTTPException(status_code=400, detail=f"No public tweets found for @{handle}")

    # 2. Analyze voice — use cache if available
    voice_profile = None if req.bust_cache else load_cached_profile(handle)

    if not voice_profile:
        voice_profile = await analyze_voice(handle, tweets)
        save_cached_profile(handle, voice_profile)

    # 3. Generate tweet batch
    preprocessed = preprocess_tweets(tweets)
    generated = await generate_tweets(
        voice_profile=voice_profile,
        categories=req.categories,
        demographics=req.demographics,
        top_performers=preprocessed["top_performers"],
        material=req.material,
        count=req.count,
    )

    return {
        "voice_profile": voice_profile,
        "tweets": generated,
        "meta": {
            "handle": handle,
            "tweets_analyzed": preprocessed["total_analyzed"],
            "avg_likes": round(preprocessed["avg_likes"], 1),
            "voice_cached": not req.bust_cache,
        },
    }
