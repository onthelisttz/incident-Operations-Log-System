import { useEffect } from 'react'
import { appName } from '../utils/appConfig'

export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${appName}` : appName
  }, [title])
}
