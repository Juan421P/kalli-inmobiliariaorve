import { useState, useEffect, useCallback, useRef } from 'react'
import PropertyService from '@/services/property'
const VISIBLE = 4
const CARD_W = 264
const tabs = [
    { key: 'recent', label: 'Recientes' },
    { key: 'popular', label: 'Populares' },
    { key: 'nearby', label: 'Cerca de ti' },
]
const useHome = () => {
    const [activeTab, setActiveTab] = useState('recent')
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [carouselIdx, setCarouselIdx] = useState(0)
    const [search, setSearch] = useState('')
    const carouselRef = useRef(null)
    const fetchProperties = useCallback(async () => {
        setLoading(true)
        setCarouselIdx(0)
        try {
            const data = await PropertyService.get({ limit: 8, page: 1 });
            setProperties(data);
        } catch {
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab])
    useEffect(() => { fetchProperties() }, [fetchProperties])
    const maxIdx = Math.max(0, properties.length - VISIBLE)
    const canPrev = carouselIdx > 0
    const canNext = carouselIdx < maxIdx
    const progress = maxIdx > 0 ? carouselIdx / maxIdx : 0
    const prev = () => setCarouselIdx(i => Math.max(0, i - 1))
    const next = () => setCarouselIdx(i => Math.min(maxIdx, i + 1))
    const seekTo = (fraction) => setCarouselIdx(Math.round(fraction * maxIdx))
    return {
        tabs, activeTab, setActiveTab,
        properties, loading,
        carouselRef, carouselIdx, CARD_W, progress,
        canPrev, canNext, prev, next, seekTo,
        search, setSearch,
    };
}
export default useHome;