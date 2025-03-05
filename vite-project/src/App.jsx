import React, { useState, useEffect, useCallback } from "react";
import GenreList from "./components/Genre";
import Logo from "./components/Logo";
import Search from "./components/Search";
import "./App.css";

const App = () => {
  const [key, setKey] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [term, setTerm] = useState("");

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

  return (
    <div className="app">
      <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
        <Logo onClick={resetScroll} />
        <Search onSearch={setTerm} />
      </header>
      <main>
        <GenreList key={key} initialSearchTerm={term} />
      </main>
    </div>
  );
};

export default App;
