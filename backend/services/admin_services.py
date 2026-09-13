
from crud import admin_crud

def admin_profile(db) :
    return admin_crud.admin_profile(db)
    

def admin_profile_update(admin, aid, db) :
    return admin_crud.admin_profile_update(admin, aid, db)


def total_user(db) :
    return admin_crud.total_user(db)
    

def total_topic(db) :
    return admin_crud.total_topic(db)


def total_question_per_topic(tid, db) :
    return admin_crud.total_question_per_topic(tid, db)


def total_questions(db):
    return admin_crud.total_questions(db)


def get_all_users(db):
    return admin_crud.get_all_users(db)


def update_user_status(user_id, status, db):
    return admin_crud.update_user_status(user_id, status, db)

