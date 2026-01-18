import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: { label: string; value: string }[]
}

const Select = ({ label, options, className = '', ...props }: SelectProps) => {
  return (
    <label className="block text-sm font-medium text-ink">
      <span>{label}</span>
      <select
        className={`mt-2 w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default Select
