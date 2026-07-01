import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middleware/error_handler.js';
import router from './src/routers/router.js';
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'too many requests, please try again later' }
}));
app.use('/api', router);
app.use((req, res) => {
    return res.status(404).json({ message: `path ${req.originalUrl} not found on this server` });
});
app.use(errorHandler);
export default app;