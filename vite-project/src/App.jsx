import React, { useState, useEffect, useCallback } from "react";
import GenreList from "./components/Genre";
import Logo from "./components/Logo";
import Search from "./components/Search";
import "./App.css";

const App = () => {
  const [key, setKey] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [term, setTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for theme preference
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resetScroll = useCallback(() => {
    setKey(prevKey => prevKey + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light'); // Save preference
      
      // Löse ein benutzerdefiniertes Event aus, um andere Komponenten zu benachrichtigen
      const event = new CustomEvent('themechange', { 
        detail: { darkMode: newMode } 
      });
      window.dispatchEvent(event);
      
      return newMode;
    });
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <header className={`app-header ${scrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark' : 'light'}`}>
        <Logo onClick={resetScroll} />
        <Search onSearch={setTerm} />
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkMode ? 'White Mode' : 'Dark Mode'}
        </button>
      </header>
      <main>
        <GenreList key={key} initialSearchTerm={term} currentTheme={isDarkMode ? 'dark' : 'light'} />
      </main>
    </div>
  );
};

export default App;
