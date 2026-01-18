import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Modal from '../components/common/Modal'
import ChangePasswordForm from '../components/auth/ChangePasswordForm'

type ChangePasswordContextValue = {
  openChangePassword: () => void
}

const ChangePasswordContext = createContext<ChangePasswordContextValue | undefined>(undefined)

type ChangePasswordProviderProps = {
  children: ReactNode
}

export const ChangePasswordProvider = ({ children }: ChangePasswordProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const openChangePassword = () => setIsOpen(true)
  const closeChangePassword = () => setIsOpen(false)

  const value = useMemo(() => ({ openChangePassword }), [])

  return (
    <ChangePasswordContext.Provider value={value}>
      {children}
      <Modal isOpen={isOpen} onClose={closeChangePassword} title="Change password">
        <ChangePasswordForm onSuccess={closeChangePassword} />
      </Modal>
    </ChangePasswordContext.Provider>
  )
}

export const useChangePassword = () => {
  const context = useContext(ChangePasswordContext)
  if (!context) {
    throw new Error('useChangePassword must be used within ChangePasswordProvider')
  }
  return context
}
