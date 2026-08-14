import { useState } from 'react'
import { Lock, Eye, EyeOff, Monitor, CheckCircle2, Trash2, MoreVertical, Mail, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import useAuth from '@/hooks/useAuth'
import ClientService from '@/services/Client'

const inputBase = 'w-full pl-9 pr-10 py-3 text-sm bg-orve-teal/5 border border-orve-teal/15 rounded-xl outline-none transition-colors placeholder:text-orve-teal/30 focus:border-orve-teal/40'

/**
 * Pestaña "Seguridad" del perfil.
 * Cambio de contraseña: flujo 2 pasos (envío de código OTP al correo → verificar + nueva contraseña).
 * Esto es necesario porque el backend requiere la cookie c_recovery del flujo de recovery.
 */
const ProfileSecurity = () => {
    const { user, logout } = useAuth()

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='flex flex-col gap-6'>
                <ChangePasswordSection email={user?.email} />
                <AccessMethodsSection />
            </div>
            <div className='flex flex-col gap-6'>
                <ActiveSessionsSection logout={logout} />
                <EmailVerificationSection email={user?.email} />
                <DeleteAccountSection />
            </div>
        </div>
    )
}

/* ─── Cambiar contraseña (flujo 2 pasos) ─────────────────────────── */

const ChangePasswordSection = ({ email }) => {
    // phase: 'idle' → 'code_sent' → 'success'
    const [phase, setPhase] = useState('idle')
    const [serverError, setServerError] = useState(null)
    const [sending, setSending] = useState(false)

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting, isValid } } = useForm({
        mode: 'onChange',
        defaultValues: { code: '', newPassword: '', confirmPassword: '' },
    })
    const newPassword = watch('newPassword', '')

    const getStrength = (pwd) => {
        if (!pwd) return 0
        let s = 0
        if (pwd.length >= 8) s++
        if (/[A-Z]/.test(pwd)) s++
        if (/[0-9]/.test(pwd)) s++
        if (/[^A-Za-z0-9]/.test(pwd)) s++
        return s
    }
    const strength = getStrength(newPassword)
    const strengthLabel = ['', 'Débil', 'Media', 'Buena', 'Fuerte'][strength]
    const strengthColor = ['', 'bg-orve-red', 'bg-yellow-400', 'bg-blue-400', 'bg-orve-green'][strength]

    const sendCode = async () => {
        if (!email) return
        setSending(true)
        setServerError(null)
        try {
            await ClientService.requestPasswordRecovery({ email })
            setPhase('code_sent')
        } catch {
            setServerError('No se pudo enviar el código. Intente de nuevo.')
        } finally {
            setSending(false)
        }
    }

    const onSubmit = async ({ code, newPassword, confirmPassword }) => {
        setServerError(null)
        try {
            await ClientService.verifyRecoveryCode({ code })
            await ClientService.resetPassword({ newPassword, confirmPassword })
            setPhase('success')
            reset()
        } catch (err) {
            const status = err?.response?.status
            setServerError(
                status === 403 ? 'Código incorrecto o expirado.' :
                status === 400 ? 'Las contraseñas no coinciden.' :
                'Error al actualizar la contraseña.'
            )
        }
    }

    return (
        <section>
            <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2 mb-1'>
                <Lock className='w-4 h-4' />
                Cambiar contraseña
            </h3>
            <p className='text-xs text-gray-400 mb-4'>
                Asegúrese de usar una contraseña segura que únicamente usted conozca.
            </p>

            {phase === 'idle' && (
                <div className='flex flex-col gap-3'>
                    {serverError && <ErrorMsg>{serverError}</ErrorMsg>}
                    <p className='text-xs text-gray-500 bg-orve-teal/5 border border-orve-teal/10 rounded-xl px-4 py-3'>
                        Le enviaremos un código de verificación a <span className='font-semibold text-orve-darker-teal'>{email}</span> para confirmar su identidad.
                    </p>
                    <button
                        onClick={sendCode}
                        disabled={sending}
                        className='flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-60'
                    >
                        {sending
                            ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                            : <Mail className='w-3.5 h-3.5' />
                        }
                        Enviar código de verificación
                    </button>
                </div>
            )}

            {phase === 'code_sent' && (
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
                    {serverError && <ErrorMsg>{serverError}</ErrorMsg>}

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs text-gray-500 font-medium'>Código recibido por correo</label>
                        <input
                            {...register('code', { required: true, minLength: 6, maxLength: 6 })}
                            placeholder='ej: a1b2c3'
                            className='w-full px-4 py-3 text-sm bg-orve-teal/5 border border-orve-teal/15 rounded-xl outline-none focus:border-orve-teal/40 tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans'
                        />
                    </div>

                    <PasswordField label='Nueva contraseña'          name='newPassword'     register={register} error={errors.newPassword}     rules={{ required: true, minLength: { value: 8, message: 'Mínimo 8 caracteres' } }} />
                    <PasswordField label='Confirmar nueva contraseña' name='confirmPassword' register={register} error={errors.confirmPassword} rules={{ required: true, validate: v => v === newPassword || 'Las contraseñas no coinciden' }} />

                    {newPassword.length > 0 && (
                        <div className='flex flex-col gap-1.5'>
                            <div className='flex gap-1'>
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={cn('flex-1 h-1 rounded-full transition-colors', i <= strength ? strengthColor : 'bg-gray-200')} />
                                ))}
                            </div>
                            <p className='text-[10px] text-gray-400'>
                                Seguridad: <span className={cn('font-semibold', strength >= 3 ? 'text-orve-green' : strength === 2 ? 'text-yellow-500' : 'text-orve-red')}>{strengthLabel}</span>
                            </p>
                        </div>
                    )}

                    <div className='flex gap-2'>
                        <button type='button' onClick={() => { setPhase('idle'); setServerError(null); reset() }} className='text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-xl border border-gray-200 transition-colors'>
                            Cancelar
                        </button>
                        <button type='submit' disabled={isSubmitting || !isValid} className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-60'>
                            <ArrowRight className='w-3.5 h-3.5' />
                            Actualizar contraseña
                        </button>
                    </div>

                    <button type='button' onClick={sendCode} className='text-xs text-orve-teal/60 hover:text-orve-teal self-start underline'>
                        Reenviar código
                    </button>
                </form>
            )}

            {phase === 'success' && (
                <div className='flex items-center gap-3 bg-orve-green/5 border border-orve-green/20 rounded-xl px-4 py-3'>
                    <CheckCircle2 className='w-5 h-5 text-orve-green shrink-0' />
                    <div className='flex-1'>
                        <p className='text-sm font-semibold text-orve-green'>Contraseña actualizada</p>
                        <p className='text-xs text-gray-400 mt-0.5'>Su contraseña fue cambiada exitosamente.</p>
                    </div>
                    <button onClick={() => setPhase('idle')} className='text-xs text-gray-400 hover:text-gray-600 underline'>Cambiar otra vez</button>
                </div>
            )}
        </section>
    )
}

