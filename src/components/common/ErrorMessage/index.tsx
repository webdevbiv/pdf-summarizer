interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-md">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
} 