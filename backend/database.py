from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:root@localhost:9000/aptiforge")

engine = create_engine(DATABASE_URL)

def check_connection() :
    try  :
        with engine.connect() as connection:
            print("Success: database connected !")
    except Exception as e:
        print("not connnected") 
        print(e)
        
check_connection()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

def get_db() :
    db = SessionLocal()
    try :
        yield db
    finally :
        db.close()
    
    
    
    
    

