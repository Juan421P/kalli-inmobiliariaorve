// Traduce errores de apiClient (fetch) a mensajes que sí explican qué pasó.
//
// El backend casi siempre manda { message: '...' } en el body cuando algo
// falla, pero hay casos donde eso no llega y lo único que se ve es un texto
// generico como "Error 404", o el mensaje crudo de fetch. Pasa por ejemplo
// cuando:
//   - la ruta no existe o hay un typo en la URL
//   - el backend esta caido, hay un problema de red o CORS lo bloquea
//   - el rate limiter responde con { error: '...' } en vez de { message: '...' }
//
// getErrorMessage() se encarga de que, pase lo que pase, siempre salga un
// mensaje entendible en vez de un codigo pelado. Misma logica que
// frontend/public/src/lib/errorMessages.js y frontend/private/src/lib/errorMessages.js,
// adaptada a la forma del error que tira apiClient.js (error.status/error.data
// en vez de error.response.status/error.response.data, porque acá se usa
// fetch en vez de axios).

// Mensajes por defecto según el código HTTP, para cuando el backend no
// mandó nada útil en el body. Sirven como red de seguridad, no como
// reemplazo de los mensajes específicos que ya manda el backend.
const STATUS_MESSAGES = {
    400: 'Los datos enviados no son válidos. Revise el formulario e intente de nuevo.',
    401: 'Correo electrónico o contraseña incorrectos.',
    403: 'No tiene permisos para realizar esta acción.',
    404: 'No se encontró lo que buscaba. Puede que el enlace o el recurso ya no exista.',
    408: 'La solicitud tardó demasiado en completarse. Intente de nuevo.',
    409: 'Ya existe un registro con esos datos.',
    413: 'El archivo es demasiado grande.',
    422: 'Algunos campos no tienen un formato válido.',
    429: 'Demasiados intentos. Espere unos minutos antes de volver a intentar.',
    500: 'Ocurrió un error interno en el servidor. Intente de nuevo más tarde.',
    502: 'El servidor no está disponible en este momento. Intente de nuevo más tarde.',
    503: 'El servicio no está disponible en este momento. Intente de nuevo más tarde.',
    504: 'El servidor tardó demasiado en responder. Intente de nuevo.',
}

const NETWORK_MESSAGE = 'No se pudo conectar con el servidor. Verifique su conexión a internet e intente de nuevo.'
const TIMEOUT_MESSAGE = 'La solicitud tardó demasiado en responder. Intente de nuevo.'
const DEFAULT_FALLBACK = 'Ocurrió un error inesperado. Intente de nuevo.'

// Revisa 'message' y, por si acaso, 'error' (el rate limiter del backend usa
// esa llave en vez de 'message'). Si el body no es un objeto o no trae nada
// usable, devuelve null para que se use el mapeo por status en su lugar.
const extractBackendMessage = (data) => {
    if (!data || typeof data !== 'object') return null
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.error === 'string' && data.error.trim()) return data.error
    return null
}

/**
 * Devuelve siempre un mensaje legible para el usuario a partir de un error
 * de apiClient (o cualquier error con forma similar: { status, data }).
 *
 * @param {*} error - el error atrapado en el catch
 * @param {Object} [options]
 * @param {string} [options.fallback] - mensaje a usar si no hay nada mejor
 *   (ni mensaje del backend ni mapeo por status).
 * @param {Object<number,string>} [options.statusMessages] - overrides de
 *   mensaje por status específicos para este caso de uso.
 * @returns {string}
 */
export const getErrorMessage = (error, options = {}) => {
    const { fallback, statusMessages = {} } = options

    // Sin `status` significa que el fetch mismo falló antes de llegar a
    // tener una respuesta HTTP: sin conexión, timeout, DNS, el backend
    // caído, etc. (ver apiClient.js, que solo pone .status cuando sí hubo
    // respuesta, aunque fuera un error).
    if (error?.status == null) {
        if (error?.name === 'AbortError') return TIMEOUT_MESSAGE
        return NETWORK_MESSAGE
    }

    const backendMessage = extractBackendMessage(error.data)
    if (backendMessage) return backendMessage

    return statusMessages[error.status] || STATUS_MESSAGES[error.status] || fallback || DEFAULT_FALLBACK
}

// Detalles extra (meta, status) que a veces hacen falta para tomar una
// decision en el componente ademas de solo mostrar el texto.
export const getErrorMeta = (error) => error?.data?.meta ?? null
export const getErrorStatus = (error) => error?.status ?? null

export default getErrorMessage
