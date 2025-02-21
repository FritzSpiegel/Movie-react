import React, { useState } from "react";
import GenreList from "./components/Genre";
import Logo from "./components/Logo";
import "./App.css";

const App = () => {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="app" style={{
      backgroundColor: "#141414",
      minHeight: "100vh",
      color: "white",
      overflowX: "hidden"
    }}>
      <header className="app-header" style={{
        padding: "20px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Logo onClick={handleReset} />
      </header>
      <main>
        <GenreList key={resetKey} />
      </main>
    </div>
  );
};

export default App;
