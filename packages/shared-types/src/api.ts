export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore?: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
