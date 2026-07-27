import moment from 'moment-jalaali'

/**
 * Format an IP address with dots as the user types (IP Masking)
 */
export function maskIP(value: string): string {
  const digits = value.replace(/[^0-9]/g, '')
  const parts: string[] = []
  for (let i = 0; i < digits.length && parts.length < 4; i++) {
    if (!parts[parts.length - 1]) {
      parts.push('')
    }
    if (parts[parts.length - 1].length < 3) {
      parts[parts.length - 1] += digits[i]
    } else {
      parts.push(digits[i])
    }
  }
  return parts.join('.')
}

/**
 * Format a MAC address with colons as the user types (MAC Masking)
 */
export function maskMAC(value: string): string {
  const hex = value.replace(/[^0-9a-fA-F]/g, '')
  const parts: string[] = []
  for (let i = 0; i < hex.length && parts.length < 6; i++) {
    if (!parts[parts.length - 1]) {
      parts.push('')
    }
    if (parts[parts.length - 1].length < 2) {
      parts[parts.length - 1] += hex[i].toUpperCase()
    } else {
      parts.push(hex[i].toUpperCase())
    }
  }
  return parts.join(':')
}

/**
 * Clean AI response from markdown code blocks
 */
export function cleanAiResponse(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').trim()
}

/**
 * Format date for display in Jalali (Persian/Solar)
 */
export function formatJalali(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format date for input[type=date] (ISO)
 */
export function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}

/**
 * Convert a Jalali date string (YYYY/MM/DD) to Gregorian ISO (YYYY-MM-DD)
 * Using moment-jalaali for accurate conversion
 */
export function jalaliToIso(jalaliStr: string): string {
  if (!jalaliStr) return ''
  try {
    // moment-jalaali handles jYear/jMonth/jDay format
    const m = moment(jalaliStr, 'jYYYY/jMM/jDD')
    if (m.isValid()) return m.format('YYYY-MM-DD')
  } catch {}
  return jalaliStr
}

/**
 * Convert ISO date (YYYY-MM-DD or ISO string) to Jalali string
 */
export function isoToJalali(isoStr: string | null): string {
  if (!isoStr) return ''
  try {
    const m = moment(isoStr)
    if (m.isValid()) return m.format('jYYYY/jMM/jDD')
  } catch {}
  return isoStr
}

export const HARDWARE_TYPE_LABELS: Record<string, string> = {
  pc: 'کامپیوتر',
  laptop: 'لپ‌تاپ',
  server: 'سرور',
}

export const NET_TYPE_LABELS: Record<string, string> = {
  wired: 'کابلی',
  wireless: 'بی‌سیم',
  both: 'هردو',
}

export const QUICK_FILTERS = [
  { label: 'لپ‌تاپ‌ها', icon: '💻', filters: { type: 'laptop' } },
  { label: 'فقط SSD', icon: '⚡', filters: { hdd: 'SSD' } },
  { label: 'رم ≥ ۱۶ گیگ', icon: '🧠', filters: { ram: '16' } },
  { label: 'علامت‌دارها', icon: '⭐', filters: { mark: 'true' } },
  { label: 'سرورها', icon: '🖥️', filters: { type: 'server' } },
]
