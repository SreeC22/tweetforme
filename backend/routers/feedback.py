from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.voice_analysis import load_cached_profile, save_cached_profile, update_voice_from_feedback

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    handle: str
    tweet_text: str
    decision: str                       # "approved" | "rejected"
    rejection_tags: list[str] = []


class BulkFeedbackRequest(BaseModel):
    handle: str
    rejection_tags: list[str]


@router.post("/swipe")
async def swipe_feedback(req: FeedbackRequest):
    """Record a single swipe decision. Updates voice profile on rejection."""
    if req.decision not in ("approved", "rejected"):
        raise HTTPException(status_code=422, detail="decision must be 'approved' or 'rejected'")

    if req.decision == "rejected" and req.rejection_tags:
        profile = load_cached_profile(req.handle.lstrip("@"))
        if profile:
            updated = update_voice_from_feedback(profile, req.rejection_tags)
            save_cached_profile(req.handle.lstrip("@"), updated)

    return {"ok": True, "decision": req.decision}


@router.post("/session")
async def session_feedback(req: BulkFeedbackRequest):
    """Submit all rejection tags from a completed swipe session."""
    handle = req.handle.lstrip("@")
    profile = load_cached_profile(handle)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"No voice profile for @{handle}. Run POST /generate/ first."
        )

    updated = update_voice_from_feedback(profile, req.rejection_tags)
    save_cached_profile(handle, updated)

    return {
        "ok": True,
        "updated_avoid_list": updated["phrases_to_avoid"],
        "tags_processed": len(req.rejection_tags),
    }
