import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  isLoading?: boolean
}

const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  outline: 'border border-line text-ink hover:border-primary-200 hover:text-primary-600',
  ghost: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
}

const spinnerStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'border-white/60 border-t-white',
  outline: 'border-primary-200 border-t-primary-600',
  ghost: 'border-primary-200 border-t-primary-600',
}

const Button = ({ className = '', variant = 'primary', isLoading = false, disabled, children, ...props }: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${styles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={`h-4 w-4 animate-spin rounded-full border-2 ${spinnerStyles[variant]}`} />
      ) : null}
      {children}
    </button>
  )
}

export default Button
