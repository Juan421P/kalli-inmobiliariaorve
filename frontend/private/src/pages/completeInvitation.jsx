import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react'
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
import { collaboratorsService } from '@/services/CollaboratorsService'
import useAuth from '@/hooks/useAuth'
import toast from '@/lib/toast'

// espacios no cuentan como "carácter especial" ni para nada — se descartan al
// tipear en vez de dejar que la persona se confunda por qué no pasa la regla
const filterPassword = (v) => v.replace(/\s/g, '')

// Tiene que reflejar exactamente el regex de auth.password en el backend
// (backend/src/schemas/fields/primitives.js); si allá cambian los requisitos de
// la contraseña y acá no, el checklist va a mentir
const PASSWORD_RULES = [
    { key: 'length',  label: 'Al menos 8 caracteres',          test: (p) => p.length >= 8 },
    { key: 'upper',   label: 'Al menos una letra mayúscula',   test: (p) => /[A-Z]/.test(p) },
    { key: 'lower',   label: 'Al menos una letra minúscula',   test: (p) => /[a-z]/.test(p) },
    { key: 'number',  label: 'Al menos un número',             test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'Al menos un carácter especial (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
]

const ROLE_LABELS = { admin: 'administrador', collaborator: 'colaborador' }

const RuleCheck = ({ passed, label }) => (
    <div className={cn('flex items-center gap-2 text-sm transition-colors duration-200', passed ? 'text-orve-green' : 'text-orve-teal/40')}>
        <CheckCircle2 className={cn('h-4 w-4 shrink-0 transition-colors duration-200', passed ? 'text-orve-green' : 'text-orve-teal/20')} />
        <span>{label}</span>
    </div>
)

// Fondo + logo compartidos entre el estado de error y el formulario
const AuthShell = ({ children }) => (
    <div className='min-h-screen w-full relative flex items-center justify-end p-4 md:p-12 lg:p-18 overflow-hidden'>
        <div
            className='absolute inset-0 z-0 bg-cover bg-left md:bg-center pointer-events-none select-none'
            style={{
                backgroundImage: `url(${bgImage})`,
                maskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                WebkitMaskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
            }}
        />
        <div className='absolute top-10 left-10 flex flex-col items-start gap-4 select-none'>
            <img src={orveLogo} alt='Logo ORVE' className='h-15 w-auto drop-shadow-md pointer-events-none' />
            <Badge variant='secondary' className='text-orve-teal bg-orve-teal/30 rounded-md px-5 py-5 text-md font-bold drop-shadow-md'>
                <span className='drop-shadow-xs'>PANEL DE ADMINISTRACIÓN</span>
            </Badge>
        </div>
        {children}
    </div>
)

// Una sola pantalla sirve para admin y colaborador — App.jsx la monta dos veces
// en rutas distintas pasándole el rol, en vez de duplicar este componente
const CompleteInvitation = ({ role }) => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const { login } = useAuth()

    const [password, setPassword]       = useState('')
    const [confirmPwd, setConfirmPwd]   = useState('')
    const [showPwd, setShowPwd]         = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading]     = useState(false)

    const ruleResults    = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }))
    const passwordsMatch = password.length > 0 && confirmPwd.length > 0 && password === confirmPwd
    const allRulesPass   = ruleResults.every((r) => r.passed) && passwordsMatch

    const inputBase = 'border-transparent h-12 rounded-xl text-orve-teal placeholder:text-orve-teal/75 placeholder:italic drop-shadow-md font-medium transition-colors'

    const handleSubmit = async () => {
        if (!allRulesPass || !token || isLoading) return
        setIsLoading(true)
        try {
            const service = role === 'admin' ? AdminService : collaboratorsService
            const data = await service.completeInvitation({ token, password, confirm_password: confirmPwd })
            const account = data.admin ?? data.collaborator
            login({ role, user: account })
            toast.success('Cuenta activada', 'Bienvenido a ORVE.')
            navigate('/dashboard', { replace: true })
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo completar el registro. El enlace pudo haber expirado.'
            toast.error('Error', msg)
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <AuthShell>
                <Card className='w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-2 md:px-6 md:py-10'>
                    <CardContent className='flex flex-col items-center text-center gap-4 py-8'>
                        <div className='w-14 h-14 rounded-full bg-orve-red/10 flex items-center justify-center'>
                            <AlertTriangle className='w-7 h-7 text-orve-red' />
                        </div>
                        <div>
                            <h2 className='text-xl font-semibold text-orve-teal'>Enlace inválido</h2>
                            <p className='text-sm text-orve-teal/60 mt-1'>
                                Este enlace de invitación no es válido o está incompleto. Solicite uno nuevo a un administrador.
                            </p>
                        </div>
                        <Link to='/' className='text-sm text-orve-teal font-medium hover:text-orve-darker-teal transition-colors flex items-center gap-1 mt-2'>
                            <ArrowLeft className='h-4 w-4' />
                            Volver al inicio de sesión
                        </Link>
                    </CardContent>
                </Card>
            </AuthShell>
        )
    }

    return (
        <AuthShell>
            <Card className='w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-2 md:px-6 md:py-10'>
                <CardHeader className='space-y-[0.5] text-left'>
                    <CardTitle className='text-2xl text-orve-teal font-semibold drop-shadow-md select-none'>
                        Complete su registro
                    </CardTitle>
                    <CardDescription className='font-[550] text-orve-teal/60 select-none'>
                        Fue invitado como {ROLE_LABELS[role]} de ORVE. Establezca una contraseña para activar su cuenta.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className='space-y-6'>
                        <div className='space-y-1'>
                            <Label htmlFor='password' className='text-orve-teal font-semibold text-sm pl-2 select-none'>
                                Contraseña
                            </Label>
                            <div className='relative bg-orve-teal/20 rounded-2xl'>
                                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                <Input
                                    id='password'
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder='Cree una contraseña'
                                    value={password}
                                    onChange={(e) => setPassword(filterPassword(e.target.value))}
                                    className={cn('pl-12 pr-12 bg-orve-teal/20', inputBase)}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPwd((p) => !p)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-orve-teal hover:text-orve-darker-teal transition-colors cursor-pointer z-10'
                                >
                                    {showPwd ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                                </button>
                            </div>
                        </div>

                        {password.length > 0 && (
                            <div className='bg-orve-teal/5 rounded-xl p-4 border border-orve-teal/10 space-y-2'>
                                {ruleResults.map((r) => (
                                    <RuleCheck key={r.key} passed={r.passed} label={r.label} />
                                ))}
                            </div>
                        )}

                        <div className='space-y-1'>
                            <Label htmlFor='confirmPwd' className='flex items-center gap-2 text-orve-teal font-semibold text-sm pl-2 select-none'>
                                Confirmar contraseña
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
                                    placeholder='Repita la contraseña'
                                    value={confirmPwd}
                                    onChange={(e) => setConfirmPwd(filterPassword(e.target.value))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    className={cn('pl-12 pr-12', inputBase, confirmPwd && !passwordsMatch ? 'bg-orve-red/20 border-orve-red' : 'bg-orve-teal/20')}
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
                            onClick={handleSubmit}
                            disabled={isLoading || !allRulesPass}
                            className='relative w-full h-14 bg-orve-teal hover:bg-orve-black text-white transition-colors rounded-xl text-md flex items-center px-6 drop-shadow-md duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
                        >
                            <span className='mx-auto select-none'>{isLoading ? 'Activando...' : 'Completar registro'}</span>
                            {isLoading ? <Spinner className='size-[5.5] absolute right-4' /> : <ShieldCheck className='size-[5.5] absolute right-4' />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AuthShell>
    )
}

export default CompleteInvitation