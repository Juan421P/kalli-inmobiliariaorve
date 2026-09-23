import { useState, useMemo, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * Select con buscador, para listas largas (clientes, propiedades, etc.) donde
 * un <Select> normal obligaría a scrollear a mano entre cientos de opciones.
 * `items` puede ser cualquier forma de objeto; `getValue`/`getLabel` dicen
 * cómo sacarle el id y el texto a mostrar/filtrar.
 */
const SearchableSelect = ({
    items = [],
    value,
    onValueChange,
    getValue = (item) => item._id,
    getLabel = (item) => item.name,
    placeholder = 'Seleccione una opción',
    searchPlaceholder = 'Buscar...',
    emptyText = 'Sin resultados.',
    disabled = false,
    className,
}) => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const inputRef = useRef(null)

    const selected = items.find((item) => getValue(item) === value)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return items
        return items.filter((item) => getLabel(item).toLowerCase().includes(q))
    }, [items, query, getLabel])

    // Al abrir, limpia la búsqueda anterior y enfoca el input. El pequeño
    // delay es porque el popover recién se está montando en ese mismo tick.
    useEffect(() => {
        if (!open) return
        setQuery('')
        const id = requestAnimationFrame(() => inputRef.current?.focus())
        return () => cancelAnimationFrame(id)
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type='button'
                    disabled={disabled}
                    className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-white/70 px-3 py-2 text-sm text-left outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                        !selected && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className='truncate'>{selected ? getLabel(selected) : placeholder}</span>
                    <ChevronDown className='w-4 h-4 shrink-0 opacity-50' />
                </button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-[320px] p-0 bg-white border border-input shadow-md'>
                <div className='flex items-center gap-2 border-b border-input px-3 py-2'>
                    <Search className='w-4 h-4 text-muted-foreground shrink-0' />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                    />
                </div>
                <div className='max-h-60 overflow-y-auto py-1'>
                    {filtered.length === 0 ? (
                        <p className='px-3 py-4 text-sm text-center text-muted-foreground'>{emptyText}</p>
                    ) : (
                        filtered.map((item) => {
                            const itemValue = getValue(item)
                            const isSelected = itemValue === value
                            return (
                                <button
                                    type='button'
                                    key={itemValue}
                                    onClick={() => { onValueChange(itemValue); setOpen(false) }}
                                    className={cn(
                                        'flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orve-teal/10 transition-colors',
                                        isSelected && 'bg-orve-teal/10 font-medium'
                                    )}
                                >
                                    <Check className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'opacity-100 text-orve-teal' : 'opacity-0')} />
                                    <span className='truncate'>{getLabel(item)}</span>
                                </button>
                            )
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default SearchableSelect
