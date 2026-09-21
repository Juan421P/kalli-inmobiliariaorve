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

// Mismo comportamiento que formatPhoneInput pero para el formato del DUI
// (00000000-0 que exige el backend): 8 dígitos, guion, y un dígito más.
export function formatDuiInput(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 9);
  return digits.length > 8 ? `${digits.slice(0, 8)}-${digits.slice(8)}` : digits;
}