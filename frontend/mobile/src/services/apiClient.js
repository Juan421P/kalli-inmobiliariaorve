import { API_URL } from './config';
import { getErrorMessage } from '@/lib/errorMessages';

// El backend en produccion (Render, plan gratuito) se "duerme" tras un rato
// sin trafico y puede tardar bastante en responder la primera peticion
// mientras despierta, asi que el timeout tiene que ser generoso para no
// confundir un cold start con una caida real. Pero sigue siendo ACOTADO: sin
// esto, un fetch que nunca resuelve (red movil rara, servidor colgado) deja
// pantallas como el loader de sesion esperando para siempre sin ningun aviso.
const REQUEST_TIMEOUT_MS = 45_000;

// Se usa la funcion nativa fetch de JavaScript (no Axios) para las peticiones
// HTTP, tal como en el resto de la app. React Native maneja las cookies de
// sesion (ver backend/src/utils/auth_cookie.js) a nivel del stack de red
// nativo (NSURLSession en iOS, OkHttp en Android), igual que un navegador,
// asi que no hace falta ningun manejo manual de cookies desde JS.
async function request(path, { method = 'GET', body, headers = {}, timeout = REQUEST_TIMEOUT_MS } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            credentials: 'include',
            signal: controller.signal,
            // 'no-store' en GET evita que el stack de red nativo (OkHttp en
            // Android, NSURLSession en iOS) reutilice una respuesta cacheada
            // de una peticion anterior dentro de la misma sesion de la app —
            // sin esto, pantallas como "Actividad" del perfil solo mostraban
            // datos frescos despues de cerrar y volver a abrir la app entera.
            ...(method === 'GET' && { cache: 'no-store' }),
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(method === 'GET' && { 'Cache-Control': 'no-cache' }),
                ...headers,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (networkError) {
        // fetch rechaza sin .status cuando no hubo respuesta del servidor
        // (sin conexion, backend caido, DNS, etc.) o cuando el AbortController
        // lo corta por timeout (networkError.name === 'AbortError') —
        // getErrorMessage distingue ambos casos por la ausencia de `status`.
        networkError.friendlyMessage = getErrorMessage(networkError);
        throw networkError;
    } finally {
        clearTimeout(timer);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const error = new Error(data?.message ?? `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        // Se calcula acá, una sola vez, un mensaje legible para el usuario.
        // Así cualquier catch en hooks/pantallas puede usar
        // `error.friendlyMessage` en vez de repetir
        // `err?.data?.message ?? 'algo generico'`.
        error.friendlyMessage = getErrorMessage(error);
        throw error;
    }
    return data;
}

const api = {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
