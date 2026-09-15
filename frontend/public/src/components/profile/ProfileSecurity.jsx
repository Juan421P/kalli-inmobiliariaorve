import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Monitor, CheckCircle2, Trash2, MoreVertical, Mail, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import useAuth from '@/hooks/useAuth'
import ClientService from '@/services/Client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
                <EmailVerificationSection email={user?.email} />
            </div>
            <div className='flex flex-col gap-6'>
                <ActiveSessionsSection logout={logout} />
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
    const [justResent, setJustResent] = useState(false)

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

    const sendCode = async (isResend = false) => {
        if (!email) return
        setSending(true)
        setServerError(null)
        setJustResent(false)
        try {
            await ClientService.requestPasswordRecovery({ email })
            setPhase('code_sent')
            if (isResend) {
                // El formulario ya está en phase 'code_sent', así que aquí no
                // cambia nada visible -sin este aviso, reenviar parece no
                // hacer nada aunque sí dispare la petición.
                setJustResent(true)
                setTimeout(() => setJustResent(false), 4000)
            }
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
                        onClick={() => sendCode(false)}
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

                    <button
                        type='button'
                        onClick={() => sendCode(true)}
                        disabled={sending}
                        className='text-xs text-orve-teal/60 hover:text-orve-teal self-start underline disabled:opacity-60'
                    >
                        {sending ? 'Reenviando...' : justResent ? 'Código reenviado ✓' : 'Reenviar código'}
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

/* ─── Sesiones activas ────────────────────────────────────────────── */

// "Cerrar todas las sesiones" llama a /client/logout-all, que invalida en el
// backend cualquier token ya emitido (ver require_auth.js) -no solo limpia la
// cookie de este dispositivo como hacía antes con el logout normal-, así que
// sí afecta sesiones abiertas en otros dispositivos.
const ActiveSessionsSection = ({ logout }) => {
    const navigate = useNavigate()
    const [closing, setClosing] = useState(false)
    const [error, setError] = useState(null)

    const closeAllSessions = async () => {
        setClosing(true)
        setError(null)
        try {
            await ClientService.logoutAllSessions()
            await logout()
            navigate('/login')
        } catch {
            setError('No se pudieron cerrar las sesiones. Intente de nuevo.')
            setClosing(false)
        }
    }

    return (
        <section>
            <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2 mb-1'>
                <Monitor className='w-4 h-4' />
                Sesiones activas
            </h3>
            <p className='text-xs text-gray-400 mb-4'>
                Si no reconoce algún dispositivo, cierre todas las sesiones y cambie su contraseña.
            </p>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <div className='flex flex-col gap-1 bg-orve-teal/5 border border-orve-teal/10 rounded-2xl p-3 mb-3 mt-3'>
                <div className='flex items-center gap-3 px-1 py-1.5'>
                    <Monitor className='w-4 h-4 text-orve-teal/50 shrink-0' />
                    <div className='flex-1'>
                        <p className='text-sm font-medium text-orve-darker-teal'>Este dispositivo</p>
                        <p className='text-[10px] text-gray-400'>Sesión actual · Ahora</p>
                    </div>
                    <span className='text-[10px] text-orve-teal border border-orve-teal/30 px-2 py-0.5 rounded-full font-medium'>Actual</span>
                </div>
            </div>
            <button
                onClick={closeAllSessions}
                disabled={closing}
                className='text-xs font-semibold text-orve-red border border-orve-red/30 hover:bg-orve-red/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-60'
            >
                {closing ? 'Cerrando sesiones...' : 'Cerrar todas las sesiones'}
            </button>
        </section>
    )
}

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

// Requiere doble confirmación explícita antes de llamar al backend: un primer
// diálogo que explica las consecuencias, y un segundo que pide confirmar
// definitivamente la eliminación (evita borrados accidentales por un solo clic).
const DeleteAccountSection = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    // step: 0 cerrado, 1 primera confirmación, 2 confirmación definitiva
    const [step, setStep] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(null)

    const closeDialog = () => {
        if (deleting) return
        setStep(0)
        setError(null)
    }

    const confirmDelete = async () => {
        setDeleting(true)
        setError(null)
        try {
            await ClientService.delete(user.id)
            setStep(0)
            await logout()
            navigate('/')
        } catch {
            setError('No se pudo eliminar la cuenta. Intente de nuevo.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className='flex items-center justify-between bg-orve-red/5 border border-orve-red/15 rounded-2xl px-4 py-3.5'>
            <div className='flex items-center gap-3'>
                <Trash2 className='w-4 h-4 text-orve-red shrink-0' />
                <div>
                    <p className='text-sm font-bold text-orve-red'>Eliminar cuenta</p>
                    <p className='text-[10px] text-orve-red/60'>Esta acción es permanente y no se puede deshacer.</p>
                </div>
            </div>
            <button
                onClick={() => setStep(1)}
                className='shrink-0 ml-4 text-xs font-semibold text-orve-red border border-orve-red/40 hover:bg-orve-red hover:text-white px-3 py-2 rounded-xl transition-colors'
            >
                Eliminar cuenta
            </button>

            {/* Primera confirmación: explica qué se pierde */}
            <AlertDialog open={step === 1} onOpenChange={(open) => !open && closeDialog()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar su cuenta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminarán permanentemente su perfil, favoritos y el historial asociado a su cuenta. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); setStep(2) }}
                            className='bg-orve-red text-white hover:bg-orve-red/90'
                        >
                            Continuar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Segunda confirmación: la que realmente dispara el borrado */}
            <AlertDialog open={step === 2} onOpenChange={(open) => !open && closeDialog()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirme la eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta es su última oportunidad para cancelar. ¿Confirma definitivamente que desea{' '}
                            <span className='font-semibold text-orve-red'>ELIMINAR</span> su cuenta?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDialog} disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); confirmDelete() }}
                            disabled={deleting}
                            className='bg-orve-red text-white hover:bg-orve-red/90'
                        >
                            {deleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

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

export default ProfileSecurity
