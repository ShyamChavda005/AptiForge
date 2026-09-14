from fastapi import APIRouter

router = APIRouter()

@router.get("")
@router.head("/health")
def health_check() :
    return {"status" : "ok"}