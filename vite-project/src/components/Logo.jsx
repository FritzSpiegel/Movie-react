import React from 'react';
import './Logo.css';

const Logo = ({ onClick }) => {
    return (
        <div className="logo" onClick={onClick}>
            <span className="logo-text">Movie<span className="logo-highlight">Flix</span></span>
        </div>
    );
};

export default Logo; 