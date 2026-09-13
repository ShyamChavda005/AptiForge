
from crud import user_crud

def register_user(user, db) :
    return user_crud.register_user(user, db)


def login_user(user, db) :
    return user_crud.login_user(user, db)


def verify_otp(email, otp, db) :
    return user_crud.verify_otp(email, otp, db)


def user_profile(user_id, db) :
    return user_crud.user_profile(user_id, db)


def user_profile_update(user_id, user, db) :
    return user_crud.user_profile_update(user_id, user, db)