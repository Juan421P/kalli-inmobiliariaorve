import { useState, useMemo } from 'react'
import { Search, ChevronDown, MessageCircle, Phone, Mail, HelpCircle, Home, Calendar, FileText, User, DollarSign } from 'lucide-react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'

const CATEGORIES = [
    { key: 'all',       label: 'Todas',             icon: HelpCircle },
    { key: 'buy',       label: 'Comprar',            icon: Home },
    { key: 'rent',      label: 'Alquilar',           icon: Home },
    { key: 'schedule',  label: 'Citas',              icon: Calendar },
    { key: 'offer',     label: 'Ofertas',            icon: DollarSign },
    { key: 'account',   label: 'Mi cuenta',          icon: User },
    { key: 'docs',      label: 'Documentos',         icon: FileText },
]

const FAQS = [
    // Comprar
    {
        category: 'buy',
        question: '¿Cuáles son los pasos para comprar una propiedad?',
        answer: 'El proceso es: (1) Busca la propiedad en nuestra plataforma. (2) Agenda una cita para visitarla. (3) Haz una oferta si te interesa. (4) Un asesor te contactará para coordinar la negociación. (5) Se firma la promesa de venta y luego la escritura pública ante notario.',
    },
    {
        category: 'buy',
        question: '¿Puedo comprar una propiedad si necesito financiamiento?',
        answer: 'Sí. Al agendar una cita o hacer una oferta, puedes indicar que financiarás la compra con un préstamo bancario. Nuestros asesores pueden orientarte con los bancos con los que trabajamos y los requisitos habituales.',
    },
    {
        category: 'buy',
        question: '¿Cuánto cuesta el proceso de compra (honorarios, notaría)?',
        answer: 'Los honorarios notariales en El Salvador varían entre el 1 % y el 2 % del valor de la propiedad. Adicionalmente hay impuestos de transferencia (IVA 13 % sobre las ganancias del vendedor y derechos de registro). Te asesoramos en detalle durante el proceso.',
    },
    // Alquilar
    {
        category: 'rent',
        question: '¿Qué documentos necesito para alquilar una propiedad?',
        answer: 'Generalmente se requiere: DUI o pasaporte vigente, constancia de ingresos (colilla del ISSS o carta de trabajo), referencias personales o laborales, y en algunos casos un fiador. Los requisitos exactos los define el propietario.',
    },
    {
        category: 'rent',
        question: '¿El depósito de garantía es reembolsable?',
        answer: 'Sí, siempre que la propiedad se entregue en las mismas condiciones en que se recibió. El monto del depósito y las condiciones de devolución quedan establecidos en el contrato de arrendamiento.',
    },
    {
        category: 'rent',
        question: '¿Puedo negociar el canon mensual de alquiler?',
        answer: 'En muchos casos sí. Al hacer tu oferta puedes proponer un monto diferente al publicado. El propietario decidirá si acepta, rechaza o contraoferta. Un asesor te ayudará a mediar la negociación.',
    },
    // Citas
    {
        category: 'schedule',
        question: '¿Cómo agendo una visita a una propiedad?',
        answer: 'Ingresa a la propiedad que te interesa, haz clic en "Agendar cita", elige una fecha y hora disponible, completa los datos solicitados y envía la solicitud. Recibirás confirmación por el método de contacto que elegiste.',
    },
    {
        category: 'schedule',
        question: '¿Puedo reagendar o cancelar una cita?',
        answer: 'Sí. Desde la sección "Actividad" de tu perfil puedes ver tus citas próximas y usar los botones "Reagendar" o "Cancelar cita". Te recomendamos avisar con al menos 24 horas de anticipación.',
    },
    {
        category: 'schedule',
        question: '¿Cuánto dura una visita a una propiedad?',
        answer: 'Las visitas tienen una duración aproximada de 30 a 45 minutos, dependiendo del tamaño de la propiedad y las consultas que tengas. Un asesor de ORVE te acompañará durante toda la visita.',
    },
    // Ofertas
    {
        category: 'offer',
        question: '¿Cómo funciona el proceso de oferta?',
        answer: 'Desde la página de la propiedad haz clic en "Hacer una oferta", ingresa el monto que propones y completa el formulario. Un asesor revisará tu oferta y la presentará al propietario, quien podrá aceptarla, rechazarla o hacer una contraoferta.',
    },
    {
        category: 'offer',
        question: '¿Mi oferta tiene algún costo o compromiso inmediato?',
        answer: 'No. Enviar una oferta no implica ningún pago inmediato ni compromiso legal. Solo representa tu intención de compra. El compromiso formal ocurre al firmar la promesa de venta.',
    },
    {
        category: 'offer',
        question: '¿Cuánto tiempo tarda el propietario en responder una oferta?',
        answer: 'El plazo varía, pero nuestro equipo hace seguimiento activo para obtener una respuesta en un máximo de 48–72 horas hábiles desde que se presenta la oferta.',
    },
    // Mi cuenta
    {
        category: 'account',
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Ve a tu perfil → pestaña "Seguridad" → sección "Cambiar contraseña". Recibirás un código de verificación en tu correo electrónico. Ingrésalo junto con tu nueva contraseña para confirmar el cambio.',
    },
    {
        category: 'account',
        question: '¿Cómo actualizo mi foto de perfil?',
        answer: 'En la página de perfil, haz clic en "Editar foto" debajo de tu avatar. Selecciona una imagen desde tu dispositivo y se actualizará automáticamente.',
    },
    {
        category: 'account',
        question: '¿Puedo eliminar mi cuenta?',
        answer: 'Sí. En la pestaña "Seguridad" de tu perfil encontrarás la opción "Eliminar cuenta". Esta acción es permanente e irreversible. Si tienes citas o procesos activos, te recomendamos contactarnos antes.',
    },
    // Documentos
    {
        category: 'docs',
        question: '¿Qué documentos se necesitan para la escritura de compraventa?',
        answer: 'Generalmente: DUI o pasaporte del comprador y vendedor, solvencia de impuestos municipales de la propiedad, planos actualizados, y el contrato de promesa de venta si existe. El notario te indicará la lista exacta.',
    },
    {
        category: 'docs',
        question: '¿ORVE me ayuda con el trámite de escritura?',
        answer: 'Sí. Trabajamos con notarios de confianza que pueden acompañarte durante todo el proceso legal. Podemos coordinar la gestión documental para que la experiencia sea lo más sencilla posible.',
    },
]

