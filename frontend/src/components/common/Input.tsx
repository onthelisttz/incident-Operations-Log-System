import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

const Input = ({ label, className = '', ...props }: InputProps) => {
  return (
    <label className="block text-sm font-medium text-ink">
      <span>
        {label}
        {props.required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <input
        className={`mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      />
    </label>
  )
}

export default Input
