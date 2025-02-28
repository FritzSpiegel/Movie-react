import React, { useRef, useEffect, useState } from "react";
import Film from "./Film";
import "./Genre.css";
import Search from "./Search";
import { useInView } from 'react-intersection-observer';

const allGenres = [
    // Hauptgenres
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Adventure",
    "Animation", "Crime", "Documentary", "Family", "Fantasy", "History", "Music", "Mystery",
    "Sport", "War", "Western", "Biography", "Musical", "Film-Noir", "Superhero", "Anime",
    
    // Spezifischere Genres
    "Psychological Thriller", "Dark Comedy", "Romantic Comedy", "Science Fantasy",
    "Martial Arts", "Cyberpunk", "Post-Apocalyptic", "Supernatural Horror",
    "Political Drama", "Teen Drama", "Medical Drama", "Legal Drama", "Period Drama",
    "Space Opera", "Time Travel", "Alternate History", "Steampunk", "Gothic Horror",
    "Found Footage", "Mockumentary", "True Crime", "Spy", "Heist", "Disaster",
    "Monster", "Zombie", "Vampire", "Werewolf", "Ghost", "Slasher", "Psychological Horror",
    "Dark Fantasy", "Urban Fantasy", "High Fantasy", "Epic Fantasy", "Contemporary Fantasy",
    "Superhero Comedy", "Action Comedy", "Black Comedy", "Satire", "Parody",
    "Film Noir", "Neo-Noir", "Tech Noir", "Gangster", "Police", "Detective",
    "Historical Epic", "Ancient World", "Medieval", "Renaissance", "Victorian Era",
    "World War I", "World War II", "Cold War", "Modern Warfare", "Future War",
    "Sports Drama", "Boxing", "Martial Arts", "Racing", "Baseball", "Football",
    "Coming of Age", "Road Movie", "Survival", "Environmental", "Political Thriller",
    "Espionage", "Conspiracy", "Psychological Drama", "Social Drama", "Family Drama",
    "Romantic Drama", "Teen Romance", "Historical Romance", "Paranormal Romance",
    "Erotic Thriller", "Crime Thriller", "Action Thriller", "Supernatural Thriller",
    "Mystery Thriller", "Tech Thriller", "Eco Thriller", "Medical Thriller",
    "Adventure Comedy", "Family Adventure", "Historical Adventure", "Swashbuckler",
    "Sword and Sorcery", "Military Sci-Fi", "Space Western", "Kaiju", "Mecha",
    "Supernatural Drama", "Religious", "Mythological", "Folk Tale", "Fairy Tale",
    "Experimental", "Avant-Garde", "Surrealist", "Abstract", "Art House",
    "Biographical Drama", "Historical Biography", "Sports Biography", "Musical Biography",
    "Concert Film", "Rock Musical", "Dance", "Opera", "Classical Music"
];

// Funktion zum Mischen des Arrays (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const Genre = ({ genre, searchResults, onLoadMore, isSearch, onGenreClick }) => {
    const containerRef = useRef(null);
    const [films, setFilms] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

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

            container.scrollTo({
                left: container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount),
                behavior: 'smooth'
            });

            // Lade neue Filme nur wenn wir fast am Ende sind
            if (direction === 'right') {
                const maxScroll = container.scrollWidth - container.clientWidth;
                const newScrollPosition = container.scrollLeft + scrollAmount;
                if (newScrollPosition >= maxScroll - container.clientWidth) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        }
    };

    return (
        <div className="genre">
            <h2 onClick={() => onGenreClick(genre)}>{genre}</h2>
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
                <div 
                    className="film-wrapper"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button 
                        className="scroll-button left" 
                        onClick={() => scroll('left')}
                        style={{ opacity: showLeftButton && isHovered ? 1 : 0 }}
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
                        style={{ opacity: showRightButton && isHovered ? 1 : 0 }}
                    >
                        ❯
                    </button>
                </div>
            )}
        </div>
    );
};

// Funktion zum Testen der Genre-Verfügbarkeit
const testGenreAvailability = async (genre) => {
    const apiKey = "5206816f";
    try {
        const response = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${genre}&type=movie&page=1`
        );
        const data = await response.json();
        return data.totalResults >= 5;
    } catch (error) {
        console.error("Error testing genre:", error);
        return false;
    }
};

const GenreList = ({ initialSearchTerm }) => {
    const [searchResults, setSearchResults] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchPage, setSearchPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [validatedGenres, setValidatedGenres] = useState([]);
    const [visibleGenres, setVisibleGenres] = useState([]);
    
    // Ref für Intersection Observer
    const loadMoreRef = useRef(null);

    // Initial Genre-Validierung
    useEffect(() => {
        const validateGenres = async () => {
            const validGenres = [];
            for (const genre of shuffleArray([...allGenres])) {
                if (validGenres.length >= 8) break; // Stoppe nach 8 validierten Genres
                const isValid = await testGenreAvailability(genre);
                if (isValid) {
                    validGenres.push(genre);
                }
            }
            setValidatedGenres(validGenres);
            setVisibleGenres(validGenres);
        };
        
        validateGenres();
    }, []);

    // Modifizierter Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !searchResults) {
                    const currentLength = visibleGenres.length;
                    if (currentLength < allGenres.length) {
                        const remainingGenres = allGenres.filter(
                            genre => !visibleGenres.includes(genre) && !validatedGenres.includes(genre)
                        );
                        
                        // Teste die nächsten Genres
                        const newValidGenres = [];
                        for (const genre of shuffleArray(remainingGenres)) {
                            if (newValidGenres.length >= 4) break;
                            const isValid = await testGenreAvailability(genre);
                            if (isValid) {
                                newValidGenres.push(genre);
                            }
                        }
                        
                        if (newValidGenres.length > 0) {
                            setValidatedGenres(prev => [...prev, ...newValidGenres]);
                            setVisibleGenres(prev => [...prev, ...newValidGenres]);
                        }
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [visibleGenres, searchResults, validatedGenres]);

    // Reagiere auf Änderungen des initialSearchTerm
    useEffect(() => {
        if (initialSearchTerm !== undefined) {
            setSearchTerm(initialSearchTerm);
            if (initialSearchTerm.trim()) {
                fetchSearchResults(initialSearchTerm);
            } else {
                setSearchResults(null);
            }
        }
    }, [initialSearchTerm]);

    // Neue separate Funktion für Genre-Clicks
    const handleGenreClick = async (genre) => {
        setSearchTerm(genre);
        setSearchPage(1);
        await fetchSearchResults(genre); // Warten bis die Suche abgeschlossen ist
        // Dann erst nach oben scrollen
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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

    const loadMoreSearchResults = async () => {
        if (searchResults && searchResults.length < totalResults) {
            const nextPage = searchPage + 10;
            setSearchPage(nextPage);
            await fetchSearchResults(searchTerm, nextPage, true);
        }
    };

    return (
        <div className="genre-list">
            {searchResults ? (
                <Genre 
                    genre={`${searchTerm} Movies`}
                    searchResults={searchResults} 
                    onLoadMore={loadMoreSearchResults}
                    isSearch={true}
                    onGenreClick={handleGenreClick}
                />
            ) : (
                <>
                    {visibleGenres.map((genre) => (
                        <Genre 
                            key={genre} 
                            genre={genre} 
                            onGenreClick={handleGenreClick}
                        />
                    ))}
                    <div ref={loadMoreRef} style={{ height: '20px', width: '100%' }} />
                </>
            )}
        </div>
    );
};

export default GenreList;
