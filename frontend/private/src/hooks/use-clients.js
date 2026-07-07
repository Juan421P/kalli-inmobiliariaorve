import { useState, useEffect, useCallback, useMemo } from 'react'
import { clientsService } from '@/services/clients'
import toast from '@/lib/toast'

const LIMIT = 5

const isActive = (client) => client.active !== false

const useClients = () => {
    const [clients,      setClients]      = useState([])
    const [currentPage,  setCurrentPage]  = useState(1)
    const [search,       setSearch]       = useState('')
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error,        setError]        = useState(null)

    const fetchClients = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await clientsService.getAll()
            setClients(data.clients ?? [])
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar los clientes.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    // el backend no soporta búsqueda ni paginación todavía, así que se filtra en el cliente
    const filteredClients = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return clients
        return clients.filter((c) =>
            `${c.name} ${c.lastname}`.toLowerCase().includes(query)
            || c.email.toLowerCase().includes(query)
        )
    }, [clients, search])

    const total = filteredClients.length
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const paginatedClients = useMemo(
        () => filteredClients.slice((currentPage - 1) * LIMIT, currentPage * LIMIT),
        [filteredClients, currentPage]
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const metrics = useMemo(() => ({
        total: clients.length,
        active: clients.filter(isActive).length,
        inactive: clients.filter((c) => !isActive(c)).length,
    }), [clients])

    const setActive = async (id, active) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await clientsService.setActive(id, active)
            toast.success(active ? 'Cliente activado.' : 'Cliente desactivado.')
            await fetchClients()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar el cliente.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        clients: paginatedClients,
        metrics,
        total,
        totalPages,
        currentPage,
        search,
        isLoading,
        isSubmitting,
        error,
        LIMIT,
        setSearch,
        setCurrentPage,
        fetchClients,
        setActive,
    }
}

export default useClients
