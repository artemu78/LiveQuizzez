import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Join: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already has token for this session
    const saved = localStorage.getItem(`quiz_session_${sessionCode}`);
    if (saved) {
      navigate(`/game/${sessionCode}`);
    }
  }, [sessionCode, navigate]);

  const handleJoin = async () => {
    if (!nickname) return;
    const res = await fetch(`http://localhost:8000/api/sessions/${sessionCode}/join?nickname=${nickname}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem(`quiz_session_${sessionCode}`, JSON.stringify(data));
      navigate(`/game/${sessionCode}`);
    } else {
      alert(data.detail);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Join Session {sessionCode}</h1>
      <div>
        <input 
          placeholder="Enter Nickname" 
          value={nickname} 
          onChange={e => setNickname(e.target.value)} 
          style={{ padding: 10, fontSize: '1.2em' }}
        />
      </div>
      <button onClick={handleJoin} style={{ marginTop: 20, padding: '10px 20px' }}>Join Game</button>
    </div>
  );
};

export default Join;
