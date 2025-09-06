from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_reviews():
    """
    Get reviews (placeholder).
    """
    return {"message": "Reviews endpoint - coming soon"}

@router.post("/")
async def create_review():
    """
    Create review (placeholder).
    """
    return {"message": "Create review - coming soon"}