// Solo para mostrar: convierte formato interno 24h a 12h AM/PM legible
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