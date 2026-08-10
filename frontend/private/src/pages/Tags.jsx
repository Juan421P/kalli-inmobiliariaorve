import CatalogPage from '@/components/catalog/catalogPage'
import { tagService } from '@/services/CatalogService'

const Tags = () => (
    <CatalogPage
        title='Etiquetas'
        subtitle='Administre las etiquetas agregadas al sistema'
        itemLabel='Etiqueta'
        inputPlaceholder='Ej. Para estudiantes...'
        service={tagService}
    />
)

export default Tags