import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { panel } from '@/lib/styles'
import { DAYS_OF_WEEK } from './scheduleUtils'

// value es el índice en 24h ("00"–"23"); label es lo que ve el usuario en 12h
const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12
    const suffix = i < 12 ? 'AM' : 'PM'
    const value = String(i).padStart(2, '0')
    return { value, label: `${h}:00 ${suffix}` }
})

const MINUTES = Array.from({ length: 60 }, (_, i) => {
    const m = String(i).padStart(2, '0')
    return { value: m, label: `:${m}` }
})

const splitTime = (time) => {
    if (!time) return { hour: '', minute: '00' }
    const [hour, minute] = time.split(':')
    return { hour, minute }
}

const joinTime = (hour, minute) => (hour ? `${hour}:${minute}` : '')

// TimePicker
const TimePicker = ({ label, value, onChange }) => {
    const { hour, minute } = splitTime(value)

    const setHour   = (h) => onChange(joinTime(h, minute || '00'))
    const setMinute = (m) => onChange(joinTime(hour, m))

    return (
        <div className='flex flex-col gap-1.5'>
            <span className='text-xs font-semibold text-orve-teal/60 uppercase tracking-widest'>
                {label}
            </span>
            <div className='flex items-stretch rounded-lg border border-input bg-white/80 shadow-sm overflow-hidden'>
                <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger className='w-28 border-none shadow-none rounded-none bg-transparent focus:ring-0 focus-visible:ring-0 text-orve-darker-teal font-medium'>
                        <SelectValue placeholder='Hora' />
                    </SelectTrigger>
                    <SelectContent position='popper' className='bg-white border border-input shadow-md max-h-52'>
                        {HOURS.map((h) => (
                            <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className='w-px bg-input self-stretch mx-0' />

                <Select value={minute} onValueChange={setMinute} disabled={!hour}>
                    <SelectTrigger className='w-20 border-none shadow-none rounded-none bg-transparent focus:ring-0 focus-visible:ring-0 text-orve-darker-teal font-medium'>
                        <SelectValue placeholder='Min' />
                    </SelectTrigger>
                    <SelectContent position='popper' className='bg-white border border-input shadow-md max-h-52'>
                        {MINUTES.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

// ScheduleForm 
const ScheduleForm = ({ onAdd, onUpdate, editingSlot, onCancelEdit, isLoading }) => {
    const [day,   setDay]   = useState('Lunes')
    const [from,  setFrom]  = useState('')
    const [to,    setTo]    = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (editingSlot) {
            setDay(editingSlot.day)
            setFrom(editingSlot.from)
            setTo(editingSlot.to)
            setError('')
        } else {
            setDay('Lunes')
            setFrom('')
            setTo('')
            setError('')
        }
    }, [editingSlot])

    const validate = () => {
        if (!from || !to) {
            setError('Seleccioná ambos campos de tiempo.')
            return false
        }
        if (from >= to) {
            setError('La hora de inicio debe ser menor a la hora de fin.')
            return false
        }
        setError('')
        return true
    }

    const handleSubmit = () => {
        if (!validate()) return
        editingSlot ? onUpdate(editingSlot.slotId, from, to) : onAdd(day, from, to)
    }

    const isEditing = !!editingSlot

    return (
        <div className={panel}>
            {/* Header con indicador de modo */}
            <div className='flex items-center gap-2.5 mb-5'>
                <div className={`w-1 h-5 rounded-full ${isEditing ? 'bg-amber-400' : 'bg-orve-teal'}`} />
                <h2 className='text-sm font-semibold text-orve-teal tracking-wide uppercase'>
                    {isEditing ? 'Editar horario' : 'Agregar horario'}
                </h2>
            </div>

            <div className='flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap'>
                {/* Día */}
                <div className='flex flex-col gap-1.5'>
                    <span className='text-xs font-semibold text-orve-teal/60 uppercase tracking-widest'>
                        Día
                    </span>
                    <Select value={day} onValueChange={setDay} disabled={isEditing}>
                        <SelectTrigger className='w-36 bg-white/80 border-input text-orve-darker-teal font-medium shadow-sm'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                            {DAYS_OF_WEEK.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Separador visual */}
                <div className='hidden sm:flex items-end pb-2.5 text-orve-teal/20 text-lg font-light select-none'>
                    |
                </div>

                <TimePicker label='Desde' value={from} onChange={setFrom} />

                <span className='hidden sm:flex items-end pb-3 text-orve-teal/30 text-sm font-medium select-none'>
                    →
                </span>

                <TimePicker label='Hasta' value={to} onChange={setTo} />

                {/* Acciones */}
                <div className='flex gap-2 shrink-0 self-end'>
                    {isEditing && (
                        <Button
                            variant='outline'
                            onClick={onCancelEdit}
                            disabled={isLoading}
                            className='border-orve-teal/25 text-orve-teal/70 hover:bg-orve-teal/8 hover:text-orve-teal text-sm'
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className='bg-orve-teal hover:bg-orve-darker-teal text-white shadow-sm text-sm font-medium'
                    >
                        {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className='mt-3 flex items-center gap-2 text-sm text-red-500'>
                    <span className='w-1 h-1 rounded-full bg-red-400 shrink-0' />
                    {error}
                </div>
            )}
        </div>
    )
}

export default ScheduleForm