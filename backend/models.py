from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Text
from database import Base

class User(Base) :
    __tablename__ = "users"
    
    id = Column(Integer, index=True, primary_key=True)
    fullname = Column(String)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    status = Column(String, nullable=False, default="Active")
    created_at = Column(DateTime, server_default=func.now())
    
    
class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    otp = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    
    
class Topic(Base) :
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    
    
class Question(Base):
    __tablename__ = "question"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question = Column(Text, nullable=False)

    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True, default="")
    solution = Column(Text, nullable=True, default="")

    difficulty = Column(String, default="medium")