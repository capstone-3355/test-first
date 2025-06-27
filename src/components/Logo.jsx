// src/components/Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Logo.css';

const Logo = () => {
    return (
        <Link to="/" className="logo">
            <span className="logo-text">
                발음,<span className="logo-highlight">바름</span>
            </span>
        </Link>
    );
};

export default Logo;