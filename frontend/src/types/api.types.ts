export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    total: number
    per_page: number
  }
}
