import Navbar from '@/components/Navbar'
import background from '@/assets/cool-ass-design-for-the-login.png'
import { House, MapPinned, ShieldCheck } from 'lucide-react'

const FEATURES = [
    { icon: House,       title: 'Propiedades verificadas', subtitle: 'Seguridad y confianza' },
    { icon: MapPinned,   title: 'Las mejores ubicaciones', subtitle: 'Encuentre su lugar ideal' },
    { icon: ShieldCheck, title: 'Proceso seguro',          subtitle: 'Su información, siempre protegida' },
]

/**
 * Layout compartido por Login y Register.
 * Imagen de la casa cubre el 100% del viewport; la tarjeta del formulario
 * flota sobre ella alineada a la derecha. El contenido izquierdo (titulo +
 * features) es texto superpuesto directamente sobre la foto.
 *
 * @param {React.ReactNode} children - formulario (LoginForm / pasos de Register)
 */
const AuthLayout = ({ children }) => (
    <div className='min-h-screen relative overflow-x-hidden'>

        {/* Imagen de fondo fija */}
        <div
            className='fixed inset-0 -z-10 bg-cover'
            style={{ backgroundImage: `url(${background})`, backgroundPosition: 'center 25%' }}
        />

        {/* Overlay global muy suave — la foto se ve nítida */}
        <div className='fixed inset-0 -z-10 bg-white/10' />

        {/* Gradient de opacidad en el lado izquierdo para que las letras se lean */}
        <div
            className='fixed inset-0 -z-10 pointer-events-none'
            style={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 38%, transparent 62%)',
            }}
        />

        {/* Formas blancas translúcidas detrás de la tarjeta */}
        <div
            className='fixed -z-10 pointer-events-none'
            style={{
                right: '-60px',
                top: '0',
                width: '600px',
                height: '100vh',
                background: 'radial-gradient(ellipse 70% 80% at 80% 45%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 50%, transparent 75%)',
                filter: 'blur(18px)',
            }}
        />

        <Navbar light />

        {/* Contenido principal */}
        <div className='min-h-screen flex items-center justify-between pt-[70px] px-14'>

            {/* Columna izquierda: texto superpuesto sobre la imagen */}
            <div className='flex flex-col gap-5 py-8' style={{ maxWidth: '380px' }}>

                <div className='flex flex-col' style={{ lineHeight: '1.18' }}>
                    <span className='text-[36px] font-bold text-gray-800'>Encuentra</span>
                    <span className='text-[36px] font-bold text-gray-800'>tu próximo</span>
                    <span
                        className='text-[38px] text-gray-800'
                        style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}
                    >
                        hogar
                    </span>
                </div>

                <p className='text-gray-700 text-sm leading-relaxed' style={{ maxWidth: '215px' }}>
                    Numerosas propiedades en venta y en alquiler. Quizá una de ellas sea su próximo hogar.
                </p>

                {/* Features sin card — solo icon circular + texto, igual que el Figma */}
                <div className='flex flex-col gap-3.5'>
                    {FEATURES.map(({ icon: Icon, title, subtitle }) => (
                        <div key={title} className='flex items-center gap-3.5'>
                            <div className='w-9 h-9 rounded-full bg-orve-teal/25 flex items-center justify-center shrink-0 border border-orve-teal/20'>
                                <Icon className='w-[15px] h-[15px] text-orve-darker-teal' />
                            </div>
                            <div>
                                <p className='text-orve-darker-teal text-[13px] font-semibold leading-snug'>{title}</p>
                                <p className='text-gray-600 text-[11.5px]'>{subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tarjeta flotante del formulario */}
            <div className='w-[600px] shrink-0 mr-5 -mt-6'>
                <div
                    className='bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/55 px-9 py-8 max-h-[calc(100vh-96px)] overflow-y-auto'
                    style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                    {children}
                </div>
            </div>
        </div>
    </div>
)

export default AuthLayout
