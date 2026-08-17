import { email as e, shortText, phone as p, document as d } from './primitives.js';

// schemas que definen la estructura y datos personales del perfil de cualquier usuario
export const name = shortText();
export const lastname = shortText();
export const email = e();
export const phone = p(); // { countryCode, number }
export const document = d(); // { type, number }