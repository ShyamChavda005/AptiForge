from models import *
from fastapi import HTTPException
from argon2 import PasswordHasher
from auth import create_token
from mail import send_otp_email
from random import randint
from datetime import datetime, timedelta

ph = PasswordHasher()

def register_user(user, db) :
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered. Please sign in instead."
        )

    hashed = ph.hash(user.password)
    
    newUser = User(
        fullname = user.fullname,
        email = user.email,
        password_hash = hashed,
        role = user.role,
        status = user.status
    )
    
    db.add(newUser)
    db.commit()
    db.refresh(newUser)
    
    return newUser


def verifypwd(hashed, userpwd) :
    try :
        return ph.verify(hashed, userpwd)
    except Exception as e :
        return False


def login_user(user, db) :
    existingUser =  db.query(User).filter(User.email == user.email).first()
    
    if existingUser is None :
        raise HTTPException(
            status_code= 401,
            detail="Invalid Email Crediantials"
        )
        
    if not verifypwd(existingUser.password_hash, user.password):
        raise HTTPException (
            status_code=401,
            detail="Invalid Password Crediantials"
        )

    if existingUser.status and existingUser.status.lower() == "blocked":
        raise HTTPException(
            status_code=403,
            detail="Your account has been blocked by administrator."
        )
        
    if existingUser.role == "admin" :
        token = create_token(existingUser.id, existingUser.role);
        
        return {
            "require_otp" : False,
            "token" : token
        }
        
    sent_otp(existingUser.email, db)
   
    return {
        "require_otp" : True,
        "message": "OTP sent successfully",
        "email": existingUser.email
    }



def sent_otp(data, db) :
    user = db.query(User).filter(User.email == data).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    otp = randint(100000, 999999)

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    new_otp = OTP(
        user_id=user.id,
        otp=str(otp),
        expires_at=expires_at
    )

    db.add(new_otp)
    db.commit()

    if not send_otp_email(data, otp):

        db.delete(new_otp)
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Unable to send OTP"
        )

    return {
        "message": "OTP sent successfully"
    }



def verify_otp(email, userotp, db) :
    
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    otp_record = (
        db.query(OTP)
        .filter(OTP.user_id == user.id)
        .order_by(OTP.created_at.desc())
        .first()
    )

    if otp_record is None:
        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if datetime.utcnow() > otp_record.expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if otp_record.otp != userotp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    db.delete(otp_record)
    db.commit()
    
    token = create_token(user.id, user.role)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


def user_profile(user_id, db) :
    user = db.query(User).filter(User.id == user_id).first()
    
    
    if user is None :
        raise HTTPException (
            status_code=404,
            detail="User not found"
        )
        
    return {
        "id" : user_id,
        "name" : user.fullname,
        "email" : user.email,
        "role" : user.role,
        "status" : user.status,
        "created_at" : user.created_at
    }
    

def user_profile_update(user_id, user, db) :
    existingUser = db.query(User).filter(User.id == user_id).first()
    
    if existingUser is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.email != existingUser.email:
        email_check = db.query(User).filter(User.email == user.email, User.id != user_id).first()
        if email_check:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered by another account"
            )

    existingUser.fullname = user.fullname
    existingUser.email = user.email
    
    if user.password and user.password.strip():
        existingUser.password_hash = ph.hash(user.password)
    
    db.commit()
    db.refresh(existingUser)
    
    return {
        "id" : existingUser.id,
        "name" : existingUser.fullname,
        "email" : existingUser.email,
        "role" : existingUser.role,
        "status" : existingUser.status,
        "created_at" : existingUser.created_at
    }