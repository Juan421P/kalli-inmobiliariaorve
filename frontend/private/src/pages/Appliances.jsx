import CatalogPage from '@/components/catalog/CatalogPage'
import { applianceService } from '@/services/catalog'

const Appliances = () => (
    <CatalogPage
        title='Electrodomésticos'
        subtitle='Administre los electrodomésticos agregados al sistema'
        itemLabel='Electrodoméstico'
        inputPlaceholder='Ej. Microondas...'
        service={applianceService}
    />
)

export default Appliances