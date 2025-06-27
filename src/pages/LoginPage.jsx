import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/index.js';
import '../styles/LoginPage.css';

const LoginPage = ({ setIsLoggedIn, setUserInfo }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5050/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: id,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || '로그인 실패');
                return;
            }

            setIsLoggedIn(true);
            setUserInfo(data.user);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            localStorage.setItem('userId', data.user.id);

            if (keepLoggedIn) {
                localStorage.setItem('isLoggedIn', 'true');
            }

            navigate('/main');
        } catch (err) {
            console.error(err);
            alert('서버 연결 오류');
        }
    };

    return (
        <div className="login-page">
            <Logo className="logo-space" />
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">로그인</button>
                </form>
                <div className="links">
                    <Link to="/signup">회원가입</Link>
                    <a href="#">아이디·비밀번호 찾기</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
