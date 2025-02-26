import React, { useRef, useEffect, useState } from "react";
import Film from "./Film";
import "./Genre.css";
import Search from "./Search";
import { useInView } from 'react-intersection-observer';

const genres = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Adventure"
];

const Genre = ({ genre, searchResults, onLoadMore, isSearch, onGenreClick }) => {
    const containerRef = useRef(null);
    const [films, setFilms] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false
    });

    useEffect(() => {
        if (searchResults) {
            setFilms(searchResults);
        } else {
            fetchMoviesForGenre(genre, page);
        }
    }, [genre, page, searchResults]);

    useEffect(() => {
        if (inView && isSearch && onLoadMore) {
            onLoadMore();
        }
    }, [inView, isSearch, onLoadMore]);

    const handleScroll = (e) => {
        const container = e.target;
        setShowLeftButton(container.scrollLeft > 0);
        
        // Prüfe, ob wir am Ende angekommen sind
        const isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;
        setShowRightButton(!isAtEnd);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const fetchMoviesForGenre = async (genre, currentPage) => {
        setLoading(true);
        const apiKey = "5206816f";
        try {
            // Reduziere die Anzahl der gleichzeitigen Anfragen von 5 auf 2
            const fetchPromises = [];
            for (let page = currentPage; page < currentPage + 2; page++) {
                fetchPromises.push(
                    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${genre}&type=movie&page=${page}`)
                        .then(response => response.json())
                );
            }

            const results = await Promise.all(fetchPromises);
            const newMovies = results
                .filter(data => data.Search)
                .flatMap(data => data.Search);

            setFilms(prevFilms => {
                const uniqueNewFilms = newMovies.filter(newFilm => 
                    !prevFilms.some(existingFilm => existingFilm.imdbID === newFilm.imdbID)
                );
                return [...prevFilms, ...uniqueNewFilms];
            });
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
        setLoading(false);
    };

    const scroll = (direction) => {
        if (containerRef.current && !isSearch) {
            const container = containerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            // Optimiere die Animation der Filme
            const films = container.querySelectorAll('.film');
            requestAnimationFrame(() => {
                films.forEach((film, index) => {
                    film.style.animation = 'none';
                    film.offsetHeight; // Force reflow
                    film.style.animation = null;
                    film.style.setProperty('--animation-order', index);
                });
            });

            if (direction === 'right') {
                const newScrollPosition = container.scrollLeft + scrollAmount;
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                
                // Lade neue Filme nur wenn wir fast am Ende sind
                if (newScrollPosition >= maxScroll - container.clientWidth) {
                    setPage(prevPage => prevPage + 1);
                }
            } else {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="genre">
            <h2 onClick={() => onGenreClick && onGenreClick(genre)}>{genre}</h2>
            {isSearch ? (
                <div className="search-results-grid">
                    {films.map((film, index) => (
                        <Film 
                            key={film.imdbID} 
                            title={film.Title} 
                            image={film.Poster !== "N/A" ? film.Poster : null} 
                            imdbID={film.imdbID}
                            index={index} 
                        />
                    ))}
                    {loading && <div className="loading-spinner">Loading...</div>}
                    <div ref={ref} style={{ height: '20px', width: '100%' }} />
                </div>
            ) : (
                <div className="film-wrapper">
                    <button 
                        className="scroll-button left" 
                        onClick={() => scroll('left')}
                        style={{ opacity: showLeftButton ? 1 : 0 }}
                    >
                        ❮
                    </button>
                    <div 
                        className="film-container" 
                        ref={containerRef}
                        onScroll={handleScroll}
                    >
                        {films.map((film, index) => (
                            <Film 
                                key={film.imdbID} 
                                title={film.Title} 
                                image={film.Poster !== "N/A" ? film.Poster : null} 
                                imdbID={film.imdbID}
                                index={index} 
                            />
                        ))}
                        {loading && <div className="loading-spinner">Loading...</div>}
                    </div>
                    <button 
                        className="scroll-button right" 
                        onClick={() => scroll('right')}
                        style={{ opacity: showRightButton ? 1 : 0 }}
                    >
                        ❯
                    </button>
                </div>
            )}
        </div>
    );
};

const GenreList = () => {
    const [searchResults, setSearchResults] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchPage, setSearchPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    const fetchSearchResults = async (term, page = 1, append = false) => {
        if (!term.trim() || loading) return;

        setLoading(true);
        const apiKey = "5206816f";
        try {
            const fetchPromises = [];
            const pagesToFetch = 10;
            
            for (let i = page; i < page + pagesToFetch; i++) {
                fetchPromises.push(
                    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${term}&type=movie&page=${i}`)
                        .then(response => response.json())
                );
            }

            const results = await Promise.all(fetchPromises);
            const allMovies = results
                .filter(data => data.Search)
                .flatMap(data => data.Search);

            if (allMovies.length > 0) {
                if (append) {
                    setSearchResults(prev => {
                        const uniqueNewMovies = allMovies.filter(newFilm => 
                            !prev.some(existingFilm => existingFilm.imdbID === newFilm.imdbID)
                        );
                        return [...prev, ...uniqueNewMovies];
                    });
                } else {
                    setSearchResults(allMovies);
                    setTotalResults(parseInt(results[0].totalResults || 0));
                }
            }
        } catch (error) {
            console.error("Error searching movies:", error);
        }
        setLoading(false);
    };

    const handleSearch = async (term) => {
        setSearchTerm(term);
        setSearchPage(1);
        if (!term.trim()) {
            setSearchResults(null);
            return;
        }
        await fetchSearchResults(term);
    };

    const loadMoreSearchResults = async () => {
        if (searchResults && searchResults.length < totalResults) {
            const nextPage = searchPage + 10;
            setSearchPage(nextPage);
            await fetchSearchResults(searchTerm, nextPage, true);
        }
    };

    const handleGenreClick = (genre) => {
        setSearchTerm(genre);
        setSearchPage(1);
        fetchSearchResults(genre);
    };

    return (
        <div className="genre-list">
            <Search onSearch={handleSearch} />
            {searchResults ? (
                <Genre 
                    genre={`${searchTerm} Movies`}
                    searchResults={searchResults} 
                    onLoadMore={loadMoreSearchResults}
                    isSearch={true}
                    onGenreClick={handleGenreClick}
                />
            ) : (
                genres.map((genre) => (
                    <Genre 
                        key={genre} 
                        genre={genre} 
                        onGenreClick={handleGenreClick}
                    />
                ))
            )}
        </div>
    );
};

export default GenreList;
