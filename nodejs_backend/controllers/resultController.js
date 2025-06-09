import pool from '../config/db.js';

export const savePracticeResult = async (req, res) => {
    const { user_id, word, recognized_text, pronunciation_score, mouth_shape_score, final_score } = req.body;
    if (!user_id || !word) return res.status(400).json({ message: '필수 데이터 누락' });
    try {
        await pool.query(
            'INSERT INTO practice_results (user_id, word, recognized_text, pronunciation_score, mouth_shape_score, final_score) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, word, recognized_text, pronunciation_score, mouth_shape_score, final_score]
        );
        res.status(201).json({ message: '결과 저장 완료' });
    } catch (err) {
        console.error('저장 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};
