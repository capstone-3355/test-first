import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CategoryPage.css';

const categories = [
    { title: '음식', preview: ['🍱', '🍜', '🥘'] },
    { title: '장소', preview: ['🏫', '🏞️', '🏙️'] },
    { title: '직업', preview: ['👨‍⚕️', '👩‍🏫', '👨‍🔧'] },
    { title: '동물', preview: ['🐶', '🐱', '🦁'] },
    { title: '물건사물', preview: ['📱', '📚', '🎧'] },
    { title: '행동', preview: ['🏃‍♂️', '🛌', '🗣️'] },
    { title: '교통수단', preview: ['🚗', '🚲', '✈️'] },
];

const CategoryPage = () => {
    const navigate = useNavigate();

    const handleSelect = (category) => {
        fetch(`http://127.0.0.1:5000/words/random?category=${category}&limit=2`)

            .then(res => res.json())
            .then(data => {
                if (data.words) {
                    localStorage.setItem('wordList', JSON.stringify(data.words));
                    navigate('/practice');
                } else {
                    alert('단어를 불러올 수 없습니다.');
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
                    단어 연습으로<br />
                    기초부터 튼튼하게
                </h1>
            </div>

            <div className="category-grid">
                {categories.map(cat => (
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

export default CategoryPage;
