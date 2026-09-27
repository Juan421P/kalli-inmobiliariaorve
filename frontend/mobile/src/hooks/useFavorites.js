import { useContext } from 'react';
import FavoritesContext from '@/context/FavoritesContext';

/**
 * Favoritos compartidos en toda la app (ver FavoritesProvider — un solo
 * estado real, poblado desde AsyncStorage una sola vez en la raiz de la
 * app). Mismo patron que useAuth()/useToast().
 */
const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
    return context;
};

export default useFavorites;
