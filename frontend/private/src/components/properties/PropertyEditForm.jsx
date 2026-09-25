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
import LocationPicker from '@/components/properties/LocationPicker'
import CatalogMultiSelect from '@/components/properties/CatalogMultiSelect'

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

// Tienen que calzar con text()/longText() en el backend
// (backend/src/schemas/fields/primitives.js) — si allá cambian el máximo o el
// regex y acá no, el formulario deja pasar cosas que el backend va a rechazar.
const TITLE_MAX = 255
const TITLE_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s.,()#'":-]+$/
const DESCRIPTION_MAX = 1000
const DESCRIPTION_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?()#'"¿¡%/-]+$/

const NumberStepper = ({ value, onChange, min = 0 }) => (
    <div className='flex items-center gap-2'>
        <button
            type='button'
            onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, parseInt(value || '0') - 1).toString()) }}
            className='w-8 h-8 rounded-lg border border-orve-teal/20 text-orve-teal hover:bg-orve-teal/10 transition-colors flex items-center justify-center text-lg leading-none shrink-0'
        >
            −
        </button>
        <Input
            type='number'
            min={min}
            value={value}
            onChange={(e) => {
                const raw = e.target.value
                if (raw === '') { onChange(''); return }
                const parsed = parseInt(raw, 10)
                onChange(isNaN(parsed) ? '' : Math.max(min, parsed).toString())
            }}
            className='w-12 bg-white/70 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
        />
        <button
            type='button'
            onClick={(e) => { e.stopPropagation(); onChange((parseInt(value || '0') + 1).toString()) }}
            className='w-8 h-8 rounded-lg border border-orve-teal/20 text-orve-teal hover:bg-orve-teal/10 transition-colors flex items-center justify-center text-lg leading-none shrink-0'
        >
            +
        </button>
    </div>
)

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

