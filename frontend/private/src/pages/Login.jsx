import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, EyeOff, Eye, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import bgImage from '@/assets/login-bg.jpg'
import orveLogo from '@/assets/orve-logo.svg'
import { cn } from '@/lib/utils'
import AdminService from '@/services/admin'
import CollaboratorService from '@/services/collaborator'
import { login as schema } from '@/schemas/admin'
import useAuth from '@/hooks/use-auth'
const filterInvalidEmailChars = (value) => { return value.replace(/[^a-zA-Z0-9@.\-_\+]/g, '') }
const filterInvalidPasswordChars = (value) => { return value.replace(/\s/g, '') }
const Login = () => {
    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true })
    }, [isAuthenticated, navigate])
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
    const emailRegister = register('email')
    const passwordRegister = register('password')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const attemptLogin = async (data) => {
        setIsLoading(true)
        const storage = rememberMe ? localStorage : sessionStorage
        try {
            const adminResponse = await AdminService.login(data.email, data.password)
            login({ role: 'admin', user: adminResponse.admin }, rememberMe)
            toast.success('Inicio de sesión exitoso')
            navigate('/dashboard')
        } catch (adminError) {
            try {
                const collaboratorResponse = await CollaboratorService.login(data.email, data.password)
                login({ role: 'collaborator', user: collaboratorResponse.collaborator }, rememberMe)
                toast.success('Inicio de sesión exitoso')
                navigate('/dashboard')
            } catch (collaboratorError) {
                toast.error(collaboratorError.response?.data?.message || adminError.response?.data?.message || 'Credenciales inválidas')
            }
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className='min-h-screen w-full relative flex items-end justify-end p-4 md:p-12 lg:p-18 overflow-hidden'>
            <div className='absolute inset-0 z-0 bg-cover bg-left md:bg-center pointer-events-none select-none' style={{ backgroundImage: `url(${bgImage})`, maskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)', WebkitMaskImage: 'radial-gradient(at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)' }} />
            <div className='absolute top-10 left-10 flex flex-col items-start gap-4 select-none'>
                <div className='flex items-center gap-2'>
                    <img src={orveLogo} alt='Logo ORVE' className='h-15 w-auto drop-shadow-md pointer-events-none' />
                </div>
                <Badge variant='secondary' className=' text-orve-teal bg-orve-teal/30 rounded-md px-5 py-5 text-md font-bold drop-shadow-md'>
                    <span className='drop-shadow-xs'>PANEL DE ADMINISTRACIÓN</span>
                </Badge>
            </div>
            <Card className='w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl p-2 md:px-6 md:py-10 border-none'>
                <CardHeader className='space-y-[0.5] text-left'>
                    <CardTitle className='text-2xl text-orve-teal font-semibold drop-shadow-md select-none'>Inicio de sesión</CardTitle>
                    <CardDescription className='font-[550] text-orve-teal/60 drop-shadow-m select-none'>Inicie sesión para acceder al panel de administración de Kalli, ORVE</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(attemptLogin)} noValidate className='space-y-6'>
                        <div className='space-y-1'>
                            <Label htmlFor='email' className='text-orve-teal font-semibold text-sm pl-2 select-none'>Correo electrónico</Label>
                            <div className='relative'>
                                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                <TooltipProvider>
                                    <Tooltip open={!!errors.email}>
                                        <TooltipTrigger asChild>
                                            <Input id='email' type='email' placeholder='Ingrese su correo electrónico' {...emailRegister} onChange={(e) => {
                                                e.target.value = filterInvalidEmailChars(e.target.value)
                                                emailRegister.onChange(e)
                                            }} className={cn('pl-12 bg-orve-teal/20 border-transparent h-12 rounded-xl text-orve-teal placeholder:text-orve-teal/75 placeholder:italic drop-shadow-md font-medium transition-colors', errors.email && 'border-orve-red')}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="bg-orve-red text-white font-semibold border-none shadow-md">
                                            <p>{errors.email?.message}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className='space-y-1'>
                            <Label htmlFor='password' className='text-orve-teal font-semibold text-sm pl-2 select-none'>Contraseña</Label>
                            <div className='relative'>
                                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orve-teal z-10 pointer-events-none' />
                                <TooltipProvider>
                                    <Tooltip open={!!errors.password}>
                                        <TooltipTrigger asChild>
                                            <Input
                                                id='password' type={showPassword ? 'text' : 'password'} placeholder='Ingrese su contraseña' {...passwordRegister} onChange={(e) => {
                                                    e.target.value = filterInvalidPasswordChars(e.target.value)
                                                    passwordRegister.onChange(e)
                                                }} className={cn('pl-12 pr-12 bg-orve-teal/20 border-transparent h-12 rounded-xl text-orve-teal placeholder:text-orve-teal/75 placeholder:italic drop-shadow-md font-medium transition-colors', errors.password && 'border-orve-red')}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="bg-orve-red text-white font-semibold border-none shadow-md">
                                            <p>{errors.password?.message}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className='absolute right-4 top-1/2 -translate-y-1/2 text-orve-teal hover:text-orve-darker-teal transition-colors cursor-pointer z-10'>
                                    {showPassword ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                                </button>
                            </div>
                        </div>
                        <div className='flex items-center justify-between pl-2'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='remember' checked={rememberMe} onCheckedChange={setRememberMe} className='bg-orve-teal/20 data-[state=checked]:bg-orve-teal' />
                                <Label htmlFor='remember' className='pl-2 text-sm text-orve-teal/40 font-medium cursor-pointer hover:text-orve-teal/80 transition-colors'>Recordarme</Label>
                            </div>
                            <Link to='/forgot-password' className='pl-2 text-sm text-orve-teal/40 font-medium cursor-pointer hover:text-orve-teal/80 transition-colors select-none'>¿Olvidó su contraseña?</Link>
                        </div>
                        <div className='w-full'>
                            <Button type="submit" disabled={isLoading} className='relative w-full h-14 bg-orve-teal hover:bg-orve-black text-white transition-colors rounded-xl text-md flex justify-between items-center px-6 drop-shadow-md duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'>
                                <span className='mx-auto select-none'>{isLoading ? 'Ingresando...' : 'Ingresar'}</span>
                                {isLoading ? <Spinner className='size-[5.5] absolute right-4' /> : <LogIn className='size-[5.5] absolute right-4' />}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
export default Login