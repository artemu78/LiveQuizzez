import pytest
import time
from main import calculate_score, generate_session_code
from models import Question, SessionState, User

def test_calculate_score_fast():
    reveal_time = time.time()
    current_time = reveal_time + 1 # 1 second later
    score = calculate_score(reveal_time, current_time)
    assert score == 950 # 1000 - (1 * 50)

def test_calculate_score_slow():
    reveal_time = time.time()
    current_time = reveal_time + 20 # 20 seconds later
    score = calculate_score(reveal_time, current_time)
    assert score == 100 # Min score

def test_generate_session_code():
    code = generate_session_code(4)
    assert len(code) == 4
    assert code.isalnum()
