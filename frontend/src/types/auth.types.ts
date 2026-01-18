export type UserRole = 'admin' | 'operator' | 'reporter'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string | null
  phone?: string | null
  is_active?: boolean
  is_first_login?: boolean
}

export type LoginResponse = {
  user: User
  token: string
  requires_password_change: boolean
}
