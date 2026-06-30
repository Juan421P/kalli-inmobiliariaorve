
import { Info, Eye } from 'lucide-react'
import { Icon } from '@iconify/react'
import PdfViewer from '@/components/properties/PdfViewer'
import useDocumentViewer from '@/hooks/useDocumentViewer'

const WHATSAPP_NUMBER = '50322702561'

/**
 * Seccion generica "poner propiedad en venta/renta": texto explicativo,
 * boton de WhatsApp y boton para mostrar/ocultar el PDF correspondiente.
 * La usan SellProperty y RentProperty, cada una le pasa su propio texto
 * y su propio archivo PDF.
 *
 * @param {string} title - titulo de la seccion (ej. "Puesta en venta de propiedad")
 * @param {string} description - texto explicativo debajo del titulo
 * @param {string} pdfFile - URL del PDF a mostrar (import estatico de Vite)
 * @param {string} pdfFileName - nombre de archivo sugerido al descargar
 */
const PropertyFormSection = ({ title, description, pdfFile, pdfFileName }) => {
    const { isVisible: showForm, toggle: toggleForm } = useDocumentViewer()

    return (
        <section className='max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
            <div className='flex flex-col gap-5'>
                <div>
                    <h1 className='text-2xl font-bold text-orve-darker-teal leading-tight'>{title}</h1>
                    <p className='text-sm text-orve-teal/70 mt-2'>{description}</p>
                </div>

                <div className='flex items-start gap-2.5 bg-orve-teal/8 border border-orve-teal/15 rounded-xl px-4 py-3'>
                    <Info className='w-4 h-4 text-orve-teal/60 shrink-0 mt-0.5' />
                    <p className='text-xs text-orve-teal/70 leading-relaxed'>
                        Este documento debe completarse y firmarse físicamente. Para ello, puede comunicarse con nosotros vía WhatsApp.
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors'
                    >
                        <Icon icon='logos:whatsapp-icon' width={18} />
                        Contáctenos
                    </a>
                    <button
                        onClick={toggleForm}
                        className='flex items-center gap-2 bg-orve-darker-teal hover:bg-orve-teal text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors'
                    >
                        <Eye className='w-4 h-4' />
                        Ver formulario
                    </button>
                </div>
            </div>

            <div className='md:sticky md:top-20'>
                {showForm
                    ? <PdfViewer file={pdfFile} fileName={pdfFileName} />
                    : (
                        <div className='h-72 rounded-2xl border border-dashed border-orve-teal/20 bg-white/40 flex items-center justify-center text-sm text-orve-teal/40'>
                            Haga clic en "Ver formulario" para visualizar el documento
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default PropertyFormSection
