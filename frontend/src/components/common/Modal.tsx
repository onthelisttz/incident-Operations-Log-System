import type { ReactNode } from 'react'

type ModalProps = {
  isOpen: boolean
  title?: string
  children: ReactNode
  onClose: () => void
}

const Modal = ({ isOpen, title, children, onClose }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto px-4 py-10">
      <div
        className="absolute inset-0 z-[9998] bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-[9999] w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : null}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
