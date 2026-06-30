import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CalendarIcon, ArrowRight, Tag } from 'lucide-react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import propertyService from '@/services/property'
import offerService from '@/services/offer'
import useAuth from '@/hooks/useAuth'
import toast from '@/lib/toast'
import coolBg from '@/assets/cool-ass-design-for-the-background.png'

// ─── Opciones de contacto (igual que en ScheduleAppointment) ──────────────────
const CONTACT_OPTIONS = [
    { value: 'whatsapp', label: 'WhatsApp',          icon: 'logos:whatsapp-icon',   sub: 'Recomendado' },
    { value: 'phone',    label: 'Teléfono',           icon: 'solar:phone-bold'                          },
    { value: 'email',    label: 'Correo electrónico', icon: 'solar:letter-bold'                         },
]

// ─── Opciones de meses de renta ───────────────────────────────────────────────
const RENTAL_OPTIONS = [
    { value: '6',   label: '6 meses'  },
    { value: '12',  label: '1 año'    },
    { value: '24',  label: '2 años'   },
    { value: '36+', label: '3+ años'  },
]

// ─── Mock fallback ────────────────────────────────────────────────────────────
const MOCK_PROPERTY = {
    _id: 'mock1',
    public_id: 'mock1',
    title: 'Apartamento en Colonia San Benito, San Salvador',
    listing_type: 'rent',
    price: 1200,
    pictures: [{ picture: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' }],
}

// ─── Página ───────────────────────────────────────────────────────────────────
const MakeOfferPage = () => {
    const { public_id } = useParams()
    const navigate      = useNavigate()
    const { user }      = useAuth()

    const [property,     setProperty]     = useState(null)
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Campos del formulario
    const [price,          setPrice]          = useState('')
    const [moveInDate,     setMoveInDate]     = useState('')
    const [rentalMonths,   setRentalMonths]   = useState(null)
    const [contactMethod,  setContactMethod]  = useState(null)

    useEffect(() => {
        propertyService.getByPublicId(public_id)
            .then((data) => setProperty(data.property ?? data))
            .catch(() => setProperty(MOCK_PROPERTY))
            .finally(() => setIsLoading(false))
    }, [public_id])

    const isRent = property?.listing_type === 'rent'

    const handleSubmit = async () => {
        if (!price || Number(price) <= 0) {
            toast.error('Ingresá un monto de oferta válido.')
            return
        }
        if (!contactMethod) {
            toast.error('Seleccioná cómo deseas que te contactemos.')
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                buyer:    user._id,
                property: property._id,
                price:    Number(price),
                ...(moveInDate   && { move_in_date:   moveInDate }),
                ...(rentalMonths && { rental_months:  rentalMonths }),
            }
            await offerService.create(payload)
            toast.success('¡Oferta enviada! Un agente se pondrá en contacto contigo.')
            navigate(`/property/${public_id}`)
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'No se pudo enviar la oferta. Intenta de nuevo.'
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const bgImage = property?.pictures?.[0]?.picture

    return (
        <div className='relative min-h-screen w-full isolate'>
            {/* Fondo decorativo */}
            <div
                className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45'
                style={{ backgroundImage: `url(${coolBg})` }}
            />
            <Navbar />

            <div className='max-w-5xl mx-auto px-4 py-8'>
                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='flex flex-col gap-4'>
                            <Skeleton className='h-6 w-40' />
                            <Skeleton className='h-10 w-3/4' />
                        </div>
                        <Skeleton className='h-[420px] rounded-2xl' />
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>

                        {/* ── Columna izquierda — imagen + título ── */}
                        <div className='flex flex-col gap-4'>
                            <Link
                                to={`/property/${public_id}`}
                                className='flex items-center gap-1.5 text-sm text-orve-teal/70 hover:text-orve-teal transition-colors w-fit'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Volver a la propiedad
                            </Link>

                            <h1 className='text-3xl font-bold text-orve-darker-teal leading-tight'>
                                {property?.title}
                            </h1>

                            {bgImage && (
                                <div className='h-56 rounded-2xl overflow-hidden mt-2'>
                                    <img src={bgImage} alt='Propiedad' className='w-full h-full object-cover' />
                                </div>
                            )}
                        </div>

                        {/* ── Columna derecha — formulario ── */}
                        <div className='bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-6 flex flex-col gap-6 shadow-sm'>

                            {/* Encabezado */}
                            <div className='flex items-start gap-3'>
                                <div className='w-9 h-9 rounded-xl bg-orve-teal/10 flex items-center justify-center shrink-0'>
                                    <Tag className='w-4 h-4 text-orve-teal' strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className='text-lg font-bold text-orve-darker-teal'>Hacer una oferta</h2>
                                    <p className='text-xs text-orve-teal/60 mt-0.5'>
                                        Anímate a dar el primer paso hacia la adquisición de su nuevo hogar
                                    </p>
                                </div>
                            </div>

                            <div className='h-px bg-orve-teal/10' />

                            {/* Monto de oferta */}
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                    Ingrese su oferta
                                </label>
                                <div className='flex items-center gap-2 bg-orve-teal/5 border border-orve-teal/15 rounded-xl px-4 py-3'>
                                    <span className='text-orve-teal/50 text-sm font-medium'>$</span>
                                    <input
                                        type='number'
                                        min='0'
                                        placeholder='0'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className='flex-1 bg-transparent text-orve-darker-teal text-sm font-medium outline-none placeholder:text-orve-teal/30'
                                    />
                                </div>
                                {property?.price && (
                                    <p className='text-[11px] text-orve-teal/50'>
                                        Sugerencia: En el rango de ${Math.round(property.price * 0.85).toLocaleString()} a ${property.price.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Fecha de mudanza */}
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                    Fecha de mudanza deseada
                                    <span className='normal-case font-normal text-orve-teal/40 ml-1'>(opcional)</span>
                                </label>
                                <div className='flex items-center gap-2 bg-orve-teal/5 border border-orve-teal/15 rounded-xl px-4 py-3'>
                                    <CalendarIcon className='w-4 h-4 text-orve-teal/40 shrink-0' strokeWidth={1.5} />
                                    <input
                                        type='date'
                                        value={moveInDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setMoveInDate(e.target.value)}
                                        className='flex-1 bg-transparent text-orve-darker-teal text-sm outline-none'
                                    />
                                </div>
                            </div>

                            {/* Duración de renta (solo si es alquiler) */}
                            {isRent && (
                                <div className='flex flex-col gap-1.5'>
                                    <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                        Duración del contrato
                                        <span className='normal-case font-normal text-orve-teal/40 ml-1'>(opcional)</span>
                                    </label>
                                    <div className='grid grid-cols-4 gap-2'>
                                        {RENTAL_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setRentalMonths(rentalMonths === opt.value ? null : opt.value)}
                                                className={cn(
                                                    'py-2 rounded-xl text-xs font-medium border transition-colors',
                                                    rentalMonths === opt.value
                                                        ? 'bg-orve-teal text-white border-orve-teal'
                                                        : 'bg-orve-teal/5 text-orve-teal border-orve-teal/15 hover:border-orve-teal/40'
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className='h-px bg-orve-teal/10' />

                            {/* Método de contacto */}
                            <div className='flex flex-col gap-2'>
                                <label className='text-xs font-medium text-orve-teal/80'>
                                    ¿Cómo desea que lo contactemos?
                                </label>
                                <div className='grid grid-cols-3 gap-2'>
                                    {CONTACT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setContactMethod(opt.value)}
                                            className={cn(
                                                'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-colors',
                                                contactMethod === opt.value
                                                    ? 'border-orve-teal bg-orve-teal/8 text-orve-darker-teal'
                                                    : 'border-orve-teal/15 bg-orve-teal/5 text-orve-teal/70 hover:border-orve-teal/40'
                                            )}
                                        >
                                            <Icon icon={opt.icon} width={22} />
                                            <span>{opt.label}</span>
                                            {opt.sub && (
                                                <span className='text-[10px] text-orve-teal/50 font-normal'>{opt.sub}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Botón submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className='w-full flex items-center justify-center gap-2 bg-orve-darker-teal hover:bg-orve-teal disabled:opacity-60 text-white font-medium text-sm py-3.5 rounded-xl transition-colors mt-1'
                            >
                                {isSubmitting ? 'Enviando...' : 'Hacer oferta'}
                                {!isSubmitting && <ArrowRight className='w-4 h-4' strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MakeOfferPage