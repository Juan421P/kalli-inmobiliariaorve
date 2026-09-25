import { X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Selector de "agregar de a uno + chips removibles", mismo patron visual que
// las referencias en CatalogMergeForm.jsx. Se usa para asociar a una
// propiedad una o varias amenidades/electrodomesticos/caracteristicas/
// etiquetas ya existentes (los 4 catalogos administrados en components/catalog/).
const CatalogMultiSelect = ({ label, items = [], selectedIds = [], onChange, placeholder }) => {
    const add = (id) => {
        if (id && !selectedIds.includes(id)) onChange([...selectedIds, id])
    }
    const remove = (id) => onChange(selectedIds.filter((i) => i !== id))
    const getName = (id) => items.find((item) => item._id === id)?.name ?? ''
    const candidates = items.filter((item) => !selectedIds.includes(item._id))

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-sm font-medium text-orve-teal/70'>{label}</span>

            {selectedIds.length > 0 && (
                <div className='flex flex-wrap gap-1.5 mb-1'>
                    {selectedIds.map((id) => (
                        <span
                            key={id}
                            className='inline-flex items-center gap-1 bg-orve-teal/15 text-orve-darker-teal text-xs font-medium px-2.5 py-1 rounded-full'
                        >
                            {getName(id)}
                            <button
                                type='button'
                                onClick={() => remove(id)}
                                className='hover:text-orve-teal transition-colors ml-0.5'
                                aria-label={`Quitar ${getName(id)}`}
                            >
                                <X className='w-3 h-3' />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <Select onValueChange={add} value=''>
                <SelectTrigger className='w-full bg-white/70'>
                    <SelectValue placeholder={placeholder ?? `Agregar ${label.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                    {candidates.length === 0 ? (
                        <div className='px-2 py-3 text-sm text-muted-foreground text-center'>
                            No hay más opciones disponibles
                        </div>
                    ) : (
                        candidates.map((item) => (
                            <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}

export default CatalogMultiSelect
