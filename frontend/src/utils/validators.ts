export const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const isValidPhoneNumber = (value: string) => {
  if (!value) return true
  const localPattern = /^0\d{9}$/
  const intlPattern = /^\+255\d{9}$/
  return localPattern.test(value) || intlPattern.test(value)
}
