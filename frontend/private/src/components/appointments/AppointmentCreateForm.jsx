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
import LocationPicker from '@/components/properties/locationPicker'
import { cn } from '@/lib/utils'
import toast from '@/lib/toast'

const FUNDS_SOURCES = [
    { value: 'own',  label: 'Fondos propios' },
    { value: 'loan', label: 'Préstamo' },
    { value: 'mixed', label: 'Mixto' },
]

// El backend guarda los días en inglés; Date.getDay() -> 0 = domingo
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
}

const EMPTY_FORM = {
    buyer:            '',
    property:         '',
    proposedDate:     '',
    fundsSource:      'own',
    monthlyIncome:    '',
    reason:           '',
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

const formFromInitialData = (initialData) => initialData ? {
    buyer:            initialData.buyer?._id ?? '',
    property:         initialData.property?._id ?? '',
    proposedDate:     toDateInputValue(initialData.scheduled_date ?? initialData.proposed_dates?.[0]),
    fundsSource:      initialData.qualification?.funds_source ?? 'own',
    monthlyIncome:    initialData.qualification?.monthly_income?.toString() ?? '',
    reason:           initialData.qualification?.reason ?? '',
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
            } catch {
                toast.error('Error', 'No se pudieron cargar los clientes, propiedades u horarios.')
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

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    // Si cambia la fecha, el horario elegido antes ya no aplica necesariamente
    const handleDateChange = (value) => {
        setField('proposedDate', value)
        setSlot(null)
    }

    const validate = () => {
        const e = {}
        if (!form.buyer)                     e.buyer = 'Seleccione un cliente.'
        if (!form.property)                  e.property = 'Seleccione una propiedad.'
        if (!form.proposedDate)              e.proposedDate = 'Seleccione una fecha.'
        if (!slot)                           e.slot = 'Seleccione un horario disponible.'
        if (!location.address)               e.location = 'Marque y verifique la ubicación en el mapa.'
        if (!form.addressReference.trim())   e.addressReference = 'La referencia de dirección es requerida.'
        if (!form.monthlyIncome)             e.monthlyIncome = 'El ingreso mensual es requerido.'
        else if (Number(form.monthlyIncome) < 0) e.monthlyIncome = 'Debe ser un valor positivo.'
        if (!form.reason.trim())             e.reason = 'El motivo es requerido.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const submit = async () => {
        const ok = await onSubmit({ ...form, location, slot })
        if (ok && !isEditing) {
            setForm(EMPTY_FORM)
            setLocation({ coordinates: null, address: '', components: null })
            setSlot(null)
            setErrors({})
        }
    }

    const handleSaveClick = () => {
        if (!validate()) return
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
                        onChange={setLocation}
                    />
                    <FieldError>{errors.location}</FieldError>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Calificación financiera</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Fuente de fondos</FieldTitle>
                            <Select value={form.fundsSource} onValueChange={(v) => setField('fundsSource', v)}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {FUNDS_SOURCES.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Ingreso mensual (USD)</FieldTitle>
                            <Input
                                type='number'
                                min='0'
                                value={form.monthlyIncome}
                                onChange={(e) => setField('monthlyIncome', e.target.value)}
                                placeholder='0.00'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.monthlyIncome}</FieldError>
                    </Field>
                </div>

                <Field>
                    <FieldLabel>
                        <FieldTitle className='text-orve-teal/70'>Motivo</FieldTitle>
                        <Textarea
                            value={form.reason}
                            onChange={(e) => setField('reason', e.target.value)}
                            placeholder='Ej. Busca su primera casa propia.'
                            className='bg-white/70'
                        />
                    </FieldLabel>
                    <FieldError>{errors.reason}</FieldError>
                </Field>
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