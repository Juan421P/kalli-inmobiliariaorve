import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import ClientService from '@/services/client'
import useAuth from '@/hooks/useAuth'

/**
 * Maneja el formulario de inicio de sesion y el sub-flujo de recuperacion
 * de contrasena. Separa dos instancias de react-hook-form para que la
 * validacion de un flujo no interfiera con la del otro.
 *
 * @returns {{
 *   form: import('react-hook-form').UseFormReturn,
 *   forgotForm: import('react-hook-form').UseFormReturn,
 *   serverError: string|null,
 *   forgotMode: boolean,
 *   setForgotMode: Function,
 *   forgotSent: boolean,
 *   resetForgot: Function,
 *   onLoginSubmit: Function,
 *   onForgotSubmit: Function,
 * }}
 */
const useLoginForm = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState(null)
    const [forgotMode, setForgotMode] = useState(false)
    const [forgotSent, setForgotSent] = useState(false)

    const form = useForm({
        mode: 'onChange',
        defaultValues: { email: '', password: '' },
    })

    const forgotForm = useForm({
        mode: 'onChange',
        defaultValues: { recoveryEmail: '' },
    })

    const onLoginSubmit = async ({ email, password }) => {
        setServerError(null)
        try {
            const data = await ClientService.login({ email, password })
            // El backend devuelve { client } pero AuthContext espera { role, user }
            login({ role: data.role ?? 'client', user: data.user ?? data.client })
            navigate('/')
        } catch (err) {
            setServerError(err?.response?.data?.message ?? 'Credenciales incorrectas. Intente de nuevo.')
        }
    }

    const onForgotSubmit = async ({ recoveryEmail }) => {
        setServerError(null)
        try {
            await ClientService.requestPasswordRecovery({ email: recoveryEmail })
            setForgotSent(true)
        } catch (err) {
            const status = err?.response?.status
            if (status === 403 || status === 404) {
                setServerError('No encontramos una cuenta con ese correo electrónico.')
            } else {
                setServerError('Ocurrió un error. Intente de nuevo más tarde.')
            }
        }
    }

    // Limpia el sub-flujo de recuperacion y vuelve al login normal.
    const resetForgot = () => {
        setForgotMode(false)
        setForgotSent(false)
        setServerError(null)
        forgotForm.reset()
    }

    return {
        form,
        forgotForm,
        serverError,
        forgotMode, setForgotMode,
        forgotSent,
        resetForgot,
        onLoginSubmit: form.handleSubmit(onLoginSubmit),
        onForgotSubmit: forgotForm.handleSubmit(onForgotSubmit),
    }
}

export default useLoginForm
