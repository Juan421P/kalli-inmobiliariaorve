import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import orveLogo from '@/assets/orve-logo.svg'
import OTPInput from '@/components/auth/register/OTPInput'
import useLoginForm from '@/hooks/useLoginForm'

const inputBase = 'w-full text-sm bg-gray-100/80 border border-gray-200/80 rounded-xl outline-none transition-colors placeholder:text-xs placeholder:text-gray-400 focus:border-orve-teal/50 focus:bg-white/80'

// Tiene que calzar exacto con auth.password en el backend
// (backend/src/schemas/fields/primitives.js) — el login pasa por el mismo
// schema antes de comparar credenciales, así que una contraseña floja acá deja
// pasar intentos que el backend rechaza con un error de validación en vez de
// "credenciales incorrectas".
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const PASSWORD_MAX = 20

const PASSWORD_CHECKS = [
    { label: `Entre 8 y ${PASSWORD_MAX} caracteres`, test: (v) => v.length >= 8 && v.length <= PASSWORD_MAX },
    { label: 'Una letra mayúscula',       test: (v) => /[A-Z]/.test(v) },
    { label: 'Una letra minúscula',       test: (v) => /[a-z]/.test(v) },
    { label: 'Un número',                 test: (v) => /\d/.test(v) },
    { label: 'Un símbolo (@$!%*?&)',      test: (v) => /[@$!%*?&]/.test(v) },
]

