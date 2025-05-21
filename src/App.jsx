import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/Signup.jsx';
import MainPage from './pages/MainPage';

const App = () => {
    // 임시로 로그인 상태를 true로 설정 (테스트용)
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userInfo, setUserInfo] = useState({ name: '삼삼오오' });

    // 로컬 스토리지 로직은 테스트 후 다시 활성화

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
                    element={<MainPage userInfo={userInfo} />}
                />
            </Routes>
        </Router>
    );
};

export default App;