import { useState } from 'react'
import { Eye, EyeOff, Lock, Hash, FileText, ArrowLeft, UserPlus, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOCUMENT_TYPES = ['DUI', 'Pasaporte', 'Residencia']
/**
 * Paso 2 del registro: datos de contacto e identificacion.
 * Al enviar este formulario SI llama al backend (POST /client) para crear la
 * cuenta y disparar el envio del codigo OTP al correo del usuario.
 *
 * @param {import('react-hook-form').UseFormReturn} form - step2 del hook
 * @param {string} password - contrasena del paso 1 para validar que coincida
 * @param {Function} onSubmit - handleSubmit ya vinculado por useRegisterForm
 * @param {Function} goBack - retrocede al paso 1
 * @param {string|null} serverError - error del backend al crear la cuenta
 */
const RegisterStep2 = ({ form, password, onSubmit, goBack, serverError }) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const { register, formState: { errors, isSubmitting, isValid } } = form

    return (
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            {serverError && (
                <p className='text-xs text-orve-red bg-orve-red/5 border border-orve-red/15 px-3 py-2 rounded-lg'>{serverError}</p>
            )}

            {/* Telefono y Tipo de documento en dos columnas */}
            <div className='grid grid-cols-2 gap-3'>
                {/* Numero de telefono con prefijo El Salvador */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Número de teléfono</label>
                    <div className='relative flex items-center bg-orve-teal/5 border border-orve-teal/15 rounded-xl overflow-hidden focus-within:border-orve-teal/50 transition-colors'>
                        <div className='flex items-center gap-1 pl-2.5 pr-2 border-r border-orve-teal/15 shrink-0'>
                            <span className='text-sm'>🇸🇻</span>
                            <span className='text-[10px] text-orve-teal/50 font-medium'>+503</span>
                        </div>
                        <input
                            {...register('phone', {
                                required: true,
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
                    {errors.phone && (
                        <p className='text-[10px] text-orve-red'>{errors.phone.message ?? 'Requerido'}</p>
                    )}
                </div>

                {/* Tipo de documento select */}
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Tipo de documento</label>
                    <div className='relative'>
                        <FileText className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40 pointer-events-none' />
                        <select
                            {...register('document_type', { required: true })}
                            className={cn(
                                'w-full pl-8 pr-3 py-2.5 text-xs bg-orve-teal/5 border rounded-xl outline-none transition-colors appearance-none cursor-pointer',
                                errors.document_type ? 'border-orve-red/40 text-orve-red/70' : 'border-orve-teal/15 focus:border-orve-teal/50 text-orve-teal/80'
                            )}
                            defaultValue=''
                        >
                            <option value='' disabled>Seleccione un tipo de documento</option>
                            {DOCUMENT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Numero de documento y Confirmar contrasena en dos columnas */}
            <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Número de documento</label>
                    <div className='relative'>
                        <Hash className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40' />
                        <input
                            {...register('document_number', { required: true })}
                            placeholder='Ingrese su número de documento'
                            className={cn(
                                'w-full pl-8 pr-3 py-2.5 text-xs bg-orve-teal/5 border rounded-xl outline-none transition-colors placeholder:text-orve-teal/30',
                                errors.document_number ? 'border-orve-red/40' : 'border-orve-teal/15 focus:border-orve-teal/50'
                            )}
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs text-orve-teal/70 font-medium'>Confirme su contraseña</label>
                    <div className='relative'>
                        <Lock className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40' />
                        <input
                            {...register('confirmPassword', {
                                required: true,
                                // Valida que coincida con la contrasena del paso 1
                                validate: (v) => v === password || 'No coinciden',
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
                        <p className='text-[10px] text-orve-red'>{errors.confirmPassword.message ?? 'Requerido'}</p>
                    )}
                </div>
            </div>

            {/* Terminos y condiciones */}
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

            {/* Botones Atras / Registrarse */}
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
                    { icon: ShieldCheck, text: 'Nunca compartiremos sus datos sin su consentimiento' },
                    { icon: ShieldCheck, text: 'Su información está protegida y encriptada' },
                ].map(({ icon: Icon, text }) => (
                    <div key={text} className='flex items-center gap-2 text-[10px] text-orve-teal/35'>
                        <Icon className='w-3 h-3 shrink-0' />
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
