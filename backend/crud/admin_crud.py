from models import User, Topic, Question
from fastapi import HTTPException
from argon2 import PasswordHasher

ph = PasswordHasher()

def admin_profile(db) :
    return db.query(User).filter(User.role == "admin").first()


def total_user(db) :
    return db.query(User).filter(User.role != "admin").count()


def total_topic(db) :
    return db.query(Topic).count()


def total_question_per_topic(tid, db) :
    return db.query(Question).filter(Question.topic_id == tid).count()


def admin_profile_update(admin, admin_id, db) :
    existingAdmin = db.query(User).filter(User.id == admin_id).first()
    
    if existingAdmin is None:
        raise HTTPException(
            status_code=404,
            detail="Admin not found"
        )
    
    if admin.email != existingAdmin.email:
        email_check = db.query(User).filter(User.email == admin.email, User.id != admin_id).first()
        if email_check:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered by another account"
            )

    existingAdmin.fullname = admin.fullname
    existingAdmin.email = admin.email
    
    if admin.password and admin.password.strip():
        existingAdmin.password_hash = ph.hash(admin.password)
    
    db.commit()
    db.refresh(existingAdmin)
    
    return {
        "id" : existingAdmin.id,
        "name" : existingAdmin.fullname,
        "email" : existingAdmin.email,
        "role" : existingAdmin.role,
        "status" : existingAdmin.status,
        "created_at" : existingAdmin.created_at
    }
   

def total_questions(db):
   return db.query(Question).count()


def get_all_users(db):
    users = db.query(User).filter(User.role != "admin").all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "fullname": u.fullname,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at
        })
    return result


def update_user_status(user_id, status, db):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = status
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "fullname": user.fullname,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "created_at": user.created_at
    }
