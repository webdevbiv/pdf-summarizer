import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ru' | 'uk')}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="uk">Українська</option>
      </select>
    </div>
  );
} 