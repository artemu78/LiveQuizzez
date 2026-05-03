import { useState, useEffect, useCallback, useRef } from 'react';

export interface QuizState {
  session_code: string;
  current_question_index: number;
  users: Array<{ nickname: string; score: number; connected: boolean }>;
  is_active: boolean;
  total_questions: number;
  voted_count: number;
  current_question?: {
    text: string;
    options: string[];
    id: string;
  };
  correct_option_index?: number; // Only for admin
}

export const useQuizSocket = (sessionCode: string | undefined, token: string | null, isAdmin: boolean = false) => {
  const [state, setState] = useState<QuizState | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!sessionCode) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = 'localhost:8000'; // Default for local dev
    const url = `${protocol}//${host}/ws/${sessionCode}?${isAdmin ? 'is_admin=true' : `token=${token}`}`;
    
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      console.log('WS Connected');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATE_UPDATE') {
        setState(message.data);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      console.log('WS Disconnected');
      // Simple reconnect
      setTimeout(connect, 3000);
    };
  }, [sessionCode, token, isAdmin]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const sendMessage = (type: string, data: any = {}) => {
    if (ws.current && connected) {
      ws.current.send(JSON.stringify({ type, ...data }));
    }
  };

  return { state, connected, sendMessage };
};
