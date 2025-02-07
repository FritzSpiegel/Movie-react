import React, { useState } from "react";
import FilmPopup from "./FilmPopup";
import "./Film.css";

const Film = ({ title, image, imdbID }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="film" onClick={() => setIsOpen(true)}>
                <img src={image || "https://picsum.photos/170/270"} alt={title} />
            </div>
            {isOpen && <FilmPopup imdbID={imdbID} onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default Film;
