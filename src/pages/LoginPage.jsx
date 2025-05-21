// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 🔹 Link 추가
import { Logo } from '../components/index.js';
import '../styles/LoginPage.css';

const LoginPage = ({ setIsLoggedIn, setUserInfo }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (id === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
            setUserInfo({ name: '관리자' });
            if (keepLoggedIn) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userInfo', JSON.stringify({ name: '관리자' }));
            }
            navigate('/main');
        } else {
            alert('ID 또는 비밀번호가 잘못되었습니다.');
        }
    };

    return (
        <div className="login-page">
            <Logo />
            <div className="login-container">
                <h2>Login</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>로그인</button>
                <div className="links">
                    <Link to="/signup">회원가입</Link> {/* 🔹 이 줄만 수정됨 */}
                    <a href="#">아이디·비밀번호 찾기</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
