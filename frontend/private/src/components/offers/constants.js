// colores y etiquetas según el estado de la oferta — compartido entre
// OffersTable y OfferDetailsDialog, mismo patrón que components/appointments/constants.js
export const STATUS_MAP = {
    pending:   { label: 'Pendiente',       className: 'bg-amber-50   text-amber-700   border-amber-200'   },
    accepted:  { label: 'Aceptada',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:  { label: 'Rechazada',       className: 'bg-red-50     text-red-600     border-red-200'     },
    countered: { label: 'Contrapropuesta', className: 'bg-blue-50    text-blue-700    border-blue-200'    },
    withdrawn: { label: 'Retirada',        className: 'bg-gray-50    text-gray-500    border-gray-200'    },
}

export const getStatus = (status) => STATUS_MAP[status] ?? { label: status, className: 'bg-gray-100 text-gray-500 border-gray-200' }

export const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : value

export const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
