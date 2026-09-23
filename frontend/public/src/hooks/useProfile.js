import { useState, useEffect, useCallback, useMemo } from 'react'
import useAuth from '@/hooks/useAuth'
import clientService from '@/services/Client'

const tabs = [
    { key: 'profile',   label: 'Perfil' },
    { key: 'activity',  label: 'Actividad' },
    { key: 'security',  label: 'Seguridad' },
]

// Tienen que calzar con user.name/user.lastname/user.phone en el backend
// (backend/src/schemas/fields/primitives.js) — PUT /client/:id valida esto
// mismo del lado del servidor.
const SHORT_TEXT_MAX = 20
const SHORT_TEXT_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s'-]+$/
const PHONE_REGEX = /^\d{4}-\d{4}$/

const validatePersonal = (p) => {
    const errors = {}
    const name = p.name.trim()
    const lastname = p.lastname.trim()
    const phone = p.phone.trim()

    if (!name) errors.name = 'El nombre es requerido.'
    else if (name.length > SHORT_TEXT_MAX) errors.name = `No puede superar los ${SHORT_TEXT_MAX} caracteres.`
    else if (!SHORT_TEXT_REGEX.test(name)) errors.name = 'Solo letras, números, espacios, guiones y apóstrofes.'

    if (!lastname) errors.lastname = 'El apellido es requerido.'
    else if (lastname.length > SHORT_TEXT_MAX) errors.lastname = `No puede superar los ${SHORT_TEXT_MAX} caracteres.`
    else if (!SHORT_TEXT_REGEX.test(lastname)) errors.lastname = 'Solo letras, números, espacios, guiones y apóstrofes.'

    if (!phone) errors.phone = 'El teléfono es requerido.'
    else if (!PHONE_REGEX.test(phone)) errors.phone = 'Formato: 0000-0000'

    return errors
}

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

    const personalErrors = useMemo(() => validatePersonal(personal), [personal])
    const personalIsValid = Object.keys(personalErrors).length === 0

    // Solo name, lastname y phone son editables: PUT /client/:id los limita
    // (schemas.update es .strict()). El correo y el documento se muestran pero
    // no se envian, el backend los rechaza.
    const savePersonal = useCallback(async () => {
        if (!personalIsValid) return
        setSavingPersonal(true)
        setPersonalError(null)
        try {
            await clientService.update(user.id, {
                name:     personal.name.trim(),
                lastname: personal.lastname.trim(),
                phone:    personal.phone.trim(),
            })
            setEditingPersonal(false)
        } catch (err) {
            setPersonalError(err.friendlyMessage)
        } finally {
            setSavingPersonal(false)
        }
    }, [personal, personalIsValid, user?.id])

    return {
        user, role,
        tabs, activeTab, setActiveTab,
        isLoading,
        personal, setPersonal,
        editingPersonal, setEditingPersonal, savingPersonal, savePersonal,
        personalError, personalErrors, personalIsValid,
        identification,
    }
}

export default useProfile