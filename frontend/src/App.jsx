import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/Signup.jsx';
import MainPage from './pages/MainPage.jsx';
import WordPractice from './pages/WordPractice.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SentenceCategoryPage from './pages/SentenceCategoryPage.jsx';
import SentencePractice from './pages/SentencePractice.jsx';
import FreeModePractice from './pages/FreeModePractice.jsx';
import ReviewPage from './pages/ReviewPage.jsx';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        const storedUserInfo = localStorage.getItem('userInfo');
        if (loggedIn === 'true' && storedUserInfo) {
            setIsLoggedIn(true);
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<HomePage isLoggedIn={isLoggedIn} userInfo={userInfo} />}
                />
                <Route
                    path="/login"
                    element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />}
                />
                <Route
                    path="/signup"
                    element={<SignupPage setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />}
                />
                <Route
                    path="/main"
                    element={isLoggedIn ? <MainPage userInfo={userInfo} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/category"
                    element={isLoggedIn ? <CategoryPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/practice"
                    element={isLoggedIn ? <WordPractice /> : <Navigate to="/login" />}
                />
                <Route
                    path="/sentence-category"
                    element={isLoggedIn ? <SentenceCategoryPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/practice/sentence"
                    element={isLoggedIn ? <SentencePractice /> : <Navigate to="/login" />}
                />
                <Route
                    path="/free-mode"
                    element={isLoggedIn ? <FreeModePractice /> : <Navigate to="/login" />}
                />
                <Route
                    path="/review"
                    element={isLoggedIn ? <ReviewPage /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
};

export default App;
