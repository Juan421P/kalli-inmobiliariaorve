import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPARE_KEY = 'orve_compare';
export const MAX_SLOTS = 3;

/** Propiedades seleccionadas para comparar, persistidas en AsyncStorage,
 * igual que el sessionStorage de frontend/public/src/pages/CompareProperties.jsx. */
const useCompare = () => {
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(COMPARE_KEY)
            .then((raw) => setSlots(raw ? JSON.parse(raw) : []))
            .catch(() => setSlots([]))
            .finally(() => setIsLoading(false));
    }, []);

    const persist = (next) => {
        setSlots(next);
        AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    };

    const addProperty = useCallback((property) => {
        setSlots((prev) => {
            if (prev.find((p) => p._id === property._id)) return prev;
            const next = [...prev, property].slice(0, MAX_SLOTS);
            AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const removeProperty = useCallback((id) => {
        setSlots((prev) => {
            const next = prev.filter((p) => p._id !== id);
            AsyncStorage.setItem(COMPARE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clearAll = useCallback(() => persist([]), []);

    return { slots, isLoading, addProperty, removeProperty, clearAll };
};

export default useCompare;
