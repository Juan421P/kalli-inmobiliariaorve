import { useState, useEffect, useCallback } from 'react'
import useAuth from '@/hooks/useAuth'
import clientService from '@/services/Client'

const tabs = [
    { key: 'profile',   label: 'Perfil' },
    { key: 'activity',  label: 'Actividad' },
    { key: 'security',  label: 'Seguridad' },
]

/**
 * Lógica del perfil del cliente.
 * Carga los datos completos del usuario desde el backend (phone, document, etc.)
 * ya que el AuthContext solo guarda los campos del login (name, lastname, email, picture).
 */
const useProfile = () => {
    const { user, role } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState(true)

    const [editingPersonal, setEditingPersonal] = useState(false)
    const [savingPersonal, setSavingPersonal] = useState(false)
    const [personalError, setPersonalError] = useState(null)

    const [personal, setPersonal] = useState({
        name: '', lastname: '', email: '', phone: '',
    })
    const [identification, setIdentification] = useState({
        document_type: '', document_number: '',
    })

    // Carga los datos completos del cliente desde el backend
    useEffect(() => {
        if (!user?.id) return
        setIsLoading(true)
        clientService.get(user.id)
            .then((res) => {
                const c = res.client ?? res
                setPersonal({
                    name:     c.name     ?? '',
                    lastname: c.lastname ?? '',
                    email:    c.email    ?? '',
                    // phone llega como { country_code, number } del modelo
                    phone: c.phone?.number ?? c.phone ?? '',
                })
                setIdentification({
                    document_type:   c.document?.type   ?? '',
                    document_number: c.document?.number ?? '',
                })
            })
            .catch(() => {
                // Si falla usa los datos del AuthContext como fallback
                setPersonal({
                    name:     user.name     ?? '',
                    lastname: user.lastname ?? '',
                    email:    user.email    ?? '',
                    phone:    '',
                })
            })
            .finally(() => setIsLoading(false))
    }, [user?.id])

    // Solo name, lastname y phone son editables: PUT /client/:id los limita
    // (schemas.update es .strict()). El correo y el documento se muestran pero
    // no se envian, el backend los rechaza.
    const savePersonal = useCallback(async () => {
        setSavingPersonal(true)
        setPersonalError(null)
        try {
            await clientService.update(user.id, {
                name:     personal.name,
                lastname: personal.lastname,
                phone:    personal.phone,
            })
            setEditingPersonal(false)
        } catch (err) {
            setPersonalError(
                err?.response?.data?.message ?? 'No se pudieron guardar los cambios.'
            )
        } finally {
            setSavingPersonal(false)
        }
    }, [personal, user?.id])

    return {
        user, role,
        tabs, activeTab, setActiveTab,
        isLoading,
        personal, setPersonal,
        editingPersonal, setEditingPersonal, savingPersonal, savePersonal,
        personalError,
        identification,
    }
}

export default useProfile