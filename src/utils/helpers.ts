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
 * Format date for display
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fa-IR')
}

/**
 * Format date for input[type=date]
 */
export function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
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
