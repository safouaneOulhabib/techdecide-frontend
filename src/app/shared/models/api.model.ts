export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

export interface ValidationError {
  [field: string]: string;
}