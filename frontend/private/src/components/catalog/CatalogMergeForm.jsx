import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import toast from '@/lib/toast'

// Para limpiar duplicados tipo "A/C" y "Aire acondicionado": se elige un
// principal y una o más referencias, y el backend reasigna a todas las
// propiedades que usaban una referencia para que apunten al principal, y luego
// borra las referencias. Es una fusión real, no se puede deshacer
const CatalogMergeForm = ({ label, items = [], service, onMerged }) => {
    const [principalId, setPrincipalId] = useState('')
    const [referenceIds, setReferenceIds] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const addReference = (id) => {
        if (id && !referenceIds.includes(id)) {
            setReferenceIds((prev) => [...prev, id])
        }
    }

    const removeReference = (id) => {
        setReferenceIds((prev) => prev.filter((r) => r !== id))
    }

    const getItemName = (id) => items.find((item) => item._id === id)?.name ?? ''

    const handleMerge = async () => {
        if (!principalId) {
            toast.error('Selecciona el elemento principal.')
            return
        }
        if (referenceIds.length === 0) {
            toast.error('Selecciona al menos una referencia.')
            return
        }

        setIsLoading(true)
        try {
            const data = await service.merge(principalId, referenceIds)
            onMerged(data)
            setPrincipalId('')
            setReferenceIds([])
            toast.success(`${label}s mezclados correctamente.`)
        } catch {
            toast.error('Ocurrió un error', `No se pudieron mezclar los ${label.toLowerCase()}s.`)
        } finally {
            setIsLoading(false)
        }
    }

    // Items disponibles para referencias (excluye el principal y los ya seleccionados)
    const referenceCandidates = items.filter(
        (item) => item._id !== principalId && !referenceIds.includes(item._id)
    )

    return (
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>

            {/* Principal */}
            <div className='flex flex-col gap-1.5 flex-1'>
                <span className='text-sm font-medium text-orve-teal'>
                    {label} principal
                </span>
                <Select
                    value={principalId}
                    onValueChange={(val) => {
                        setPrincipalId(val)
                        setReferenceIds((prev) => prev.filter((r) => r !== val))
                    }}
                >
                    <SelectTrigger className='w-full bg-white/80 border-input'>
                        <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-white border border-input shadow-md">
                        {items.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Referencias */}
            <div className='flex flex-col gap-1.5 flex-1'>
                <span className='text-sm font-medium text-orve-teal'>Referencias</span>

                {/* Tags seleccionadas */}
                {referenceIds.length > 0 && (
                    <div className='flex flex-wrap gap-1.5 mb-1'>
                        {referenceIds.map((id) => (
                            <span
                                key={id}
                                className='inline-flex items-center gap-1 bg-orve-teal/15 text-orve-darker-teal text-xs font-medium px-2.5 py-1 rounded-full'
                            >
                                {getItemName(id)}
                                <button
                                    onClick={() => removeReference(id)}
                                    className='hover:text-orve-teal transition-colors ml-0.5'
                                    aria-label={`Quitar ${getItemName(id)}`}
                                >
                                    <X className='w-3 h-3' />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Select para agregar referencias */}
                <Select onValueChange={addReference} value=''>
                    <SelectTrigger className='w-full bg-white/80 border-input'>
                        <SelectValue placeholder='Agregar referencia...' />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-white border border-input shadow-md">
                        {referenceCandidates.length === 0 ? (
                            <div className='px-2 py-3 text-sm text-muted-foreground text-center'>
                                No hay más opciones disponibles
                            </div>
                        ) : (
                            referenceCandidates.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                    {item.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Acción */}
            <Button
                onClick={handleMerge}
                disabled={isLoading}
                className='bg-orve-teal hover:bg-orve-darker-teal text-white shrink-0'
            >
                {isLoading ? 'Mezclando...' : `Mezclar ${label.toLowerCase()}s`}
            </Button>
        </div>
    )
}

export default CatalogMergeForm