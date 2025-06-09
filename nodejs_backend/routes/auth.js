// 📁 routes/auth.js

import express from 'express';
import {
    registerUser,
    loginUser,
    checkUsername
} from '../controllers/authController.js'; // ✅ 컨트롤러 import

const router = express.Router();

router.post('/signup', registerUser);    // 회원가입
router.post('/login', loginUser);        // 로그인
router.get('/check-id', checkUsername);  // 아이디 중복 확인

export default router;
