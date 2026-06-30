import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

/**
 * Maneja los botones de accion de la ficha de propiedad ("Hacer una oferta"
 * y "Agendar cita"): si el usuario no tiene sesion, pide mostrar el modal
 * de login (authPrompt indica cual de los dos flujos lo disparo); si ya
 * esta logueado, navega directo al formulario correspondiente. Ambas rutas
 * estan protegidas por ProtectedRoute en el router, asi que este chequeo
 * es solo para dar una mejor experiencia (evita el redirect silencioso).
 *
 * @param {string} publicId - public_id de la propiedad
 * @returns { authPrompt, closeAuthPrompt, handleOfferClick, handleScheduleClick }
 */
const usePropertyActions = (publicId) => {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [authPrompt, setAuthPrompt] = useState(null) // null | 'offer' | 'schedule'

    const handleOfferClick = () => {
        if (!isAuthenticated) {
            setAuthPrompt('offer')
        } else {
            navigate(`/property/${publicId}/offer`)
        }
    }

    const handleScheduleClick = () => {
        if (!isAuthenticated) {
            setAuthPrompt('schedule')
        } else {
            navigate(`/property/${publicId}/schedule`)
        }
    }

    return {
        authPrompt,
        closeAuthPrompt: () => setAuthPrompt(null),
        handleOfferClick,
        handleScheduleClick,
    }
}

export default usePropertyActions
