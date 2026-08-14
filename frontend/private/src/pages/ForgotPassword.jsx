import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import bgImage from '@/assets/login-bg.jpg'
import orveLogo from '@/assets/orve-logo.svg'
import AdminService from '@/services/AdminService'
import toast from '@/lib/toast'

const filterEmail = (v) => v.replace(/[^a-zA-Z0-9@.\-_+]/g, '')
const filterPassword = (v) => v.replace(/\s/g, '')
const filterCode = (v) => v.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PASSWORD_RULES = [
    { key: 'length', label: 'Al menos 8 caracteres',        test: (p) => p.length >= 8 },
    { key: 'upper',  label: 'Al menos una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',  label: 'Al menos una letra minúscula', test: (p) => /[a-z]/.test(p) },
    { key: 'number', label: 'Al menos un número',           test: (p) => /[0-9]/.test(p) },
]

const RuleCheck = ({ passed, label }) => (
    <div className={cn('flex items-center gap-2 text-sm transition-colors duration-200', passed ? 'text-orve-green' : 'text-orve-teal/40')}>
        <CheckCircle2 className={cn('h-4 w-4 shrink-0 transition-colors duration-200', passed ? 'text-orve-green' : 'text-orve-teal/20')} />
        <span>{label}</span>
    </div>
)

const STEP = { EMAIL: 0, CODE: 1, PASSWORD: 2 }

const STEP_CONFIG = {
    [STEP.EMAIL]: {
        title: 'Recuperar contraseña',
        description: 'Ingrese su correo electrónico y le enviaremos un código para restablecer su contraseña.',
    },
    [STEP.CODE]: {
        title: 'Verificar código',
        description: 'Ingrese el código de 6 dígitos que enviamos a su correo electrónico.',
    },
    [STEP.PASSWORD]: {
        title: 'Nueva contraseña',
        description: 'Establezca una nueva contraseña segura para su cuenta.',
    },
}

const StepDots = ({ current }) => (
    <div className='flex items-center gap-2 mb-1'>
        {[STEP.EMAIL, STEP.CODE, STEP.PASSWORD].map((s) => (
            <div
                key={s}
                className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    s === current ? 'w-6 bg-orve-teal' : s < current ? 'w-3 bg-orve-teal/40' : 'w-3 bg-orve-teal/15'
                )}
            />
        ))}
    </div>
)

