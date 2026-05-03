import React, { useState } from 'react';
import { useQuizSocket } from './useQuizSocket';

const Admin: React.FC = () => {
  const [adminToken, setAdminToken] = useState('supersecret');
  const [jsonInput, setJsonInput] = useState('');
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  
  const { state, connected, sendMessage } = useQuizSocket(sessionCode || undefined, null, true);

  const createSession = async () => {
    try {
      const questions = JSON.parse(jsonInput);
      const res = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_token: adminToken, questions })
      });
      const data = await res.json();
      if (res.ok) {
        setSessionCode(data.session_code);
      } else {
        alert(data.detail);
      }
    } catch (e) {
      alert('Invalid JSON');
    }
  };

  if (!sessionCode) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Console</h1>
        <div>
          <label>Admin Token:</label>
          <input type="password" value={adminToken} onChange={e => setAdminToken(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Question Bank (JSON):</label><br/>
          <textarea 
            rows={10} cols={50} 
            value={jsonInput} 
            onChange={e => setJsonInput(e.target.value)}
            placeholder='[{"text": "What is 2+2?", "options": ["3", "4", "5"], "correct_option_index": 1}]'
          />
        </div>
        <button onClick={createSession} style={{ marginTop: 10 }}>Create Session</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Session: {sessionCode} {connected ? '🟢' : '🔴'}</h1>
      <p>Invite Link: <code>{window.location.origin}/join/{sessionCode}</code></p>
      
      {state && (
        <div>
          <h3>Game Status: {state.is_active ? 'Active' : 'Ended'}</h3>
          <p>Current Question Index: {state.current_question_index} / {state.total_questions - 1}</p>
          <p>Votes: {state.voted_count} / {state.users.length}</p>
          
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => sendMessage('NEXT_QUESTION')}>Next Question</button>
            <button onClick={() => sendMessage('END_SESSION')} style={{ marginLeft: 10 }}>End Session</button>
          </div>

          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <h3>Players</h3>
              <ul>
                {state.users.map(u => (
                  <li key={u.nickname}>{u.nickname}: {u.score} {u.connected ? '' : '(disconnected)'}</li>
                ))}
              </ul>
            </div>
            {state.current_question && (
              <div>
                <h3>Active Question</h3>
                <p>{state.current_question.text}</p>
                <ul>
                  {state.current_question.options.map((opt, i) => (
                    <li key={i} style={{ fontWeight: i === state.correct_option_index ? 'bold' : 'normal', color: i === state.correct_option_index ? 'green' : 'black' }}>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
