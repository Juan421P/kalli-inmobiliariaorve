import { useState, useRef } from 'react'
import { Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPhoneInput, formatDuiInput } from '@/lib/utils'
import {
    Field,
    FieldLabel,
    FieldTitle,
    FieldError,
} from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const DOCUMENT_TYPES = [
    { value: 'dui',        label: 'DUI'        },
    { value: 'pasaporte',  label: 'Pasaporte'  },
    { value: 'residencia', label: 'Residencia' },
]

const EMPTY_FORM = {
    name:           '',
    lastname:       '',
    email:          '',
    phone:          '',
    documentType:   'dui',
    documentNumber: '',
}

// Tienen que calzar exacto con user.name/user.lastname en el backend
// (backend/src/schemas/fields/primitives.js: shortText) — si allá cambian el
// máximo o el regex y acá no, el formulario deja pasar cosas que el backend
// va a rechazar igual.
const SHORT_TEXT_MAX = 20
const SHORT_TEXT_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s'-]+$/
const DOCUMENT_NUMBER_MAX = 50
const EMAIL_MAX = 255

const AvatarUpload = ({ preview, onChange, error }) => {
    const inputRef = useRef(null)

    const handleFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        onChange(file, URL.createObjectURL(file))
    }

    return (
        <div className='flex flex-col items-center gap-2'>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='relative w-20 h-20 rounded-full border-2 border-dashed border-orve-teal/30 bg-orve-teal/5 hover:border-orve-teal/60 hover:bg-orve-teal/10 transition-all group overflow-hidden'
            >
                {preview ? (
                    <img src={preview} alt='Vista previa' className='w-full h-full object-cover' />
                ) : (
                    <div className='flex flex-col items-center justify-center gap-1 text-orve-teal/50 group-hover:text-orve-teal transition-colors'>
                        <User className='w-7 h-7' />
                    </div>
                )}
                {preview && (
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <Upload className='w-4 h-4 text-white' />
                    </div>
                )}
            </button>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='text-xs text-orve-teal/60 hover:text-orve-teal transition-colors'
            >
                {preview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {error && <span className='text-xs text-destructive'>{error}</span>}
            <input
                ref={inputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleFile}
            />
        </div>
    )
}

