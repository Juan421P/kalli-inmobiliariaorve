import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoritesContext from '@/context/FavoritesContext';

const FAV_KEY = 'orve_favorites';

/**
 * Favoritos guardados localmente en el dispositivo (AsyncStorage), igual que
 * localStorage en la web (frontend/public/src/hooks/useFavorites.js).
 *
 * Antes esto vivia directo en el hook useFavorites(), y cada pantalla que lo
 * llamaba (Home, Propiedades, Detalle, Favoritos) tenia su PROPIO useState
 * independiente: marcar un favorito en una pantalla escribia en AsyncStorage,
 * pero la pantalla de Favoritos (montada aparte, ej. como tab que ya estaba
 * abierta) nunca se enteraba porque su copia en memoria no se releia. Por
 * eso "marco favorito pero no aparece en Favoritos" — no era un problema de
 * AsyncStorage ni de IDs, era que no habia una sola fuente de verdad
 * compartida. Con esto, un solo estado vive acá (una vez, al nivel de la
 * app) y toda pantalla que use useFavorites() lee/escribe la misma fuente,
 * igual que ya hacen AuthProvider/ToastProvider para sesion y toasts.
 */
const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem(FAV_KEY)
            .then((raw) => setFavorites(raw ? JSON.parse(raw) : []))
            .catch(() => setFavorites([]))
            .finally(() => setIsLoading(false));
    }, []);

    const toggleFavorite = useCallback((property) => {
        setFavorites((prev) => {
            const exists = prev.some((f) => f._id === property._id);
            const next = exists
                ? prev.filter((f) => f._id !== property._id)
                : [...prev, {
                    _id: property._id,
                    public_id: property.public_id,
                    title: property.title,
                    price: property.price,
                    address: property.address,
                    property_type: property.property_type,
                    image: property.pictures?.[0]?.picture ?? property.image ?? null,
                }];
            AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch(() => {});
            return next;
        });
    }, []);

    const isFavorite = useCallback(
        (id) => favorites.some((f) => f._id === id),
        [favorites]
    );

    const value = useMemo(
        () => ({ favorites, isLoading, toggleFavorite, isFavorite }),
        [favorites, isLoading, toggleFavorite, isFavorite]
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export default FavoritesProvider;
