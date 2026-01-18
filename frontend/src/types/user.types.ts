import type { UserRole } from './auth.types'

export type UserSummary = {
  id: number
  name: string
  email: string
  role: UserRole
  is_active?: boolean
  phone?: string | null
  avatar?: string | null
}
