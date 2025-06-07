import { ReactNode } from 'react';
import ThemeToggle from '../../ThemeToggle';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <ThemeToggle />
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
} 