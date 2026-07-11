import { email, text, phone, document } from './primitives';

// schemas que definen la estructura y datos personales del perfil de cualquier usuario
export const name = text();
export const lastname = text();
export const email = email();
export const phone = phone(); // { countryCode, number }
export const document = document(); // { type, number }