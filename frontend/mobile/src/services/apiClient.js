import { API_URL } from './config';

// Se usa la funcion nativa fetch de JavaScript (no Axios) para las peticiones
// HTTP, tal como en el resto de la app. React Native maneja las cookies de
// sesion (ver backend/src/utils/auth_cookie.js) a nivel del stack de red
// nativo (NSURLSession en iOS, OkHttp en Android), igual que un navegador,
// asi que no hace falta ningun manejo manual de cookies desde JS.
async function request(path, { method = 'GET', body, headers = {} } = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        method,
        credentials: 'include',
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const error = new Error(data?.message ?? `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

const api = {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
