import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import orveLogo from '@/assets/orve-logo.svg'
import useLoginForm from '@/hooks/useLoginForm'

const inputBase = 'w-full text-sm bg-gray-100/80 border border-gray-200/80 rounded-xl outline-none transition-colors placeholder:text-xs placeholder:text-gray-400 focus:border-orve-teal/50 focus:bg-white/80'

/**
 * Formulario de inicio de sesion con sub-vista de recuperacion de contrasena.
 * El estado de visibilidad de la contrasena es local (UI pura).
 * Toda la logica de llamadas al backend vive en useLoginForm.
 */
const LoginForm = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const {
        form: { register, formState: { errors, isSubmitting, isValid } },
        forgotForm,
        serverError,
        forgotMode, setForgotMode,
        forgotSent,
        resetForgot,
        onLoginSubmit,
        onForgotSubmit,
    } = useLoginForm()

    if (forgotMode) {
        return (
            <div className='flex flex-col gap-5'>
                <div className='flex justify-end'>
                    <img src={orveLogo} alt='ORVE' className='h-10 w-auto' />
                </div>
                <div className='text-right -mt-1'>
                    <h2 className='text-xl font-bold text-orve-darker-teal'>Recuperar contraseña</h2>
                    <p className='text-xs text-gray-400 mt-0.5'>Le enviaremos un código a su correo</p>
                </div>
                {forgotSent ? (
                    <div className='flex flex-col items-center gap-4 py-6'>
                        <div className='w-14 h-14 rounded-full bg-green-50 flex items-center justify-center'>
                            <Mail className='w-6 h-6 text-orve-green' />
                        </div>
                        <p className='text-sm text-center text-gray-500'>Revise su correo para continuar.</p>
                        <button onClick={resetForgot} className='text-sm text-orve-teal underline hover:text-orve-darker-teal transition-colors'>
                            Volver al inicio de sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={onForgotSubmit} className='flex flex-col gap-4'>
                        {serverError && (
                            <p className='text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl'>{serverError}</p>
                        )}
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-500 font-medium'>Correo electrónico</label>
                            <div className='relative'>
                                <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                                <input
                                    {...forgotForm.register('recoveryEmail', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                                    type='email'
                                    placeholder='Ingrese su correo electrónico'
                                    className={cn(inputBase, 'pl-10 pr-4 py-3')}
                                />
                            </div>
                        </div>
                        <button
                            type='submit'
                            disabled={forgotForm.formState.isSubmitting || !forgotForm.formState.isValid}
                            className='w-full flex items-center py-3.5 px-5 rounded-xl bg-orve-darker-teal text-white font-semibold text-sm hover:bg-orve-teal transition-colors disabled:opacity-60'
                        >
                            <span className='flex-1 text-center'>Enviar código</span>
                            <ArrowRight className='w-4 h-4 shrink-0' />
                        </button>
                        <button type='button' onClick={resetForgot} className='text-xs text-gray-400 text-center hover:text-gray-600 transition-colors'>
                            Volver al inicio de sesión
                        </button>
                    </form>
                )}
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-5'>
            {/* Header: logo + titulo alineados a la derecha */}
            <div className='flex flex-col items-end gap-0.5'>
                <img src={orveLogo} alt='ORVE' className='h-10 w-auto' />
                <h2 className='text-xl font-bold text-orve-darker-teal mt-0.5'>Inicio de sesión</h2>
                <p className='text-xs text-gray-400 text-right'>Accede a tu cuenta para gestionar propiedades</p>
            </div>

            {/* Tabs: Iniciar sesion (activo) | Registrarse */}
            <div className='grid grid-cols-2 gap-1 bg-gray-100/80 rounded-2xl p-1.5'>
                <button className='py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold cursor-default'>
                    Iniciar sesión
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className='py-2.5 rounded-xl text-gray-500 text-sm font-semibold hover:text-orve-teal transition-colors'
                >
                    Registrarse
                </button>
            </div>

            <form onSubmit={onLoginSubmit} className='flex flex-col gap-4'>
                {serverError && (
                    <p className='text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl'>{serverError}</p>
                )}

                {/* Campo correo */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Correo electrónico</label>
                    <div className='relative'>
                        <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                            type='email'
                            placeholder='Ingrese su correo electrónico'
                            className={cn(inputBase, 'pl-10 pr-4 py-3', errors.email && 'border-red-300/70')}
                        />
                    </div>
                </div>

                {/* Campo contrasena */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Contraseña</label>
                    <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('password', { required: true, minLength: 6 })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Ingrese su contraseña'
                            className={cn(inputBase, 'pl-10 pr-10 py-3', errors.password && 'border-red-300/70')}
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword((v) => !v)}
                            className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                        >
                            {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                    </div>
                </div>

                {/* Recordarme + Olvide contrasena */}
                <div className='flex items-center justify-between'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' className='w-3.5 h-3.5 accent-orve-teal rounded' />
                        <span className='text-xs text-gray-500'>Recordarme</span>
                    </label>
                    <button
                        type='button'
                        onClick={() => setForgotMode(true)}
                        className='text-xs text-gray-400 hover:text-orve-teal transition-colors'
                    >
                        ¿Olvidó su contraseña?
                    </button>
                </div>

                {/* Boton principal */}
                <button
                    type='submit'
                    disabled={isSubmitting || !isValid}
                    className='w-full flex items-center py-4 px-5 rounded-xl bg-orve-darker-teal text-white font-semibold text-sm hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    <span className='flex-1 text-center'>Ingresar</span>
                    {isSubmitting
                        ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        : <ArrowRight className='w-4 h-4 shrink-0' />
                    }
                </button>
            </form>

            {/* Separador */}
            <div className='flex items-center gap-3'>
                <div className='flex-1 h-px bg-gray-200' />
                <span className='text-xs text-gray-400'>o continuar con</span>
                <div className='flex-1 h-px bg-gray-200' />
            </div>

            {/* Botones sociales */}
            <div className='grid grid-cols-2 gap-3'>
                <button className='flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3.5 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white/90 transition-colors'>
                    <svg className='w-4 h-4 shrink-0' viewBox='0 0 24 24'>
                        <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
                        <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
                        <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
                        <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
                    </svg>
                    Continuar con Google
                </button>
                <button className='flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3.5 text-xs font-medium text-gray-600 bg-white/60 hover:bg-white/90 transition-colors'>
                    <svg className='w-4 h-4 shrink-0' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.06 2.2.72 2.96.75.98-.18 1.92-.86 2.98-.79 1.27.09 2.22.56 2.84 1.42-2.6 1.56-2.2 5.26.65 6.24-.62 1.56-1.44 3.12-2.43 5.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
                    </svg>
                    Continuar con Apple
                </button>
            </div>
        </div>
    )
}

export default LoginForm
