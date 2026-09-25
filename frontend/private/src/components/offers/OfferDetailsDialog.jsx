import { useState } from 'react'
import { Eye, Home, History, Mail, Phone, ArrowRightLeft } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/users/UserAvatar'
import { cn } from '@/lib/utils'
import { getStatus, formatCurrency, formatDate } from './constants'

const InfoRow = ({ label, value }) => (
    <div className='flex flex-col gap-0.5'>
        <span className='text-xs text-orve-teal/50'>{label}</span>
        <span className='text-sm text-orve-darker-teal font-medium'>{value ?? '—'}</span>
    </div>
)

const SectionTitle = ({ icon: Icon, children }) => (
    <div className='flex items-center gap-2 text-orve-teal font-semibold text-sm'>
        <Icon className='w-4 h-4' />
        {children}
    </div>
)

const ACTOR_LABEL = { buyer: 'Cliente', seller: 'ORVE' }

// Detalle de una oferta: contacto del comprador, propiedad, historial completo
// de negociacion (offer.history, ya viene del backend) y — cuando la oferta
// sigue abierta y le toca responder al vendedor — el formulario para
// contraofertar. Mismo patron visual que AppointmentDetailsDialog.jsx.
const OfferDetailsDialog = ({ offer: o, onCounter }) => {
    const [open, setOpen] = useState(false)
    const [price, setPrice] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const status = getStatus(o.status)
    // el vendedor (ORVE) solo puede contraofertar si la oferta sigue abierta y
    // el ultimo movimiento fue del comprador — igual que valida el backend
    // (offer.js -> counter(): "debe esperar a que la otra parte responda")
    const canCounter = ['pending', 'countered'].includes(o.status) && o.last_actor !== 'seller'

    const handleCounter = async () => {
        const value = parseFloat(price)
        if (!value || value <= 0) return
        setSubmitting(true)
        const ok = await onCounter(o._id, value)
        setSubmitting(false)
        if (ok) { setPrice(''); setOpen(false) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon-sm'
                    title='Ver detalle'
                    className='text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10'
                >
                    <Eye className='w-3.5 h-3.5' />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle de la oferta</DialogTitle>
                    <DialogDescription>{o.property?.title}</DialogDescription>
                </DialogHeader>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <UserAvatar
                            name={o.buyer?.name}
                            lastname={o.buyer?.lastname}
                            avatarUrl={o.buyer?.picture}
                            className='w-11 h-11'
                        />
                        <div>
                            <p className='text-sm font-semibold text-orve-darker-teal'>
                                {o.buyer ? `${o.buyer.name} ${o.buyer.lastname}` : 'Cliente eliminado'}
                            </p>
                            {o.buyer?.email && (
                                <p className='text-xs text-orve-teal/60 flex items-center gap-1'><Mail className='w-3 h-3' /> {o.buyer.email}</p>
                            )}
                            {o.buyer?.phone?.number && (
                                <p className='text-xs text-orve-teal/60 flex items-center gap-1'><Phone className='w-3 h-3' /> {o.buyer.phone.country_code} {o.buyer.phone.number}</p>
                            )}
                        </div>
                    </div>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border shrink-0', status.className)}>
                        {status.label}
                    </span>
                </div>

                <Separator />

                <div className='flex flex-col gap-3'>
                    <SectionTitle icon={Home}>Propiedad y oferta</SectionTitle>
                    <div className='grid grid-cols-2 gap-4'>
                        <InfoRow label='Propiedad' value={o.property?.title} />
                        <InfoRow label='ID de propiedad' value={o.property?.public_id} />
                        <InfoRow label='Oferta actual' value={formatCurrency(o.price)} />
                        <InfoRow label='Fecha de mudanza' value={formatDate(o.move_in_date)} />
                    </div>
                </div>

                {o.history?.length > 0 && (
                    <>
                        <Separator />
                        <div className='flex flex-col gap-3'>
                            <SectionTitle icon={History}>Historial de negociación</SectionTitle>
                            <div className='flex flex-col gap-2'>
                                {o.history.map((h, i) => (
                                    <div key={i} className='flex items-center justify-between text-sm bg-orve-teal/[0.04] rounded-lg px-3 py-2'>
                                        <span className='text-orve-teal/70'>{ACTOR_LABEL[h.actor] ?? h.actor}</span>
                                        <span className='font-semibold text-orve-darker-teal'>{formatCurrency(h.price)}</span>
                                        <span className='text-xs text-orve-teal/40'>{formatDate(h.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {canCounter && (
                    <>
                        <Separator />
                        <div className='flex flex-col gap-2'>
                            <SectionTitle icon={ArrowRightLeft}>Hacer contraoferta</SectionTitle>
                            <div className='flex items-center gap-2'>
                                <div className='relative flex-1'>
                                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orve-teal/50 text-sm font-medium'>$</span>
                                    <Input
                                        type='number'
                                        min='0'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder='Nuevo monto'
                                        className='bg-white/70 pl-7 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
                                    />
                                </div>
                                <Button
                                    onClick={handleCounter}
                                    disabled={submitting || !price}
                                    className='bg-orve-teal hover:bg-orve-darker-teal text-white shrink-0'
                                >
                                    {submitting ? 'Enviando...' : 'Contraofertar'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default OfferDetailsDialog
