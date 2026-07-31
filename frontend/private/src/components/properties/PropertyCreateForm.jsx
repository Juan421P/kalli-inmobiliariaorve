import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Field,
    FieldLabel,
    FieldTitle,
    FieldError,
    FieldGroup,
    FieldSet,
    FieldLegend,
} from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import LocationPicker from '@/components/properties/LocationPicker'

const PROPERTY_TYPES = [
    { value: 'house',     label: 'Casa'        },
    { value: 'apartment', label: 'Apartamento' },
    { value: 'land',      label: 'Terreno'     },
]

const LISTING_TYPES = [
    { value: 'sale', label: 'Venta'    },
    { value: 'rent', label: 'Alquiler' },
]

const STATUS_TYPES = [
    { value: 'available', label: 'Disponible' },
    { value: 'occupied',  label: 'Ocupado'    },
]

const AREA_UNITS = [
    { value: 'm2', label: 'm²' },
    { value: 'v2', label: 'v²' },
]

const EMPTY_FORM = {
    title:          '',
    description:    '',
    property_type:  'house',
    listing_type:   'sale',
    status:         'available',
    price:          '',
    bedrooms:       '',
    bathrooms:      '',
    parking_spaces: '',
    area_number:    '',
    area_unit:      'm2',
    allows_pets:    false,
    furnished:      false,
}

// ─── Upload de imágenes ───────────────────────────────────────────────────────
const ImageUploader = ({ images, onChange }) => {
    const inputRef   = useRef(null)
    const [dragging, setDragging] = useState(false)

    const addFiles = (files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
        const items = valid.map((f) => ({
            id:   `${Date.now()}-${Math.random()}`,
            file: f,
            url:  URL.createObjectURL(f),
        }))
        onChange([...images, ...items])
    }

    const remove = (id) => onChange(images.filter((i) => i.id !== id))

    return (
        <div className='flex flex-col gap-3'>
            <div
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all select-none ${
                    dragging
                        ? 'border-orve-teal bg-orve-teal/10'
                        : 'border-orve-teal/20 bg-orve-teal/[0.02] hover:border-orve-teal/40 hover:bg-orve-teal/5'
                }`}
            >
                <ImagePlus className='w-7 h-7 text-orve-teal/40' />
                <p className='text-sm font-medium text-orve-teal/70 text-center'>
                    {dragging ? 'Soltá para agregar' : 'Arrastrá o hacé clic para subir imágenes'}
                </p>
                <p className='text-xs text-orve-teal/40'>PNG, JPG, WEBP</p>
                <input
                    ref={inputRef}
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={(e) => addFiles(e.target.files)}
                />
            </div>

            {images.length > 0 && (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                    {images.map((img, idx) => (
                        <div key={img.id} className='relative group aspect-square rounded-lg overflow-hidden border border-orve-teal/10'>
                            {idx === 0 && (
                                <div className='absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-orve-teal text-white text-[9px] font-bold rounded'>
                                    Principal
                                </div>
                            )}
                            <img src={img.url} alt='' className='w-full h-full object-cover' />
                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                <button
                                    type='button'
                                    onClick={(e) => { e.stopPropagation(); remove(img.id) }}
                                    className='w-7 h-7 bg-red-500 hover:bg-red-600 rounded-md flex items-center justify-center text-white transition-colors'
                                >
                                    <X className='w-3.5 h-3.5' />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Campo numérico con controles +/- ─────────────────────────────────────────
const NumberStepper = ({ value, onChange, min = 0 }) => (
    <div className='flex items-center gap-2'>
        <button
            type='button'
            onClick={() => onChange(Math.max(min, parseInt(value || '0') - 1).toString())}
            className='w-8 h-8 rounded-lg border border-orve-teal/20 text-orve-teal hover:bg-orve-teal/10 transition-colors flex items-center justify-center text-lg leading-none shrink-0'
        >
            −
        </button>
        <Input
            type='number'
            min={min}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='0'
            className='bg-white/70 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
        />
        <button
            type='button'
            onClick={() => onChange((parseInt(value || '0') + 1).toString())}
            className='w-8 h-8 rounded-lg border border-orve-teal/20 text-orve-teal hover:bg-orve-teal/10 transition-colors flex items-center justify-center text-lg leading-none shrink-0'
        >
            +
        </button>
    </div>
)

// ─── Toggle de característica ─────────────────────────────────────────────────
const FeatureToggle = ({ checked, onCheckedChange, label, description }) => (
    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
        checked
            ? 'bg-orve-teal/8 border-orve-teal/30'
            : 'bg-white/50 border-orve-teal/10 hover:bg-orve-teal/5'
    }`}>
        <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            className='mt-0.5 border-orve-teal/40 data-[state=checked]:bg-orve-teal data-[state=checked]:border-orve-teal'
        />
        <div>
            <p className='text-sm font-medium text-orve-teal'>{label}</p>
            <p className='text-xs text-orve-teal/50 mt-0.5'>{description}</p>
        </div>
    </label>
)

