from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import *
from services import user_services
from auth import identify_user

router = APIRouter()

# Register
@router.post("/users") 
def register_user(user : registerReq, db : Session = Depends(get_db)) :
     return user_services.register_user(user, db)


# Login
@router.post("/login/users") 
def login_user(user : loginReq, db : Session = Depends(get_db)) :
     return user_services.login_user(user, db) 


# Verify OTP
@router.post("/login/verify-otp")
def verify_otp(data : verifyOTPReq, db : Session = Depends(get_db)) :
     return user_services.verify_otp(data.email, data.otp, db)


# User Profile
@router.get("/profile")
def user_profile(user_id : int = Depends(identify_user), db : Session = Depends(get_db)) :
     return user_services.user_profile(user_id, db)
    
    
# User Profile Update
@router.put("/profile")
def user_profile_update(user : userUpdate, user_id : int = Depends(identify_user), db : Session = Depends(get_db)) :
     return user_services.user_profile_update(user_id, user, db)


