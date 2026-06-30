import { Lock, ShieldCheck, BadgeCheck, X, UserPlus, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Modal que se muestra cuando un usuario no autenticado intenta hacer una oferta.
 * Muestra la imagen de fondo de la propiedad con un overlay difuminado,
 * y un card central igual al diseño de la imagen de referencia.
 *
 * Props:
 *  - propertyTitle  : string  — título de la propiedad (e.g. "Apartamento en Colonia San Benito")
 *  - coverImage     : string  — URL de la imagen principal de la propiedad
 *  - onClose        : () => void — cierra el modal
 *  - title          : string  — título del modal (opcional, default: oferta)
 *  - description    : string  — descripción del modal (opcional, default: oferta)
 */
const LoginToOfferModal = ({
    propertyTitle,
    coverImage,
    onClose,
    title = 'Inicie sesión para hacer una oferta',
    description = 'Para proteger su información y garantizar un proceso seguro, es necesario que inicie sesión',
}) => {
    const navigate = useNavigate()

    return (
        /* Backdrop */
        <div
            className='fixed inset-0 z-50 flex items-center justify-center'
            onClick={onClose}
        >
            {/* Fondo con la imagen de la propiedad + blur */}
            <div
                className='absolute inset-0 bg-cover bg-center'
                style={{ backgroundImage: coverImage ? `url(${coverImage})` : undefined }}
            >
                <div className='absolute inset-0 bg-white/60 backdrop-blur-sm' />
            </div>

            {/* Card central */}
            <div
                className='relative w-full max-w-md mx-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-orve-teal/40 hover:text-orve-teal transition-colors'
                    aria-label='Cerrar'
                >
                    <X className='w-5 h-5' />
                </button>

                <div className='flex flex-col items-center px-8 py-10 gap-5'>
                    {/* Icono candado */}
                    <div className='w-20 h-20 rounded-full bg-orve-teal/10 flex items-center justify-center'>
                        <Lock className='w-9 h-9 text-orve-teal' strokeWidth={1.5} />
                    </div>

                    {/* Textos */}
                    <div className='text-center'>
                        <h2 className='text-xl font-bold text-orve-darker-teal'>
                            {title}
                        </h2>
                        <p className='text-sm text-orve-teal/60 mt-1.5 leading-relaxed'>
                            {description}
                        </p>
                    </div>

                    {/* Beneficios */}
                    <div className='w-full grid grid-cols-2 gap-3'>
                        <div className='flex flex-col items-center gap-2 bg-orve-teal/5 rounded-xl p-3 text-center'>
                            <ShieldCheck className='w-6 h-6 text-orve-teal' strokeWidth={1.5} />
                            <div>
                                <p className='text-xs font-semibold text-orve-darker-teal'>Proceso seguro</p>
                                <p className='text-[11px] text-orve-teal/60 mt-0.5'>
                                    Su información, siempre protegida
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-2 bg-orve-teal/5 rounded-xl p-3 text-center'>
                            <BadgeCheck className='w-6 h-6 text-orve-teal' strokeWidth={1.5} />
                            <div>
                                <p className='text-xs font-semibold text-orve-darker-teal'>Ofertas serias</p>
                                <p className='text-[11px] text-orve-teal/60 mt-0.5'>
                                    Las ofertas son verificadas por nuestros agentes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className='w-full flex flex-col gap-3 mt-1'>
                        <button
                            onClick={() => navigate('/login')}
                            className='w-full flex items-center justify-center gap-2.5 bg-orve-teal hover:bg-orve-darker-teal text-white font-medium text-sm py-3 rounded-xl transition-colors'
                        >
                            <LogIn className='w-4 h-4' strokeWidth={1.5} />
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className='w-full flex items-center justify-center gap-2.5 bg-orve-darker-teal hover:bg-orve-teal text-white font-medium text-sm py-3 rounded-xl transition-colors'
                        >
                            <UserPlus className='w-4 h-4' strokeWidth={1.5} />
                            ¿No tiene una cuenta? Cree una
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginToOfferModal