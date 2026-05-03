from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import time
import uuid

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    options: List[str]
    correct_option_index: int

class User(BaseModel):
    nickname: str
    token: str
    score: int = 0
    connected: bool = True

class SessionState(BaseModel):
    session_code: str
    admin_token: str
    questions: List[Question]
    current_question_index: int = -1  # -1 means not started
    is_active: bool = True
    start_time: float = Field(default_factory=time.time)
    question_reveal_time: Optional[float] = None
    users: Dict[str, User] = {}  # token -> User
    votes: Dict[str, int] = {}  # user_token -> option_index

class VoteRequest(BaseModel):
    session_code: str
    user_token: str
    option_index: int

class CreateSessionRequest(BaseModel):
    admin_token: str
    questions: List[Question]
