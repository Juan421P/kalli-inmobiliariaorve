import { useState, useEffect, useCallback, useMemo } from 'react'
import { appointmentsService } from '@/services/AppointmentsService'
import toast from '@/lib/toast'

const LIMIT = 5

const useAppointments = () => {
    const [appointments, setAppointments] = useState([])
    const [currentPage,  setCurrentPage]  = useState(1)
    const [search,       setSearch]       = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error,        setError]        = useState(null)

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await appointmentsService.getAll()
            setAppointments(data.appointments ?? [])
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar las citas.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    // el backend no soporta búsqueda ni paginación todavía, así que se filtra en el cliente
    const filteredAppointments = useMemo(() => {
        const query = search.trim().toLowerCase()
        return appointments.filter((apt) => {
            const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
            const matchesQuery = !query
                || `${apt.buyer?.name ?? ''} ${apt.buyer?.lastname ?? ''}`.toLowerCase().includes(query)
                || (apt.property?.title ?? '').toLowerCase().includes(query)
            return matchesStatus && matchesQuery
        })
    }, [appointments, search, statusFilter])

    const total = filteredAppointments.length
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const paginatedAppointments = useMemo(
        () => filteredAppointments.slice((currentPage - 1) * LIMIT, currentPage * LIMIT),
        [filteredAppointments, currentPage]
    )

    // vuelve a la primera página cuando cambia la búsqueda o el filtro
    useEffect(() => {
        setCurrentPage(1)
    }, [search, statusFilter])

    // "confirmed" es solo el nombre que usa la tarjeta del dashboard; en el
    // backend ese estado se llama "scheduled"
    const metrics = useMemo(() => ({
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'scheduled').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
    }), [appointments])

    const updateStatus = async (id, status) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await appointmentsService.updateStatus(id, status)
            toast.success(status === 'completed' ? 'Cita marcada como completada.' : 'Cita cancelada.')
            await fetchAppointments()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar la cita.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const createAppointment = async (data) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await appointmentsService.create(data)
            toast.success('Cita creada correctamente.')
            await fetchAppointments()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo crear la cita.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const editAppointment = async (id, data) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await appointmentsService.update(id, data)
            toast.success('Cita actualizada correctamente.')
            await fetchAppointments()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar la cita.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        appointments: paginatedAppointments,
        metrics,
        total,
        totalPages,
        currentPage,
        search,
        statusFilter,
        isLoading,
        isSubmitting,
        error,
        LIMIT,
        setSearch,
        setStatusFilter,
        setCurrentPage,
        fetchAppointments,
        updateStatus,
        createAppointment,
        editAppointment,
    }
}

export default useAppointments
