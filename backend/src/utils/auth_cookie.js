// En produccion el frontend (Vercel) y el backend (Render) viven en dominios
// distintos, asi que la cookie tiene que ser sameSite:'none' + secure para que
// el navegador la mande en esas peticiones cross-site. Local no puede usar
// secure porque ahi no hay HTTPS, por eso queda condicionado a NODE_ENV.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = isProd
    ? { httpOnly: true, sameSite: 'none', secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }
    : { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 };

export const authCookie = {
    set: (res, token) => res.cookie('auth', token, cookieOptions),
    clear: (res) => res.clearCookie('auth', cookieOptions)
};