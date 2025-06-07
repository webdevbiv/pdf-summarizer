import { useState, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import PDFUpload from './components/PDFUpload'
import PageLayout from './components/layout/PageLayout'
import Header from './components/layout/Header'
import FileInfo from './components/pdf/FileInfo'
import ErrorMessage from './components/common/ErrorMessage'
import SummaryDisplay from './components/pdf/SummaryDisplay'
import Card from './components/common/Card'
import ModelSelector from './components/ModelSelector'
import LanguageSelector from './components/LanguageSelector'
import { ThemeProvider } from './context/ThemeContext'
import { summarizeText } from './utils/api'
import { logSummarizationStart, logSummarizationComplete, logError } from './utils/logger'
import type { PDFFile } from './types'
import { getPDFDocument } from './utils/pdfWorker'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi'
import { ImSpinner2 } from 'react-icons/im'
import ThemeSwitcher from './components/ThemeSwitcher'
import { Button } from './components/common/Card'

console.log('VITE_OPENROUTER_API_KEY present:', Boolean(import.meta.env.VITE_OPENROUTER_API_KEY));

function AppContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1:free')
  const [outputType, setOutputType] = useState<'summary' | 'plain'>('summary')
  const [output, setOutput] = useState('')
  const { t } = useLanguage()
  const [showToTop, setShowToTop] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setOutput('')
    setError(null)
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('Starting PDF extraction...');
      const arrayBuffer = await file.arrayBuffer()
      console.log('File loaded into array buffer');
      
      const pdf = await getPDFDocument(arrayBuffer)
      console.log('PDF loaded, pages:', pdf.numPages)
      
      const pageTexts = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) => {
          try {
            const page = await pdf.getPage(i + 1)
            const textContent = await page.getTextContent()
            const text = textContent.items
              .map((item: any) => item.str)
              .join(' ')
            console.log(`Page ${i + 1} extracted, length:`, text.length)
            return text
          } catch (pageError) {
            console.error(`Error extracting page ${i + 1}:`, pageError)
            throw new Error(`Failed to extract text from page ${i + 1}: ${pageError instanceof Error ? pageError.message : String(pageError)}`)
          }
        })
      )

      const fullText = pageTexts.join('\n\n')
      console.log('Text extraction complete, total length:', fullText.length)
      
      if (fullText.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF')
      }
      
      return fullText
    } catch (err) {
      console.error('PDF extraction error:', err)
      throw new Error('Failed to extract text from PDF: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Split text into parts for API (max 15000 chars per part)
  const splitTextIntoParts = (text: string, maxLen = 15000) => {
    const parts = [];
    let i = 0;
    while (i < text.length) {
      parts.push(text.slice(i, i + maxLen));
      i += maxLen;
    }
    return parts;
  };

  const handleSummarize = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      logSummarizationStart(selectedFile.name);

      // Extract text from PDF
      const extractedText = await extractTextFromPDF(selectedFile);
      console.log('Extracted text length:', extractedText.length);

      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the PDF');
      }

      // Send text to API for summarization
      console.log('Sending text to API for summarization...');
      const summaryText = await summarizeText(extractedText, selectedModel);
      console.log('Received summary from API:', summaryText);

      if (!summaryText || summaryText.trim().length === 0) {
        throw new Error('Received empty summary from API');
      }

      setSummary(summaryText);
      logSummarizationComplete(selectedFile.name, summaryText.length);
    } catch (err) {
      console.error('Summarization error:', err);
      logError(err, 'Summarization Process');
      setError(err instanceof Error ? err.message : 'An error occurred while summarizing the PDF');
      setSummary(''); // Clear any partial summary
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    setProgress(0);
    try {
      const plainText = await extractTextFromPDF(file);
      if (outputType === 'plain') {
        setOutput(plainText);
      } else {
        // Split text and summarize each part
        const parts = splitTextIntoParts(plainText, 15000);
        let combinedSummary = '';
        for (let idx = 0; idx < parts.length; idx++) {
          const part = parts[idx];
          const summary = await summarizeText(part, selectedModel);
          combinedSummary += summary + '\n\n';
          setProgress(Math.round(((idx + 1) / parts.length) * 100));
          setOutput(combinedSummary.trim());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.processingError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOutput('');
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setOutput('');
    setError(null);
  };

  // Функция для скачивания summary
  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `summary-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-6 flex flex-col md:flex-row justify-between items-center max-w-3xl mx-auto px-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{t.app.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t.app.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 w-full flex flex-col gap-8 max-w-3xl mx-auto px-4">
        {/* Form card */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-8 mb-8">
          {/* Карточка выбранного файла с иконкой и кнопкой удаления */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600 mb-6">
              <div className="flex items-center gap-3">
                <HiOutlineDocumentText className="w-7 h-7 text-primary-500" />
                <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">{selectedFile.name}</span>
                <span className="text-xs text-gray-400 ml-2">{(selectedFile.size/1024/1024).toFixed(2)} MB</span>
              </div>
              <button onClick={handleRemoveFile} className="text-red-600 hover:text-red-800 flex items-center px-2 py-1 rounded" title={t.upload.removeFile}>
                <HiOutlineTrash className="w-5 h-5" />
                <span className="hidden sm:inline ml-1">{t.upload.removeFile}</span>
              </button>
            </div>
          )}
          <PDFUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
          />
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t.modelSelector.title}</h2>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">{t.upload.outputTypeLabel}</label>
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center text-gray-900 dark:text-white text-base">
                <input
                  type="radio"
                  name="outputType"
                  value="summary"
                  checked={outputType === 'summary'}
                  onChange={() => setOutputType('summary')}
                  className="form-radio text-primary-600 w-4 h-4"
                />
                <span className="ml-2 font-medium">{t.summary.title}</span>
                <span className="ml-4 text-base text-gray-600 dark:text-white font-medium">{t.summary.summaryDesc}</span>
              </label>
              <label className="flex items-center text-gray-900 dark:text-white text-base">
                <input
                  type="radio"
                  name="outputType"
                  value="plain"
                  checked={outputType === 'plain'}
                  onChange={() => setOutputType('plain')}
                  className="form-radio text-primary-600 w-4 h-4"
                />
                <span className="ml-2 font-medium">{t.upload.plainText}</span>
                <span className="ml-4 text-base text-gray-600 dark:text-white font-medium">{t.upload.plainTextDesc}</span>
              </label>
            </div>
            <button
              onClick={() => selectedFile && handleFileUpload(selectedFile)}
              disabled={!selectedFile || isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed text-lg font-semibold transition"
            >
              {isLoading && <ImSpinner2 className="animate-spin mr-2 h-5 w-5" />}
              {t.summary.generate}
            </button>
            {outputType === 'summary' && isLoading && (
              <div className="w-full max-w-xl mx-auto my-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-primary-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-center">{progress}%</div>
              </div>
            )}
          </div>
        </section>
        {/* Result card */}
        {output && (
          <div className="relative">
            <SummaryDisplay
              summary={output}
              isLoading={isLoading}
              error={error}
              plain={outputType === 'plain'}
            />
            <div className="mt-4 flex justify-start">
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg font-semibold transition"
              >
                {t.summary.download}
              </button>
            </div>
            {showToTop && (
              <Button
                onClick={handleToTop}
                className="fixed bottom-8 right-8 shadow-lg !bg-primary-600 !text-white !rounded-full !w-14 !h-14 flex items-center justify-center text-2xl z-50"
                aria-label="To Top"
                type="button"
              >
                ↑
              </Button>
            )}
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4 mt-8">
        &copy; {new Date().getFullYear()} PDF Summarizer. <a href="https://github.com/" className="underline hover:text-primary-600">GitHub</a>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}
