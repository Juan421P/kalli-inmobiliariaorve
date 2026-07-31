import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import orveLogo from '@/assets/orve-logo.svg'
import RegisterStep1 from '@/components/auth/register/RegisterStep1'
import RegisterStep2 from '@/components/auth/register/RegisterStep2'
import RegisterStep3 from '@/components/auth/register/RegisterStep3'
import useRegisterForm from '@/hooks/useRegisterForm'
import useAuth from '@/hooks/useAuth'

/**
 * Pagina de registro en /register. Comparte AuthLayout con Login.
 * 4 estados: datos basicos → datos de contacto → OTP → exito.
 * Redirige a "/" si ya hay sesion activa (ruta inversa protegida).
 */
const Register = () => {
    const { isAuthenticated, isRehydrating } = useAuth()
    const navigate = useNavigate()
    const {
        step, step1, step2, step3,
        serverError, countdown, formatCountdown,
        onStep1Submit, onStep2Submit, onStep3Submit,
        onResendCode, goBack, goToLogin,
    } = useRegisterForm()

    useEffect(() => {
        if (!isRehydrating && isAuthenticated) navigate('/', { replace: true })
    }, [isAuthenticated, isRehydrating, navigate])

    if (isRehydrating) return null

    // El titulo del header cambia en el paso de verificacion
    const title    = step === 3 ? 'Verificación de correo' : 'Registro'
    const subtitle = step === 3
        ? 'Crea su cuenta para poder personalizar su experiencia'
        : 'Crea su cuenta para poder personalizar su experiencia'

    return (
        <AuthLayout>
            <div className='flex flex-col gap-4'>
                {/* Header: logo + titulo alineados a la derecha */}
                {step < 4 && (
                    <div className='flex flex-col items-end gap-0.5'>
                        <img src={orveLogo} alt='ORVE' className='h-9 w-auto' />
                        <h2 className='text-xl font-bold text-orve-darker-teal'>{title}</h2>
                        <p className='text-[11px] text-gray-400 text-right max-w-[230px]'>{subtitle}</p>
                    </div>
                )}

                {/* Tabs: Iniciar sesion | Registrarse (activo). Solo en pasos 1-3 */}
                {step < 4 && (
                    <div className='grid grid-cols-2 gap-1 bg-gray-100/80 rounded-2xl p-1'>
                        <button
                            onClick={() => navigate('/login')}
                            className='py-2.5 rounded-xl text-gray-500 text-sm font-semibold hover:text-orve-teal transition-colors'
                        >
                            Iniciar sesión
                        </button>
                        <button className='py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold cursor-default'>
                            Registrarse
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <RegisterStep1 form={step1} onSubmit={onStep1Submit} />
                )}

                {step === 2 && (
                    <RegisterStep2
                        form={step2}
                        password={step1.getValues('password')}
                        onSubmit={onStep2Submit}
                        goBack={goBack}
                        serverError={serverError}
                    />
                )}

                {step === 3 && (
                    <RegisterStep3
                        form={step3}
                        email={step1.getValues('email')}
                        countdown={countdown}
                        formatCountdown={formatCountdown}
                        onSubmit={onStep3Submit}
                        onResend={onResendCode}
                        goBack={goBack}
                        serverError={serverError}
                    />
                )}

                {/* Paso 4: exito */}
                {step === 4 && (
                    <div className='flex flex-col items-center gap-5 py-4'>
                        <img src={orveLogo} alt='ORVE' className='h-9 w-auto' />
                        <div className='w-16 h-16 rounded-full bg-green-50 flex items-center justify-center'>
                            <CheckCircle2 className='w-8 h-8 text-orve-green' />
                        </div>
                        <div className='text-center'>
                            <h3 className='text-lg font-bold text-orve-darker-teal'>¡Cuenta creada!</h3>
                            <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                                Su cuenta ha sido verificada exitosamente. Ya puede iniciar sesión.
                            </p>
                        </div>
                        <button
                            onClick={goToLogin}
                            className='w-full py-3 rounded-2xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors'
                        >
                            Iniciar sesión
                        </button>
                    </div>
                )}
            </div>
        </AuthLayout>
    )
}

export default Register
