import { storageBaseUrl } from './appConfig'

export const getFileUrl = (path?: string | null) => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const normalized = path.replace(/^\/+/, '')
  return `${storageBaseUrl}/${normalized}`
}
