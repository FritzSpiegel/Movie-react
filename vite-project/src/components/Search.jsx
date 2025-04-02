import React, { useState } from 'react';
import './Search.css';

const Search = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Verhindert das Standard-Formular-Verhalten
        const trimmedTerm = searchTerm.trim();
        onSearch(trimmedTerm);
    };

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
        // Entfernt den automatischen Suchaufruf bei Eingabe
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="search-input"
                />
            </form>
        </div>
    );
};

export default Search; 