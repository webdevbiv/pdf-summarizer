import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../contexts/LanguageContext';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

export default function PDFUpload({ onFileSelect, selectedFile }: PDFUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t.errors.fileTooLarge);
      return;
    }

    if (file.type !== 'application/pdf') {
      setError(t.errors.invalidFormat);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [onFileSelect, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    disabled: !!selectedFile,
  });

  if (selectedFile) return null;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors bg-white dark:bg-gray-800 shadow
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {isDragActive ? t.upload.dragAndDrop : t.upload.selectFile}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t.upload.maxSize}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.upload.supportedFormats}
          </p>
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
} 