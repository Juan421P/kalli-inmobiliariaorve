import { useState, useEffect, useCallback } from 'react'
import useAuth from '@/hooks/useAuth'
import ClientService from '@/services/client'

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
    const [editingId, setEditingId] = useState(false)
    const [savingPersonal, setSavingPersonal] = useState(false)
    const [savingId, setSavingId] = useState(false)

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
        ClientService.get(user.id)
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

    const savePersonal = useCallback(async () => {
        setSavingPersonal(true)
        try {
            await ClientService.update(user.id, {
                name:     personal.name,
                lastname: personal.lastname,
                email:    personal.email,
                phone:    personal.phone,
            })
            setEditingPersonal(false)
        } catch {
            // manejo de error pendiente
        } finally {
            setSavingPersonal(false)
        }
    }, [personal, user?.id])

    const saveId = useCallback(async () => {
        setSavingId(true)
        try {
            await ClientService.update(user.id, {
                document_type:   identification.document_type,
                document_number: identification.document_number,
            })
            setEditingId(false)
        } catch {
            // manejo de error pendiente
        } finally {
            setSavingId(false)
        }
    }, [identification, user?.id])

    return {
        user, role,
        tabs, activeTab, setActiveTab,
        isLoading,
        personal, setPersonal,
        editingPersonal, setEditingPersonal, savingPersonal, savePersonal,
        identification, setIdentification,
        editingId, setEditingId, savingId, saveId,
    }
}

export default useProfile
