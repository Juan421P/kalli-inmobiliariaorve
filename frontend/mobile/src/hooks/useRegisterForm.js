import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import clientService from '@/services/clientService';

const OTP_TTL = 300; // 5 minutos en segundos

/**
 * Maneja el flujo de registro en 3 pasos mas pantalla de exito (step 4),
 * igual que frontend/public/src/hooks/useRegisterForm.js:
 *  1. Nombre, apellido, email, contraseña -> avanza localmente (sin llamada al backend)
 *  2. Teléfono, tipo/número de documento, confirmar contraseña -> POST /client/register
 *     (el backend crea la cuenta sin verificar y envía el codigo OTP al correo)
 *  3. Código OTP de 6 dígitos -> POST /client/verify-email (activa la cuenta;
 *     el backend deja la cookie de sesion puesta, pero igual que en la web el
 *     usuario confirma el login a mano en el paso 4 para llegar con
 *     AuthContext ya sincronizado)
 *  4. Éxito
 */
const useRegisterForm = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [serverError, setServerError] = useState(null);
    const [step1Data, setStep1Data] = useState(null);
    const [verificationToken, setVerificationToken] = useState(null);
    const [countdown, setCountdown] = useState(OTP_TTL);

    const step1 = useForm({ mode: 'onChange', defaultValues: { name: '', lastname: '', email: '', password: '' } });
    const step2 = useForm({ mode: 'onChange', defaultValues: { phone: '', document_type: '', document_number: '', confirmPassword: '', terms: false } });
    const step3 = useForm({ mode: 'onChange', defaultValues: { code: '' } });

    useEffect(() => {
        if (step !== 3) return;
        setCountdown(OTP_TTL);
        const id = setInterval(() => setCountdown((v) => (v > 0 ? v - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [step]);

    const goToStep2 = (data) => {
        setStep1Data(data);
        setStep(2);
        setServerError(null);
    };

    const submitStep2 = async (data) => {
        setServerError(null);
        try {
            const res = await clientService.register({
                name: step1Data.name,
                lastname: step1Data.lastname,
                email: step1Data.email,
                password: step1Data.password,
                phone: data.phone,
                document_type: data.document_type,
                document_number: data.document_number,
            });
            setVerificationToken(res?.token ?? null);
            setStep(3);
        } catch (err) {
            setServerError(err?.data?.message ?? 'Error al crear la cuenta. Intente de nuevo.');
        }
    };

    const submitStep3 = async ({ code }) => {
        setServerError(null);
        try {
            await clientService.verifyEmail({ code: code.toLowerCase(), token: verificationToken });
            setStep(4);
        } catch (err) {
            setServerError(err?.data?.message ?? 'Código incorrecto o expirado.');
        }
    };

    const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const resendCode = async () => {
        setServerError(null);
        try {
            const res = await clientService.resendVerification({ email: step1Data?.email ?? step1.getValues('email') });
            setVerificationToken(res?.token ?? verificationToken);
            setCountdown(OTP_TTL);
            step3.reset({ code: '' });
        } catch (err) {
            setServerError(err?.data?.message ?? 'No se pudo reenviar el código. Intente de nuevo.');
        }
    };

    const goBack = () => {
        setStep((s) => Math.max(1, s - 1));
        setServerError(null);
    };

    return {
        step, step1, step2, step3,
        serverError, countdown, formatCountdown,
        onStep1Submit: step1.handleSubmit(goToStep2),
        onStep2Submit: step2.handleSubmit(submitStep2),
        onStep3Submit: step3.handleSubmit(submitStep3),
        onResendCode: resendCode,
        goBack,
        goToLogin: () => navigation.replace('Login'),
    };
};

export default useRegisterForm;
