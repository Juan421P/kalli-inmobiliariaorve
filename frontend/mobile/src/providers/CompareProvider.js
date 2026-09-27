import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CompareContext from '@/context/CompareContext';

const COMPARE_KEY = 'orve_compare';
export const MAX_SLOTS = 3;

/**
 * Propiedades seleccionadas para comparar, persistidas en AsyncStorage,
 * igual que el sessionStorage de frontend/public/src/pages/CompareProperties.jsx.
 *
 * Mismo motivo que FavoritesProvider: `CompareScreen` y `CompareSelectScreen`
 * son dos pantallas distintas del mismo stack, y React Navigation no
 * desmonta `CompareScreen` cuando se navega a `CompareSelectScreen` encima
 * (solo la tapa) — si cada una tuviera su propio useState, agregar una
 * propiedad en "Elegir propiedad" y volver atrás no se reflejaba en
 * `CompareScreen`, que se habia quedado con su copia vieja en memoria desde
 * antes de que existiera el cambio. Con el estado viviendo una sola vez acá
 * (mismo patron que FavoritesProvider/AuthProvider/ToastProvider), ambas
 * pantallas leen y escriben la misma fuente.
 */
const CompareProvider = ({ children }) => {
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(COMPARE_KEY)
            .then((raw) => setSlots(raw ? JSON.parse(raw) : []))
            .catch(() => setSlots([]))
            .finally(() => setIsLoading(false));
    }, []);

    const addProperty = useCallback((property) => {
        setSlots((prev) => {
            if (prev.some((p) => p._id === property._id)) return prev;
            const next = [...prev, property].slice(0, MAX_SLOTS);
            AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(next)).catch(() => {});
            return next;
        });
    }, []);

    const removeProperty = useCallback((id) => {
        setSlots((prev) => {
            const next = prev.filter((p) => p._id !== id);
            AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(next)).catch(() => {});
            return next;
        });
    }, []);

    const clearAll = useCallback(() => {
        setSlots([]);
        AsyncStorage.setItem(COMPARE_KEY, JSON.stringify([])).catch(() => {});
    }, []);

    const value = useMemo(
        () => ({ slots, isLoading, addProperty, removeProperty, clearAll }),
        [slots, isLoading, addProperty, removeProperty, clearAll]
    );

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
};

export default CompareProvider;
