import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/index.js';
import '../styles/Signup.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
    });

    const [errors, setErrors] = useState({});
    const [idStatus, setIdStatus] = useState('unchecked'); // 'unchecked', 'available', 'taken', 'error'
    const [idMessage, setIdMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'id') {
            setIdStatus('unchecked');
            setIdMessage('');
        }
    };

    const validate = () => {
        const { id, password, confirmPassword, name, email } = formData;
        const newErrors = {};

        if (!id) newErrors.id = '아이디를 입력해주세요.';
        if (!password) newErrors.password = '비밀번호를 입력해주세요.';
        else if (password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
        if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        if (!name || name.length < 2) newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
        if (!email) newErrors.email = '이메일을 입력해주세요.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '유효한 이메일 주소를 입력해주세요.';

        return newErrors;
    };

    const checkIdDuplicate = async () => {
        if (!formData.id) {
            setIdMessage('아이디를 입력해주세요.');
            setIdStatus('error');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5050/api/check-id?username=${formData.id}`);
            const data = await res.json();

            if (res.ok) {
                setIdStatus('available');
                setIdMessage('사용 가능한 아이디입니다.');
            } else {
                setIdStatus('taken');
                setIdMessage(data.message || '이미 사용 중인 아이디입니다.');
            }
        } catch (err) {
            console.error(err);
            setIdStatus('error');
            setIdMessage('서버 오류');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (idStatus !== 'available') {
            newErrors.id = '아이디 중복확인을 완료해주세요.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch('http://localhost:5050/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.id,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || '회원가입 실패');
            } else {
                alert('회원가입이 완료되었습니다.');
                navigate('/login');
            }
        } catch (err) {
            console.error('에러:', err);
            alert('서버 연결 실패');
        }
    };

    const fields = [
        { name: 'password', type: 'password', placeholder: '비밀번호' },
        { name: 'confirmPassword', type: 'password', placeholder: '비밀번호 확인' },
        { name: 'name', type: 'text', placeholder: '이름' },
        { name: 'email', type: 'email', placeholder: '이메일' },
    ];

    return (
        <div className="signup-page">
            <Logo className="logo-space" />
            <div className="signup-container">
                <h2>회원가입</h2>

                {/* 아이디 입력 + 중복확인 */}
                <div className="form-group">
                    <label htmlFor="id">아이디</label>
                    <div className="id-check-row">
                        <input
                            type="text"
                            name="id"
                            id="id"
                            placeholder="아이디"
                            value={formData.id}
                            onChange={handleChange}
                            className={errors.id ? 'input-error' : ''}
                        />
                        <button
                            type="button"
                            className="id-check-button"
                            onClick={checkIdDuplicate}
                        >
                            중복확인
                        </button>
                    </div>
                    {idMessage && <div className={`id-check-message ${idStatus}`}>{idMessage}</div>}
                    {errors.id && <div className="error-message">{errors.id}</div>}
                </div>

                {/* 기타 필드 */}
                {fields.map(({ name, type, placeholder }) => (
                    <div key={name} className="form-group">
                        <label htmlFor={name}>{placeholder}</label>
                        <input
                            type={type}
                            name={name}
                            id={name}
                            placeholder={placeholder}
                            value={formData[name]}
                            onChange={handleChange}
                            className={errors[name] ? 'input-error' : ''}
                        />
                        {errors[name] && <div className="error-message">{errors[name]}</div>}
                    </div>
                ))}

                <button className="submit-button" onClick={handleSignup}>회원가입</button>
            </div>
        </div>
    );
};

export default SignupPage;
