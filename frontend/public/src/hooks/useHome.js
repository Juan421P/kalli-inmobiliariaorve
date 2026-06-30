import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import propertyService from '@/services/property'

/**
 * Logica de la pagina de inicio: trae todas las propiedades (para las
 * secciones de "Recientes"/"Populares") y maneja el buscador del Hero,
 * que al confirmar redirige a /buy con el texto buscado como query param.
 */
const useHome = () => {
    const navigate = useNavigate()
    const [search,     setSearch]     = useState('')
    const [properties, setProperties] = useState([])
    const [isLoading,  setIsLoading]  = useState(true)

    useEffect(() => {
        propertyService.getAll()
            .then((data) => {
                const list = data.properties ?? data.data ?? data ?? []
                setProperties(Array.isArray(list) ? list : [])
            })
            .catch(() => setProperties([]))
            .finally(() => setIsLoading(false))
    }, [])

    // Solo navega si hay texto; evita mandar a /buy?q= vacio.
    const handleSearch = () => {
        if (!search.trim()) return
        navigate(`/buy?q=${encodeURIComponent(search.trim())}`)
    }

    return { search, setSearch, properties, isLoading, handleSearch }
}

export default useHome
