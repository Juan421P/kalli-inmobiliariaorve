import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL normalmente viene del archivo .env de este proyecto
// (apunta al backend de produccion en Render por defecto — ver ese archivo),
// asi que tanto el emulador como un celular fisico con Expo Go/dev client
// funcionan sin configurar nada de red. DEV_FALLBACK solo se usa si ese
// archivo faltara o la variable viniera vacia.
//
// En el emulador de Android "localhost" apunta al propio emulador, no a la
// maquina host, por eso se usa la IP especial 10.0.2.2 para apuntar a un
// backend corriendo en la compu. En el simulador de iOS si se puede usar
// localhost directo. Ninguna de las dos sirve desde un celular fisico real
// (ver .env para como apuntar a un backend en la red local en ese caso).
const DEV_FALLBACK = Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK;
