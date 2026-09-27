import { useCallback, useEffect, useState } from 'react';
import propertyService from '@/services/propertyService';

/**
 * Trae una propiedad por su public_id y expone el estado de carga/error.
 * Reusado por PropertyDetailScreen, MakeOfferScreen y ScheduleAppointmentScreen.
 *
 * `notFound` es especificamente "la propiedad no existe" (404 real del
 * backend); cualquier otro fallo (red, timeout, 500) cae en `loadError` con
 * su propio mensaje y se puede reintentar con `refetch` — antes ambos casos
 * se mostraban igual como "propiedad no encontrada", lo cual es enganoso si
 * en realidad el servidor no respondio (ej. Render despertando de un cold
 * start) y no dejaba ninguna forma de reintentar.
 */
const useProperty = (publicId) => {
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [loadError, setLoadError] = useState(null);

    const fetchProperty = useCallback(() => {
        setIsLoading(true);
        setNotFound(false);
        setLoadError(null);
        return propertyService.getByPublicId(publicId)
            .then((data) => setProperty(data?.property ?? data))
            .catch((err) => {
                if (err.status === 404) setNotFound(true);
                else setLoadError(err.friendlyMessage);
            })
            .finally(() => setIsLoading(false));
    }, [publicId]);

    useEffect(() => { fetchProperty(); }, [fetchProperty]);

    return { property, isLoading, notFound, loadError, refetch: fetchProperty };
};

export default useProperty;
