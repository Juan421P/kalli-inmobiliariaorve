/**
 * Standardized HTTP response builder.
 *
 * Provides:
 * - Consistent API response structure
 * - Centralized status handling
 * - Reusable success/error helpers
 * - Timestamp generation
 * - Pagination support
 * - Extensible response metadata
 */
class HttpResponses {
    /**
     * Builds a standardized response object.
     *
     * @param {Object} options - Response configuration
     * @param {boolean} options.ok - Indicates request success
     * @param {string} options.message - Human-readable response message
     * @param {*} [options.data=null] - Response payload
     * @param {*} [options.error=null] - Error details
     * @param {*} [options.meta=null] - Additional metadata
     *
     * @returns {Object} Standardized API response
     */
    static build({ ok, message, data = null, error = null, meta = null }) {
        return {
            ok,
            message,
            data,
            error,
            meta,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Sends a standardized JSON response.
     *
     * @param {Object} res - Express response object
     * @param {number} status - HTTP status code
     * @param {Object} payload - Response payload
     *
     * @returns {Object} Express response
     */
    static send(res, status, payload) {
        return res.status(status).json(this.build(payload));
    }
    /**
     * Sends a successful HTTP response.
     *
     * @param {Object} res - Express response object
     * @param {*} [data=null] - Response payload
     * @param {string} [message='Solicitud exitosa'] - Success message
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static ok(res, data = null, message = 'Solicitud exitosa', meta = null) {
        return this.send(res, 200, {
            ok: true,
            message,
            data,
            meta,
        });
    }
    /**
     * Sends a resource created response.
     *
     * @param {Object} res - Express response object
     * @param {*} [data=null] - Created resource
     * @param {string} [message='Recurso creado correctamente'] - Success message
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static created(res, data = null, message = 'Recurso creado correctamente', meta = null) {
        return this.send(res, 201, {
            ok: true,
            message,
            data,
            meta,
        });
    }
    /**
     * Sends a no content response.
     *
     * @param {Object} res - Express response object
     *
     * @returns {Object} Express response
     */
    static noContent(res) {
        return res.status(204).send();
    }
    /**
     * Sends a bad request response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Solicitud invalida'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static badRequest(res, message = 'Solicitud invalida', error = null, meta = null) {
        return this.send(res, 400, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends an unauthorized response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='No autorizado'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static unauthorized(res, message = 'No autorizado', error = null, meta = null) {
        return this.send(res, 401, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends a forbidden response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Acceso denegado'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static forbidden(res, message = 'Acceso denegado', error = null, meta = null) {
        return this.send(res, 403, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends a resource not found response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Recurso no encontrado'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static notFound(res, message = 'Recurso no encontrado', error = null, meta = null) {
        return this.send(res, 404, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends a conflict response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Conflicto en la solicitud'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static conflict(res, message = 'Conflicto en la solicitud', error = null, meta = null) {
        return this.send(res, 409, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends a validation error response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Error de validacion'] - Error message
     * @param {*} [error=null] - Validation details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static unprocessable(res, message = 'Error de validacion', error = null, meta = null) {
        return this.send(res, 422, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends an internal server error response.
     *
     * @param {Object} res - Express response object
     * @param {string} [message='Error interno del servidor'] - Error message
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static serverError(res, message = 'Error interno del servidor', error = null, meta = null) {
        return this.send(res, 500, {
            ok: false,
            message,
            error,
            meta,
        });
    }
    /**
     * Sends a paginated response.
     *
     * @param {Object} res - Express response object
     * @param {Array} [data=[]] - Paginated data
     * @param {Object} [pagination={}] - Pagination metadata
     * @param {string} [message='Listado obtenido correctamente'] - Success message
     *
     * @returns {Object} Express response
     */
    static paginated(res, data = [], pagination = {}, message = 'Listado obtenido correctamente') {
        return this.send(res, 200, {
            ok: true,
            message,
            data,
            meta: { pagination },
        });
    }
    /**
     * Generic customizable response handler.
     *
     * Useful for uncommon HTTP responses without creating
     * dedicated helper methods.
     *
     * @param {Object} res - Express response object
     * @param {number} status - HTTP status code
     * @param {boolean} ok - Indicates request success
     * @param {string} message - Response message
     * @param {*} [data=null] - Response payload
     * @param {*} [error=null] - Error details
     * @param {*} [meta=null] - Additional metadata
     *
     * @returns {Object} Express response
     */
    static custom(res, status, ok, message, data = null, error = null, meta = null) {
        return this.send(res, status, {
            ok,
            message,
            data,
            error,
            meta,
        });
    }
}
export default HttpResponses;