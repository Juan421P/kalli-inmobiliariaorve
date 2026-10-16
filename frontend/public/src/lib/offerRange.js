// Monto minimo permitido para ofertas y contraofertas: el 70% del precio
// publicado, sin tope maximo. Es un espejo de
// backend/src/utils/offer_price_range.js -el backend es el que manda y vuelve
// a validar todo-, aca solo sirve para avisarle al cliente antes de enviar.
export const MIN_PRICE_RATIO = 0.70

export const getAllowedRange = (propertyPrice) => ({
    min: Math.round(propertyPrice * MIN_PRICE_RATIO),
})

export const formatUSD = (value) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

/**
 * Devuelve el motivo por el que un monto no es valido, o null si lo es.
 * @param {string|number} raw - lo que escribio el usuario
 * @param {number} [propertyPrice] - precio publicado; sin el solo se valida el formato
 */
export const getPriceError = (raw, propertyPrice) => {
    if (raw === '' || raw === null || raw === undefined) return 'Ingrese un monto.'
    const value = Number(raw)
    if (!Number.isFinite(value)) return 'Ingrese un monto con un formato válido.'
    if (value <= 0) return 'El monto debe ser mayor que cero.'
    if (!propertyPrice) return null
    const { min } = getAllowedRange(propertyPrice)
    if (value < min) return `El monto mínimo permitido para esta propiedad es ${formatUSD(min)}.`
    return null
}
