import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import propertyService from '@/services/propertyService';

/**
 * Logica de la pantalla de inicio: trae todas las propiedades (para las
 * secciones de "Recientes"/"Populares") y maneja el buscador del Hero, que
 * al confirmar navega al listado con el texto buscado.
 */
const useHome = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        propertyService.getAll()
            .then((data) => {
                const list = data?.properties ?? data?.data ?? data ?? [];
                setProperties(Array.isArray(list) ? list : []);
            })
            .catch(() => setProperties([]))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearch = () => {
        if (!search.trim()) return;
        navigation.navigate('PropertyList', { query: search.trim() });
    };

    return { search, setSearch, properties, isLoading, handleSearch };
};

export default useHome;
