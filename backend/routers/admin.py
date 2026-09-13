from fastapi import APIRouter, Depends
from database import get_db
from sqlalchemy.orm import Session
from services import admin_services
from auth import identify_user
from schemas import adminUpdate, aiGenerateReq
from services import ai_service

router = APIRouter()

@router.get("/admin/profile")
def admin_profile(db : Session = Depends(get_db)) :
    return admin_services.admin_profile(db)


@router.put("/admin/update-profile")
def update_admin(admin : adminUpdate, aid : int = Depends(identify_user), db : Session = Depends(get_db)) :
    return admin_services.admin_profile_update(admin, aid, db)

@router.get("/admin/total-user")
def total_user(db : Session = Depends(get_db)) :
    return admin_services.total_user(db)


@router.get("/admin/total-topic")
def total_topic(db : Session = Depends(get_db)) :
    return admin_services.total_topic(db)


@router.get("/admin/total-questions")
def total_questions(db : Session = Depends(get_db)) :
    return admin_services.total_questions(db)


@router.get("/admin/total-question-topic")
def total_question_per_topic(tid : int, db : Session = Depends(get_db)) :
    return admin_services.total_question_per_topic(tid, db)


@router.get("/admin/users")
def get_all_users(db : Session = Depends(get_db)) :
    return admin_services.get_all_users(db)



@router.put("/admin/users/{user_id}/status")
def update_user_status(user_id: int, status: str, db: Session = Depends(get_db)):
    return admin_services.update_user_status(user_id, status, db)


@router.post("/admin/generate-questions")
def generate_questions(req: aiGenerateReq):
    return ai_service.generate_questions_ai(req.topic_id, req.topic_name, req.difficulty, req.count)



