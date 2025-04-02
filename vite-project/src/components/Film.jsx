import React, { useState, useRef, useEffect, useCallback } from "react";
import FilmPopup from "./FilmPopup";
import "./Film.css";

const Film = ({ title, image, imdbID, index, isDarkMode: propIsDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewVideo, setPreviewVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const filmRef = useRef(null);
    const hoverTimerRef = useRef(null);
    
    // Eigenen isDarkMode-Status verwalten, der auf propIsDarkMode basiert,
    // aber auch direkt aus localStorage aktualisiert werden kann
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return propIsDarkMode !== undefined 
            ? propIsDarkMode 
            : localStorage.getItem('theme') === 'dark';
    });
    
    // Aktualisiere den lokalen isDarkMode-Status, wenn sich propIsDarkMode ändert
    useEffect(() => {
        if (propIsDarkMode !== undefined) {
            setIsDarkMode(propIsDarkMode);
        }
    }, [propIsDarkMode]);
    
    // Themeänderungen überwachen
    useEffect(() => {
        const updateTheme = () => {
            const currentTheme = localStorage.getItem('theme') === 'dark';
            if (propIsDarkMode === undefined) {
                setIsDarkMode(currentTheme);
            }
        };
        
        window.addEventListener('storage', updateTheme);
        window.addEventListener('themechange', updateTheme);
        
        // Regelmäßige Überprüfung, falls andere Mechanismen fehlschlagen
        const checkThemeInterval = setInterval(() => {
            const currentTheme = localStorage.getItem('theme') === 'dark';
            if (propIsDarkMode === undefined && currentTheme !== isDarkMode) {
                setIsDarkMode(currentTheme);
            }
        }, 100);
        
        return () => {
            window.removeEventListener('storage', updateTheme);
            window.removeEventListener('themechange', updateTheme);
            clearInterval(checkThemeInterval);
        };
    }, [propIsDarkMode, isDarkMode]);

    const handleMouseEnter = useCallback(async () => {
        hoverTimerRef.current = setTimeout(async () => {
            try {
                setIsLoading(true);
                const options = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                };

                const searchResponse = await fetch(
                    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`,
                    options
                );
                const searchData = await searchResponse.json();

                if (searchData.results && searchData.results[0]) {
                    const movieId = searchData.results[0].id;
                    const videosResponse = await fetch(
                        `https://api.themoviedb.org/3/movie/${movieId}/videos`,
                        options
                    );
                    const videosData = await videosResponse.json();

                    const video = videosData.results?.find(v => 
                        v.type === "Trailer" || v.type === "Teaser" || v.type === "Clip"
                    );

                    if (video) {
                        setPreviewVideo(`https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&controls=0&modestbranding=1`);
                        setShowPreview(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching preview:", error);
            } finally {
                setIsLoading(false);
            }
        }, 4000);
    }, [title]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setShowPreview(false);
        setTimeout(() => {
            setPreviewVideo(null);
        }, 300);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
            }
        };
    }, []);

    const handleClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <div 
                ref={filmRef}
                className={`film ${showPreview ? 'showing-preview' : ''}`}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ '--animation-order': index }}
            >
                <div className="preview-container">
                    {showPreview && previewVideo ? (
                        <iframe
                            src={previewVideo}
                            className="preview-video"
                            frameBorder="0"
                            allowFullScreen
                        />
                    ) : (
                        <img 
                            src={image || "https://picsum.photos/170/270"} 
                            alt={title} 
                        />
                    )}
                    {showPreview && isLoading && (
                        <div className="preview-overlay">
                            <div className="preview-loader"></div>
                        </div>
                    )}
                </div>
                <div className="film-info">
                    <h3>{title}</h3>
                </div>
            </div>
            {isOpen && (
                <FilmPopup 
                    imdbID={imdbID} 
                    onClose={() => setIsOpen(false)}
                    sourceRect={filmRef.current.getBoundingClientRect()}
                    isDarkMode={isDarkMode}
                />
            )}
        </>
    );
};

export default Film;
