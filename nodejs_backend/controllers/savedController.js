import pool from '../config/db.js';

// 단어/문장 저장
export const saveWord = async (req, res) => {
    const { user_id, content, type } = req.body;

    if (!user_id || !content || !type) {
        return res.status(400).json({ message: '필수 데이터 누락' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id FROM saved_words WHERE user_id = ? AND content = ?',
            [user_id, content]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: '이미 저장된 내용입니다.' });
        }

        await pool.query(
            'INSERT INTO saved_words (user_id, content, type) VALUES (?, ?, ?)',
            [user_id, content, type]
        );

        res.status(201).json({ message: `${type === 'word' ? '단어' : '문장'} 저장 완료` });
    } catch (err) {
        console.error('저장 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 복습용 문장 조회
export const getSavedSentences = async (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ message: 'user_id 누락' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, content, type, created_at FROM saved_words WHERE user_id = ? AND type = ? ORDER BY created_at DESC',
            [userId, 'sentence']
        );

        res.json(rows);
    } catch (err) {
        console.error('조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 복습 항목 삭제
export const deleteSavedWord = async (req, res) => {
    const { id, user_id } = req.body;

    if (!id || !user_id) {
        return res.status(400).json({ message: 'id 또는 user_id 누락' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM saved_words WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '삭제할 항목이 없습니다.' });
        }

        res.json({ message: '삭제 성공' });
    } catch (err) {
        console.error('삭제 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};
