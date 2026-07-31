import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, Hash, FileText, ArrowLeft, UserPlus, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOCUMENT_TYPES = ['DUI', 'Pasaporte', 'Residencia']

const DOCUMENT_HINTS = {
    DUI:        { placeholder: '00000000-0',               hint: 'Formato: 00000000-0'       },
    Pasaporte:  { placeholder: 'Ej. A12345678',            hint: 'Letras y números'           },
    Residencia: { placeholder: 'Número de residencia',     hint: 'Número de carnet de resid.' },
}

const validateDocument = (value, type) => {
    if (!value?.trim()) return 'El número de documento es requerido.'
    if (type === 'DUI') {
        return /^\d{8}-\d$/.test(value) || 'El DUI debe tener el formato 00000000-0'
    }
    return value.trim().length >= 3 || 'Ingrese un número de documento válido.'
}

const RegisterStep2 = ({ form, password, onSubmit, goBack, serverError }) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const { register, watch, trigger, formState: { errors, isSubmitting, isValid } } = form

    const documentType = watch('document_type', '')
    const docHint = DOCUMENT_HINTS[documentType] ?? { placeholder: 'Ingrese su número de documento', hint: null }

    // Revalida el número de documento cuando cambia el tipo
    useEffect(() => {
        trigger('document_number')
    }, [documentType, trigger])

    return (
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            {serverError && (
                <p className='text-xs text-orve-red bg-orve-red/5 border border-orve-red/15 px-3 py-2 rounded-lg'>{serverError}</p>
            )}

            {/* Teléfono y Tipo de documento */}
            <div className='grid grid-cols-2 gap-3'>
                {/* Número de teléfono */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Número de teléfono</label>
                    <div className={cn(
                        'relative flex items-center bg-orve-teal/5 border rounded-xl overflow-hidden transition-colors',
                        errors.phone ? 'border-orve-red/40' : 'border-orve-teal/15 focus-within:border-orve-teal/50'
                    )}>
                        <div className='flex items-center gap-1 pl-2.5 pr-2 border-r border-orve-teal/15 shrink-0'>
                            <span className='text-sm'>🇸🇻</span>
                            <span className='text-[10px] text-orve-teal/50 font-medium'>+503</span>
                        </div>
                        <input
                            {...register('phone', {
                                required: 'El teléfono es requerido.',
                                pattern: {
                                    value: /^\d{4}-?\d{4}$/,
                                    message: 'Formato: 0000-0000',
                                },
                            })}
                            type='tel'
                            placeholder='0000-0000'
                            className={cn(
                                'flex-1 pl-2 pr-3 py-2.5 text-xs bg-transparent outline-none placeholder:text-orve-teal/30',
                                errors.phone && 'placeholder:text-orve-red/50'
                            )}
                        />
                    </div>
                    {errors.phone
                        ? <p className='text-[10px] text-orve-red'>{errors.phone.message}</p>
                        : <p className='text-[10px] text-orve-teal/40'>Formato: 0000-0000</p>
                    }
                </div>

                {/* Tipo de documento */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Tipo de documento</label>
                    <div className='relative'>
                        <FileText className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40 pointer-events-none' />
                        <select
                            {...register('document_type', { required: 'Seleccione un tipo de documento.' })}
                            className={cn(
                                'w-full pl-8 pr-3 py-2.5 text-xs bg-orve-teal/5 border rounded-xl outline-none transition-colors appearance-none cursor-pointer',
                                errors.document_type
                                    ? 'border-orve-red/40 text-orve-red/70'
                                    : 'border-orve-teal/15 focus:border-orve-teal/50 text-orve-teal/80'
                            )}
                            defaultValue=''
                        >
                            <option value='' disabled>Seleccione un tipo</option>
                            {DOCUMENT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    {errors.document_type && (
                        <p className='text-[10px] text-orve-red'>{errors.document_type.message}</p>
                    )}
                </div>
            </div>

            {/* Número de documento y Confirmar contraseña */}
            <div className='grid grid-cols-2 gap-3'>
                {/* Número de documento */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Número de documento</label>
                    <div className='relative'>
                        <Hash className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40' />
                        <input
                            {...register('document_number', {
                                validate: (v) => validateDocument(v, documentType),
                            })}
                            placeholder={docHint.placeholder}
                            className={cn(
                                'w-full pl-8 pr-3 py-2.5 text-xs bg-orve-teal/5 border rounded-xl outline-none transition-colors placeholder:text-orve-teal/30',
                                errors.document_number
                                    ? 'border-orve-red/40'
                                    : 'border-orve-teal/15 focus:border-orve-teal/50'
                            )}
                        />
                    </div>
                    {errors.document_number
                        ? <p className='text-[10px] text-orve-red'>{errors.document_number.message}</p>
                        : docHint.hint && <p className='text-[10px] text-orve-teal/40'>{docHint.hint}</p>
                    }
                </div>

                {/* Confirmar contraseña */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Confirme su contraseña</label>
                    <div className='relative'>
                        <Lock className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40' />
                        <input
                            {...register('confirmPassword', {
                                required: 'Confirme su contraseña.',
                                validate: (v) => v === password || 'Las contraseñas no coinciden.',
                            })}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder='Ingrese la contraseña otra vez'
                            className={cn(
                                'w-full pl-8 pr-8 py-2.5 text-xs bg-orve-teal/5 border rounded-xl outline-none transition-colors placeholder:text-orve-teal/30',
                                errors.confirmPassword ? 'border-orve-red/40' : 'border-orve-teal/15 focus:border-orve-teal/50'
                            )}
                        />
                        <button
                            type='button'
                            onClick={() => setShowConfirm((v) => !v)}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-orve-teal/40 hover:text-orve-teal/70 transition-colors'
                        >
                            {showConfirm ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className='text-[10px] text-orve-red'>{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            {/* Términos y condiciones */}
            <div className='flex flex-col gap-1'>
                <label className='flex items-start gap-2 cursor-pointer'>
                    <input
                        type='checkbox'
                        {...register('terms', { validate: (v) => v === true })}
                        className='w-3.5 h-3.5 mt-0.5 accent-orve-teal rounded shrink-0'
                    />
                    <span className='text-xs text-orve-teal/60 leading-relaxed'>
                        He leído y acepto los <span className='text-orve-teal font-medium underline'>términos y condiciones</span> de Kalli
                    </span>
                </label>
                {errors.terms && (
                    <p className='text-[10px] text-orve-red pl-5'>Debe aceptar los términos para continuar.</p>
                )}
            </div>

            {/* Botones Atrás / Registrarse */}
            <div className='grid grid-cols-2 gap-3'>
                <button
                    type='button'
                    onClick={goBack}
                    className='flex items-center justify-center gap-2 py-3 rounded-xl border border-orve-teal/20 text-orve-teal/70 text-sm font-semibold hover:bg-orve-teal/5 transition-colors'
                >
                    <ArrowLeft className='w-4 h-4' />
                    Atrás
                </button>
                <button
                    type='submit'
                    disabled={isSubmitting || !isValid}
                    className='flex items-center justify-center gap-2 py-3 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    {isSubmitting
                        ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        : <> Registrarse <UserPlus className='w-4 h-4' /> </>
                    }
                </button>
            </div>

            {/* Notas de privacidad */}
            <div className='flex flex-col gap-1.5 pt-1'>
                {[
                    { text: 'Nunca compartiremos sus datos sin su consentimiento' },
                    { text: 'Su información está protegida y encriptada' },
                ].map(({ text }) => (
                    <div key={text} className='flex items-center gap-2 text-[10px] text-orve-teal/35'>
                        <ShieldCheck className='w-3 h-3 shrink-0' />
                        {text}
                    </div>
                ))}
            </div>

            {/* Indicador de paso */}
            <div className='flex items-center gap-2 pt-1'>
                <div className='flex-1 h-px bg-orve-teal/10' />
                <span className='text-[10px] text-orve-teal/35 font-medium'>paso 2 / 3</span>
                <div className='flex-1 h-px bg-orve-teal/10' />
            </div>
        </form>
    )
}

export default RegisterStep2
