import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Pide permiso de ubicación al usuario (foreground) y expone sus coordenadas.
 * No pide el permiso automáticamente al montar: solo cuando se llama a
 * requestLocation (ej. al tocar "Cerca de mí" o el botón de centrar el mapa),
 * para no bombardear al usuario con el prompt nativo apenas entra a Propiedades.
 */
const useUserLocation = () => {
    const [coords, setCoords] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | loading | granted | denied | error

    const requestLocation = useCallback(async () => {
        setStatus('loading');
        try {
            const { status: permission } = await Location.requestForegroundPermissionsAsync();
            if (permission !== 'granted') {
                setStatus('denied');
                return null;
            }
            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            setCoords(next);
            setStatus('granted');
            return next;
        } catch {
            setStatus('error');
            return null;
        }
    }, []);

    return { coords, status, requestLocation };
};

export default useUserLocation;
