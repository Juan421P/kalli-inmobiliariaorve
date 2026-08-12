import { Platform } from 'react-native';

// En el emulador de Android "localhost" apunta al propio emulador, no a la
// maquina host, por eso se usa la IP especial 10.0.2.2. En el simulador de
// iOS si se puede usar localhost directo.
// Para probar en un celular fisico hay que levantar el backend en la misma
// red y exportar EXPO_PUBLIC_API_URL con la IP de esa maquina, ej:
// EXPO_PUBLIC_API_URL=http://192.168.1.5:4000/api npx expo start
const DEV_FALLBACK = Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK;
