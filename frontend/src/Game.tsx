import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuizSocket } from './useQuizSocket';

const Game: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [userData, setUserData] = useState<{ token: string; nickname: string } | null>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`quiz_session_${sessionCode}`);
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, [sessionCode]);

  const { state, connected, sendMessage } = useQuizSocket(sessionCode, userData?.token || null);

  // Reset voted index when question changes
  useEffect(() => {
    setVotedIndex(null);
  }, [state?.current_question_index]);

  const handleVote = (index: number) => {
    if (votedIndex !== null) return;
    setVotedIndex(index);
    sendMessage('VOTE', { user_token: userData?.token, option_index: index });
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{userData.nickname} {connected ? '🟢' : '🔴'}</h2>
        <h3>Score: {state?.users.find(u => u.nickname === userData.nickname)?.score || 0}</h3>
      </header>

      {!state?.is_active && (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <h1>Game Ended!</h1>
          <h2>Final Leaderboard</h2>
          <ol>
            {state?.users.sort((a, b) => b.score - a.score).map(u => (
              <li key={u.nickname}>{u.nickname}: {u.score}</li>
            ))}
          </ol>
        </div>
      )}

      {state?.is_active && state.current_question_index === -1 && (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <h1>Waiting for game to start...</h1>
        </div>
      )}

      {state?.is_active && state.current_question && (
        <div style={{ marginTop: 30 }}>
          <h2 style={{ textAlign: 'center' }}>{state.current_question.text}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
            {state.current_question.options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleVote(i)}
                disabled={votedIndex !== null}
                style={{ 
                  padding: 40, 
                  fontSize: '1.5em', 
                  backgroundColor: votedIndex === i ? '#4CAF50' : '#f0f0f0',
                  color: votedIndex === i ? 'white' : 'black',
                  border: '2px solid #ccc',
                  cursor: votedIndex === null ? 'pointer' : 'default'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {votedIndex !== null && (
            <p style={{ textAlign: 'center', marginTop: 20 }}>Vote submitted! Waiting for next question...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
