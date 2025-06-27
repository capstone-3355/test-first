import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/Signup';
import MainPage from './pages/MainPage';
import WordPractice from './pages/WordPractice';
import CategoryPage from './pages/CategoryPage';
import SentenceCategoryPage from './pages/SentenceCategoryPage';
import SentencePractice from './pages/SentencePractice';
import FreeModePractice from './pages/FreeModePractice';
import ReviewPage from './pages/ReviewPage';

const TEST_MODE = true; // ✅ true면 로그인 안 해도 다 열림

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(TEST_MODE); // ✅ 기본값 TEST_MODE 따라감
    const [userInfo, setUserInfo] = useState(TEST_MODE ? {} : null);

    useEffect(() => {
        if (!TEST_MODE) {
            const loggedIn = localStorage.getItem('isLoggedIn');
            const storedUserInfo = localStorage.getItem('userInfo');
            if (loggedIn === 'true' && storedUserInfo) {
                setIsLoggedIn(true);
                setUserInfo(JSON.parse(storedUserInfo));
            }
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />} />
                <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />} />
                <Route path="/main" element={isLoggedIn ? <MainPage userInfo={userInfo} /> : <Navigate to="/login" />} />
                <Route path="/category" element={isLoggedIn ? <CategoryPage /> : <Navigate to="/login" />} />
                <Route path="/practice" element={isLoggedIn ? <WordPractice /> : <Navigate to="/login" />} />
                <Route path="/sentence-category" element={isLoggedIn ? <SentenceCategoryPage /> : <Navigate to="/login" />} />
                <Route path="/practice/sentence" element={isLoggedIn ? <SentencePractice /> : <Navigate to="/login" />} />
                <Route path="/free-mode" element={isLoggedIn ? <FreeModePractice /> : <Navigate to="/login" />} />
                <Route path="/review" element={isLoggedIn ? <ReviewPage /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;
