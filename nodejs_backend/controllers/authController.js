import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// 회원가입
export const registerUser = async (req, res) => {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, name, email]
        );

        res.status(201).json({ message: '회원가입 성공' });
    } catch (err) {
        console.error('DB 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 로그인
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: '존재하지 않는 사용자입니다.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        res.status(200).json({
            message: '로그인 성공',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('로그인 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 아이디 중복 확인
export const checkUsername = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: '아이디를 입력해주세요.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
        }

        return res.status(200).json({ message: '사용 가능한 아이디입니다.' });
    } catch (error) {
        console.error('아이디 중복 확인 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};
