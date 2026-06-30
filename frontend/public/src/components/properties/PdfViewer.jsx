import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'

// pdf.js corre el parseo del PDF en un web worker aparte; sin esto react-pdf
// no encuentra el worker y tira error en vez de renderizar el documento.
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

/**
 * Visor de PDF con paginacion, zoom y descarga. Generico: no sabe nada
 * de "propiedades" ni de ORVE, solo recibe la URL de un PDF y lo muestra.
 * @param {string} file - URL del PDF (import estatico de Vite o URL remota)
 * @param {string} [fileName] - nombre sugerido para el archivo al descargarlo
 */
const PdfViewer = ({ file, fileName = 'documento.pdf' }) => {
    const [numPages, setNumPages] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [scale, setScale] = useState(1)

    return (
        <div className='flex flex-col gap-2'>
            <div className='bg-white border border-orve-teal/10 rounded-2xl shadow-sm overflow-auto max-h-[65vh] flex justify-center p-4'>
                <Document
                    file={file}
                    onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(1) }}
                    loading={<p className='text-sm text-orve-teal/50 py-12'>Cargando documento...</p>}
                    error={<p className='text-sm text-red-500 py-12'>No se pudo cargar el documento.</p>}
                >
                    <Page pageNumber={pageNumber} scale={scale} />
                </Document>
            </div>

            <div className='flex items-center justify-between gap-3 bg-white/70 border border-orve-teal/10 rounded-xl px-3 py-2'>
                {numPages > 1 ? (
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                            disabled={pageNumber <= 1}
                            className='text-orve-teal/60 hover:text-orve-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            aria-label='Pagina anterior'
                        >
                            <ChevronLeft className='w-4 h-4' />
                        </button>
                        <span className='text-xs text-orve-teal/70 font-medium'>{pageNumber} / {numPages}</span>
                        <button
                            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                            disabled={pageNumber >= numPages}
                            className='text-orve-teal/60 hover:text-orve-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            aria-label='Pagina siguiente'
                        >
                            <ChevronRight className='w-4 h-4' />
                        </button>
                    </div>
                ) : <div />}

                <div className='flex items-center gap-1.5'>
                    <button
                        onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                        className='w-8 h-8 text-orve-teal/60 hover:text-orve-teal hover:bg-orve-teal/10 rounded-full flex items-center justify-center transition-colors'
                        aria-label='Alejar'
                    >
                        <ZoomOut className='w-4 h-4' />
                    </button>
                    <button
                        onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                        className='w-8 h-8 text-orve-teal/60 hover:text-orve-teal hover:bg-orve-teal/10 rounded-full flex items-center justify-center transition-colors'
                        aria-label='Acercar'
                    >
                        <ZoomIn className='w-4 h-4' />
                    </button>
                    <a
                        href={file}
                        download={fileName}
                        className='w-8 h-8 bg-orve-teal hover:bg-orve-darker-teal text-white rounded-full flex items-center justify-center transition-colors'
                        aria-label='Descargar documento'
                    >
                        <Download className='w-4 h-4' />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default PdfViewer
