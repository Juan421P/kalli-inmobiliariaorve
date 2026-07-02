import { useState, useEffect, useCallback } from 'react'
import { offersService } from '@/services/offers'
import toast from '@/lib/toast'

const LIMIT = 5

const useOffers = () => {
    const [offers,      setOffers]      = useState([])
    const [metrics,     setMetrics]     = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 })
    const [total,       setTotal]       = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [search,      setSearch]      = useState('')
    const [typeFilter,  setTypeFilter]  = useState('all')
    const [isLoading,   setIsLoading]   = useState(true)
    const [isSubmitting,setIsSubmitting]= useState(false)
    const [error,       setError]       = useState(null)

    const fetchOffers = useCallback(async (page = 1, q = '', type = 'all') => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await offersService.getAll({ search: q, page, limit: LIMIT, type })
            setOffers(data.offers)
            setTotal(data.total)
            setCurrentPage(page)
            if (data.metrics) setMetrics(data.metrics)
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar las ofertas.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // carga inicial al entrar a la página
    useEffect(() => {
        fetchOffers(1, '', 'all')
    }, [])

    // espera 400ms después de que el usuario deja de escribir antes de buscar
    useEffect(() => {
        const timer = setTimeout(() => fetchOffers(1, search, typeFilter), 400)
        return () => clearTimeout(timer)
    }, [search, typeFilter])

    const updateStatus = async (id, status) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await offersService.updateStatus(id, status)
            toast.success(status === 'accepted' ? 'Oferta aceptada.' : 'Oferta rechazada.')
            await fetchOffers(currentPage, search, typeFilter)
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar el estado.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteOffer = async (id) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await offersService.remove(id)
            toast.success('Oferta eliminada.')
            await fetchOffers(currentPage, search, typeFilter)
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo eliminar la oferta.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    return {
        offers,
        metrics,
        total,
        totalPages,
        currentPage,
        search,
        typeFilter,
        isLoading,
        isSubmitting,
        error,
        LIMIT,
        setSearch,
        setTypeFilter,
        fetchOffers,
        updateStatus,
        deleteOffer,
    }
}

export default useOffers
