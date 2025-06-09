// 📁 routes/result.js

import express from 'express';
import { savePracticeResult } from '../controllers/resultController.js';

const router = express.Router();

router.post('/save-result', savePracticeResult); // 결과 저장 API

export default router;
