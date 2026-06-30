import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import propertyService from '@/services/property'

/**
 * Maneja el listado de propiedades para las paginas de Comprar/Alquilar:
 * trae las propiedades del tipo indicado, y aplica busqueda por texto,
 * filtro por tipo de inmueble y orden, todo en el cliente (el backend
 * de /properties no soporta query params todavia, asi que filtramos aca).
 *
 * @param {'sale'|'rent'} listingType - que tipo de listado traer
 * @returns estado y setters listos para usar en la UI (input, selects, grid)
 */
const usePropertyListing = (listingType) => {
    const [searchParams] = useSearchParams()
    const [properties, setProperties] = useState([])
    const [filtered,   setFiltered]   = useState([])
    const [isLoading,  setIsLoading]  = useState(true)
    const [search,     setSearch]     = useState(searchParams.get('q') ?? '')
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? 'all')
    const [sortBy,     setSortBy]     = useState('recommended')
    const [view,       setView]       = useState('grid') // 'grid' | 'list'

    // Trae las propiedades del backend una sola vez al montar la pagina.
    // El filtro por listing_type se hace en el cliente porque el endpoint
    // GET /properties siempre devuelve todas las propiedades sin filtrar.
    useEffect(() => {
        propertyService.getAll({ listing_type: listingType })
            .then((data) => {
                const list = data.properties ?? data.data ?? data ?? []
                const result = Array.isArray(list) ? list.filter((p) => p.listing_type === listingType) : []
                setProperties(result)
            })
            .catch(() => setProperties([]))
            .finally(() => setIsLoading(false))
    }, [listingType])

    // Re-calcula la lista visible cada vez que cambia el texto buscado,
    // el tipo de propiedad seleccionado o el criterio de orden.
    const applyFilters = useCallback(() => {
        let result = [...properties]

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter((p) =>
                p.title.toLowerCase().includes(q) ||
                (p.address ?? '').toLowerCase().includes(q)
            )
        }

        if (typeFilter !== 'all') {
            result = result.filter((p) => p.property_type === typeFilter)
        }

        if (sortBy === 'price_asc')  result.sort((a, b) => a.price - b.price)
        if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
        if (sortBy === 'newest')     result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setFiltered(result)
    }, [properties, search, typeFilter, sortBy])

    useEffect(() => { applyFilters() }, [applyFilters])

    return {
        isLoading, filtered,
        search, setSearch,
        typeFilter, setTypeFilter,
        sortBy, setSortBy,
        view, setView,
    }
}

export default usePropertyListing
