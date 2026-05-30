import CatalogPage from '@/components/catalog/CatalogPage'
import { amenityService } from '@/services/catalog'

const Amenities = () => (
    <CatalogPage
        title='Amenidades'
        subtitle='Administre las amenidades agregadas al sistema'
        itemLabel='Amenidad'
        inputPlaceholder='Ej. Wi-Fi...'
        service={amenityService}
    />
)

export default Amenities