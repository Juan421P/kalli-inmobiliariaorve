const PropertyService = {
    async get() {
        return [
            {
                _id: '1',
                title: 'Casa en Santa Tecla',
                property_type: 'house',
                price: 185000,
                createdAt: '2026-06-26T08:30:00Z',
                pictures: [
                    {
                        picture: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
                    },
                    {
                        picture: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
                    }
                ]
            },
            {
                _id: '2',
                title: 'Apartamento moderno',
                property_type: 'apartment',
                price: 129500,
                createdAt: '2026-06-25T17:00:00Z',
                pictures: [
                    {
                        picture: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
                    }
                ]
            },
            {
                _id: '3',
                title: 'Terreno con vista',
                property_type: 'land',
                price: 75000,
                createdAt: '2026-06-23T10:15:00Z',
                pictures: [
                    {
                        picture: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
                    },
                    {
                        picture: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800'
                    },
                    {
                        picture: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'
                    }
                ]
            }
        ];
    }
};
export default PropertyService;