/* ─── Métodos de acceso ───────────────────────────────────────────── */

const AccessMethodsSection = () => (
    <section>
        <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2 mb-1'>
            <svg className='w-4 h-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/></svg>
            Métodos de acceso
        </h3>
        <p className='text-xs text-gray-400 mb-4'>Administre las cuentas conectadas que puede utilizar para iniciar sesión.</p>
        <div className='flex flex-col gap-1 bg-orve-teal/5 border border-orve-teal/10 rounded-2xl p-3'>
            {[
                { name: 'Google', connected: false, icon: <GoogleIcon /> },
                { name: 'Apple',  connected: false, icon: <AppleIcon /> },
            ].map(({ name, connected, icon }) => (
                <div key={name} className='flex items-center gap-3 px-1 py-2'>
                    <div className='w-6 h-6 flex items-center justify-center shrink-0'>{icon}</div>
                    <div className='flex-1'>
                        <p className='text-sm font-medium text-orve-darker-teal'>{name}</p>
                        <p className='text-[10px] text-gray-400'>{connected ? 'Conectado' : 'Sin conectar'}</p>
                    </div>
                    {connected
                        ? <span className='text-[10px] text-orve-green border border-orve-green/30 px-2 py-0.5 rounded-full font-medium'>Conectado</span>
                        : <button className='text-[10px] text-orve-teal border border-orve-teal/30 px-3 py-0.5 rounded-full hover:bg-orve-teal/5 transition-colors'>Conectar</button>
                    }
                </div>
            ))}
        </div>
    </section>
)

/* ─── Sesiones activas ────────────────────────────────────────────── */

