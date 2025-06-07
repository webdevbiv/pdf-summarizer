type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogData {
  action: string;
  details?: unknown;
  level?: LogLevel;
}

const LOG_COLORS = {
  info: '#0ea5e9',    // Blue
  success: '#22c55e', // Green
  warning: '#eab308', // Yellow
  error: '#ef4444',   // Red
};

export function logAppAction({ action, details, level = 'info' }: LogData) {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  
  console.group(`%c${action}`, `color: ${color}; font-weight: bold`);
  console.log('%cTimestamp:', 'color: #64748b', timestamp);
  
  if (details) {
    console.log('%cDetails:', 'color: #64748b', details);
  }
  
  console.groupEnd();
}

// Specific logging functions for common actions
export const logFileUpload = (file: File) => {
  logAppAction({
    action: '📄 File Upload',
    details: {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    },
    level: 'info',
  });
};

export const logFileValidation = (file: File, isValid: boolean) => {
  logAppAction({
    action: '🔍 File Validation',
    details: {
      name: file.name,
      isValid,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    },
    level: isValid ? 'success' : 'warning',
  });
};

export const logSummarizationStart = (fileName: string) => {
  logAppAction({
    action: '🔄 Starting Summarization',
    details: { fileName },
    level: 'info',
  });
};

export const logSummarizationComplete = (fileName: string, summaryLength: number) => {
  logAppAction({
    action: '✅ Summarization Complete',
    details: {
      fileName,
      summaryLength,
    },
    level: 'success',
  });
};

export const logError = (error: unknown, context: string) => {
  logAppAction({
    action: '❌ Error',
    details: {
      context,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
};

export const logThemeChange = (theme: 'light' | 'dark') => {
  logAppAction({
    action: '🎨 Theme Changed',
    details: { theme },
    level: 'info',
  });
}; 