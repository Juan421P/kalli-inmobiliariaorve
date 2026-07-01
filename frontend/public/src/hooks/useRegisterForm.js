import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import ClientService from '@/services/client'

const OTP_TTL = 300 // 5 minutos en segundos

/**
 * Maneja el flujo de registro en 3 pasos mas pantalla de exito (step 4):
 *  1. Nombre, apellido, email, contrasena → avanza localmente (sin llamada al backend)
 *  2. Telefono, tipo de documento, numero de documento, confirmar contrasena, terminos
 *     → POST /client (aqui se crea la cuenta, el backend envia el OTP al email)
 *  3. OTP de 6 digitos → POST /client/verify-email
 *  4. Exito (pantalla de confirmacion)
 *
 * Los datos del paso 1 se guardan en step1Data para unirlos con los del paso 2
 * al hacer la llamada al backend.
 *
 * @returns {{
 *   step: 1|2|3|4,
 *   step1: import('react-hook-form').UseFormReturn,
 *   step2: import('react-hook-form').UseFormReturn,
 *   step3: import('react-hook-form').UseFormReturn,
 *   serverError: string|null,
 *   countdown: number,
 *   formatCountdown: (s: number) => string,
 *   onStep1Submit: Function,
 *   onStep2Submit: Function,
 *   onStep3Submit: Function,
 *   goBack: Function,
 *   goToLogin: Function,
 * }}
 */
const useRegisterForm = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [serverError, setServerError] = useState(null)
    const [step1Data, setStep1Data] = useState(null)
    const [countdown, setCountdown] = useState(OTP_TTL)

    const step1 = useForm({
        mode: 'onChange',
        defaultValues: { name: '', lastname: '', email: '', password: '' },
    })

    const step2 = useForm({
        mode: 'onChange',
        defaultValues: { phone: '', document_type: '', document_number: '', confirmPassword: '', terms: false },
    })

    const step3 = useForm({
        mode: 'onChange',
        defaultValues: { code: '' },
    })

    // Arranca el countdown solo cuando se llega al paso 3 (OTP activo)
    useEffect(() => {
        if (step !== 3) return
        setCountdown(OTP_TTL)
        const id = setInterval(() => setCountdown((v) => (v > 0 ? v - 1 : 0)), 1000)
        return () => clearInterval(id)
    }, [step])

    // Paso 1 → 2: no llama al backend, solo guarda los datos para usarlos en el paso 2
    const goToStep2 = (data) => {
        setStep1Data(data)
        setStep(2)
        setServerError(null)
    }

    const submitStep2 = async (data) => {
        setServerError(null)
        try {
            await ClientService.register({
                name: step1Data.name,
                lastname: step1Data.lastname,
                email: step1Data.email,
                password: step1Data.password,
                phone: data.phone,
                document_type: data.document_type,
                document_number: data.document_number,
            })
            setStep(3)
        } catch (err) {
            setServerError(err?.response?.data?.message ?? 'Error al crear la cuenta. Intente de nuevo.')
        }
    }

const submitStep3 = async ({ code }) => {
    setServerError(null)
    try {
        await ClientService.verifyEmail({ code: code.toLowerCase() })
        setStep(4)
    } catch (err) {
        console.log(err);
        setServerError(err?.response?.data?.message ?? 'Código incorrecto o expirado.')
    }
}

    // "mm:ss" para mostrar en el countdown del OTP
    const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    const goBack = () => {
        setStep((s) => Math.max(1, s - 1))
        setServerError(null)
    }

    return {
        step,
        step1, step2, step3,
        serverError,
        countdown, formatCountdown,
        onStep1Submit: step1.handleSubmit(goToStep2),
        onStep2Submit: step2.handleSubmit(submitStep2),
        onStep3Submit: step3.handleSubmit(submitStep3),
        goBack,
        goToLogin: () => navigate('/login'),
    }
}

export default useRegisterForm
