import CatalogPage from '@/components/catalog/CatalogPage'
import { featureService } from '@/services/CatalogService'

const Features = () => (
    <CatalogPage
        title='Características'
        subtitle='Administre las características agregadas al sistema'
        itemLabel='Característica'
        inputPlaceholder='Ej. Baldosas...'
        service={featureService}
    />
)

export default Features