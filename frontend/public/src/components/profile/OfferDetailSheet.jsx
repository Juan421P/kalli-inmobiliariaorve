import { useState, useEffect } from 'react'
import { History, ArrowRightLeft, XCircle } from 'lucide-react'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import offerService from '@/services/Offer'
import toast from '@/lib/toast'

const STATUS_LABEL = {
    pending:   { label: 'Pendiente de respuesta', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    countered: { label: 'Contraoferta recibida',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
    accepted:  { label: 'Aceptada',               className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:  { label: 'Rechazada',              className: 'bg-red-50 text-red-600 border-red-200' },
    withdrawn: { label: 'Retirada',               className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

const ACTOR_LABEL = { buyer: 'Usted', seller: 'ORVE' }

const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : value

const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// Detalle de una oferta propia con su historial completo de negociacion.
// El cliente solo puede contraofertar cuando le toca a él responder
// (last_actor === 'seller', es decir ORVE ya contraofertó) o retirar la
// oferta mientras siga abierta — el backend valida lo mismo del otro lado
// (offer.js -> counter()/resolve()), esto solo evita mostrar una acción que
// igual el servidor rechazaría.
const OfferDetailSheet = ({ offerId, open, onOpenChange, onChanged }) => {
    const [offer, setOffer] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [price, setPrice] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open || !offerId) return
        setIsLoading(true)
        offerService.getById(offerId)
            .then((data) => setOffer(data.offer ?? data))
            .catch(() => setOffer(null))
            .finally(() => setIsLoading(false))
    }, [open, offerId])

    const isOpenOffer = offer && ['pending', 'countered'].includes(offer.status)
    const canCounter = isOpenOffer && offer.last_actor === 'seller'

    const handleCounter = async () => {
        const value = parseFloat(price)
        if (!value || value <= 0) return
        setSubmitting(true)
        try {
            const data = await offerService.counter(offerId, value)
            setOffer(data.offer ?? data)
            setPrice('')
            toast.success('Contraoferta enviada.')
            onChanged?.()
        } catch (err) {
            toast.error(err.friendlyMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleWithdraw = async () => {
        setSubmitting(true)
        try {
            const data = await offerService.resolve(offerId, 'withdrawn')
            setOffer(data.offer ?? data)
            toast.success('Oferta retirada.')
            onChanged?.()
        } catch (err) {
            toast.error(err.friendlyMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const status = STATUS_LABEL[offer?.status] ?? { label: offer?.status, className: 'bg-gray-100 text-gray-500 border-gray-200' }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='p-6 flex flex-col gap-5 overflow-y-auto'>
                <SheetHeader className='p-0'>
                    <SheetTitle>Detalle de mi oferta</SheetTitle>
                    <SheetDescription>{offer?.property?.title}</SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className='flex flex-col gap-2'>
                        {[1, 2, 3].map((i) => <div key={i} className='h-12 rounded-xl bg-orve-teal/5 animate-pulse' />)}
                    </div>
                ) : !offer ? (
                    <p className='text-sm text-gray-400'>No se pudo cargar la oferta.</p>
                ) : (
                    <>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs text-gray-400'>Oferta actual</p>
                                <p className='text-xl font-bold text-orve-darker-teal'>{formatCurrency(offer.price)}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${status.className}`}>
                                {status.label}
                            </span>
                        </div>

                        {offer.history?.length > 0 && (
                            <div className='flex flex-col gap-2'>
                                <p className='text-xs font-semibold text-orve-teal flex items-center gap-1.5'>
                                    <History className='w-3.5 h-3.5' /> Historial de negociación
                                </p>
                                {offer.history.map((h, i) => (
                                    <div key={i} className='flex items-center justify-between text-sm bg-orve-teal/5 rounded-lg px-3 py-2'>
                                        <span className='text-gray-500'>{ACTOR_LABEL[h.actor] ?? h.actor}</span>
                                        <span className='font-semibold text-orve-darker-teal'>{formatCurrency(h.price)}</span>
                                        <span className='text-[10px] text-gray-400'>{formatDate(h.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {canCounter && (
                            <div className='flex flex-col gap-2 pt-2 border-t border-orve-teal/10'>
                                <p className='text-xs font-semibold text-orve-teal flex items-center gap-1.5'>
                                    <ArrowRightLeft className='w-3.5 h-3.5' /> Hacer contraoferta
                                </p>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        type='number'
                                        min='0'
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder='Nuevo monto'
                                    />
                                    <Button onClick={handleCounter} disabled={submitting || !price} className='shrink-0'>
                                        {submitting ? 'Enviando...' : 'Enviar'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isOpenOffer && (
                            <button
                                onClick={handleWithdraw}
                                disabled={submitting}
                                className='self-start text-xs text-red-500 hover:underline flex items-center gap-1.5 disabled:opacity-50'
                            >
                                <XCircle className='w-3.5 h-3.5' /> Retirar mi oferta
                            </button>
                        )}
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default OfferDetailSheet
