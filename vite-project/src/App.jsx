import React, { useState, useEffect } from "react";
import GenreList from "./components/Genre";
import Logo from "./components/Logo";
import Search from "./components/Search";
import "./App.css";

const App = () => {
  const [resetKey, setResetKey] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="app">
      <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
        <Logo onClick={handleReset} />
        <Search onSearch={setSearchTerm} />
      </header>
      <main>
        <GenreList key={resetKey} initialSearchTerm={searchTerm} />
      </main>
    </div>
  );
};

export default App;
