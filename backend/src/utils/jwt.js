export const jwt = {
    sign = (payload, expiresIn) => {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn
        });
    },
    verify = (token) => {
        return jwt.verify(token, config.jwt.secret);
    }
};