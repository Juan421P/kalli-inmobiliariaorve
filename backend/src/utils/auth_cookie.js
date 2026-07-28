export const authCookie = {
    set: (res, token) => {
        res.cookie('auth', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
    },
    clear: (res) => {
        res.clearCookie('auth');
    }
};