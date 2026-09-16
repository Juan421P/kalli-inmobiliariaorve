import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Field,
    FieldLabel,
    FieldTitle,
    FieldError,
    FieldGroup,
    FieldSet,
    FieldLegend,
    FieldSeparator,
} from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { appointmentOptionsService } from '@/services/AppointmentsService'
import LocationPicker from '@/components/properties/LocationPicker'
import { cn } from '@/lib/utils'
import toast from '@/lib/toast'

// El backend guarda los días en inglés; Date.getDay() -> 0 = domingo
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
}

const EMPTY_FORM = {
    buyer:            '',
    property:         '',
    proposedDate:     '',
    addressReference: '',
    notes:            '',
}

const toDateInputValue = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().slice(0, 10)
}

// Parsea 'YYYY-MM-DD' como fecha local (evita el corrimiento de día que causa
// `new Date(str)` al interpretarla como medianoche UTC)
const parseLocalDate = (dateStr) => {
    if (!dateStr) return null
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

// Hoy a medianoche local, para comparar solo la fecha (sin la hora) contra la
// fecha propuesta y así permitir agendar "hoy" pero no un día que ya pasó
const startOfToday = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

// Un año hacia adelante como tope razonable para que no se cuele una fecha
// tipeada mal (ej. un año con dígito de más)
const MAX_MONTHS_AHEAD = 12

const formFromInitialData = (initialData) => initialData ? {
    buyer:            initialData.buyer?._id ?? '',
    property:         initialData.property?._id ?? '',
    proposedDate:     toDateInputValue(initialData.scheduled_date ?? initialData.proposed_dates?.[0]),
    addressReference: initialData.current_address?.reference ?? '',
    notes:            initialData.notes ?? '',
} : EMPTY_FORM

const initialLocation = (initialData) => ({
    coordinates: initialData?.current_address?.location?.coordinates ?? null,
    address:     initialData?.current_address?.address ?? '',
    components:  null,
})

const initialSlot = (initialData) => initialData?.time
    ? { start_time: initialData.time.start_time, end_time: initialData.time.end_time }
    : null

const AppointmentCreateForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const isEditing = Boolean(initialData)
    const [form,     setForm]     = useState(() => formFromInitialData(initialData))
    const [errors,   setErrors]   = useState({})
    const [touched,  setTouched]  = useState({})
    const [clients,    setClients]    = useState([])
    const [properties, setProperties] = useState([])
    const [schedules,  setSchedules]  = useState([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [location, setLocation] = useState(() => initialLocation(initialData))
    const [slot,     setSlot]     = useState(() => initialSlot(initialData))

    useEffect(() => {
        const loadOptions = async () => {
            setIsLoadingOptions(true)
            try {
                const [clientsData, propertiesData, schedulesData] = await Promise.all([
                    appointmentOptionsService.listClients(),
                    appointmentOptionsService.listProperties(),
                    appointmentOptionsService.listSchedules(),
                ])
                setClients(clientsData)
                setProperties(propertiesData)
                setSchedules(schedulesData)
            } catch (error) {
                toast.error('No se pudieron cargar los clientes, propiedades u horarios.', error.friendlyMessage)
            } finally {
                setIsLoadingOptions(false)
            }
        }
        loadOptions()
    }, [])

    const slotsForDate = useMemo(() => {
        if (!form.proposedDate) return []
        const day = DAY_MAP[parseLocalDate(form.proposedDate).getDay()]
        return schedules.find((s) => s.day === day)?.intervals ?? []
    }, [form.proposedDate, schedules])

    // Un validador por campo para poder revisar uno solo (al salir del campo,
    // "en vivo") o todos de una vez (justo antes de enviar al backend). Recibe
    // el form completo más location/slot porque algunos campos dependen de más
    // de un estado (ej. el horario depende de la fecha elegida).
    const fieldValidators = {
        buyer: (f) => !f.buyer ? 'Seleccione un cliente.' : null,
        property: (f) => !f.property ? 'Seleccione una propiedad.' : null,
        proposedDate: (f) => {
            if (!f.proposedDate) return 'Seleccione una fecha.'
            const parsed = parseLocalDate(f.proposedDate)
            if (!parsed || isNaN(parsed.getTime())) return 'La fecha ingresada no es válida.'
            if (parsed < startOfToday()) return 'La fecha no puede ser anterior a hoy.'
            const maxDate = new Date()
            maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_AHEAD)
            if (parsed > maxDate) return 'La fecha es demasiado lejana. Elija una fecha más cercana.'
            return null
        },
        slot: (_f, loc, s) => !s ? 'Seleccione un horario disponible.' : null,
        location: (_f, loc) => !loc.address ? 'Marque y verifique la ubicación en el mapa.' : null,
        addressReference: (f) => !f.addressReference.trim() ? 'La referencia de dirección es requerida.' : null,
    }

    // Valida un solo campo contra el estado actual y actualiza su error en el
    // momento — así el error sale apenas la persona sale del campo mal
    // llenado, no hasta que le da clic a "Guardar".
    const validateField = (key, formOverride = form, locOverride = location, slotOverride = slot) => {
        const message = fieldValidators[key]?.(formOverride, locOverride, slotOverride) ?? null
        setErrors((prev) => ({ ...prev, [key]: message }))
        return message
    }

    const touchField = (key) => {
        setTouched((prev) => ({ ...prev, [key]: true }))
        validateField(key)
    }

    // Corre TODOS los validadores contra el estado actual. Se usa antes de
    // mandar la petición al backend, sin importar si el campo ya fue "tocado"
    // o no, para no dejar pasar nada que no se haya revisado todavía.
    const validateAll = () => {
        const e = {}
        for (const key of Object.keys(fieldValidators)) {
            const message = fieldValidators[key](form, location, slot)
            if (message) e[key] = message
        }
        setErrors(e)
        setTouched(Object.fromEntries(Object.keys(fieldValidators).map((k) => [k, true])))
        return Object.keys(e).length === 0
    }

    const setField = (key, value) => {
        const nextForm = { ...form, [key]: value }
        setForm(nextForm)
        // Se valida contra el valor nuevo de una vez, sin esperar a que el campo
        // pierda el foco — así el error (o su corrección) se refleja apenas se
        // escribe, no hasta salir del campo o darle a "Guardar".
        setTouched((prev) => ({ ...prev, [key]: true }))
        validateField(key, nextForm)
    }

    // Si cambia la fecha, el horario elegido antes ya no aplica necesariamente
    const handleDateChange = (value) => {
        const nextForm = { ...form, proposedDate: value }
        setForm(nextForm)
        setSlot(null)
        setTouched((prev) => ({ ...prev, proposedDate: true }))
        validateField('proposedDate', nextForm)
        // el horario queda sin elegir de nuevo, así que se marca requerido otra vez
        setErrors((prev) => ({ ...prev, slot: touched.slot ? 'Seleccione un horario disponible.' : null }))
    }

    const handleLocationChange = (loc) => {
        setLocation(loc)
        setTouched((prev) => ({ ...prev, location: true }))
        validateField('location', form, loc)
    }

    const submit = async () => {
        const ok = await onSubmit({ ...form, location, slot })
        if (ok && !isEditing) {
            setForm(EMPTY_FORM)
            setLocation({ coordinates: null, address: '', components: null })
            setSlot(null)
            setErrors({})
            setTouched({})
        }
    }

    const handleSaveClick = () => {
        // Verificación final y completa de TODOS los campos justo antes de
        // hablar con el backend, sin importar cuáles se hayan tocado ya.
        if (!validateAll()) return
        if (isEditing) setDialogOpen(true)
        else submit()
    }

    const clientLabel = (id) => {
        const c = clients.find((client) => client._id === id)
        return c ? `${c.name} ${c.lastname}` : ''
    }

    return (
        <FieldSet>
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Cliente y propiedad</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Cliente</FieldTitle>
                            <Select value={form.buyer} onValueChange={(v) => setField('buyer', v)} disabled={isLoadingOptions}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccione un cliente'} />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {clients.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>{c.name} {c.lastname} — {c.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldError>{errors.buyer}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Propiedad</FieldTitle>
                            <Select value={form.property} onValueChange={(v) => setField('property', v)} disabled={isLoadingOptions}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccione una propiedad'} />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {properties.map((p) => (
                                        <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldError>{errors.property}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Fecha y horario</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Fecha propuesta</FieldTitle>
                            <Input
                                type='date'
                                value={form.proposedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.proposedDate}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Horario disponible</FieldTitle>
                        </FieldLabel>
                        {!form.proposedDate ? (
                            <p className='text-xs text-orve-teal/40 mt-1'>Seleccione una fecha primero.</p>
                        ) : slotsForDate.length === 0 ? (
                            <p className='text-xs text-orve-teal/40 mt-1'>No hay horarios disponibles para ese día.</p>
                        ) : (
                            <div className='flex flex-wrap gap-2 mt-1'>
                                {slotsForDate.map((iv) => (
                                    <button
                                        type='button'
                                        key={iv._id}
                                        onClick={() => { setSlot(iv); setErrors((prev) => ({ ...prev, slot: null })) }}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                                            slot?._id === iv._id
                                                ? 'bg-orve-teal text-white border-orve-teal'
                                                : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                        )}
                                    >
                                        {iv.start_time} – {iv.end_time}
                                    </button>
                                ))}
                            </div>
                        )}
                        <FieldError>{errors.slot}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Dirección actual del cliente</FieldLegend>

                <Field>
                    <FieldLabel>
                        <FieldTitle className='text-orve-teal/70'>Referencia</FieldTitle>
                        <Input
                            value={form.addressReference}
                            onChange={(e) => setField('addressReference', e.target.value)}
                            placeholder='Ej. Cerca de la gasolinera central'
                            className='bg-white/70'
                        />
                    </FieldLabel>
                    <FieldError>{errors.addressReference}</FieldError>
                </Field>

                <div className='mt-2'>
                    <LocationPicker
                        defaultCoordinates={location.coordinates}
                        defaultAddress={location.address}
                        onChange={handleLocationChange}
                    />
                    <FieldError>{errors.location}</FieldError>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Notas (opcional)</FieldLegend>
                <Field>
                    <FieldLabel>
                        <Textarea
                            value={form.notes}
                            onChange={(e) => setField('notes', e.target.value)}
                            placeholder='Notas internas sobre la cita'
                            className='bg-white/70'
                        />
                    </FieldLabel>
                </Field>
            </FieldGroup>

            <div className='flex justify-end gap-3 pt-2'>
                {isEditing && (
                    <Button
                        variant='outline'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar'}
                </Button>
            </div>

            {isEditing && (
                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent size='sm'>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se actualizará la cita de <strong>{clientLabel(form.buyer)}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={submit}
                                className='!bg-orve-teal hover:!bg-orve-darker-teal !text-white !border-transparent'
                            >
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </FieldSet>
    )
}

export default AppointmentCreateForm