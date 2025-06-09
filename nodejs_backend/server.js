// 📁 server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import savedRoutes from './routes/saved.js';    // ⬅️ 추가
import resultRoutes from './routes/result.js';  // ⬅️ 추가

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 라우팅 등록
app.use('/api', authRoutes);
app.use('/api', savedRoutes);
app.use('/api', resultRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
