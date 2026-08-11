import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middleware/error_handler.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDocs from '../docs/swagger.json' with {type: 'json'};
import router from './src/routers/router.js';
const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);
const requestLimit = {
    general: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'too many requests, please try again later' }
    }),
    auth: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: 'too many attempts, please try again later' },
        skipSuccessfulRequests: true,
    })
};
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return cb(null, true);
        }

        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api', requestLimit.general);
app.use([
    '/api/admin/login',
    '/api/admin/invite',
    '/api/admin/complete-invitation',
    '/api/admin/password-recovery',
    '/api/client/login',
    '/api/client/register',
    '/api/client/verify-email',
    '/api/client/password-recovery',
    '/api/collaborator/login',
    '/api/collaborator/invite',
    '/api/collaborator/complete-invitation',
    '/api/collaborator/password-recovery',
], requestLimit.auth);
app.use('/api', router);
app.use((req, res) => {
    return res.status(404).json({ message: 'route not found' });
});
app.use(errorHandler);
export default app;