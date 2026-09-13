from pydantic import BaseModel, EmailStr

class registerReq(BaseModel) :
    fullname : str
    email : EmailStr
    password : str
    role : str
    status : str
    
    
class loginReq(BaseModel) :
    email : EmailStr
    password : str
  
  
class sendOTPReq(BaseModel) :
    email : EmailStr
    
    
class verifyOTPReq(BaseModel) :
    email : EmailStr
    otp : str

    
class userUpdate(BaseModel):
    fullname: str
    email: EmailStr
    password: str | None = None
    
    
class adminUpdate(BaseModel):
    fullname: str
    email: EmailStr
    password: str | None = None
    

class topicReq(BaseModel) :
    name : str
    
    
class questionReq(BaseModel) :
    topic_id : int
    question : str
    option_a : str
    option_b : str
    option_c : str
    option_d : str
    correct_answer : str
    explanation : str | None = ""
    solution : str | None = ""
    difficulty : str


class aiGenerateReq(BaseModel):
    topic_id : int
    topic_name : str
    difficulty : str = "Medium"
    count : int = 3


