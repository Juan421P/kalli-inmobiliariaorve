import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import ClientService from '@/services/Client'
import useAuth from '@/hooks/useAuth'

const useLoginForm = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState(null)
    const [forgotMode, setForgotMode] = useState(false)
    const [forgotStep, setForgotStep] = useState(1) // 1: email, 2: código, 3: nueva contraseña

    const form = useForm({
        mode: 'onChange',
        defaultValues: { email: '', password: '' },
    })

    const emailForm = useForm({
        mode: 'onChange',
        defaultValues: { recoveryEmail: '' },
    })

    const codeForm = useForm({
        mode: 'onChange',
        defaultValues: { code: '' },
    })

    const passwordForm = useForm({
        mode: 'onChange',
        defaultValues: { newPassword: '', confirmPassword: '' },
    })

    const onLoginSubmit = async ({ email, password }) => {
        setServerError(null)
        try {
            const data = await ClientService.login({ email, password })
            login({ role: data.role ?? 'client', user: data.user ?? data.client })
            navigate('/')
        } catch (err) {
            setServerError(err.friendlyMessage)
        }
    }

    const onForgotSubmit = async ({ recoveryEmail }) => {
        setServerError(null)
        try {
            await ClientService.requestPasswordRecovery({ email: recoveryEmail })
            setForgotStep(2)
        } catch (err) {
            const status = err?.response?.status
            // Para "no existe cuenta con este correo" se prefiere un mensaje fijo
            // en vez del que mande el backend, para no filtrar detalles de más;
            // cualquier otro caso (incluido el rate limiter) usa el mensaje real.
            setServerError(
                status === 401 || status === 403 || status === 404
                    ? 'No encontramos una cuenta con ese correo electrónico.'
                    : err.friendlyMessage
            )
        }
    }

    const onCodeSubmit = async ({ code }) => {
        setServerError(null)
        try {
            await ClientService.verifyRecoveryCode({ code: code.toLowerCase() })
            setForgotStep(3)
        } catch (err) {
            setServerError(err.friendlyMessage)
        }
    }

    const onPasswordSubmit = async ({ newPassword, confirmPassword }) => {
        setServerError(null)
        try {
            await ClientService.resetPassword({ newPassword, confirmPassword })
            resetForgot()
        } catch (err) {
            setServerError(err.friendlyMessage)
        }
    }

    const resetForgot = () => {
        setForgotMode(false)
        setForgotStep(1)
        setServerError(null)
        emailForm.reset()
        codeForm.reset()
        passwordForm.reset()
    }

    return {
        form,
        emailForm,
        codeForm,
        passwordForm,
        serverError,
        forgotMode, setForgotMode,
        forgotStep,
        resetForgot,
        onLoginSubmit:    form.handleSubmit(onLoginSubmit),
        onForgotSubmit:   emailForm.handleSubmit(onForgotSubmit),
        onCodeSubmit:     codeForm.handleSubmit(onCodeSubmit),
        onPasswordSubmit: passwordForm.handleSubmit(onPasswordSubmit),
    }
}

export default useLoginForm
