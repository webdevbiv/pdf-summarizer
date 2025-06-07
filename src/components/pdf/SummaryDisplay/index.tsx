import { useLanguage } from '../../../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';

interface SummaryDisplayProps {
  summary: string;
  isLoading?: boolean;
  error?: string | null;
  plain?: boolean;
}

export default function SummaryDisplay({ summary, isLoading, error, plain }: SummaryDisplayProps) {
  const { t } = useLanguage();
  const handleDownload = () => {
    // Create a blob with the summary text
    const blob = new Blob([summary], { type: 'text/plain' });
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set the filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `summary-${timestamp}.txt`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && !summary) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-300">{t.summary.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        {plain ? (
          <pre className="whitespace-pre-wrap text-gray-900 dark:text-white text-base">{summary}</pre>
        ) : (
          <div className="prose prose-invert max-w-none text-gray-900 dark:text-white prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-ul:pl-6 prose-li:mb-1">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 