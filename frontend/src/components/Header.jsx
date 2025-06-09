// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from "./Logo.jsx";
import '../styles/Header.css';

const Header = ({ userInfo, setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <header>
            <div className="header-text">
                <Logo />
                <p className="main-text">
                    {userInfo ? `${userInfo.name}님` : '게스트님'}, 오늘은 무엇을 배워볼까요?
                </p>
            </div>
            <div className="profile">
                {userInfo ? (
                    <button onClick={handleLogout} className="logout-button">
                        로그아웃
                    </button>
                ) : (
                    <Link to="/login" className="login-link">
                        로그인
                    </Link>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        </header>
    );
};

export default Header;