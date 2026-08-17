import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = 'orve_favorites';

/** Favoritos guardados localmente en el dispositivo (AsyncStorage), igual que
 * localStorage en la web (frontend/public/src/hooks/useFavorites.js). */
const useFavorites = () => {
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
            const exists = prev.find((f) => f._id === property._id);
            const next = exists
                ? prev.filter((f) => f._id !== property._id)
                : [...prev, {
                    _id: property._id,
                    public_id: property.public_id,
                    title: property.title,
                    price: property.price,
                    address: property.address,
                    property_type: property.property_type,
                    image: property.pictures?.[0]?.picture ?? null,
                }];
            AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isFavorite = useCallback((id) => favorites.some((f) => f._id === id), [favorites]);

    return { favorites, isLoading, toggleFavorite, isFavorite };
};

export default useFavorites;
