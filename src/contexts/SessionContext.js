import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null); // { type: 'chat' | 'call', params: {} }

  // Restore session on app launch (in case of crash/restart)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('active_session');
        if (saved) {
          setActiveSession(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    };
    restoreSession();
  }, []);

  const startSession = async (type, params) => {
    const session = { type, params };
    setActiveSession(session);
    await AsyncStorage.setItem('active_session', JSON.stringify(session));
  };

  const endSession = async () => {
    setActiveSession(null);
    await AsyncStorage.removeItem('active_session');
  };

  return (
    <SessionContext.Provider value={{ activeSession, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);