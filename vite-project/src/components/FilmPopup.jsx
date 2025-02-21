import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import "./FilmPopup.css";

const FilmPopup = ({ imdbID, onClose }) => {
    const [film, setFilm] = useState(null);

    useEffect(() => {
        fetch(`http://www.omdbapi.com/?apikey=5206816f&i=${imdbID}`)
            .then(response => response.json())
            .then(data => setFilm(data));
    }, [imdbID]);

    if (!film) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <div className="popup-left">
                    <img src={film.Poster !== "N/A" ? film.Poster : "https://picsum.photos/200/300"} alt={film.Title} />
                </div>
                <div className="popup-right">
                    <h2>{film.Title} ({film.Year})</h2>
                    <p><strong>Actors:</strong> {film.Actors}</p>
                    <p><strong>Director:</strong> {film.Director}</p>
                    <p><strong>Plot:</strong> {film.Plot}</p>
                    <p><strong>Rating:</strong> {film.imdbRating}/10</p>
                    <p><strong>Country:</strong> {film.Country}</p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FilmPopup;
