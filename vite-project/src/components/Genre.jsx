import React, { useRef, useEffect, useState } from "react";
import Film from "./Film";
import "./Genre.css";
import Search from "./Search";

const genres = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Adventure"
];

const Genre = ({ genre, searchResults, onLoadMore, isSearch }) => {
    const containerRef = useRef(null);
    const [films, setFilms] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchResults) {
            setFilms(searchResults);
        } else {
            fetchMoviesForGenre(genre, page);
        }
    }, [genre, page, searchResults]);

    const fetchMoviesForGenre = async (genre, currentPage) => {
        setLoading(true);
        const apiKey = "5206816f";
        try {
            // Fetch 5 pages simultaneously for 50 movies per genre
            const fetchPromises = [];
            for (let page = currentPage; page < currentPage + 5; page++) {
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
            const scrollAmount = containerRef.current.clientWidth * 0.8;
            const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
            
            if (direction === 'right') {
                const newScrollPosition = containerRef.current.scrollLeft + scrollAmount;
                if (newScrollPosition >= maxScroll) {
                    setPage(prevPage => prevPage + 1);
                }
                containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="genre">
            <h2>{genre}</h2>
            {isSearch ? (
                <div className="search-results-grid">
                    {films.map((film) => (
                        <Film 
                            key={film.imdbID} 
                            title={film.Title} 
                            image={film.Poster !== "N/A" ? film.Poster : null} 
                            imdbID={film.imdbID} 
                        />
                    ))}
                    {loading && <div className="loading-spinner">Loading...</div>}
                </div>
            ) : (
                <div className="film-wrapper">
                    <button 
                        className="scroll-button left" 
                        onClick={() => scroll('left')}
                        style={{ opacity: containerRef.current?.scrollLeft > 0 ? 1 : 0 }}
                    >
                        ❮
                    </button>
                    <div className="film-container" ref={containerRef}>
                        {films.map((film) => (
                            <Film 
                                key={film.imdbID} 
                                title={film.Title} 
                                image={film.Poster !== "N/A" ? film.Poster : null} 
                                imdbID={film.imdbID} 
                            />
                        ))}
                        {loading && <div className="loading-spinner">Loading...</div>}
                    </div>
                    <button 
                        className="scroll-button right" 
                        onClick={() => scroll('right')}
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
            // Fetch 10 pages simultaneously for initial search (100 movies)
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
                    // Store total results count from first response
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

    return (
        <div className="genre-list">
            <Search onSearch={handleSearch} />
            {searchResults ? (
                <Genre 
                    genre="Search Results" 
                    searchResults={searchResults} 
                    onLoadMore={loadMoreSearchResults}
                    isSearch={true}
                />
            ) : (
                genres.map((genre) => (
                    <Genre key={genre} genre={genre} />
                ))
            )}
        </div>
    );
};

export default GenreList;
