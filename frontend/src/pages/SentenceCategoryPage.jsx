import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SentenceCategoryPage.css';

const sentenceCategories = [
    { title: '인사', preview: ['🙋‍♀️', '🤝', '👋'] },
    { title: '음식', preview: ['🍱', '🍜', '🥘'] },
    { title: '쇼핑', preview: ['🛍️', '💳', '🏪'] },
    { title: '감정표현', preview: ['😊', '😢', '😠'] },
    { title: '교통', preview: ['🚗', '🚌', '🚇'] },
    { title: '병원', preview: ['🏥', '💊', '🩺'] },
    { title: '학교', preview: ['🏫', '📚', '✏️'] },
    { title: '일상', preview: ['🌞', '💬', '🏃‍♂️'] },
];

const SentenceCategoryPage = () => {
    const navigate = useNavigate();

    const handleSelect = (category) => {
        fetch(`http://127.0.0.1:5000/sentences/random?category=${category}&limit=2`)
            .then(res => res.json())
            .then(data => {
                if (data.words) {
                    localStorage.setItem('sentenceList', JSON.stringify(data.words));
                    navigate('/practice/sentence');
                } else {
                    alert('문장을 불러올 수 없습니다.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('서버 오류 발생');
            });
    };

    return (
        <div className="category-layout">
            <button className="back-button" onClick={() => navigate('/main')}>← 나가기</button>

            <div className="intro-text">
                <p className="sub">발음 바름</p>
                <h1 className="headline">
                    문장 연습으로<br />
                    실력을 키워봐요
                </h1>
            </div>

            <div className="category-grid">
                {sentenceCategories.map(cat => (
                    <div
                        key={cat.title}
                        className="category-card"
                        onClick={() => handleSelect(cat.title)}
                    >
                        <p className="label">카테고리</p>
                        <h3>{cat.title}</h3>
                        <div className="preview">
                            {cat.preview.map((icon, idx) => (
                                <span key={idx} className="key">{icon}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SentenceCategoryPage;
