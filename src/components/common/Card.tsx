import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {children}
    </div>
  );
}

// New reusable Button component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-primary ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 