const CONTACT = [
    {
        icon: 'logos:whatsapp-icon',
        label: 'WhatsApp',
        value: '+503 2270-2561',
        desc: 'Lunes a Sábado · 8:00–18:00',
        action: 'https://wa.me/50322702561',
        color: 'bg-green-50 border-green-100 text-green-700',
    },
    {
        icon: 'solar:phone-bold',
        label: 'Teléfono',
        value: '+503 2270-2561',
        desc: 'Lunes a Viernes · 8:00–17:00',
        action: 'tel:+50322702561',
        color: 'bg-orve-teal/8 border-orve-teal/15 text-orve-darker-teal',
    },
    {
        icon: 'solar:letter-bold',
        label: 'Correo',
        value: 'hola@orve.com.sv',
        desc: 'Respondemos en menos de 24 h',
        action: 'mailto:hola@orve.com.sv',
        color: 'bg-blue-50 border-blue-100 text-blue-700',
    },
]

/* ─── Página ───────────────────────────────────────────────────────── */

const Help = () => {
    const [search,   setSearch]   = useState('')
    const [category, setCategory] = useState('all')

    const filtered = useMemo(() => {
        let list = FAQS
        if (category !== 'all') list = list.filter(f => f.category === category)
        const q = search.toLowerCase().trim()
        if (q) list = list.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
        return list
    }, [search, category])

    return (
        <div
            className='min-h-screen relative overflow-x-hidden'
            style={{ background: 'linear-gradient(135deg, #deeef0 0%, #eaf4f5 40%, #f2f8f9 100%)' }}
        >
            {/* Círculos decorativos */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none' preserveAspectRatio='none' style={{ opacity: 0.15 }} aria-hidden>
                <circle cx='75%' cy='12%' r='300' fill='none' stroke='#507177' strokeWidth='55' />
                <circle cx='82%' cy='18%' r='460' fill='none' stroke='#507177' strokeWidth='38' />
                <circle cx='10%' cy='88%' r='240' fill='none' stroke='#507177' strokeWidth='42' />
            </svg>

            <Navbar />

            <div className='relative max-w-3xl mx-auto px-6 pt-28 pb-20'>

                {/* Hero */}
                <div className='text-center mb-10'>
                    <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orve-teal/10 mb-4'>
                        <HelpCircle className='w-7 h-7 text-orve-teal' strokeWidth={1.5} />
                    </div>
                    <h1 className='text-3xl font-bold text-orve-darker-teal mb-2'>Centro de ayuda</h1>
                    <p className='text-sm text-orve-teal/60'>¿En qué podemos ayudarte hoy?</p>
                </div>

                {/* Buscador */}
                <div className='flex items-center gap-3 bg-white/85 border border-orve-teal/15 rounded-2xl px-4 py-3 mb-6 shadow-sm'>
                    <Search className='w-4 h-4 text-orve-teal/40 shrink-0' />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='Buscar en preguntas frecuentes...'
                        className='flex-1 bg-transparent text-sm outline-none text-orve-darker-teal placeholder:text-orve-teal/35'
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className='text-orve-teal/30 hover:text-orve-teal/60 text-xs'>✕</button>
                    )}
                </div>

                {/* Categorías */}
                <div className='flex flex-wrap gap-2 mb-8'>
                    {CATEGORIES.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setCategory(key)}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                                category === key
                                    ? 'bg-orve-darker-teal text-white border-orve-darker-teal'
                                    : 'bg-white/70 text-orve-teal/70 border-orve-teal/20 hover:border-orve-teal/50 hover:bg-white'
                            )}
                        >
                            <Icon className='w-3.5 h-3.5' />
                            {label}
                        </button>
                    ))}
                </div>

                {/* FAQs */}
                {filtered.length === 0 ? (
                    <div className='flex flex-col items-center py-16 gap-2 text-center'>
                        <HelpCircle className='w-10 h-10 text-orve-teal/20' strokeWidth={1} />
                        <p className='text-sm text-orve-teal/50 font-medium'>Sin resultados</p>
                        <p className='text-xs text-gray-400'>Prueba con otras palabras o categoría.</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-2 mb-12'>
                        {filtered.map((faq, i) => (
                            <FaqItem key={i} faq={faq} />
                        ))}
                    </div>
                )}

                {/* Contacto */}
                <div className='border-t border-orve-teal/10 pt-10'>
                    <div className='text-center mb-6'>
                        <p className='text-base font-bold text-orve-darker-teal'>¿No encontraste lo que buscabas?</p>
                        <p className='text-xs text-orve-teal/50 mt-1'>Nuestro equipo está disponible para ayudarte directamente.</p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                        {CONTACT.map(({ icon, label, value, desc, action, color }) => (
                            <a
                                key={label}
                                href={action}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={cn(
                                    'flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5',
                                    color
                                )}
                            >
                                <Icon icon={icon} className='w-7 h-7' />
                                <div>
                                    <p className='text-sm font-semibold'>{label}</p>
                                    <p className='text-xs font-medium mt-0.5'>{value}</p>
                                    <p className='text-[10px] opacity-60 mt-0.5'>{desc}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── FaqItem ──────────────────────────────────────────────────────── */

const FaqItem = ({ faq }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className={cn(
            'rounded-2xl border overflow-hidden transition-colors',
            open ? 'bg-white/90 border-orve-teal/20' : 'bg-white/60 border-orve-teal/10 hover:border-orve-teal/20'
        )}>
            <button
                onClick={() => setOpen(v => !v)}
                className='w-full flex items-center justify-between px-5 py-4 text-left gap-4'
            >
                <span className='text-sm font-medium text-orve-darker-teal leading-snug'>{faq.question}</span>
                <ChevronDown className={cn('w-4 h-4 text-orve-teal/40 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && (
                <div className='px-5 pb-5 pt-0'>
                    <div className='h-px bg-orve-teal/8 mb-3' />
                    <p className='text-sm text-gray-600 leading-relaxed'>{faq.answer}</p>
                </div>
            )}
        </div>
    )
}

export default Help
