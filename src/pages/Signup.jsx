import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/index.js'; // Logo 컴포넌트 임포트
import '../styles/Signup.css';

const SignupPage = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); // 이메일 상태 추가
    const [errors, setErrors] = useState({}); // 오류 상태 추가
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        const newErrors = {}; // 오류 상태 초기화

        // 유효성 검사
        if (!id) newErrors.id = '아이디를 입력해주세요.';
        if (!password) newErrors.password = '비밀번호를 입력해주세요.';
        else if (password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
        if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        if (!name || name.length < 2) newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
        if (!email) newErrors.email = '이메일을 입력해주세요.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '유효한 이메일 주소를 입력해주세요.'; // 이메일 유효성 검사

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // 오류가 있을 경우 더 이상 진행하지 않음
        }

        // 회원가입 성공 (여기서는 간단히 메시지만 표시)
        alert('회원가입이 완료되었습니다!');
        navigate('/login'); // 회원가입 후 로그인 페이지로 이동
    };

    return (
        <div className="signup-page">
            <Logo />
            <div className="signup-container">
                <h2>회원가입</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                {errors.id && <div className="error-message">{errors.id}</div>}

                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}

                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}

                <input
                    type="email"  // 이메일 입력 필드
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}

                <button onClick={handleSignup}>회원가입</button>
            </div>
        </div>
    );
};

export default SignupPage;
