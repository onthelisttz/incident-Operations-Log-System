import type { StylesConfig } from 'react-select'
import Select from 'react-select'

type Option = { label: string; value: string }

type SelectInputProps = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  isLoading?: boolean
  required?: boolean
}

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? 'rgb(var(--color-line-strong))' : 'rgb(var(--color-line))',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
    borderRadius: '12px',
    minHeight: '44px',
    backgroundColor: 'rgb(var(--color-surface))',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgba(79, 70, 229, 0.12)'
      : state.isFocused
        ? 'rgba(79, 70, 229, 0.08)'
        : 'transparent',
    color: 'rgb(var(--color-ink))',
    fontSize: '0.875rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(var(--color-ink))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(var(--color-ink-subtle))',
  }),
}

const SelectInput = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  isDisabled,
  isLoading,
  required,
}: SelectInputProps) => {
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <label className="block text-sm font-medium text-ink">
      <span>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <div className="mt-2">
        <Select
          isDisabled={isDisabled}
          isLoading={isLoading}
          options={options}
          value={selected}
          onChange={(option) => onChange(option?.value ?? '')}
          placeholder={placeholder}
          styles={selectStyles}
          menuPlacement="bottom"
          menuPosition="absolute"
          menuShouldScrollIntoView
        />
      </div>
    </label>
  )
}

export default SelectInput
