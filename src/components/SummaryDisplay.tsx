import { useLanguage } from '../../contexts/LanguageContext';

interface SummaryDisplayProps {
  summary: string;
  isLoading?: boolean;
  error?: string | null;
  plain?: boolean;
  onDownload?: () => void;
}

export default function SummaryDisplay({ summary, isLoading, error, plain }: SummaryDisplayProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow text-white bg-transparent">
        <p className="text-white">{t.summary.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow text-white bg-transparent">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-4 rounded-lg shadow text-white bg-transparent">
      <div className="max-w-none text-white">
        {plain
          ? <pre className="whitespace-pre-wrap text-white bg-transparent border-0">{summary}</pre>
          : summary.split('\n').map((line, index) => (
              <p key={index} className="text-white">{line}</p>
            ))
        }
      </div>
    </div>
  );
} 