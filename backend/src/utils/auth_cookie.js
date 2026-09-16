// En produccion el frontend (Vercel) y el backend (Render) viven en dominios
// distintos, asi que la cookie tiene que ser sameSite:'none' + secure para que
// el navegador la mande en esas peticiones cross-site. Local no puede usar
// secure porque ahi no hay HTTPS, por eso queda condicionado a NODE_ENV.
const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = isProd
    ? { httpOnly: true, sameSite: 'none', secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }
    : { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 };

// Un nombre de cookie por rol (en vez de una sola "auth" compartida): así
// iniciar sesión como admin no pisa la sesión de un colaborador ni la de un
// cliente que ya estaban activas en otras pestañas del mismo navegador -antes,
// las tres compartían el mismo nombre de cookie, así que la última sesión
// iniciada sobreescribía silenciosamente a las demás en TODAS las pestañas.
export const AUTH_COOKIE_NAMES = {
    admin: 'auth_admin',
    client: 'auth_client',
    collaborator: 'auth_collaborator',
};

export const authCookie = {
    set: (res, token, role) => res.cookie(AUTH_COOKIE_NAMES[role], token, cookieOptions),
    clear: (res, role) => res.clearCookie(AUTH_COOKIE_NAMES[role], cookieOptions),
};
