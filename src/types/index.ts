export interface PDFFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface SummaryResponse {
  summary: string;
  error?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
} 