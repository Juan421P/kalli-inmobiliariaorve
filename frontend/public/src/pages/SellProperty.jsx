import Navbar from '@/components/Navbar'
import PropertyFormSection from '@/components/properties/PropertyFormSection'
import coolBg from '@/assets/cool-ass-design-for-the-background.png'
import tomaDePropiedadVenta from '@/assets/documents/toma-de-propiedad-venta.pdf'

// Pagina publica con el contenido para poner una propiedad en venta;
// no tiene logica propia, solo le pasa su texto y su PDF a PropertyFormSection.
const SellProperty = () => (
    <div className='relative min-h-screen w-full isolate'>
        <div
            className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45'
            style={{ backgroundImage: `url(${coolBg})` }}
        />
        <Navbar />
        <div className='pt-14'>
            <PropertyFormSection
                title='Puesta en venta de propiedad'
                description='Para poner su propiedad en venta, es necesario completar y firmar el formulario de Toma de Propiedad.'
                pdfFile={tomaDePropiedadVenta}
                pdfFileName='toma-de-propiedad-venta.pdf'
            />
        </div>
    </div>
)

export default SellProperty
