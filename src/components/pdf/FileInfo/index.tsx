import type { PDFFile } from '../../../types';

interface FileInfoProps {
  file: PDFFile;
  onSummarize: () => void;
  isLoading: boolean;
}

export default function FileInfo({ file, onSummarize, isLoading }: FileInfoProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Selected File
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
        </p>
      </div>
      <button
        onClick={onSummarize}
        disabled={isLoading}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Summarizing...' : 'Summarize'}
      </button>
    </div>
  );
} 