const LoginForm = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)

    const {
        form: { register, formState: { errors, isSubmitting, isValid } },
        emailForm,
        codeForm,
        passwordForm,
        serverError,
        forgotMode, setForgotMode,
        forgotStep,
        resetForgot,
        onLoginSubmit,
        onForgotSubmit,
        onCodeSubmit,
        onPasswordSubmit,
    } = useLoginForm()

    const newPassVal = passwordForm.watch('newPassword', '')

    // ── Flujo de recuperación de contraseña ──────────────────────────────────
    if (forgotMode) {
        const stepTitles = {
            1: { title: 'Recuperar contraseña', subtitle: 'Le enviaremos un código a su correo' },
            2: { title: 'Verificar código',     subtitle: 'Introduzca el código enviado a su correo' },
            3: { title: 'Nueva contraseña',     subtitle: 'Elija una contraseña segura para su cuenta' },
        }
        const { title, subtitle } = stepTitles[forgotStep] ?? stepTitles[1]

        return (
            <div className='flex flex-col gap-5'>
                <div className='flex justify-end'>
                    <img src={orveLogo} alt='ORVE' className='h-10 w-auto' />
                </div>
                <div className='text-right -mt-1'>
                    <h2 className='text-xl font-bold text-orve-darker-teal'>{title}</h2>
                    <p className='text-xs text-gray-400 mt-0.5'>{subtitle}</p>
                </div>

                {serverError && (
                    <p className='text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl'>{serverError}</p>
                )}

                {/* Paso 1: Ingresar correo */}
                {forgotStep === 1 && (
                    <form onSubmit={onForgotSubmit} className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-500 font-medium'>Correo electrónico</label>
                            <div className='relative'>
                                <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                                <input
                                    {...emailForm.register('recoveryEmail', {
                                        required: 'El correo es requerido.',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Ingrese un correo válido.',
                                        },
                                    })}
                                    type='email'
                                    placeholder='Ingrese su correo electrónico'
                                    className={cn(inputBase, 'pl-10 pr-4 py-3', emailForm.formState.errors.recoveryEmail && 'border-red-300/70')}
                                />
                            </div>
                            {emailForm.formState.errors.recoveryEmail && (
                                <p className='text-[10px] text-red-400'>{emailForm.formState.errors.recoveryEmail.message}</p>
                            )}
                        </div>
                        <button
                            type='submit'
                            disabled={emailForm.formState.isSubmitting || !emailForm.formState.isValid}
                            className='w-full flex items-center py-3.5 px-5 rounded-xl bg-orve-darker-teal text-white font-semibold text-sm hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            <span className='flex-1 text-center'>Enviar código</span>
                            {emailForm.formState.isSubmitting
                                ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                : <ArrowRight className='w-4 h-4 shrink-0' />
                            }
                        </button>
                        <button type='button' onClick={resetForgot} className='text-xs text-gray-400 text-center hover:text-gray-600 transition-colors'>
                            Volver al inicio de sesión
                        </button>
                    </form>
                )}

                {/* Paso 2: Ingresar código OTP */}
                {forgotStep === 2 && (
                    <form onSubmit={onCodeSubmit} className='flex flex-col gap-4'>
                        <Controller
                            name='code'
                            control={codeForm.control}
                            rules={{ required: true, validate: (v) => v.length === 6 }}
                            render={({ field: { value, onChange } }) => (
                                <OTPInput value={value} onChange={onChange} separatorAt={3} />
                            )}
                        />
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                type='button'
                                onClick={() => { codeForm.reset(); resetForgot() }}
                                className='flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Cancelar
                            </button>
                            <button
                                type='submit'
                                disabled={codeForm.formState.isSubmitting || !codeForm.formState.isValid}
                                className='flex items-center justify-center gap-2 py-3 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {codeForm.formState.isSubmitting
                                    ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    : <>Verificar <CheckCircle2 className='w-4 h-4' /></>
                                }
                            </button>
                        </div>
                    </form>
                )}

                {/* Paso 3: Nueva contraseña */}
                {forgotStep === 3 && (
                    <form onSubmit={onPasswordSubmit} className='flex flex-col gap-4'>
                        {/* Nueva contraseña */}
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-500 font-medium'>Nueva contraseña</label>
                            <div className='relative'>
                                <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                                <input
                                    {...passwordForm.register('newPassword', {
                                        required: true,
                                        validate: (v) =>
                                            (v.length <= PASSWORD_MAX && PASSWORD_REGEX.test(v))
                                            || 'La contraseña no cumple los requisitos.',
                                    })}
                                    type={showNewPass ? 'text' : 'password'}
                                    placeholder='Nueva contraseña'
                                    maxLength={PASSWORD_MAX}
                                    className={cn(inputBase, 'pl-10 pr-10 py-3')}
                                />
                                <button type='button' onClick={() => setShowNewPass(v => !v)}
                                    className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                                    {showNewPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                            {newPassVal && (
                                <div className='flex flex-col gap-0.5 pt-0.5'>
                                    {PASSWORD_CHECKS.map(({ label, test }) => {
                                        const ok = test(newPassVal)
                                        return (
                                            <div key={label} className={cn('flex items-center gap-1.5 text-[10px] transition-colors', ok ? 'text-green-500' : 'text-gray-400')}>
                                                <span className='font-bold'>{ok ? '✓' : '○'}</span>
                                                {label}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-500 font-medium'>Confirmar contraseña</label>
                            <div className='relative'>
                                <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                                <input
                                    {...passwordForm.register('confirmPassword', {
                                        required: true,
                                        validate: (v) => v === newPassVal || 'Las contraseñas no coinciden.',
                                    })}
                                    type={showConfirmPass ? 'text' : 'password'}
                                    placeholder='Confirme su nueva contraseña'
                                    className={cn(inputBase, 'pl-10 pr-10 py-3')}
                                />
                                <button type='button' onClick={() => setShowConfirmPass(v => !v)}
                                    className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'>
                                    {showConfirmPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className='text-[10px] text-red-400'>{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type='submit'
                            disabled={passwordForm.formState.isSubmitting || !passwordForm.formState.isValid}
                            className='w-full flex items-center py-3.5 px-5 rounded-xl bg-orve-darker-teal text-white font-semibold text-sm hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            <span className='flex-1 text-center'>Cambiar contraseña</span>
                            {passwordForm.formState.isSubmitting
                                ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                : <CheckCircle2 className='w-4 h-4 shrink-0' />
                            }
                        </button>
                    </form>
                )}
            </div>
        )
    }

    // ── Formulario de inicio de sesión ───────────────────────────────────────
    return (
        <div className='flex flex-col gap-5'>
            <div className='flex flex-col items-end gap-0.5'>
                <img src={orveLogo} alt='ORVE' className='h-10 w-auto' />
                <h2 className='text-xl font-bold text-orve-darker-teal mt-0.5'>Inicio de sesión</h2>
                <p className='text-xs text-gray-400 text-right'>Accede a tu cuenta para gestionar propiedades</p>
            </div>

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

                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Correo electrónico</label>
                    <div className='relative'>
                        <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('email', {
                                required: 'El correo es requerido.',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Ingrese un correo válido.',
                                },
                            })}
                            type='email'
                            placeholder='Ingrese su correo electrónico'
                            className={cn(inputBase, 'pl-10 pr-4 py-3', errors.email && 'border-red-300/70')}
                        />
                    </div>
                    {errors.email && (
                        <p className='text-[10px] text-red-400'>{errors.email.message}</p>
                    )}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Contraseña</label>
                    <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('password', {
                                required: 'La contraseña es requerida.',
                                maxLength: {
                                    value: PASSWORD_MAX,
                                    message: `La contraseña no puede superar los ${PASSWORD_MAX} caracteres.`,
                                },
                                pattern: {
                                    value: PASSWORD_REGEX,
                                    message: 'Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&).',
                                },
                            })}
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
                    {errors.password && (
                        <p className='text-[10px] text-red-400'>{errors.password.message}</p>
                    )}
                </div>

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
        </div>
    )
}

export default LoginForm
