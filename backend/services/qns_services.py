from crud import qns_crud

def get_all_topic(db) :
    return qns_crud.get_topic(db)

def add_topic(topic, db) :
    return qns_crud.add_topic(topic, db)

def update_topic(topic_id, topic, db):
    return qns_crud.update_topic(topic_id, topic, db)

def delete_topic(topic_id, db):
    return qns_crud.delete_topic(topic_id, db)


def get_all_questions(db):
    return qns_crud.get_all_questions(db)


def get_que(topic_id, db) :
    return qns_crud.get_topic_que(topic_id, db)

def add_que_topic(que, db) :
    return qns_crud.add_topic_question(que, db)

def update_topic_que(qid, que, db) :
    return qns_crud.update_topic_que(qid,que,db)
        
def delete_topic_que(qid, db) :
    return qns_crud.delete_topic_que(qid, db)