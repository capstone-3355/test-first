// src/components/SpeechTest.jsx
import React from 'react';
import '../styles/SpeechTest.css';

const SpeechTest = ({ type, description, imageSrc, isFirst, isLoggedIn }) => {
    return (
        <div className={`card ${isFirst ? 'card-1' : ''} ${!isLoggedIn ? 'disabled' : ''}`}>
            <h3>{type}</h3>
            <p>{description}</p>
            <img src={imageSrc} alt={type} />
        </div>
    );
};

export default SpeechTest;