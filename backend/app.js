import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middleware/error_handler.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDocs from './src/docs/swagger.json' with {type: 'json'};
import router from './src/routers/router.js';
const allowedOrigins = [
    'https://kalli-inmobiliariaorve-omega.vercel.app',
    'https://kalli-inmobiliariaorve-6s5l.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);
// Vite prueba puertos consecutivos (5173, 5174, 5175...) cuando el anterior
// ya esta ocupado, asi que hardcodear un puerto especifico rompe CORS apenas
// se levanta un cuarto o quinto frontend en simultaneo. En dev se acepta
// cualquier puerto de localhost/127.0.0.1; en produccion sigue exigiendose
// el match exacto contra allowedOrigins de arriba.
const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
const requestLimit = {
    general: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'demasiadas solicitudes, intente de nuevo más tarde' }
    }),
    auth: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: { error: 'demasiados intentos, intente de nuevo más tarde' },
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
        if (!origin || allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
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
    return res.status(404).json({ message: 'ruta no encontrada' });
});
app.use(errorHandler);
export default app;