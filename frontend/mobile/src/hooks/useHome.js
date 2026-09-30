import { useEffect, useState } from 'react';
import propertyService from '@/services/propertyService';
import useToast from '@/hooks/useToast';

/**
 * Logica de la pantalla de inicio: trae todas las propiedades para las
 * secciones de "Recientes"/"Populares".
 */
const useHome = () => {
    const toast = useToast();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchProperties = () => propertyService.getAll()
        .then((data) => {
            const list = data?.properties ?? data?.data ?? data ?? [];
            setProperties(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
            // Se deja la lista vacia igual (la UI ya sabe mostrar el
            // EmptyState de "sin propiedades"), pero se avisa la causa
            // real en vez de que un error de red se vea identico a que
            // simplemente no hay propiedades cargadas.
            setProperties([]);
            toast.error('No se pudieron cargar las propiedades', err.friendlyMessage);
        });

    useEffect(() => {
        fetchProperties().finally(() => setIsLoading(false));
    }, []);

    // Pull-to-refresh: mismo fetch, pero con su propio indicador para no
    // reemplazar la lista por los skeletons de carga inicial cada vez que se
    // desliza hacia abajo.
    const refresh = () => {
        setIsRefreshing(true);
        fetchProperties().finally(() => setIsRefreshing(false));
    };

    return { properties, isLoading, isRefreshing, refresh };
};

export default useHome;
