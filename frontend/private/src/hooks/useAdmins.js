import { useState, useEffect, useCallback, useMemo } from 'react'
import AdminService from '@/services/AdminService'
import toast from '@/lib/toast'

const LIMIT = 5

const useAdmins = () => {
    const [admins,       setAdmins]       = useState([])
    const [currentPage,  setCurrentPage]  = useState(1)
    const [search,       setSearch]       = useState('')
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error,        setError]        = useState(null)

    const fetchAdmins = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await AdminService.getAll()
            setAdmins(data.admins ?? [])
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar los administradores.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAdmins()
    }, [fetchAdmins])

    const filteredAdmins = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return admins
        return admins.filter((a) =>
            `${a.name} ${a.lastname}`.toLowerCase().includes(query)
            || a.email.toLowerCase().includes(query)
        )
    }, [admins, search])

    const total = filteredAdmins.length
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const paginatedAdmins = useMemo(
        () => filteredAdmins.slice((currentPage - 1) * LIMIT, currentPage * LIMIT),
        [filteredAdmins, currentPage]
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const createInvite = async (formData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await AdminService.create(formData)
            toast.success('Invitación enviada correctamente.')
            await fetchAdmins()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo invitar al administrador.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        admins: paginatedAdmins,
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
        fetchAdmins,
        createInvite,
    }
}

export default useAdmins