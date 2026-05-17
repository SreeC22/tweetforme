from fastapi import APIRouter, HTTPException
from services.twitter_fetch import fetch_tweets
from services.voice_analysis import analyze_voice, load_cached_profile, save_cached_profile, bust_cache

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/{handle}")
async def get_voice_profile(handle: str):
    """Return the cached voice profile for a handle."""
    profile = load_cached_profile(handle.lstrip("@"))
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="No voice profile yet. Call POST /generate/ first."
        )
    return profile


@router.post("/{handle}/retrain")
async def retrain_voice(handle: str):
    """Force re-fetch tweets and rebuild the voice profile from scratch."""
    handle = handle.lstrip("@")
    bust_cache(handle)

    tweets = await fetch_tweets(handle, max_tweets=200)
    if not tweets:
        raise HTTPException(status_code=400, detail=f"No public tweets found for @{handle}")

    profile = await analyze_voice(handle, tweets)
    save_cached_profile(handle, profile)

    return {"ok": True, "profile": profile}
