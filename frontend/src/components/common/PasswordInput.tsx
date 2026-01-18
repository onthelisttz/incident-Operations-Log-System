import { useState } from 'react'

type PasswordInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

const PasswordInput = ({ label, value, onChange, placeholder, required }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <label className="block text-sm font-medium text-ink">
      <span>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <div className="relative mt-2">
        <input
          className="w-full rounded-xl border border-line bg-surface px-4 py-2 pr-12 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-primary-600"
          onClick={() => setVisible((prev) => !prev)}
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 3L21 21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M10.8 6.3C11.2 6.2 11.6 6.1 12 6.1C16.5 6.1 20 10.2 21 12C20.5 12.8 19.3 14.4 17.6 15.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M6.4 8.4C4.7 9.6 3.5 11.2 3 12C4 13.8 7.5 17.9 12 17.9C12.4 17.9 12.8 17.9 13.2 17.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M9.2 9.2C8.8 9.6 8.6 10.2 8.6 10.8C8.6 12.5 10 13.9 11.7 13.9C12.3 13.9 12.9 13.7 13.3 13.3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12C4 10.2 7.5 6.1 12 6.1C16.5 6.1 20 10.2 21 12C20 13.8 16.5 17.9 12 17.9C7.5 17.9 4 13.8 3 12Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </button>
      </div>
    </label>
  )
}

export default PasswordInput
