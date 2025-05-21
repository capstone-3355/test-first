import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/MainPage.css';
import Image1 from '../assets/images/005.png';
import Image2 from '../assets/images/006.png';
import Image3 from '../assets/images/007.png';
import Image4 from '../assets/images/008.png';

const MainPage = ({ userInfo }) => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef(null);
    const profileRef = useRef(null);

    // 사용자 이름에서 첫 두 글자 추출
    const displayName = userInfo?.name?.slice(0, 2) || '';

    // 로그아웃 처리
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    // 팝업 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="main-page">
            <header>
                <div className="header-text">
                    <p className="greeting">
                        발음,<span className="highlight">바름</span>
                    </p>
                    <p className="main-text">{userInfo?.name}님, 오늘은 무엇을 배워볼까요?</p>
                </div>
                <div
                    className="profile"
                    ref={profileRef}
                    onClick={() => setShowPopup(!showPopup)}
                >
                    <span className="profile-text">{displayName}</span>
                    {showPopup && (
                        <div className="profile-popup" ref={popupRef}>
                            <div className="popup-header">
                                <div className="popup-profile-circle">
                                    <span className="profile-text">{displayName}</span>
                                </div>
                                <div className="popup-user-info">
                                    <p className="popup-user-name">{userInfo?.name}</p>
                                    <p className="popup-user-email">{userInfo?.email || 'alsgm513@naver.com'}</p>
                                </div>
                            </div>
                            <hr className="popup-divider" />
                            <Link to="/my-info" className="popup-link">나의 정보</Link>
                            <button className="popup-link logout-button" onClick={handleLogout}>로그아웃</button>
                        </div>
                    )}
                </div>
            </header>
            <div className="container">
                <div className="card card-1">
                    <h3>단어 연습</h3>
                    <p>다양한 단어를 연습해요!</p>
                    <img src={Image1} alt="단어" />
                </div>
                <div className="card card-2">
                    <h3>짧은 문장 연습</h3>
                    <p>간단한 문장을 연습해요!</p>
                    <img src={Image2} alt="짧은문장" />
                </div>
                <div className="card card-3">
                    <h3>긴 문장 연습</h3>
                    <p>긴 문장을 연습해요!</p>
                    <img src={Image3} alt="긴문장" />
                </div>
                <div className="card card-4">
                    <h3>자유 모드</h3>
                    <p>원하는 문장을 말할 수 있어요!</p>
                    <img src={Image4} alt="자유모드" />
                </div>
            </div>
        </div>
    );
};

export default MainPage;