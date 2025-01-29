import React from "react";
import "./Film.css";

const Film = ({ title }) => {
    const randomImage = "https://picsum.photos/170/270";

    return (
        <div className="film" onClick={() => console.log(title)}>
            <img src={randomImage} alt={title} />
        </div>
    );
};

export default Film;

