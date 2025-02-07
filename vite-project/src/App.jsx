import React from "react";
import Genre from "./components/Genre";
import "./components/Genre";

const films = [
  { title: "Wolverine", image: "./assets/wolverine.jpg" },
  { title: "Take Cover", image: "./assets/wolverine.jpg" },
  { title: "The Dark Knight", image: "./assets/wolverine.jpg" },
  { title: "The Bouncer", image: "./assets/wolverine.jpg" },
  { title: "Grenzgänger", image: "./assets/wolverine.jpg" },
  { title: "Supergirl", image: "./assets/wolverine.jpg" },
  { title: "Furiosa", image: "./assets/wolverine.jpg" },
  { title: "2Wolverine", image: "./assets/wolverine.jpg" },
  { title: "2Take Cover", image: "./assets/wolverine.jpg" },
  { title: "2The Dark Knight", image: "./assets/wolverine.jpg" },
  { title: "2The Bouncer", image: "./assets/wolverine.jpg" },
  { title: "2Grenzgänger", image: "./assets/wolverine.jpg" },
  { title: "2Supergirl", image: "./assets/wolverine.jpg" },
  { title: "2Furiosa", image: "./assets/wolverine.jpg" }

];

const App = () => {
  return (
    <div className="app">
      <Genre title="Genre 1" films={films} />
      <Genre title="Genre 2" films={films} />
    </div>
  );
};

export default App;
