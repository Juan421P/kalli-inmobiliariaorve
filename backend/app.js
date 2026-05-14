import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { requestLogger } from './src/middleware/request_logger.js';
import { errorHandler } from './src/middleware/error_handler.js';
import AppRouter from './src/routers/index.js';
const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(requestLogger);
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'too many requests, please try again later' }
}));
app.use('/api', AppRouter);
app.use('*', (req, res) => {
    return HttpResponses.notFound(res, `path ${req.originalUrl} not found on this server`);
});
app.use(errorHandler);
export default app;