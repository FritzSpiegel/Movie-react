import React, { useState } from "react";
import FilmPopup from "./FilmPopup";
import "./Film.css";

const Film = ({ title, image, imdbID, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div 
                className="film" 
                onClick={() => setIsOpen(true)}
                style={{ '--animation-order': index }}
            >
                <img src={image || "https://picsum.photos/170/270"} alt={title} />
                <div className="film-info">
                    <h3>{title}</h3>
                </div>
            </div>
            {isOpen && <FilmPopup imdbID={imdbID} onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default Film;
