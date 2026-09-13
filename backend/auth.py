import jwt
from datetime import datetime, timezone, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException

oauth_scheme = OAuth2PasswordBearer(tokenUrl="login/users")

secret_key = "my-secret-jwt-key"

def create_token(uid : int, role : str) :
    
    payload = {
        "uid" : uid,
        "role" : role,
        "exp" : datetime.now(timezone.utc) + timedelta(days=1)
    }
    
    token = jwt.encode(payload, secret_key, algorithm="HS256")
 
    return token


def verify_token(token : str) :
    try :
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload.get("uid")
    
    except Exception as e :
        return None
    

def identify_user(token : str = Depends(oauth_scheme)) :
     user_id = verify_token(token)
     
     if user_id is None :
          raise HTTPException (
               status_code=401,
               detail="User not identify by its token"
          )
     
     return user_id
    