import { useState, useEffect, useCallback } from 'react'
import { propertyService } from '@/services/PropertyService'
import toast from '@/lib/toast'

const LIMIT = 5

const useProperties = () => {
    const [properties,      setProperties]      = useState([])
    const [metrics,         setMetrics]         = useState({ total: 0, available: 0, rented: 0, sold: 0 })
    const [total,           setTotal]           = useState(0)
    const [currentPage,     setCurrentPage]     = useState(1)
    const [search,          setSearch]          = useState('')
    const [filterType,      setFilterType]      = useState('all')
    const [filterListing,   setFilterListing]   = useState('all')
    const [filterStatus,    setFilterStatus]    = useState('all')
    const [isLoading,       setIsLoading]       = useState(true)
    const [isSubmitting,    setIsSubmitting]    = useState(false)
    const [error,           setError]           = useState(null)

    const fetchProperties = useCallback(async (page = 1, q = '', type = 'all', listing = 'all', status = 'all') => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await propertyService.getAll({
                search:  q,
                page,
                limit:   LIMIT,
                type:    type    === 'all' ? '' : type,
                listing: listing === 'all' ? '' : listing,
                status:  status  === 'all' ? '' : status,
            })
            setProperties(data.properties)
            setTotal(data.total)
            setCurrentPage(page)
            if (data.metrics) setMetrics(data.metrics)
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudieron cargar las propiedades.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Carga inicial
    useEffect(() => {
        fetchProperties(1, '', 'all', 'all', 'all')
    }, [])

    // Van separados del efecto de arriba para no pegarle al backend en cada letra
    // que se escribe en el buscador; el timeout se cancela y se reinicia con cada
    // tecla, así que solo dispara la búsqueda 400ms después de que la persona para
    useEffect(() => {
        const timer = setTimeout(() => fetchProperties(1, search, filterType, filterListing, filterStatus), 400)
        return () => clearTimeout(timer)
    }, [search, filterType, filterListing, filterStatus])

    const createProperty = async (formData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await propertyService.create(formData)
            toast.success('Propiedad agregada correctamente.')
            setSearch(''); setFilterType('all'); setFilterListing('all'); setFilterStatus('all')
            await fetchProperties(1, '', 'all', 'all', 'all')
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo agregar la propiedad.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const updateProperty = async (id, formData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await propertyService.update(id, formData)
            toast.success(`"${formData.title}" actualizado correctamente.`)
            await fetchProperties(currentPage, search, filterType, filterListing, filterStatus)
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo actualizar la propiedad.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteProperty = async (property) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await propertyService.remove(property._id)
            toast.success(`"${property.title}" eliminado.`)
            await fetchProperties(currentPage, search, filterType, filterListing, filterStatus)
            return true
        } catch (err) {
            setError(err.message)
            toast.error('Error', 'No se pudo eliminar la propiedad.')
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    return {
        properties,
        metrics,
        total,
        totalPages,
        currentPage,
        search,
        filterType,
        filterListing,
        filterStatus,
        isLoading,
        isSubmitting,
        error,
        LIMIT,
        setSearch,
        setFilterType,
        setFilterListing,
        setFilterStatus,
        fetchProperties,
        createProperty,
        updateProperty,
        deleteProperty,
    }
}

export default useProperties