// Ojo: a diferencia del login (que prueba admin y colaborador), esta pantalla
// solo pega a AdminService — hoy por hoy un colaborador no tiene por dónde
// recuperar su contraseña desde el panel
const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(STEP.EMAIL)
    const [isLoading, setIsLoading] = useState(false)

    // Step 1 – email
    const [email, setEmail]               = useState('')
    const [emailError, setEmailError]     = useState('')
    const [emailTouched, setEmailTouched] = useState(false)
    const [recoveryToken, setRecoveryToken] = useState('')

    // Step 2 – code
    const [code, setCode]               = useState('')
    const [codeError, setCodeError]     = useState('')
    const [codeTouched, setCodeTouched] = useState(false)
    const [timeLeft, setTimeLeft]       = useState(900)
    const [verifiedToken, setVerifiedToken] = useState('')

    // Step 3 – new password
    const [newPwd, setNewPwd]           = useState('')
    const [confirmPwd, setConfirmPwd]   = useState('')
    const [showNew, setShowNew]         = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmTouched, setConfirmTouched] = useState(false)

    // Countdown
    useEffect(() => {
        if (step !== STEP.CODE || timeLeft <= 0) return
        const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000)
        return () => clearTimeout(t)
    }, [step, timeLeft])

    const formatTime = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    // Password validation
    const ruleResults     = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(newPwd) }))
    const passwordsMatch  = newPwd.length > 0 && confirmPwd.length > 0 && newPwd === confirmPwd
    const allRulesPass    = ruleResults.every((r) => r.passed) && passwordsMatch

    // ── Helpers ──────────────────────────────────────────────────────────────

    const validateEmail = (v) => {
        if (!v.trim()) return 'Requerido'
        if (!EMAIL_RE.test(v)) return 'Formato de correo inválido'
        return ''
    }

    const emailIsValid = !validateEmail(email)

    const handleEmailChange = (e) => {
        const val = filterEmail(e.target.value)
        setEmail(val)
        if (emailTouched) setEmailError(validateEmail(val))
    }

    const handleCodeChange = (e) => {
        const val = filterCode(e.target.value)
        setCode(val)
        if (codeTouched) setCodeError(val.length === 0 ? 'Requerido' : val.length < 6 ? 'El código debe tener 6 caracteres' : '')
    }

    // ── Step handlers ─────────────────────────────────────────────────────────

    const handleRequestCode = async () => {
        const err = validateEmail(email)
        if (err) { setEmailTouched(true); setEmailError(err); return }

        setIsLoading(true)
        try {
            const { token } = await AdminService.requestPasswordRecovery(email)
            setRecoveryToken(token)
            setTimeLeft(900)
            setCode('')
            setCodeError('')
            setCodeTouched(false)
            setStep(STEP.CODE)
        } catch (error) {
            const code = error.response?.data?.meta?.code
            if (code === 'EMAIL_NOT_REGISTERED') {
                setEmailTouched(true)
                setEmailError('No existe ningún usuario registrado con este correo.')
            } else {
                toast.error('Error', error.response?.data?.message || 'No se pudo enviar el código')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            const { token } = await AdminService.requestPasswordRecovery(email)
            setRecoveryToken(token)
            setTimeLeft(900)
            setCode('')
            setCodeError('')
            setCodeTouched(false)
            toast.success('Código reenviado', 'Revise su correo electrónico.')
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo reenviar el código'
            toast.error('Error', msg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!code.trim()) { setCodeTouched(true); setCodeError('Requerido'); return }
        if (code.length < 6) { setCodeTouched(true); setCodeError('El código debe tener 6 caracteres'); return }

        setIsLoading(true)
        try {
            const { token } = await AdminService.verifyPasswordRecovery({ token: recoveryToken, code: code.toLowerCase() })
            setVerifiedToken(token)
            setStep(STEP.PASSWORD)
        } catch (error) {
            const msg = error.response?.data?.message || 'Código incorrecto o expirado'
            setCodeTouched(true)
            setCodeError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (!allRulesPass) return
        setIsLoading(true)
        try {
            await AdminService.changePassword({ token: verifiedToken, newPassword: newPwd, confirmPassword: confirmPwd })
            toast.success('Contraseña actualizada', 'Ya puede iniciar sesión con su nueva contraseña.')
            navigate('/')
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo actualizar la contraseña'
            toast.error('Error', msg)
        } finally {
            setIsLoading(false)
        }
    }

    // ── Shared input classes ──────────────────────────────────────────────────

    const inputBase = 'border-transparent h-12 rounded-xl text-orve-teal placeholder:text-orve-teal/75 placeholder:italic drop-shadow-md font-medium transition-colors'

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className='min-h-screen w-full relative flex items-end justify-end p-4 md:p-12 lg:p-18 overflow-hidden'>
            {/* Background */}
            <div
                className='absolute inset-0 z-0 bg-cover bg-left md:bg-center pointer-events-none select-none'
                style={{
                    backgroundImage: `url(${bgImage})`,
                    maskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                    WebkitMaskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                }}
            />

            {/* Logo */}
            <div className='absolute top-10 left-10 flex flex-col items-start gap-4 select-none'>
                <img src={orveLogo} alt='Logo ORVE' className='h-15 w-auto drop-shadow-md pointer-events-none' />
                <Badge variant='secondary' className='text-orve-teal bg-orve-teal/30 rounded-md px-5 py-5 text-md font-bold drop-shadow-md'>
                    <span className='drop-shadow-xs'>PANEL DE ADMINISTRACIÓN</span>
                </Badge>
            </div>

            {/* Card */}
            <Card className='w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-2 md:px-6 md:py-10'>
                <CardHeader className='space-y-[0.5] text-left'>
                    <StepDots current={step} />
                    <CardTitle className='text-2xl text-orve-teal font-semibold drop-shadow-md select-none'>
                        {STEP_CONFIG[step].title}
                    </CardTitle>
                    <CardDescription className='font-[550] text-orve-teal/60 select-none'>
                        {STEP_CONFIG[step].description}
                    </CardDescription>
                </CardHeader>

                <CardContent>

                    {/* ── Step 1: Email ──────────────────────────────────── */}
                    {step === STEP.EMAIL && (
                        <div className='space-y-6'>
                            <div className='space-y-1'>
                                <Label htmlFor='email' className='flex items-center gap-2 text-orve-teal font-semibold text-sm pl-2 select-none'>
                                    Correo electrónico
                                    {emailTouched && emailError && (
                                        <span className='text-orve-red text-xs font-semibold'>{emailError}</span>
                                    )}
                                </Label>
                                <div className={cn('relative rounded-2xl', emailTouched && emailError ? 'bg-orve-red/10' : 'bg-orve-teal/20')}>
                                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                    <Input
                                        id='email'
                                        type='email'
                                        placeholder='Ingrese su correo electrónico'
                                        value={email}
                                        onChange={handleEmailChange}
                                        onBlur={() => { setEmailTouched(true); setEmailError(validateEmail(email)) }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRequestCode()}
                                        className={cn('pl-12', inputBase, emailTouched && emailError ? 'bg-orve-red/20 border-orve-red' : 'bg-orve-teal/20')}
                                    />
                                </div>
                            </div>

                            <Button
                                type='button'
                                onClick={handleRequestCode}
                                disabled={isLoading || !emailIsValid}
                                className='relative w-full h-14 bg-orve-teal hover:bg-orve-black text-white transition-colors rounded-xl text-md flex items-center px-6 drop-shadow-md duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
                            >
                                <span className='mx-auto select-none'>{isLoading ? 'Enviando...' : 'Enviar código'}</span>
                                {isLoading ? <Spinner className='size-[5.5] absolute right-4' /> : <Mail className='size-[5.5] absolute right-4' />}
                            </Button>

                            <div className='flex justify-center'>
                                <Link to='/' className='text-sm text-orve-teal/40 font-medium hover:text-orve-teal/80 transition-colors select-none flex items-center gap-1'>
                                    <ArrowLeft className='h-4 w-4' />
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Code ───────────────────────────────────── */}
                    {step === STEP.CODE && (
                        <div className='space-y-6'>
                            {timeLeft > 0 ? (
                                <div className='text-center text-sm text-orve-teal/70 bg-orve-teal/5 rounded-xl py-3 px-4 border border-orve-teal/10 select-none'>
                                    El código expira en{' '}
                                    <span className='font-bold text-orve-teal tabular-nums'>{formatTime(timeLeft)}</span>
                                </div>
                            ) : (
                                <div className='text-center text-sm text-orve-red bg-orve-red/5 rounded-xl py-3 px-4 border border-orve-red/20 select-none'>
                                    El código ha expirado. Solicite uno nuevo.
                                </div>
                            )}

                            <div className='space-y-1'>
                                <Label htmlFor='code' className='flex items-center gap-2 text-orve-teal font-semibold text-sm pl-2 select-none'>
                                    Código de verificación
                                    {codeTouched && codeError && (
                                        <span className='text-orve-red text-xs font-semibold'>{codeError}</span>
                                    )}
                                </Label>
                                <div className={cn('relative rounded-2xl', codeTouched && codeError ? 'bg-orve-red/10' : 'bg-orve-teal/20')}>
                                    <KeyRound className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                    <Input
                                        id='code'
                                        placeholder='Ingrese el código de 6 dígitos'
                                        value={code}
                                        onChange={handleCodeChange}
                                        onBlur={() => {
                                            setCodeTouched(true)
                                            setCodeError(!code ? 'Requerido' : code.length < 6 ? 'El código debe tener 6 caracteres' : '')
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                                        maxLength={6}
                                        className={cn(
                                            'pl-12 text-center tracking-[0.6em] font-bold text-lg',
                                            inputBase,
                                            codeTouched && codeError ? 'bg-orve-red/20 border-orve-red' : 'bg-orve-teal/20'
                                        )}
                                    />
                                </div>
                            </div>

                            <Button
                                type='button'
                                onClick={handleVerifyCode}
                                disabled={isLoading || code.length < 6 || timeLeft <= 0}
                                className='relative w-full h-14 bg-orve-teal hover:bg-orve-black text-white transition-colors rounded-xl text-md flex items-center px-6 drop-shadow-md duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
                            >
                                <span className='mx-auto select-none'>{isLoading ? 'Verificando...' : 'Verificar código'}</span>
                                {isLoading ? <Spinner className='size-[5.5] absolute right-4' /> : <ShieldCheck className='size-[5.5] absolute right-4' />}
                            </Button>

                            <div className='flex justify-center gap-6'>
                                <button
                                    type='button'
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className='text-sm text-orve-teal/40 font-medium hover:text-orve-teal/80 transition-colors select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    ¿No recibió el código? Reenviar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: New password ───────────────────────────── */}
                    {step === STEP.PASSWORD && (
                        <div className='space-y-6'>
                            {/* Nueva contraseña */}
                            <div className='space-y-1'>
                                <Label htmlFor='newPwd' className='flex items-center gap-2 text-orve-teal font-semibold text-sm pl-2 select-none'>
                                    Nueva contraseña
                                    {!newPwd && <span className='text-orve-red text-xs font-semibold'>Requerido</span>}
                                </Label>
                                <div className='relative bg-orve-teal/20 rounded-2xl'>
                                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                    <Input
                                        id='newPwd'
                                        type={showNew ? 'text' : 'password'}
                                        placeholder='Ingrese su nueva contraseña'
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(filterPassword(e.target.value))}
                                        className={cn('pl-12 pr-12 bg-orve-teal/20', inputBase)}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowNew((p) => !p)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-orve-teal hover:text-orve-darker-teal transition-colors cursor-pointer z-10'
                                    >
                                        {showNew ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                                    </button>
                                </div>
                            </div>

                            {/* Checklist de reglas */}
                            {newPwd.length > 0 && (
                                <div className='bg-orve-teal/5 rounded-xl p-4 border border-orve-teal/10 space-y-2'>
                                    {ruleResults.map((r) => (
                                        <RuleCheck key={r.key} passed={r.passed} label={r.label} />
                                    ))}
                                </div>
                            )}

                            {/* Confirmar contraseña */}
                            <div className='space-y-1'>
                                <Label htmlFor='confirmPwd' className='flex items-center gap-2 text-orve-teal font-semibold text-sm pl-2 select-none'>
                                    Confirmar contraseña
                                    {!confirmPwd && confirmTouched && (
                                        <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                    )}
                                    {confirmPwd && !passwordsMatch && (
                                        <span className='text-orve-red text-xs font-semibold'>Las contraseñas no coinciden</span>
                                    )}
                                    {passwordsMatch && (
                                        <span className='text-orve-green text-xs font-semibold flex items-center gap-1'>
                                            <CheckCircle2 className='h-3 w-3' /> Coinciden
                                        </span>
                                    )}
                                </Label>
                                <div className={cn('relative rounded-2xl', confirmPwd && !passwordsMatch ? 'bg-orve-red/10' : 'bg-orve-teal/20')}>
                                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                    <Input
                                        id='confirmPwd'
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder='Confirme su nueva contraseña'
                                        value={confirmPwd}
                                        onChange={(e) => { setConfirmTouched(true); setConfirmPwd(filterPassword(e.target.value)) }}
                                        onBlur={() => setConfirmTouched(true)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                                        className={cn(
                                            'pl-12 pr-12',
                                            inputBase,
                                            confirmPwd && !passwordsMatch ? 'bg-orve-red/20 border-orve-red' : 'bg-orve-teal/20'
                                        )}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowConfirm((p) => !p)}
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-orve-teal hover:text-orve-darker-teal transition-colors cursor-pointer z-10'
                                    >
                                        {showConfirm ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type='button'
                                onClick={handleChangePassword}
                                disabled={isLoading || !allRulesPass}
                                className='relative w-full h-14 bg-orve-teal hover:bg-orve-black text-white transition-colors rounded-xl text-md flex items-center px-6 drop-shadow-md duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
                            >
                                <span className='mx-auto select-none'>{isLoading ? 'Actualizando...' : 'Cambiar contraseña'}</span>
                                {isLoading ? <Spinner className='size-[5.5] absolute right-4' /> : <ShieldCheck className='size-[5.5] absolute right-4' />}
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    )
}

export default ForgotPassword
