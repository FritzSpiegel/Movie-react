import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from 'react-dom';
import "./FilmPopup.css";

const FilmPopup = ({ imdbID, onClose, sourceRect, isDarkMode: propIsDarkMode }) => {
    const [film, setFilm] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [popupStyle, setPopupStyle] = useState({});
    // Verwende propIsDarkMode als Anfangswert, aber überwache auch localStorage-Änderungen
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Wenn die Prop definiert ist, verwende diese, ansonsten prüfe localStorage
        return propIsDarkMode !== undefined 
            ? propIsDarkMode 
            : localStorage.getItem('theme') === 'dark';
    });

    // Cache für bereits geladene Filme
    const filmCache = React.useRef(new Map());

    // Überwache localStorage-Änderungen und Theme-Toggle
    useEffect(() => {
        // Aktualisiere Zustand, wenn sich propIsDarkMode ändert
        if (propIsDarkMode !== undefined) {
            setIsDarkMode(propIsDarkMode);
        }
        
        // Event-Listener für localStorage-Änderungen
        const handleStorageChange = (e) => {
            if (e.key === 'theme') {
                setIsDarkMode(e.newValue === 'dark');
            }
        };
        
        // Event-Listener für benutzerdefinierten Event, falls Theme über den Toggle geändert wird
        const handleThemeChange = (e) => {
            setIsDarkMode(localStorage.getItem('theme') === 'dark');
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('themechange', handleThemeChange);
        
        // Regelmäßige Überprüfung des Theme-Status aus localStorage
        const checkThemeInterval = setInterval(() => {
            const currentTheme = localStorage.getItem('theme') === 'dark';
            if (currentTheme !== isDarkMode) {
                setIsDarkMode(currentTheme);
            }
        }, 100);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themechange', handleThemeChange);
            clearInterval(checkThemeInterval);
        };
    }, [propIsDarkMode, isDarkMode]);

    const fetchFilm = useCallback(async () => {
        if (filmCache.current.has(imdbID)) {
            setFilm(filmCache.current.get(imdbID));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://www.omdbapi.com/?apikey=5206816f&i=${imdbID}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            filmCache.current.set(imdbID, data);
            setFilm(data);
        } catch (error) {
            console.error("Error fetching movie:", error);
        } finally {
            setIsLoading(false);
        }
    }, [imdbID]);

    useEffect(() => {
        fetchFilm();
    }, [fetchFilm]);

    useEffect(() => {
        if (sourceRect) {
            // Berechne die initiale Position basierend auf dem Film-Cover
            const initialStyle = {
                transformOrigin: `${sourceRect.left + sourceRect.width/2}px ${sourceRect.top + sourceRect.height/2}px`
            };
            setPopupStyle(initialStyle);
        }
    }, [sourceRect]);

    const handleClose = (e) => {
        e?.stopPropagation();
        setIsClosing(true);
        // Kürzere Wartezeit für die Animation
        setTimeout(onClose, 200);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // Tastatur-Navigation
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Verhindere Scrollen des Hintergrunds
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Für Debugging: log theme state
    useEffect(() => {
        console.log("Current theme in popup:", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    if (!film && !isLoading) return null;

    // Definiere Popup Content Style basierend auf isDarkMode
    const popupContentStyle = {
        ...popupStyle,
        background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        color: isDarkMode ? 'white' : '#333',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    return ReactDOM.createPortal(
        <div 
            className={`popup-overlay ${isClosing ? 'closing' : ''}`} 
            onClick={handleOverlayClick}
        >
            <div 
                className={`popup-content ${isClosing ? 'closing' : ''}`}
                style={popupContentStyle}
                onClick={e => e.stopPropagation()}
            >
                <button className="close-btn" onClick={handleClose}>×</button>
                {isLoading ? (
                    <div className="popup-loader">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        <div className="popup-left">
                            <img 
                                src={film.Poster !== "N/A" ? film.Poster : "https://picsum.photos/200/300"} 
                                alt={film.Title}
                                loading="eager"
                            />
                            <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(film.Title + ' trailer')}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="trailer-button"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                                Find Trailer (with sound)
                            </a>
                        </div>
                        <div className="popup-right">
                            <h2>{film.Title} ({film.Year})</h2>
                            <p><strong>Actors:</strong> {film.Actors}</p>
                            <p><strong>Director:</strong> {film.Director}</p>
                            <p><strong>Plot:</strong> {film.Plot}</p>
                            <p><strong>Rating:</strong> {film.imdbRating}/10</p>
                            <p><strong>Country:</strong> {film.Country}</p>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default FilmPopup;
