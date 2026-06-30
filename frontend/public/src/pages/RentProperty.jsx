import Navbar from '@/components/Navbar'
import PropertyFormSection from '@/components/properties/PropertyFormSection'
import coolBg from '@/assets/cool-ass-design-for-the-background.png'
import formularioArrendamiento from '@/assets/documents/formulario-arrendamiento.pdf'

// Pagina publica con el contenido para poner una propiedad en alquiler;
// no tiene logica propia, solo le pasa su texto y su PDF a PropertyFormSection.
const RentProperty = () => (
    <div className='relative min-h-screen w-full isolate'>
        <div
            className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45'
            style={{ backgroundImage: `url(${coolBg})` }}
        />
        <Navbar />
        <div className='pt-14'>
            <PropertyFormSection
                title='Puesta en renta de propiedad'
                description='Para poner su propiedad en alquiler, es necesario completar y firmar el Formulario de Arrendamiento.'
                pdfFile={formularioArrendamiento}
                pdfFileName='formulario-arrendamiento.pdf'
            />
        </div>
    </div>
)

export default RentProperty
