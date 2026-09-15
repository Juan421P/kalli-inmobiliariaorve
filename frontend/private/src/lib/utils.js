import { clsx } from 'clsx';;
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Inserta el guion automáticamente mientras se escribe, para que el valor
// siempre quede en el formato 0000-0000 que exige el backend, sin que el
// usuario tenga que teclearlo (ej. "73264064" -> "7326-4064").
export function formatPhoneInput(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}