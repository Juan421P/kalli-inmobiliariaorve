import { Pencil, Trash2, Clock } from 'lucide-react'
import { panel } from '@/lib/styles'
import { formatTime } from './scheduleUtils'

// Colores del indicador lateral por día — ciclan sobre los 7 días
const DAY_ACCENTS = [
    'bg-[#507177]',   // Lunes   — orve-teal
    'bg-[#6B8F95]',   // Martes
    'bg-[#4A7A6B]',   // Miércoles
    'bg-[#405C62]',   // Jueves  — orve-darker-teal
    'bg-[#5C8070]',   // Viernes
    'bg-[#7A9E9F]',   // Sábado
    'bg-[#9DB4B5]',   // Domingo — más suave
]

const ScheduleTable = ({ schedules = [], onEdit, onDelete, onDeleteSlot, loadingSlotId }) => {
    return (
        <div className={`${panel} !p-0 overflow-hidden`}>
            {schedules.map((dayEntry, index) => {
                const accent = DAY_ACCENTS[index % DAY_ACCENTS.length]
                const isEmpty = dayEntry.slots.length === 0

                return (
                    <div
                        key={dayEntry._id}
                        className='group flex items-stretch border-b border-orve-teal/8 last:border-b-0 hover:bg-orve-teal/[0.03] transition-colors'
                    >
                        {/* Barra lateral de color */}
                        <div className={`w-1 shrink-0 ${accent} opacity-70 group-hover:opacity-100 transition-opacity`} />

                        {/* Contenido */}
                        <div className='flex flex-1 items-center gap-5 px-5 py-4'>
                            {/* Día */}
                            <div className='flex items-center gap-2 w-28 shrink-0'>
                                <Clock className='w-3.5 h-3.5 text-orve-teal/40 shrink-0' />
                                <span className='text-sm font-semibold text-orve-teal tracking-wide'>
                                    {dayEntry.day}
                                </span>
                            </div>

                            {/* Chips — cada uno con su propio editar */}
                            <div className='flex flex-1 flex-wrap gap-2'>
                                {isEmpty ? (
                                    <span className='inline-flex items-center px-3 py-1 rounded-md bg-orve-teal/6 text-orve-teal/40 text-xs font-medium border border-orve-teal/10 tracking-wide'>
                                        Sin horario
                                    </span>
                                ) : (
                                    dayEntry.slots.map((slot) => (
                                        <span
                                            key={slot._id}
                                            className='inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 rounded-md bg-orve-teal/12 text-orve-darker-teal text-xs font-semibold border border-orve-teal/15 shadow-sm tracking-wide'
                                        >
                                            <span>{formatTime(slot.from)}</span>
                                            <span className='text-orve-teal/40 font-normal'>→</span>
                                            <span>{formatTime(slot.to)}</span>
                                            <button
                                                onClick={() => onEdit(dayEntry, slot)}
                                                disabled={!!loadingSlotId}
                                                className='ml-1 p-0.5 rounded text-orve-teal/40 hover:text-orve-teal hover:bg-orve-teal/15 transition-all disabled:opacity-40'
                                                aria-label={`Editar ${formatTime(slot.from)} → ${formatTime(slot.to)}`}
                                            >
                                                <Pencil className='w-3 h-3' />
                                            </button>
                                            <button
                                                onClick={() => onDeleteSlot(slot._id)}
                                                disabled={!!loadingSlotId}
                                                className='p-0.5 rounded text-orve-teal/40 hover:text-red-400 hover:bg-red-50/80 transition-all disabled:opacity-40'
                                                aria-label={`Eliminar ${formatTime(slot.from)} → ${formatTime(slot.to)}`}
                                            >
                                                <Trash2 className='w-3 h-3' />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            {/* Solo eliminar día completo */}
                            <div className='flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                    onClick={() => onDelete(dayEntry)}
                                    disabled={!!loadingSlotId}
                                    className='p-2 rounded-lg text-orve-teal/50 hover:text-red-400 hover:bg-red-50/80 transition-all disabled:opacity-40'
                                    aria-label={`Eliminar horarios de ${dayEntry.day}`}
                                >
                                    <Trash2 className='w-3.5 h-3.5' />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ScheduleTable