import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import characterImage from '../assets/images/mainlogo.png';
import '../styles/HomePage.css';

const HomePage = ({ isLoggedIn, userInfo }) => {
    const navigate = useNavigate();

    const handleStart = () => {
        if (isLoggedIn) {
            navigate('/main');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="home-page">
            <div className="home-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-text">
                            발음,<span className="logo-highlight">바름</span>
                        </span>
                    </div>
                    <div className="auth-links">
                        {isLoggedIn ? (
                            <span className="user-name">{userInfo?.name}님</span>
                        ) : (
                            <>
                                <Link to="/login" className="auth-link">로그인</Link>
                                <span className="divider">|</span>
                                <Link to="/signup" className="auth-link">회원가입</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="home-content">
                <div className="content-wrapper">
                    <div className="text-content">
                        <h1>
                            발음,
                            <span className="highlight-wrapper">
                                <span className="char-wrapper">
                                    <span className="char">바</span>
                                    <span className="circle"></span>
                                </span>
                                <span className="char-wrapper">
                                    <span className="char">름</span>
                                    <span className="circle"></span>
                                </span>
                            </span>
                        </h1>
                        <div className="sub-text-container">
                            <p className="sub-text">언제 어디서든 쉽고 간편한</p>
                            <p className="sub-text">발음 교정 서비스</p>
                        </div>
                        <Link to={isLoggedIn ? '/main' : '/login'} className="start-link" onClick={handleStart}>
                            바로 시작하기
                        </Link>
                    </div>
                </div>
                <div className="image-content">
                    <img src={characterImage} alt="Character" className="character-image" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;