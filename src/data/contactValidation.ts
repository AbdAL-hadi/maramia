export function isUaePhone(value: string) {
  const digits = value.trim().replace(/[٠-٩۰-۹]/gu, (digit) => String(digit.charCodeAt(0) - (digit <= '٩' ? 0x660 : 0x6f0)))
    .replace(/[\s().-]/gu, '').replace(/^(?:\+971|00971|971)0?/, '0')
  return /^0(?:5\d{8}|[234679]\d{7})$/.test(digits)
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.trim())
}
