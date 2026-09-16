import { useState, useEffect } from 'react'
import propertyService from '@/services/Property'

/**
 * Trae una propiedad por su public_id y expone el estado de carga/error.
 * Reusado por PropertyForSale, MakeOfferPage y ScheduleAppointment: las tres
 * pantallas necesitan la misma propiedad pero hacen cosas distintas con ella,
 * asi que centralizamos el fetch aca para no repetir el mismo useEffect 3 veces.
 *
 * @param {string} publicId - public_id de la propiedad (viene de useParams)
 * @returns {{ property: object|null, isLoading: boolean, notFound: boolean }}
 */
const useProperty = (publicId) => {
    const [property, setProperty] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        propertyService.getByPublicId(publicId)
            // El backend devuelve { property }, pero por las dudas soportamos
            // tambien una respuesta "plana" para no romper si el shape cambia.
            .then((data) => {
                const prop = data.property ?? data
                setProperty(prop)
                // Cuenta la vista (y, si hay sesion de cliente, la registra en
                // su "Actividad reciente"). No bloquea el render ni molesta
                // al usuario si falla, es informativo nada mas.
                if (prop?._id) propertyService.incrementView(prop._id).catch(() => {})
            })
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false))
    }, [publicId])

    return { property, isLoading, notFound }
}

export default useProperty