const CollaboratorInviteForm = ({ onSubmit, isLoading }) => {
    const [form,    setForm]    = useState(EMPTY_FORM)
    const [errors,  setErrors]  = useState({})
    const [touched, setTouched] = useState({})
    const [avatar,  setAvatar]  = useState({ file: null, preview: null })

    // Un validador por campo: se usa tanto para revisar uno solo apenas cambia
    // (feedback inmediato) como para revisarlos todos de un golpe antes de
    // mandar la invitación al backend. `f` es el form y `av` el archivo de
    // avatar — se pasan explícitos para poder validar contra el valor recién
    // elegido, que puede no estar en el state todavía.
    const fieldValidators = {
        avatar: (_f, av) => !av ? 'La foto es requerida.' : null,
        name: (f) => {
            if (!f.name.trim()) return 'El nombre es requerido.'
            if (f.name.trim().length > SHORT_TEXT_MAX) return `No puede superar los ${SHORT_TEXT_MAX} caracteres.`
            if (!SHORT_TEXT_REGEX.test(f.name.trim())) return 'Solo letras, números, espacios, guiones y apóstrofes.'
            return null
        },
        lastname: (f) => {
            if (!f.lastname.trim()) return 'El apellido es requerido.'
            if (f.lastname.trim().length > SHORT_TEXT_MAX) return `No puede superar los ${SHORT_TEXT_MAX} caracteres.`
            if (!SHORT_TEXT_REGEX.test(f.lastname.trim())) return 'Solo letras, números, espacios, guiones y apóstrofes.'
            return null
        },
        email: (f) => {
            if (!f.email.trim()) return 'El correo es requerido.'
            if (f.email.trim().length > EMAIL_MAX) return `No puede superar los ${EMAIL_MAX} caracteres.`
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'Ingrese un correo válido.'
            return null
        },
        phone: (f) => {
            if (!f.phone.trim()) return 'El teléfono es requerido.'
            if (!/^\d{4}-\d{4}$/.test(f.phone)) return 'Formato: 0000-0000'
            return null
        },
        documentNumber: (f) => {
            if (!f.documentNumber.trim()) return 'El número de documento es requerido.'
            if (f.documentType === 'dui' && !/^\d{8}-\d$/.test(f.documentNumber)) return 'El DUI debe tener el formato 00000000-0'
            if (f.documentType !== 'dui' && f.documentNumber.trim().length > DOCUMENT_NUMBER_MAX) return `No puede superar los ${DOCUMENT_NUMBER_MAX} caracteres.`
            return null
        },
    }

    // Revisa un solo campo contra el valor recién tecleado/elegido (que puede
    // no estar en el state todavía) y actualiza su error en el momento.
    const validateField = (key, formOverride = form, avatarOverride = avatar.file) => {
        const message = fieldValidators[key]?.(formOverride, avatarOverride) ?? null
        setErrors((prev) => ({ ...prev, [key]: message }))
        return message
    }

    const setField = (key, value) => {
        const nextForm = { ...form, [key]: value }
        setForm(nextForm)
        setTouched((prev) => ({ ...prev, [key]: true }))
        validateField(key, nextForm)
        // el formato de DUI depende de documentType, así que si cambia hay que
        // re-revisar documentNumber contra el tipo nuevo
        if (key === 'documentType') validateField('documentNumber', nextForm)
    }

    const touchField = (key) => setTouched((prev) => ({ ...prev, [key]: true }))

    const isDuiValid = form.documentType !== 'dui' || /^\d{8}-\d$/.test(form.documentNumber)
    const isNameValid = (v) => v.trim() && v.trim().length <= SHORT_TEXT_MAX && SHORT_TEXT_REGEX.test(v.trim())
    const isDocumentNumberValid =
        form.documentNumber.trim() &&
        isDuiValid &&
        (form.documentType === 'dui' || form.documentNumber.trim().length <= DOCUMENT_NUMBER_MAX)

    const isFormReady =
        isNameValid(form.name) &&
        isNameValid(form.lastname) &&
        form.email.trim() && form.email.trim().length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        /^\d{4}-\d{4}$/.test(form.phone) &&
        isDocumentNumberValid &&
        avatar.file

    // Revisa TODOS los campos (y la foto) contra el estado actual, sin
    // importar cuáles ya se habían tocado. Chequeo final antes de hablar con
    // el backend: nada se manda si algo, aunque nadie lo haya tocado, está mal.
    const validate = () => {
        const e = {}
        for (const key of Object.keys(fieldValidators)) {
            const message = fieldValidators[key](form, avatar.file)
            if (message) e[key] = message
        }
        setErrors(e)
        setTouched(Object.fromEntries(Object.keys(fieldValidators).map((k) => [k, true])))
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        const ok = await onSubmit({
            name:           form.name.trim(),
            lastname:       form.lastname.trim(),
            email:          form.email.trim(),
            phone:          { country_code: '+503', number: form.phone.trim() },
            documentType:   form.documentType,
            documentNumber: form.documentNumber.trim(),
            avatarFile:     avatar.file,
        })
        if (ok) {
            setForm(EMPTY_FORM)
            setAvatar({ file: null, preview: null })
            setErrors({})
            setTouched({})
        }
    }

    return (
        <div className='flex flex-col gap-5'>
            {/* ── Avatar + campos lado a lado ── */}
            <div className='flex gap-6 items-start'>
                {/* Avatar */}
                <div className='shrink-0 pt-1'>
                    <AvatarUpload
                        preview={avatar.preview}
                        onChange={(file, preview) => {
                            setAvatar({ file, preview })
                            validateField('avatar', form, file)
                        }}
                        error={errors.avatar}
                    />
                </div>

                {/* Campos en cuadrícula 2 columnas */}
                <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Nombre
                                {touched.name && !form.name.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                onBlur={() => touchField('name')}
                                placeholder='Nombre'
                                maxLength={SHORT_TEXT_MAX}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.name}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Apellido
                                {touched.lastname && !form.lastname.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.lastname}
                                onChange={(e) => setField('lastname', e.target.value)}
                                onBlur={() => touchField('lastname')}
                                placeholder='Apellido'
                                maxLength={SHORT_TEXT_MAX}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.lastname}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Teléfono
                                {touched.phone && !form.phone.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                                {touched.phone && form.phone.trim() && !/^\d{4}-\d{4}$/.test(form.phone) && (
                                    <span className='text-orve-red text-xs font-semibold'>Formato: 0000-0000</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.phone}
                                onChange={(e) => setField('phone', formatPhoneInput(e.target.value))}
                                onBlur={() => touchField('phone')}
                                placeholder='0000-0000'
                                maxLength={9}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.phone}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Correo electrónico
                                {touched.email && !form.email.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                                {touched.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                                    <span className='text-orve-red text-xs font-semibold'>Formato inválido</span>
                                )}
                            </FieldTitle>
                            <Input
                                type='email'
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                onBlur={() => touchField('email')}
                                placeholder='correo@ejemplo.com'
                                maxLength={EMAIL_MAX}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.email}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Tipo de documento</FieldTitle>
                            <Select
                                value={form.documentType}
                                onValueChange={(v) => setField('documentType', v)}
                            >
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {DOCUMENT_TYPES.map((dt) => (
                                        <SelectItem key={dt.value} value={dt.value}>
                                            {dt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Número de documento
                                {touched.documentNumber && !form.documentNumber.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                                {touched.documentNumber && form.documentNumber.trim() && !isDuiValid && (
                                    <span className='text-orve-red text-xs font-semibold'>Formato: 00000000-0</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.documentNumber}
                                onChange={(e) => setField('documentNumber', form.documentType === 'dui' ? formatDuiInput(e.target.value) : e.target.value)}
                                onBlur={() => touchField('documentNumber')}
                                placeholder={form.documentType === 'dui' ? '00000000-0' : 'Número de documento'}
                                maxLength={form.documentType === 'dui' ? 10 : DOCUMENT_NUMBER_MAX}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.documentNumber}</FieldError>
                    </Field>
                </div>
            </div>

            {/* ── Nota + botón ── */}
            <div className='flex items-center justify-between gap-4 pt-1'>
                <p className='text-xs text-orve-teal/50'>
                    Se enviará un correo de invitación para que el colaborador defina su contraseña.
                </p>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !isFormReady}
                    className='shrink-0 bg-orve-teal hover:bg-orve-darker-teal text-white px-8'
                >
                    {isLoading ? 'Enviando...' : 'Enviar invitación'}
                </Button>
            </div>
        </div>
    )
}

export default CollaboratorInviteForm
