import { useCallback, useEffect, useState } from 'react';
import propertyService from '@/services/propertyService';

const toRad = (deg) => (deg * Math.PI) / 180;

/** Distancia aproximada en km entre la ubicacion del usuario y una propiedad
 * (formula haversine), usada para el orden "Cerca de mi". */
const distanceKm = (userCoords, property) => {
    const coords = property.location?.coordinates;
    if (!userCoords || !coords || coords.length !== 2) return Infinity;
    const [lng, lat] = coords;
    const R = 6371;
    const dLat = toRad(lat - userCoords.latitude);
    const dLng = toRad(lng - userCoords.longitude);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(userCoords.latitude)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Maneja el listado de propiedades para la pantalla de Propiedades: trae
 * todas las propiedades y aplica busqueda por texto, filtro por tipo de
 * inmueble y orden en el cliente (GET /property no soporta query params
 * todavia — ver backend/src/services/property.js getAll(), igual que en la
 * web, ver frontend/public/src/hooks/usePropertyListing.js).
 *
 * @param {'sale'|'rent'} listingType - que tipo de listado traer
 * @param {{ propertyType?: string, query?: string }} initial - filtros iniciales (via params de navegacion)
 */
const usePropertyListing = (listingType, initial = {}) => {
    const [properties, setProperties] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(initial.query ?? '');
    const [typeFilter, setTypeFilter] = useState(initial.propertyType ?? 'all');
    const [sortBy, setSortBy] = useState('recommended');
    const [view, setView] = useState('list'); // 'list' | 'map'
    const [userCoords, setUserCoords] = useState(null);

    useEffect(() => {
        propertyService.getAll()
            .then((data) => {
                const list = data?.properties ?? data?.data ?? data ?? [];
                const result = Array.isArray(list) ? list.filter((p) => p.listing_type === listingType) : [];
                setProperties(result);
            })
            .catch(() => setProperties([]))
            .finally(() => setIsLoading(false));
    }, [listingType]);

    const applyFilters = useCallback(() => {
        let result = [...properties];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((p) =>
                p.title?.toLowerCase().includes(q) ||
                (p.address ?? '').toLowerCase().includes(q)
            );
        }

        if (typeFilter !== 'all') {
            result = result.filter((p) => p.property_type === typeFilter);
        }

        if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortBy === 'distance' && userCoords) result.sort((a, b) => distanceKm(userCoords, a) - distanceKm(userCoords, b));

        setFiltered(result);
    }, [properties, search, typeFilter, sortBy, userCoords]);

    useEffect(() => { applyFilters(); }, [applyFilters]);

    return {
        isLoading, filtered,
        search, setSearch,
        typeFilter, setTypeFilter,
        sortBy, setSortBy,
        view, setView,
        userCoords, setUserCoords,
    };
};

export default usePropertyListing;
