export const getPasswordStrength = (password: string) => {
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const score = Object.values(rules).filter(Boolean).length
  const isStrong = score >= 4

  return { score, rules, isStrong }
}