// Fotos que ya existen en la propiedad — clic para marcar/desmarcar como
// "para quitar". No se borran de Cloudinary hasta que se confirme el guardado
const ExistingPictures = ({ pictures, removedIds, onToggleRemove }) => (
    <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
        {pictures.map((pic) => {
            const isRemoved = removedIds.includes(pic.picture_id)
            return (
                <button
                    type='button'
                    key={pic.picture_id}
                    onClick={() => onToggleRemove(pic.picture_id)}
                    className='relative aspect-square rounded-lg overflow-hidden border border-orve-teal/15 group'
                >
                    <img
                        src={pic.picture}
                        alt=''
                        className={`w-full h-full object-cover transition-opacity ${isRemoved ? 'opacity-25' : ''}`}
                    />
                    <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                        isRemoved ? 'bg-red-500/10' : 'bg-black/0 group-hover:bg-black/40'
                    }`}>
                        {isRemoved
                            ? <span className='text-[10px] font-semibold text-white bg-red-500 px-2 py-1 rounded-md'>Deshacer</span>
                            : <X className='w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                        }
                    </div>
                </button>
            )
        })}
    </div>
)

// Fotos nuevas por subir — mismo patrón visual que ExistingPictures pero con
// preview local (URL.createObjectURL) en vez de la URL de Cloudinary
const NewImageUploader = ({ images, onChange }) => {
    const inputRef = useRef(null)

    const addFiles = (files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
        const items = valid.map((f) => ({ id: `${Date.now()}-${Math.random()}`, file: f, url: URL.createObjectURL(f) }))
        onChange([...images, ...items])
    }

    const remove = (id) => onChange(images.filter((i) => i.id !== id))

    return (
        <div className='flex flex-col gap-3'>
            <div
                onClick={() => inputRef.current?.click()}
                className='border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-1.5 cursor-pointer select-none transition-all border-orve-teal/20 bg-orve-teal/[0.02] hover:border-orve-teal/40 hover:bg-orve-teal/5'
            >
                <ImagePlus className='w-5 h-5 text-orve-teal/40' />
                <p className='text-xs font-medium text-orve-teal/60'>Agregar fotos nuevas</p>
                <input
                    ref={inputRef}
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
                />
            </div>
            {images.length > 0 && (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                    {images.map((img) => (
                        <div key={img.id} className='relative aspect-square rounded-lg overflow-hidden border border-orve-teal/15'>
                            <img src={img.url} alt='' className='w-full h-full object-cover' />
                            <button
                                type='button'
                                onClick={() => remove(img.id)}
                                className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors'
                            >
                                <X className='w-3 h-3' />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Los catalogos vienen poblados como objetos completos ({_id, name}) desde el
// backend (.populate) — acá solo hace falta el id para el multiselect.
const toIds = (list) => (list ?? []).map((item) => item?._id ?? item).filter(Boolean)

const PropertyEditForm = ({ initialData, onSubmit, onCancel, isLoading, catalogs }) => {
    const initCoords = initialData?.location?.coordinates ?? null
    // El campo address puede venir en un formato legado (objeto con reference/district)
    // en vez del string plano que espera el formulario actual.
    const initAddress = typeof initialData?.address === 'string'
        ? initialData.address
        : (initialData?.address?.reference ?? initialData?.address?.district ?? '')

    const [form, setForm] = useState({
        title:          initialData?.title                      ?? '',
        description:    initialData?.description                ?? '',
        property_type:  initialData?.property_type              ?? 'house',
        listing_type:   initialData?.listing_type               ?? 'sale',
        status:         initialData?.status                     ?? 'available',
        price:          initialData?.price?.toString()          ?? '',
        bedrooms:       initialData?.bedrooms?.toString()       ?? '0',
        bathrooms:      initialData?.bathrooms?.toString()      ?? '0',
        parking_spaces: initialData?.parking_spaces?.toString() ?? '0',
        area_number:    initialData?.area?.number?.toString()   ?? '',
        area_unit:      initialData?.area?.unit                 ?? 'm2',
        allows_pets:    initialData?.allows_pets                ?? false,
        furnished:      initialData?.furnished                  ?? false,
        amenities:      toIds(initialData?.amenities),
        appliances:     toIds(initialData?.appliances),
        features:       toIds(initialData?.features),
        tags:           toIds(initialData?.tags),
    })
    const [location,   setLocation]   = useState({ coordinates: initCoords, address: initAddress })
    const [errors,     setErrors]     = useState({})
    const [dialogOpen, setDialogOpen] = useState(false)

    const existingPictures = initialData?.pictures ?? []
    const [removedIds, setRemovedIds] = useState([])
    const [newImages,  setNewImages]  = useState([])
    const remainingCount = (ids = removedIds, imgs = newImages) =>
        existingPictures.filter((p) => !ids.includes(p.picture_id)).length + imgs.length

    // Un validador por campo para poder revisar uno solo apenas cambia (feedback
    // inmediato) o todos de un golpe justo antes de mandar la petición.
    const fieldValidators = {
        title: (f) => {
            if (!f.title.trim()) return 'El título es requerido.'
            if (f.title.trim().length > TITLE_MAX) return `No puede superar los ${TITLE_MAX} caracteres.`
            if (!TITLE_REGEX.test(f.title.trim())) return 'Contiene caracteres no permitidos.'
            return null
        },
        description: (f) => {
            if (!f.description.trim()) return 'La descripción es requerida.'
            if (f.description.trim().length > DESCRIPTION_MAX) return `No puede superar los ${DESCRIPTION_MAX} caracteres.`
            if (!DESCRIPTION_REGEX.test(f.description.trim())) return 'Contiene caracteres no permitidos.'
            return null
        },
        price: (f) => {
            if (!f.price) return 'El precio es requerido.'
            if (isNaN(parseFloat(f.price)) || parseFloat(f.price) <= 0) return 'Ingrese un precio válido, mayor a 0.'
            return null
        },
        area_number: (f) => (!f.area_number || parseFloat(f.area_number) <= 0) ? 'El área es requerida y debe ser mayor a 0.' : null,
        bedrooms: (f) => (f.bedrooms && parseInt(f.bedrooms) < 0) ? 'No puede ser negativo.' : null,
        bathrooms: (f) => (f.bathrooms && parseInt(f.bathrooms) < 0) ? 'No puede ser negativo.' : null,
        parking_spaces: (f) => (f.parking_spaces && parseInt(f.parking_spaces) < 0) ? 'No puede ser negativo.' : null,
        address: (_f, loc) => !loc.address ? 'Marque y verifique la ubicación en el mapa.' : null,
        images: (_f, _loc, count) => count < 3 ? 'Debe quedar al menos 3 imágenes.' : null,
    }

    // Revisa un solo campo contra el valor más reciente (puede no estar en el
    // state todavía) y actualiza su error al instante.
    const validateField = (key, formOverride = form, locOverride = location, countOverride = remainingCount()) => {
        const message = fieldValidators[key]?.(formOverride, locOverride, countOverride) ?? null
        setErrors((prev) => ({ ...prev, [key]: message }))
        return message
    }

    const toggleRemove = (pictureId) => {
        const nextIds = removedIds.includes(pictureId)
            ? removedIds.filter((id) => id !== pictureId)
            : [...removedIds, pictureId]
        setRemovedIds(nextIds)
        validateField('images', form, location, remainingCount(nextIds, newImages))
    }

    const setField = (key, value) => {
        const nextForm = { ...form, [key]: value }
        setForm(nextForm)
        if (fieldValidators[key]) validateField(key, nextForm)
    }

    // Revisa TODOS los campos contra el estado actual, sin importar si ya se
    // habían tocado o no. Nada se manda al backend sin pasar por acá primero.
    const validateAll = () => {
        const e = {}
        for (const key of Object.keys(fieldValidators)) {
            const message = fieldValidators[key](form, location, remainingCount())
            if (message) e[key] = message
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSaveClick = () => {
        if (!validateAll()) return
        setDialogOpen(true)
    }

    const handleConfirm = () => {
        onSubmit({
            title:          form.title.trim(),
            description:    form.description.trim(),
            property_type:  form.property_type,
            listing_type:   form.listing_type,
            status:         form.status,
            price:          parseFloat(form.price),
            address:        location.address,
            // Si nadie tocó el mapa no hay coordenadas nuevas que mandar — se omite
            // la llave por completo en vez de mandar null, así el backend deja la
            // ubicación original intacta en lugar de borrarla
            ...(location.coordinates && {
                location: { type: 'Point', coordinates: location.coordinates },
            }),
            bedrooms:       parseInt(form.bedrooms       || '0'),
            bathrooms:      parseInt(form.bathrooms      || '0'),
            parking_spaces: parseInt(form.parking_spaces || '0'),
            area:           { number: parseFloat(form.area_number || '0'), unit: form.area_unit },
            allows_pets:    form.allows_pets,
            furnished:      form.furnished,
            amenities:      form.amenities,
            appliances:     form.appliances,
            features:       form.features,
            tags:           form.tags,
            removePictureIds: removedIds,
            newImages:        newImages.map((i) => i.file),
        })
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
                                    maxLength={TITLE_MAX}
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
                                    maxLength={DESCRIPTION_MAX}
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
                                <div className='flex flex-col gap-1.5'>
                                    <span className='text-sm font-medium text-orve-teal/70'>Habitaciones</span>
                                    <NumberStepper value={form.bedrooms}       onChange={(v) => setField('bedrooms', v)}       />
                                </div>
                                <div className='flex flex-col gap-1.5'>
                                    <span className='text-sm font-medium text-orve-teal/70'>Baños</span>
                                    <NumberStepper value={form.bathrooms}      onChange={(v) => setField('bathrooms', v)}      />
                                </div>
                                <div className='flex flex-col gap-1.5'>
                                    <span className='text-sm font-medium text-orve-teal/70'>Parqueos</span>
                                    <NumberStepper value={form.parking_spaces} onChange={(v) => setField('parking_spaces', v)} />
                                </div>
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

                    {/* Catálogos: amenidades, electrodomésticos, características, etiquetas */}
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>Catálogos</FieldLegend>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <CatalogMultiSelect label='Amenidades' items={catalogs?.amenities} selectedIds={form.amenities} onChange={(v) => setField('amenities', v)} />
                            <CatalogMultiSelect label='Electrodomésticos' items={catalogs?.appliances} selectedIds={form.appliances} onChange={(v) => setField('appliances', v)} />
                            <CatalogMultiSelect label='Características' items={catalogs?.features} selectedIds={form.features} onChange={(v) => setField('features', v)} />
                            <CatalogMultiSelect label='Etiquetas' items={catalogs?.tags} selectedIds={form.tags} onChange={(v) => setField('tags', v)} />
                        </div>
                    </FieldGroup>
                </FieldSet>

                {/* ── Columna derecha: ubicación + imágenes ── */}
                <FieldSet>
                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>
                            Ubicación
                            {errors.address && (
                                <span className='ml-2 text-xs font-normal text-red-500'>{errors.address}</span>
                            )}
                        </FieldLegend>
                        <LocationPicker
                            defaultCoordinates={initCoords}
                            defaultAddress={initAddress}
                            onChange={(loc) => {
                                setLocation(loc)
                                validateField('address', form, loc)
                            }}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLegend className='text-orve-teal'>
                            Imágenes
                            {errors.images && (
                                <span className='ml-2 text-xs font-normal text-red-500'>{errors.images}</span>
                            )}
                        </FieldLegend>
                        {existingPictures.length > 0 && (
                            <div className='flex flex-col gap-1.5'>
                                <p className='text-xs text-orve-teal/50'>Clic en una foto para marcarla y quitarla</p>
                                <ExistingPictures
                                    pictures={existingPictures}
                                    removedIds={removedIds}
                                    onToggleRemove={toggleRemove}
                                />
                            </div>
                        )}
                        <NewImageUploader
                            images={newImages}
                            onChange={(imgs) => {
                                setNewImages(imgs)
                                validateField('images', form, location, remainingCount(removedIds, imgs))
                            }}
                        />
                    </FieldGroup>
                </FieldSet>
            </div>

            {/* ── Acciones ── */}
            <div className='flex justify-end gap-3 pt-2'>
                <Button
                    variant='outline'
                    onClick={onCancel}
                    disabled={isLoading}
                    className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>

            {/* ── Diálogo de confirmación ── */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se actualizará la información de <strong>{form.title}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className='!bg-orve-teal hover:!bg-orve-darker-teal !text-white !border-transparent'
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default PropertyEditForm
