// src/context/ToastContext.js
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-toast-message';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  
  // This function maintains your existing 'showToast(msg, type)' API
  // but forwards the call to the global Toast library.
  const showToast = (msg, type = 'success') => {
    Toast.show({
      type: 'customToast', // This triggers the 'customToast' config in App.js
      text1: msg || 'Notification', // Pass the message as text1
      position: 'bottom', // ✅ Changed to Bottom
      visibilityTime: 3000,
      bottomOffset: 60, // ✅ Spacing from bottom (prevents overlap with tabs)
      props: { originalType: type } 
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);