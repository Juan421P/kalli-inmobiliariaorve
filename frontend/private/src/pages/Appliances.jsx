import CatalogPage from '@/components/catalog/catalogPage'
import { applianceService } from '@/services/CatalogService'

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