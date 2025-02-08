export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface ApiError {
  error: string;
  status?: number;
} 