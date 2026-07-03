import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldTitle, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import toast from '@/lib/toast'

const MIN_LENGTH = 3
const MAX_LENGTH = 60

const CatalogCreateForm = ({ label, placeholder, service, onCreated }) => {
    const [name, setName] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const validate = (value) => {
        if (!value) return 'El nombre no puede estar vacío.'
        if (value.length < MIN_LENGTH) return `Debe tener al menos ${MIN_LENGTH} caracteres.`
        if (value.length > MAX_LENGTH) return `No puede superar los ${MAX_LENGTH} caracteres.`
        return null
    }


    const handleSubmit = async () => {
        const trimmedName = name.trim()
        const validationError = validate(trimmedName)
        if (validationError) {
            setError(validationError)
            return
        }

        setError(null)
        setIsLoading(true)
        try {
            const data = await service.post({ name: trimmedName })
            setName('')
            onCreated(data)
            toast.success(`${label} agregado correctamente.`)
        } catch (err) {
            const status = err?.response?.status
            if (status === 409) {
                setError(`"${trimmedName}" ya está registrado.`)
            } else {
                toast.error('Ocurrió un error', `No se pudo agregar el ${label.toLowerCase()}.`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <div className='flex flex-col gap-4'>
            <Field>
                <FieldLabel>
                    <FieldTitle className='text-orve-teal'>{`Nombre de ${label.charAt(0) === 'E' ? 'el' : 'la'} ${label.toLowerCase()}`}</FieldTitle>
                    <Input
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null) }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className='bg-white/70'
                    />
                </FieldLabel>
                <FieldError>{error}</FieldError>
            </Field>
            <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className='w-full bg-orve-teal hover:bg-orve-darker-teal text-white'
            >
                {isLoading ? 'Agregando...' : 'Agregar'}
            </Button>
        </div>
    )
}

export default CatalogCreateForm