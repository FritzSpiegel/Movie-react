import React, { useState, useEffect } from 'react';
import './Search.css';

const Search = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const trimmedTerm = searchTerm.trim();
        if (trimmedTerm) {
            onSearch(trimmedTerm);
        } else {
            onSearch('');
        }
    }, [searchTerm, onSearch]);

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
        </div>
    );
};

export default Search; 