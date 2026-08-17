import { useState, useEffect, useCallback, useMemo } from 'react'
import { collaboratorsService } from '@/services/CollaboratorsService'
import toast from '@/lib/toast'

const LIMIT = 5

const isActive = (collaborator) => collaborator.active !== false

const useCollaborators = () => {
    const [collaborators, setCollaborators] = useState([])
    const [currentPage,   setCurrentPage]   = useState(1)
    const [search,        setSearch]        = useState('')
    const [isLoading,     setIsLoading]     = useState(true)
    const [isSubmitting,  setIsSubmitting]  = useState(false)
    const [error,         setError]         = useState(null)

    const fetchCollaborators = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await collaboratorsService.getAll()
            setCollaborators(data.collaborators ?? [])
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar los colaboradores.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCollaborators()
    }, [fetchCollaborators])

    const filteredCollaborators = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return collaborators
        return collaborators.filter((c) =>
            `${c.name} ${c.lastname}`.toLowerCase().includes(query)
            || c.email.toLowerCase().includes(query)
        )
    }, [collaborators, search])

    const total = filteredCollaborators.length
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const paginatedCollaborators = useMemo(
        () => filteredCollaborators.slice((currentPage - 1) * LIMIT, currentPage * LIMIT),
        [filteredCollaborators, currentPage]
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const metrics = useMemo(() => ({
        total: collaborators.length,
        active: collaborators.filter(isActive).length,
        inactive: collaborators.filter((c) => !isActive(c)).length,
    }), [collaborators])

    const createInvite = async (formData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await collaboratorsService.create(formData)
            toast.success('Invitación enviada correctamente.')
            await fetchCollaborators()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo invitar al colaborador.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const setActive = async (id, active) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await collaboratorsService.setActive(id, active)
            toast.success(active ? 'Colaborador activado.' : 'Colaborador desactivado.')
            await fetchCollaborators()
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar el colaborador.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        collaborators: paginatedCollaborators,
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
        fetchCollaborators,
        createInvite,
        setActive,
    }
}

export default useCollaborators
