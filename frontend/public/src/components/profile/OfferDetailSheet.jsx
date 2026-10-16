import { useState, useEffect } from 'react'
import { History, ArrowRightLeft, XCircle, CheckCircle2, Clock } from 'lucide-react'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import offerService from '@/services/Offer'
import { getAllowedRange, getPriceError } from '@/lib/offerRange'
import toast from '@/lib/toast'

const STATUS_LABEL = {
    pending:   { label: 'Pendiente de respuesta', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    accepted:  { label: 'Aceptada',               className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:  { label: 'Rechazada',              className: 'bg-red-50 text-red-600 border-red-200' },
    withdrawn: { label: 'Retirada',               className: 'bg-gray-50 text-gray-500 border-gray-200' },
}

// 'countered' se usa tanto cuando ORVE contraoferta como cuando el cliente
// responde con otra contraoferta; lo que cambia es quien movio ultimo
const getStatus = (offer) => {
    if (offer?.status === 'countered') return offer.last_actor === 'seller'
        ? { label: 'Contraoferta recibida', className: 'bg-blue-50 text-blue-700 border-blue-200' }
        : { label: 'Contraoferta enviada',  className: 'bg-amber-50 text-amber-700 border-amber-200' }
    return STATUS_LABEL[offer?.status] ?? { label: offer?.status, className: 'bg-gray-100 text-gray-500 border-gray-200' }
}

const ACTOR_LABEL = { buyer: 'Usted', seller: 'ORVE' }

const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : value

const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const Notice = ({ icon, tone, children }) => {
    const Icon = icon
    const tones = {
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 [&_svg]:text-emerald-600',
        red:     'bg-red-50 border-red-200 text-red-600 [&_svg]:text-red-500',
        amber:   'bg-amber-50 border-amber-200 text-amber-700 [&_svg]:text-amber-600',
        blue:    'bg-blue-50 border-blue-200 text-blue-700 [&_svg]:text-blue-600',
    }
    return (
        <div className={`flex items-start gap-2 border rounded-xl px-3 py-2.5 ${tones[tone]}`}>
            <Icon className='w-4 h-4 shrink-0 mt-0.5' />
            <p className='text-sm font-medium'>{children}</p>
        </div>
    )
}

// Detalle de una oferta propia con su historial completo de negociacion.
// Cuando le toca responder al cliente (last_actor === 'seller', es decir ORVE
// ya contraoferto) puede contraofertar (solo ORVE acepta); mientras la
// oferta siga abierta puede retirarla. El backend valida lo mismo del otro
// lado (offer.js -> counter()/resolve()), incluido el rango de montos; esto
// solo evita mostrar una accion que igual el servidor rechazaria.
const OfferDetailSheet = ({ offerId, open, onOpenChange, onChanged }) => {
    const [offer, setOffer] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [price, setPrice] = useState('')
    const [priceError, setPriceError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [loadError, setLoadError] = useState(null)

    const loadOffer = () => offerService.getById(offerId)
        .then((data) => setOffer(data.offer ?? data))

    useEffect(() => {
        if (!open || !offerId) return
        setIsLoading(true)
        setLoadError(null)
        setPrice('')
        setPriceError(null)
        offerService.getById(offerId)
            .then((data) => setOffer(data.offer ?? data))
            .catch((err) => {
                setOffer(null)
                setLoadError(err.friendlyMessage ?? 'No se pudo cargar la oferta.')
            })
            .finally(() => setIsLoading(false))
    }, [open, offerId])

    const propertyPrice = offer?.property?.price
    const range = propertyPrice ? getAllowedRange(propertyPrice) : null
    const isOpenOffer = offer && ['pending', 'countered'].includes(offer.status)
    const isMyTurn = isOpenOffer && offer.last_actor === 'seller'
    const propertyAvailable = offer?.property?.status !== 'occupied'
    const canRespond = isMyTurn && propertyAvailable

    // si el servidor rechaza la accion porque la oferta cambio por otro lado
    // (ya resuelta, propiedad ocupada...), se recarga para que el estado y los
    // botones que se muestran coincidan con lo que realmente hay guardado
    const handleActionError = (err) => {
        toast.error(err.friendlyMessage)
        if (err.response?.status === 409) {
            loadOffer().catch(() => {})
            onChanged?.()
        }
    }

    const handleCounter = async () => {
        const error = getPriceError(price, propertyPrice)
        setPriceError(error)
        if (error) return
        setSubmitting(true)
        try {
            const data = await offerService.counter(offerId, Number(price))
            setOffer((prev) => ({ ...prev, ...(data.offer ?? data), property: prev.property }))
            setPrice('')
            toast.success('Contraoferta enviada.')
            onChanged?.()
        } catch (err) {
            handleActionError(err)
        } finally {
            setSubmitting(false)
        }
    }


    const handleWithdraw = async () => {
        setSubmitting(true)
        try {
            await offerService.resolve(offerId, 'withdrawn')
            toast.success('Oferta retirada y eliminada.')
            onChanged?.()
            onOpenChange(false)
        } catch (err) {
            handleActionError(err)
        } finally {
            setSubmitting(false)
        }
    }

    const status = getStatus(offer)

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
                    <p className='text-sm text-red-500'>{loadError ?? 'No se pudo cargar la oferta.'}</p>
                ) : (
                    <>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-xs text-gray-400'>
                                    {isOpenOffer
                                        ? (offer.last_actor === 'seller' ? 'Contraoferta de ORVE' : 'Su oferta actual')
                                        : 'Monto final'}
                                </p>
                                <p className='text-xl font-bold text-orve-darker-teal'>{formatCurrency(offer.price)}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${status.className}`}>
                                {status.label}
                            </span>
                        </div>

                        {offer.status === 'accepted' && (
                            <Notice icon={CheckCircle2} tone='emerald'>
                                Oferta aceptada. Nos comunicaremos contigo pronto.
                            </Notice>
                        )}
                        {offer.status === 'rejected' && (
                            <Notice icon={XCircle} tone='red'>
                                ORVE rechazó esta oferta. La negociación está cerrada.
                            </Notice>
                        )}
                        {isOpenOffer && !propertyAvailable && (
                            <Notice icon={XCircle} tone='red'>
                                La propiedad ya no está disponible, por lo que esta oferta no puede continuar.
                            </Notice>
                        )}
                        {isOpenOffer && propertyAvailable && offer.last_actor === 'buyer' && (
                            <Notice icon={Clock} tone='amber'>
                                {offer.status === 'pending'
                                    ? 'Su oferta está pendiente. Un agente de ORVE la revisará pronto.'
                                    : 'Su contraoferta fue enviada. Espere la respuesta de ORVE.'}
                            </Notice>
                        )}
                        {canRespond && (
                            <Notice icon={ArrowRightLeft} tone='blue'>
                                ORVE le propone {formatCurrency(offer.price)}. Puede contraofertar o retirar su oferta; solo ORVE puede aceptar ofertas.
                            </Notice>
                        )}

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


                        {canRespond && (
                            <div className='flex flex-col gap-2 pt-2 border-t border-orve-teal/10'>
                                <p className='text-xs font-semibold text-orve-teal flex items-center gap-1.5'>
                                    <ArrowRightLeft className='w-3.5 h-3.5' /> Hacer contraoferta
                                </p>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        type='number'
                                        min='0'
                                        value={price}
                                        onChange={(e) => { setPrice(e.target.value); setPriceError(null) }}
                                        placeholder='Nuevo monto'
                                        aria-invalid={!!priceError}
                                    />
                                    <Button onClick={handleCounter} disabled={submitting || !price} className='shrink-0'>
                                        {submitting ? 'Enviando...' : 'Enviar'}
                                    </Button>
                                </div>
                                {priceError
                                    ? <p className='text-[11px] text-red-500'>{priceError}</p>
                                    : range && (
                                        <p className='text-[11px] text-gray-400'>
                                            Monto mínimo: {formatCurrency(range.min)}
                                        </p>
                                    )}
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