const ActiveSessionsSection = ({ logout }) => (
    <section>
        <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2 mb-1'>
            <Monitor className='w-4 h-4' />
            Sesiones activas
        </h3>
        <p className='text-xs text-gray-400 mb-4'>
            Si no reconoce algún dispositivo, cierre la sesión y cambie su contraseña.
        </p>
        <div className='flex flex-col gap-1 bg-orve-teal/5 border border-orve-teal/10 rounded-2xl p-3 mb-3'>
            <div className='flex items-center gap-3 px-1 py-1.5'>
                <Monitor className='w-4 h-4 text-orve-teal/50 shrink-0' />
                <div className='flex-1'>
                    <p className='text-sm font-medium text-orve-darker-teal'>Este dispositivo</p>
                    <p className='text-[10px] text-gray-400'>Sesión actual · Ahora</p>
                </div>
                <span className='text-[10px] text-orve-teal border border-orve-teal/30 px-2 py-0.5 rounded-full font-medium'>Actual</span>
            </div>
        </div>
        <button onClick={logout} className='text-xs font-semibold text-orve-red border border-orve-red/30 hover:bg-orve-red/5 px-4 py-2 rounded-xl transition-colors'>
            Cerrar todas las sesiones
        </button>
    </section>
)

/* ─── Verificación de correo ──────────────────────────────────────── */

const EmailVerificationSection = ({ email }) => (
    <section>
        <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2 mb-1'>
            <Mail className='w-4 h-4' />
            Estado de verificación de correo
        </h3>
        <p className='text-xs text-gray-400 mb-4'>Su correo está verificado. Esto ayuda a mantener su cuenta segura.</p>
        <div className='flex items-center gap-3 bg-orve-teal/5 border border-orve-teal/10 rounded-2xl px-4 py-3'>
            <CheckCircle2 className='w-5 h-5 text-orve-green shrink-0' />
            <div className='flex-1'>
                <p className='text-sm font-medium text-orve-darker-teal'>Correo verificado</p>
                <p className='text-xs text-gray-400'>{email}</p>
            </div>
            <span className='text-[10px] text-orve-green border border-orve-green/30 px-2 py-0.5 rounded-full font-medium'>Verificado</span>
        </div>
    </section>
)

/* ─── Eliminar cuenta ─────────────────────────────────────────────── */

const DeleteAccountSection = () => (
    <div className='flex items-center justify-between bg-orve-red/5 border border-orve-red/15 rounded-2xl px-4 py-3.5'>
        <div className='flex items-center gap-3'>
            <Trash2 className='w-4 h-4 text-orve-red shrink-0' />
            <div>
                <p className='text-sm font-bold text-orve-red'>Eliminar cuenta</p>
                <p className='text-[10px] text-orve-red/60'>Esta acción es permanente y no se puede deshacer.</p>
            </div>
        </div>
        <button className='shrink-0 ml-4 text-xs font-semibold text-orve-red border border-orve-red/40 hover:bg-orve-red hover:text-white px-3 py-2 rounded-xl transition-colors'>
            Eliminar cuenta
        </button>
    </div>
)

/* ─── Helpers ─────────────────────────────────────────────────────── */

const PasswordField = ({ label, name, register, error, rules }) => {
    const [show, setShow] = useState(false)
    return (
        <div>
            <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40' />
                <input
                    {...register(name, rules)}
                    type={show ? 'text' : 'password'}
                    placeholder={label}
                    className={cn(inputBase, error && 'border-orve-red/40')}
                />
                <button type='button' onClick={() => setShow(v => !v)} className='absolute right-3 top-1/2 -translate-y-1/2 text-orve-teal/40 hover:text-orve-teal/70'>
                    {show ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                </button>
            </div>
            {error?.message && <p className='text-[10px] text-orve-red mt-1 pl-1'>{error.message}</p>}
        </div>
    )
}

const ErrorMsg = ({ children }) => (
    <p className='text-xs text-orve-red bg-orve-red/5 border border-orve-red/15 px-3 py-2 rounded-xl'>{children}</p>
)

const GoogleIcon = () => (
    <svg viewBox='0 0 24 24' className='w-5 h-5'>
        <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
        <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
        <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
        <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
    </svg>
)

const AppleIcon = () => (
    <svg viewBox='0 0 24 24' className='w-5 h-5' fill='currentColor'>
        <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.06 2.2.72 2.96.75.98-.18 1.92-.86 2.98-.79 1.27.09 2.22.56 2.84 1.42-2.6 1.56-2.2 5.26.65 6.24-.62 1.56-1.44 3.12-2.43 5.24zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z'/>
    </svg>
)

export default ProfileSecurity
