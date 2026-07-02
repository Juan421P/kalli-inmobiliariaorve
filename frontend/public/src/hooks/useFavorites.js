import { useState } from 'react'

const FAV_KEY = 'orve_favorites'

const useFavorites = () => {
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) ?? [] }
        catch { return [] }
    })

    const toggleFavorite = (property) => {
        setFavorites(prev => {
            const exists = prev.find(f => f._id === property._id)
            const next = exists
                ? prev.filter(f => f._id !== property._id)
                : [...prev, {
                    _id:       property._id,
                    public_id: property.public_id,
                    title:     property.title,
                    price:     property.price,
                    image:     property.pictures?.[0]?.picture ?? null,
                }]
            localStorage.setItem(FAV_KEY, JSON.stringify(next))
            return next
        })
    }

    const isFavorite = (id) => favorites.some(f => f._id === id)

    return { favorites, toggleFavorite, isFavorite }
}

export default useFavorites
