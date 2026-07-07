export const STATUS_MAP = {
    pending:   { label: 'Pendiente',  className: 'bg-amber-50 text-amber-700 border-amber-100' },
    assigned:  { label: 'Asignada',   className: 'bg-blue-50 text-blue-700 border-blue-100' },
    scheduled: { label: 'Confirmada', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    completed: { label: 'Completada', className: 'bg-orve-green/10 text-orve-green border-orve-green/20' },
    cancelled: { label: 'Cancelada',  className: 'bg-orve-red/10 text-orve-red border-orve-red/20' },
}

export const getStatus = (status) => STATUS_MAP[status] ?? { label: status, className: 'bg-gray-100 text-gray-500 border-gray-200' }

export const FUNDS_SOURCE_LABELS = {
    own:   'Fondos propios',
    loan:  'Préstamo',
    mixed: 'Mixto',
}

export const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : '—'
