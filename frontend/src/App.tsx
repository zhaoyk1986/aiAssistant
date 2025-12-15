import React, { useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="transition-colors duration-300">
      <ChatProvider>
        <ChatWindow />
      </ChatProvider>
    </div>
  );
};

export default App;