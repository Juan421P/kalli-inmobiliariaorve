/**
 * Convierte "08:00" -> "8:00 AM", "14:30" -> "2:30 PM"
 */
export const formatTime = (time24) => {
    if (!time24) return ''
    const [hourStr, minutes] = time24.split(':')
    const hour = parseInt(hourStr, 10)
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12}:${minutes} ${suffix}`
}

export const DAYS_OF_WEEK = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
]