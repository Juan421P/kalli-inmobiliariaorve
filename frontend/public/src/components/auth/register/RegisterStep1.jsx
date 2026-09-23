import { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputBase = 'w-full text-sm bg-gray-100/80 border border-gray-200/80 rounded-xl outline-none transition-colors placeholder:text-xs placeholder:text-gray-400 focus:border-orve-teal/50 focus:bg-white/80'

// Tienen que calzar con user.name/user.lastname (shortText) y auth.password en
// el backend (backend/src/schemas/fields/primitives.js) — si allá cambian el
// máximo o el regex y acá no, el registro deja pasar cosas que el backend
// va a rechazar igual.
const SHORT_TEXT_MAX = 20
const SHORT_TEXT_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s'-]+$/
const EMAIL_MAX = 255
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const PASSWORD_MAX = 20

const PASSWORD_CHECKS = [
    { label: `Entre 8 y ${PASSWORD_MAX} caracteres`, test: (v) => v.length >= 8 && v.length <= PASSWORD_MAX },
    { label: 'Una letra mayúscula',       test: (v) => /[A-Z]/.test(v) },
    { label: 'Una letra minúscula',       test: (v) => /[a-z]/.test(v) },
    { label: 'Un número',                 test: (v) => /\d/.test(v) },
    { label: 'Un símbolo (@$!%*?&)',      test: (v) => /[@$!%*?&]/.test(v) },
]

const RegisterStep1 = ({ form, onSubmit }) => {
    const [showPass, setShowPass] = useState(false)
    const { register, watch, formState: { errors, isSubmitting, isValid } } = form
    const passwordVal = watch('password', '')

    return (
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            {/* Fila: Nombre | Apellido */}
            <div className='grid grid-cols-2 gap-3'>
                {[
                    { name: 'name',     label: 'Nombre',   placeholder: 'Ingrese su nombre'   },
                    { name: 'lastname', label: 'Apellido', placeholder: 'Ingrese su apellido' },
                ].map(({ name, label, placeholder }) => (
                    <div key={name} className='flex flex-col gap-1.5'>
                        <label className='text-xs text-gray-500 font-medium'>{label}</label>
                        <div className='relative'>
                            <User className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                {...register(name, {
                                    required: 'Este campo es requerido.',
                                    maxLength: {
                                        value: SHORT_TEXT_MAX,
                                        message: `No puede superar los ${SHORT_TEXT_MAX} caracteres.`,
                                    },
                                    pattern: {
                                        value: SHORT_TEXT_REGEX,
                                        message: 'Solo letras, números, espacios, guiones y apóstrofes.',
                                    },
                                })}
                                placeholder={placeholder}
                                maxLength={SHORT_TEXT_MAX}
                                className={cn(inputBase, 'pl-10 pr-3 py-3', errors[name] && 'border-red-300/70')}
                            />
                        </div>
                        {errors[name] && (
                            <p className='text-[10px] text-red-400'>{errors[name].message}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Fila: Correo | Contraseña */}
            <div className='grid grid-cols-2 gap-3'>
                {/* Correo */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Correo electrónico</label>
                    <div className='relative'>
                        <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('email', {
                                required: 'El correo es requerido.',
                                maxLength: {
                                    value: EMAIL_MAX,
                                    message: `No puede superar los ${EMAIL_MAX} caracteres.`,
                                },
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Ingrese un correo válido.',
                                },
                            })}
                            type='email'
                            placeholder='correo@ejemplo.com'
                            maxLength={EMAIL_MAX}
                            className={cn(inputBase, 'pl-10 pr-3 py-3', errors.email && 'border-red-300/70')}
                        />
                    </div>
                    {errors.email && (
                        <p className='text-[10px] text-red-400'>{errors.email.message}</p>
                    )}
                </div>

                {/* Contraseña */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-gray-500 font-medium'>Contraseña</label>
                    <div className='relative'>
                        <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            {...register('password', {
                                required: 'La contraseña es requerida.',
                                validate: (v) =>
                                    (v.length <= PASSWORD_MAX && PASSWORD_REGEX.test(v))
                                    || 'La contraseña no cumple los requisitos.',
                            })}
                            type={showPass ? 'text' : 'password'}
                            placeholder='Ingrese su contraseña'
                            maxLength={PASSWORD_MAX}
                            className={cn(inputBase, 'pl-10 pr-10 py-3', errors.password && 'border-red-300/70')}
                        />
                        <button
                            type='button'
                            onClick={() => setShowPass((v) => !v)}
                            className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                        >
                            {showPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                    </div>

                    {/* Checklist de requisitos de contraseña */}
                    {passwordVal && (
                        <div className='flex flex-col gap-0.5 pt-0.5'>
                            {PASSWORD_CHECKS.map(({ label, test }) => {
                                const ok = test(passwordVal)
                                return (
                                    <div
                                        key={label}
                                        className={cn(
                                            'flex items-center gap-1.5 text-[10px] transition-colors',
                                            ok ? 'text-green-500' : 'text-gray-400'
                                        )}
                                    >
                                        <span className='font-bold'>{ok ? '✓' : '○'}</span>
                                        {label}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Boton Continuar */}
            <button
                type='submit'
                disabled={isSubmitting || !isValid}
                className='w-full flex items-center py-4 px-5 mt-1 rounded-xl bg-orve-darker-teal text-white font-semibold text-sm hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
            >
                <span className='flex-1 text-center'>Continuar</span>
                {isSubmitting
                    ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    : <ArrowRight className='w-4 h-4 shrink-0' />
                }
            </button>
        </form>
    )
}

export default RegisterStep1
