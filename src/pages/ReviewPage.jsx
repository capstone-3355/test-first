import React, { useEffect, useState } from 'react';


const ReviewPage = () => {
    const [reviewSentences, setReviewSentences] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userId = userInfo?.id;

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:5050/api/review?user_id=${userId}`)
            .then(res => res.json())
            .then(data => setReviewSentences(data))
            .catch(err => console.error('복습 데이터 불러오기 실패', err));
    }, [userId]);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === reviewSentences.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reviewSentences.map(item => item.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0 || !window.confirm('정말 선택 항목을 삭제할까요?')) return;

        for (let id of selectedIds) {
            await fetch('http://localhost:5050/api/delete-word', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, user_id: userId })
            });
        }

        setReviewSentences(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setSelectedIds([]);
    };

    const handlePracticeSelected = () => {
        const selectedContents = reviewSentences
            .filter(item => selectedIds.includes(item.id))
            .map(item => item.content);

        localStorage.setItem("sentenceList", JSON.stringify(selectedContents));
        window.location.href = "/sentence-practice";
    };

    return (
        <div className="practice-wrapper">
            <h2 className="practice-title">복습하기</h2>
            <p className="practice-subtitle">틀린 문장들을 복습하고 정리하세요.</p>

            {userId && reviewSentences.length > 0 && (
                <div className="bulk-actions">
                    <div className="select-all">
                        <span>전체 선택</span>
                        <input
                            type="checkbox"
                            checked={selectedIds.length === reviewSentences.length}
                            onChange={handleSelectAll}
                        />
                    </div>
                    <button onClick={handlePracticeSelected}>복습</button>
                    <button onClick={handleDeleteSelected}>삭제</button>
                </div>
            )}

            {!userId ? (
                <p>로그인 후 이용 가능합니다.</p>
            ) : reviewSentences.length === 0 ? (
                <p>복습할 문장이 없습니다.</p>
            ) : (
                <ul className="review-list">
                    {reviewSentences.map(item => (
                        <li key={item.id} className="review-item">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                            />
                            <div className="sentence-info">
                                <strong>{item.content}</strong>
                                <span className="text-sm">
                  ({new Date(item.created_at).toLocaleDateString()})
                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReviewPage;
