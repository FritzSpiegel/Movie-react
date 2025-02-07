import React, { useRef, useEffect, useState } from "react";
import Film from "./Film";
import "./Genre.css";

const genres = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Adventure", "Animation", "Fantasy",
    "Mystery", "Documentary", "Musical", "Crime", "Family", "War", "Western", "History", "Sport", "Biography"
];

const Genre = ({ genre }) => {
    const containerRef = useRef(null);
    const [films, setFilms] = useState([]);

    useEffect(() => {
        fetchMoviesForGenre(genre);
    }, [genre]);

    const fetchMoviesForGenre = async (genre) => {
        const apiKey = "5206816f";
        let allMovies = [];
        let fetchPromises = [];

        for (let i = 1; i <= 2; i++) {
            const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${genre}&type=movie&page=${i}`;
            fetchPromises.push(
                fetch(apiUrl).then(response => response.json()).then(data => {
                    if (data.Search) {
                        allMovies = [...allMovies, ...data.Search];
                    }
                })
            );
        }

        await Promise.all(fetchPromises);
        setFilms(allMovies.slice(0, 20));
    };

    const scroll = (direction) => {
        if (containerRef.current) {
            const scrollAmount = containerRef.current.clientWidth;
            if (direction === 'right') {
                if (containerRef.current.scrollLeft + scrollAmount >= containerRef.current.scrollWidth) {
                    containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            } else {
                containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="genre">
            <h2>{genre} Movies</h2>
            <div className="film-wrapper">
                <button className="scroll-button left" onClick={() => scroll('left')}>
                    ❮
                </button>
                <div className="film-container" ref={containerRef}>
                    {films.map((film) => (
                        <Film key={film.imdbID} title={film.Title} image={film.Poster !== "N/A" ? film.Poster : null} imdbID={film.imdbID} />
                    ))}
                </div>
                <button className="scroll-button right" onClick={() => scroll('right')}>
                    ❯
                </button>
            </div>
        </div>
    );
};

const GenreList = () => {
    return (
        <div className="genre-list">
            {genres.map((genre) => (
                <Genre key={genre} genre={genre} />
            ))}
        </div>
    );
};

export default GenreList;
