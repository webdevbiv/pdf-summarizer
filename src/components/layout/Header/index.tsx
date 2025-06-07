import { useLanguage } from '../../../contexts/LanguageContext';

export default function Header() {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t.app.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        {t.app.description}
      </p>
    </div>
  );
} 