import * as pdfjs from 'pdfjs-dist';

// Set worker source to use the legacy build
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Export a function to get a PDF document
export async function getPDFDocument(arrayBuffer: ArrayBuffer) {
  try {
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
      useWorkerFetch: true,
      isEvalSupported: true,
      disableFontFace: false
    });

    return await loadingTask.promise;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw error;
  }
}

export default pdfjs; 