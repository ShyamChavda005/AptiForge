from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import qns_services
from schemas import *

router = APIRouter()

@router.get("/topics")
def get_all_topic(db : Session = Depends(get_db)) :
    return qns_services.get_all_topic(db)


@router.post("/topics/add")
def add_topic(topic : topicReq, db : Session = Depends(get_db)) :
    return qns_services.add_topic(topic, db)


@router.put("/topics/update")
def update_topic(tid : int, topic : topicReq, db : Session = Depends(get_db)) :
    return qns_services.update_topic(tid, topic, db)


@router.delete("/topics/delete")
def delete_topic(topic_id: int, db : Session = Depends(get_db)) :
    return qns_services.delete_topic(topic_id, db)


@router.get("/questions")
def get_all_questions(db : Session = Depends(get_db)) :
    return qns_services.get_all_questions(db)


@router.get("/question/topic/{topic_id}")
def get_que(topic_id : int , db : Session = Depends(get_db)) :
    return qns_services.get_que(topic_id, db)


@router.post("/question/topic/add")
def add_ques_topic(que : questionReq, db : Session = Depends(get_db)) :
    return qns_services.add_que_topic(que, db)


@router.put("/question/topic/update")
def update_que_topic(qid : int, que : questionReq, db : Session = Depends(get_db)) :
    return qns_services.update_topic_que(qid, que, db)
    

@router.delete("/question/topic/delete")
def delete_que_topic(qid : int, db : Session = Depends(get_db)) :
    return qns_services.delete_topic_que(qid, db)
