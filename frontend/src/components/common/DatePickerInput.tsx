import DatePicker from 'react-datepicker'

type DatePickerInputProps = {
  label: string
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  minDate?: Date
  required?: boolean
}

const DatePickerInput = ({
  label,
  selected,
  onChange,
  placeholder,
  minDate,
  required,
}: DatePickerInputProps) => {
  return (
    <label className="block text-sm font-medium text-ink">
      <span>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <div className="mt-2">
        <DatePicker
          selected={selected}
          onChange={onChange}
          minDate={minDate}
          placeholderText={placeholder}
          dateFormat="yyyy-MM-dd"
          required={required}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink shadow-sm focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
    </label>
  )
}

export default DatePickerInput
