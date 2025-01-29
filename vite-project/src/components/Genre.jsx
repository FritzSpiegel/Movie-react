import React, { useRef } from "react";
import Film from "./Film";
import "./Genre.css";

const Genre = ({ title, films }) => {
    const containerRef = useRef(null);


    const scrollLeft = () => {
        if (containerRef.current) {

            containerRef.current.scrollBy({ left: -980, behavior: 'smooth' });
        }
    };


    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 980, behavior: 'smooth' });
        }
    };

    return (
        <div className="genre">
            <h2>{title}</h2>
            <div className="film-container" ref={containerRef}>
                <button className="scroll-button left" onClick={scrollLeft}>
                    {"<"}
                </button>
                {films.map((film, index) => (
                    <Film key={index} title={film.title} image={film.image} />
                ))}
                <button className="scroll-button right" onClick={scrollRight}>
                    {">"}
                </button>
            </div>
        </div>
    );
};

export default Genre;
