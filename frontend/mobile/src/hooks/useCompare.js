import { useContext } from 'react';
import CompareContext from '@/context/CompareContext';
import { MAX_SLOTS } from '@/providers/CompareProvider';

export { MAX_SLOTS };

/**
 * Comparador compartido en toda la app (ver CompareProvider — un solo
 * estado real, poblado desde AsyncStorage una sola vez en la raiz de la
 * app). Mismo patron que useAuth()/useToast()/useFavorites().
 */
const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) throw new Error('useCompare must be used within CompareProvider');
    return context;
};

export default useCompare;
