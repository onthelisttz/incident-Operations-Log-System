export const appName =
  import.meta.env.VITE_APP_NAME ?? 'Incident & Operations Log System'

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

export const sanctumBaseUrl =
  import.meta.env.VITE_SANCTUM_BASE_URL ?? 'http://127.0.0.1:8000'

export const storageBaseUrl =
  import.meta.env.VITE_STORAGE_BASE_URL ?? `${sanctumBaseUrl}/storage`
