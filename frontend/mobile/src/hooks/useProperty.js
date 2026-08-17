import { useEffect, useState } from 'react';
import propertyService from '@/services/propertyService';

/**
 * Trae una propiedad por su public_id y expone el estado de carga/error.
 * Reusado por PropertyDetailScreen y ScheduleAppointmentScreen.
 */
const useProperty = (publicId) => {
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        propertyService.getByPublicId(publicId)
            .then((data) => setProperty(data?.property ?? data))
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false));
    }, [publicId]);

    return { property, isLoading, notFound };
};

export default useProperty;
