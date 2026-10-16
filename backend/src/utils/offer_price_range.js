import ValidationError from '../errors/validation.js';

// monto mínimo que se acepta en una oferta o contraoferta: el 70% del precio
// publicado, sin tope máximo. Es el mismo mínimo que el frontend ya le sugería
// al cliente al hacer su oferta, ahora se hace cumplir aquí para que no se
// pueda saltar con una petición directa a la API
export const MIN_PRICE_RATIO = 0.70;

export function getAllowedRange(propertyPrice) {
    return {
        min: Math.round(propertyPrice * MIN_PRICE_RATIO),
    };
}

const formatUSD = (value) => value.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
});

// lanza un ValidationError si el monto queda por debajo del mínimo de la propiedad.
// `action` solo cambia la redacción del mensaje (ofertar, contraofertar, aceptar)
export function assertPriceInRange(price, propertyDoc, { action = 'offer', offerId } = {}) {
    const { min } = getAllowedRange(propertyDoc.price);
    const meta = { resource: 'property', id: propertyDoc._id, offer_id: offerId, price, min };

    if (action === 'accept') {
        if (price < min) throw new ValidationError(
            `no se puede aceptar la oferta: el monto de ${formatUSD(price)} está por debajo del mínimo permitido para esta propiedad (${formatUSD(min)})`,
            { code: 'OFFER_PRICE_BELOW_MIN', ...meta }
        );
        return;
    }

    if (price < min) throw new ValidationError(
        `el monto mínimo permitido para esta propiedad es ${formatUSD(min)}`,
        { code: 'OFFER_PRICE_BELOW_MIN', ...meta }
    );
}