// ─── Formulario ───────────────────────────────────────────────────────────────
const PropertyCreateForm = ({ onSubmit, isLoading }) => {
    const [form,     setForm]     = useState(EMPTY_FORM)
    const [images,   setImages]   = useState([])
    const [errors,   setErrors]   = useState({})
    const [location, setLocation] = useState({ coordinates: null, address: '' })

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const e = {}
        if (!form.title.trim())       e.title       = 'El título es requerido.'
        if (!form.description.trim()) e.description = 'La descripción es requerida.'
        if (!form.price)              e.price       = 'El precio es requerido.'
        else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
                                      e.price       = 'Ingrese un precio válido.'
        if (!location.address)        e.address     = 'Marque y verifique la ubicación en el mapa.'
        if (form.property_type !== 'land') {
            if (!form.area_number || parseFloat(form.area_number) <= 0) e.area_number = 'El área es requerida.'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit({
            title:          form.title.trim(),
            description:    form.description.trim(),
            property_type:  form.property_type,
            listing_type:   form.listing_type,
            status:         form.status,
            price:          parseFloat(form.price),
            address:        location.address,
            coordinates:    location.coordinates,
            bedrooms:       parseInt(form.bedrooms       || '0'),
            bathrooms:      parseInt(form.bathrooms      || '0'),
            parking_spaces: parseInt(form.parking_spaces || '0'),
            area:           { number: parseFloat(form.area_number || '0'), unit: form.area_unit },
            allows_pets:    form.allows_pets,
            furnished:      form.furnished,
            images:         images.map((i) => i.file),
        })
        setForm(EMPTY_FORM)
        setImages([])
        setErrors({})
        setLocation({ coordinates: null, address: '' })
    }

    const showRooms = form.property_type !== 'land'

    return (
        <div className='flex flex-col gap-6'>
            {/* ── Layout 2 columnas ── */}
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8'>

                {/* ── Columna izquierda: información + precios ── */}
                <FieldSet>
                    {/* Información general */}
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>Información general</FieldLegend>

                        <Field>
                            <FieldLabel>
                                <FieldTitle className='text-orve-teal/70'>Título de la propiedad</FieldTitle>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setField('title', e.target.value)}
                                    placeholder='Ej. Casa en Urbanización Las Flores'
                                    className='bg-white/70'
                                />
                            </FieldLabel>
                            <FieldError>{errors.title}</FieldError>
                        </Field>

                        <div className='grid grid-cols-3 gap-3'>
                            <Field>
                                <FieldLabel>
                                    <FieldTitle className='text-orve-teal/70'>Tipo</FieldTitle>
                                    <Select value={form.property_type} onValueChange={(v) => setField('property_type', v)}>
                                        <SelectTrigger className='w-full bg-white/70'><SelectValue /></SelectTrigger>
                                        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                            {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FieldLabel>
                            </Field>
                            <Field>
                                <FieldLabel>
                                    <FieldTitle className='text-orve-teal/70'>Listado</FieldTitle>
                                    <Select value={form.listing_type} onValueChange={(v) => setField('listing_type', v)}>
                                        <SelectTrigger className='w-full bg-white/70'><SelectValue /></SelectTrigger>
                                        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                            {LISTING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FieldLabel>
                            </Field>
                            <Field>
                                <FieldLabel>
                                    <FieldTitle className='text-orve-teal/70'>Estado</FieldTitle>
                                    <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                                        <SelectTrigger className='w-full bg-white/70'><SelectValue /></SelectTrigger>
                                        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                            {STATUS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FieldLabel>
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel>
                                <FieldTitle className='text-orve-teal/70'>Descripción</FieldTitle>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    placeholder='Describa las características principales de la propiedad...'
                                    className='bg-white/70 min-h-24 resize-none'
                                />
                            </FieldLabel>
                            <FieldError>{errors.description}</FieldError>
                        </Field>
                    </FieldGroup>

                    {/* Precio y dimensiones */}
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>Precio y dimensiones</FieldLegend>

                        <div className='grid grid-cols-2 gap-4'>
                            <Field>
                                <FieldLabel>
                                    <FieldTitle className='text-orve-teal/70'>
                                        Precio {form.listing_type === 'rent' ? '(mensual)' : ''}
                                    </FieldTitle>
                                    <div className='relative'>
                                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orve-teal/50 text-sm font-medium'>$</span>
                                        <Input
                                            type='number'
                                            min='0'
                                            value={form.price}
                                            onChange={(e) => setField('price', e.target.value)}
                                            placeholder='0.00'
                                            className='bg-white/70 pl-7 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
                                        />
                                    </div>
                                </FieldLabel>
                                <FieldError>{errors.price}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel>
                                    <FieldTitle className='text-orve-teal/70'>Área</FieldTitle>
                                    <div className='flex gap-2'>
                                        <Input
                                            type='number'
                                            min='0'
                                            value={form.area_number}
                                            onChange={(e) => setField('area_number', e.target.value)}
                                            placeholder='0'
                                            className='bg-white/70 flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
                                        />
                                        <Select value={form.area_unit} onValueChange={(v) => setField('area_unit', v)}>
                                            <SelectTrigger className='w-18 bg-white/70 shrink-0'><SelectValue /></SelectTrigger>
                                            <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                                {AREA_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FieldLabel>
                                <FieldError>{errors.area_number}</FieldError>
                            </Field>
                        </div>

                        {showRooms && (
                            <div className='grid grid-cols-3 gap-3'>
                                <Field>
                                    <FieldLabel>
                                        <FieldTitle className='text-orve-teal/70'>Habitaciones</FieldTitle>
                                        <NumberStepper value={form.bedrooms}       onChange={(v) => setField('bedrooms', v)}       />
                                    </FieldLabel>
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        <FieldTitle className='text-orve-teal/70'>Baños</FieldTitle>
                                        <NumberStepper value={form.bathrooms}      onChange={(v) => setField('bathrooms', v)}      />
                                    </FieldLabel>
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        <FieldTitle className='text-orve-teal/70'>Parqueos</FieldTitle>
                                        <NumberStepper value={form.parking_spaces} onChange={(v) => setField('parking_spaces', v)} />
                                    </FieldLabel>
                                </Field>
                            </div>
                        )}
                    </FieldGroup>

                    {/* Características adicionales */}
                    {showRooms && (
                        <FieldGroup>
                            <FieldLegend className='text-orve-teal'>Características adicionales</FieldLegend>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <FeatureToggle
                                    checked={form.allows_pets}
                                    onCheckedChange={(v) => setField('allows_pets', v)}
                                    label='Permite mascotas'
                                    description='La propiedad acepta animales domésticos'
                                />
                                <FeatureToggle
                                    checked={form.furnished}
                                    onCheckedChange={(v) => setField('furnished', v)}
                                    label='Amoblado'
                                    description='Incluye mobiliario en la propiedad'
                                />
                            </div>
                        </FieldGroup>
                    )}
                </FieldSet>

                {/* ── Columna derecha: ubicación + imágenes ── */}
                <FieldSet>
                    {/* Ubicación */}
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>
                            Ubicación
                            {errors.address && (
                                <span className='ml-2 text-xs font-normal text-red-500'>{errors.address}</span>
                            )}
                        </FieldLegend>
                        <LocationPicker
                            onChange={(loc) => {
                                setLocation(loc)
                                if (loc.address) setErrors((prev) => ({ ...prev, address: null }))
                            }}
                        />
                    </FieldGroup>

                    {/* Imágenes */}
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>Imágenes</FieldLegend>
                        <ImageUploader images={images} onChange={setImages} />
                    </FieldGroup>
                </FieldSet>
            </div>

            {/* ── Acciones ── */}
            <div className='flex justify-end pt-2'>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : 'Guardar propiedad'}
                </Button>
            </div>
        </div>
    )
}

export default PropertyCreateForm
