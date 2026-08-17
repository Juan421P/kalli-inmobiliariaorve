import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config.js';

export const jwt = {
    sign: (payload, expiresIn) => jsonwebtoken.sign(payload, config.jwt.secret, { expiresIn }),
    verify: (token) => jsonwebtoken.verify(token, config.jwt.secret),
};