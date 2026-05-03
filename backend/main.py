import os
import random
import string
import time
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.exceptions import ClientError
from models import Question, User, SessionState, VoteRequest, CreateSessionRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin token from ENV
ADMIN_SECRET = os.getenv("ADMIN_TOKEN", "supersecret")

# DynamoDB Setup
dynamodb = boto3.resource('dynamodb', region_name=os.getenv("AWS_REGION", "us-east-1"))
RESULTS_TABLE = os.getenv("RESULTS_TABLE", "QuizResults")

# In-memory storage
sessions: Dict[str, SessionState] = {}
# session_code -> { user_token: WebSocket }
connections: Dict[str, Dict[str, WebSocket]] = {}
# session_code -> admin WebSocket
admin_connections: Dict[str, WebSocket] = {}

def generate_session_code(length=4):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def calculate_score(reveal_time: float, current_time: float) -> int:
    elapsed = current_time - reveal_time
    score = int(1000 - (elapsed * 50))
    return max(100, score)

async def save_session_to_db(session: SessionState):
    try:
        table = dynamodb.Table(RESULTS_TABLE)
        results = [
            {"nickname": u.nickname, "score": u.score}
            for u in session.users.values()
        ]
        table.put_item(Item={
            'session_code': session.session_code,
            'timestamp': int(session.start_time),
            'results': results,
            'total_questions': len(session.questions)
        })
    except Exception as e:
        print(f"Error saving to DynamoDB: {e}")

async def broadcast_state(session_code: str):
    if session_code not in sessions:
        return
    
    state = sessions[session_code]
    
    public_state = {
        "session_code": state.session_code,
        "current_question_index": state.current_question_index,
        "users": [
            {"nickname": u.nickname, "score": u.score, "connected": u.connected}
            for u in state.users.values()
        ],
        "is_active": state.is_active,
        "total_questions": len(state.questions),
        "voted_count": len(state.votes)
    }
    
    if state.current_question_index >= 0:
        q = state.questions[state.current_question_index]
        public_state["current_question"] = {
            "text": q.text,
            "options": q.options,
            "id": q.id
        }

    if session_code in connections:
        for ws in connections[session_code].values():
            try:
                await ws.send_json({"type": "STATE_UPDATE", "data": public_state})
            except:
                pass

    if session_code in admin_connections:
        try:
            admin_state = public_state.copy()
            if state.current_question_index >= 0:
                admin_state["correct_option_index"] = state.questions[state.current_question_index].correct_option_index
            await admin_connections[session_code].send_json({"type": "STATE_UPDATE", "data": admin_state})
        except:
            pass

@app.post("/api/sessions")
async def create_session(req: CreateSessionRequest):
    if req.admin_token != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    code = generate_session_code()
    while code in sessions:
        code = generate_session_code()
        
    session = SessionState(
        session_code=code,
        admin_token=req.admin_token,
        questions=req.questions
    )
    sessions[code] = session
    return {"session_code": code}

@app.websocket("/ws/{session_code}")
async def websocket_endpoint(websocket: WebSocket, session_code: str, token: Optional[str] = None, is_admin: bool = False):
    await websocket.accept()
    
    if session_code not in sessions:
        await websocket.close(code=4004)
        return

    if is_admin:
        admin_connections[session_code] = websocket
    else:
        if not token:
            await websocket.close(code=4003)
            return
        
        if session_code not in connections:
            connections[session_code] = {}
        
        connections[session_code][token] = websocket
        if token in sessions[session_code].users:
            sessions[session_code].users[token].connected = True

    await broadcast_state(session_code)

    try:
        while True:
            data = await websocket.receive_json()
            session = sessions[session_code]
            
            if is_admin:
                if data["type"] == "NEXT_QUESTION":
                    if session.current_question_index < len(session.questions) - 1:
                        session.current_question_index += 1
                        session.question_reveal_time = time.time()
                        session.votes = {}
                        await broadcast_state(session_code)
                elif data["type"] == "END_SESSION":
                    session.is_active = False
                    await save_session_to_db(session)
                    await broadcast_state(session_code)
            else:
                if data["type"] == "VOTE":
                    user_token = data.get("user_token")
                    option_index = data.get("option_index")
                    
                    if user_token in session.users and user_token not in session.votes:
                        session.votes[user_token] = option_index
                        q = session.questions[session.current_question_index]
                        if option_index == q.correct_option_index:
                            points = calculate_score(session.question_reveal_time, time.time())
                            session.users[user_token].score += points
                        
                        await broadcast_state(session_code)

    except WebSocketDisconnect:
        if is_admin:
            if session_code in admin_connections:
                del admin_connections[session_code]
        else:
            if session_code in connections and token in connections[session_code]:
                del connections[session_code][token]
            if session_code in sessions and token in sessions[session_code].users:
                sessions[session_code].users[token].connected = False
        await broadcast_state(session_code)

@app.post("/api/sessions/{session_code}/join")
async def join_session(session_code: str, nickname: str):
    if session_code not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_code]
    user_token = str(uuid.uuid4())
    user = User(nickname=nickname, token=user_token)
    session.users[user_token] = user
    
    return {"token": user_token, "nickname": nickname}
