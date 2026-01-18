import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/auth.types'
import { clearToken, getToken, setToken } from '../services/storage.service'
import * as authApi from '../api/auth.api'

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresPasswordChange: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [isLoading, setIsLoading] = useState(false)
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false)

  const refreshUser = useCallback(async () => {
    if (!getToken()) return
    setIsLoading(true)
    try {
      const response = await authApi.me()
      setUser(response.data.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      const payload = response.data.data
      setToken(payload.token)
      setTokenState(payload.token)
      setUser(payload.user)
      setRequiresPasswordChange(payload.requires_password_change)
      return payload.requires_password_change
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } finally {
      clearToken()
      setTokenState(null)
      setUser(null)
      setRequiresPasswordChange(false)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      void refreshUser()
    }
  }, [refreshUser, token])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      requiresPasswordChange,
      login,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, requiresPasswordChange, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
