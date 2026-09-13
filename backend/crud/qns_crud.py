from models import Topic, Question
from fastapi import HTTPException

def get_topic(db) :
    t = db.query(Topic).all()
    return t


def add_topic(topic, db) :
    newTopic = Topic(name = topic.name)
    
    db.add(newTopic)
    db.commit()
    db.refresh(newTopic)
    
    return newTopic


def update_topic(topic_id, topic, db) :
    existing_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    
    if existing_topic is None :
        raise HTTPException(
            status_code=401,
            detail="Topic Not found"
        )
        
    existing_topic.name = topic.name
    
    db.commit()
    db.refresh(existing_topic)
    return existing_topic
    
    
def delete_topic(tid, db) :
    existing_topic = db.query(Topic).filter(Topic.id == tid).first()
        
    if existing_topic is None :
        raise HTTPException(
            status_code=404,
            detail="Topic Not found"
        )
        
    db.query(Question).filter(Question.topic_id == tid).delete()
    db.delete(existing_topic)
    db.commit()
    
    return {"message": "Topic Deleted"}
          
            

def get_all_questions(db):
    questions = db.query(Question).all()
    topics = {t.id: t.name for t in db.query(Topic).all()}
    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "topic_id": q.topic_id,
            "topic": topics.get(q.topic_id, "Unknown"),
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation or "",
            "solution": q.solution or "",
            "difficulty": q.difficulty
        })
    return result


def get_topic_que(topic_id, db) :
    q = db.query(Question).filter(Question.topic_id == topic_id).all()
    return q

    
def add_topic_question(que, db) :
    newQue = Question(
        topic_id = que.topic_id,
        question = que.question,
        option_a = que.option_a,
        option_b = que.option_b,
        option_c = que.option_c,
        option_d = que.option_d,
        correct_answer = que.correct_answer,
        explanation = que.explanation or "",
        solution = que.solution or "",
        difficulty = que.difficulty
    )
    
    db.add(newQue)
    db.commit()
    db.refresh(newQue)
    
    return newQue


def update_topic_que(qid, que, db) :
    existing_ques = db.query(Question).filter(Question.id == qid).first()
        
    if existing_ques is None :
        raise HTTPException(
            status_code=404,
            detail="Question Not found"
        )
        
    existing_ques.topic_id = que.topic_id
    existing_ques.question = que.question
    existing_ques.option_a = que.option_a
    existing_ques.option_b = que.option_b
    existing_ques.option_c = que.option_c
    existing_ques.option_d = que.option_d
    existing_ques.correct_answer = que.correct_answer
    existing_ques.explanation = que.explanation or ""
    existing_ques.solution = que.solution or ""
    existing_ques.difficulty = que.difficulty
    
    db.commit()
    db.refresh(existing_ques)
    
    return existing_ques

        
def delete_topic_que(qid, db) :
    existing_ques = db.query(Question).filter(Question.id == qid).first()
        
    if existing_ques is None :
        raise HTTPException(
            status_code=404,
            detail="Question Not found"
        )
        
    db.delete(existing_ques)
    db.commit()
    return {"message": "Question Deleted"}

    
 
    