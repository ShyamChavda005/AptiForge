from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
@router.head("/health")
@router.get("/")
@router.head("/")
def health_check():
    return {"status": "ok"}
