import * as jalaali from 'jalaali-js'

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
 * جز به جز کردن تاریخ شمسی با فرمت YYYY/MM/DD یا YYYY-MM-DD
 * پشتیبانی از اعداد فارسی و عربی (مثل ۱۴۰۳ یا ٢٠٢٤)
 */
function parseJalaliDate(jalaliStr: string): { jy: number; jm: number; jd: number } | null {
  if (!jalaliStr) return null
  // تبدیل اعداد فارسی و عربی به انگلیسی
  const normalized = persianToEnglish(jalaliStr)
  const cleaned = normalized.replace(/\//g, '-')
  const parts = cleaned.split('-')
  if (parts.length !== 3) return null
  const jy = parseInt(parts[0], 10)
  const jm = parseInt(parts[1], 10)
  const jd = parseInt(parts[2], 10)
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null
  return { jy, jm, jd }
}

/**
 * تبدیل اعداد فارسی و عربی به انگلیسی
 */
export function persianToEnglish(str: string): string {
  const persianMap: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  }
  return str.replace(/[۰-۹٠-٩]/g, (ch) => persianMap[ch] || ch)
}

/**
 * Parse an ISO/Gregorian date string to {year, month, day}
 */
function parseIsoDate(isoStr: string): { year: number; month: number; day: number } | null {
  if (!isoStr) return null
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return null
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  }
}

/**
 * تبدیل تاریخ شمسی (۱۴۰۳/۰۶/۱۵) به میلادی (2024-09-05)
 * با استفاده از jalaali-js
 */
export function jalaliToIso(jalaliStr: string): string {
  if (!jalaliStr) return ''
  const parsed = parseJalaliDate(jalaliStr)
  if (!parsed) return jalaliStr
  try {
    const greg = jalaali.toGregorian(parsed.jy, parsed.jm, parsed.jd)
    const mm = String(greg.month).padStart(2, '0')
    const dd = String(greg.day).padStart(2, '0')
    return `${greg.year}-${mm}-${dd}`
  } catch {
    return jalaliStr
  }
}

/**
 * تبدیل تاریخ شمسی به میلادی با ساعت (برای start_at و end_at کامل)
 */
export function jalaliToIsoWithTime(jalaliDate: string, time: string = '00:00'): string {
  const iso = jalaliToIso(jalaliDate)
  if (iso === jalaliDate) return jalaliDate // conversion failed
  return `${iso}T${time}:00`
}

/**
 * تبدیل تاریخ میلادی (2024-09-05) به شمسی (۱۴۰۳/۰۶/۱۵)
 */
export function isoToJalali(isoStr: string | null): string {
  if (!isoStr) return ''
  const parsed = parseIsoDate(isoStr)
  if (!parsed) return isoStr
  try {
    const jal = jalaali.toJalaali(parsed.year, parsed.month, parsed.day)
    const mm = String(jal.jm).padStart(2, '0')
    const dd = String(jal.jd).padStart(2, '0')
    return `${jal.jy}/${mm}/${dd}`
  } catch {
    return isoStr
  }
}

/**
 * نمایش تاریخ شمسی در UI
 */
export function formatJalali(dateStr: string | null): string {
  if (!dateStr) return '-'
  const iso = parseIsoDate(dateStr)
  if (!iso) {
    // شاید خودش شمسی است
    const parsed = parseJalaliDate(dateStr)
    if (parsed) {
      const mm = String(parsed.jm).padStart(2, '0')
      const dd = String(parsed.jd).padStart(2, '0')
      return `${parsed.jy}/${mm}/${dd}`
    }
    return dateStr
  }
  try {
    const jal = jalaali.toJalaali(iso.year, iso.month, iso.day)
    const mm = String(jal.jm).padStart(2, '0')
    const dd = String(jal.jd).padStart(2, '0')
    return `${jal.jy}/${mm}/${dd}`
  } catch {
    return dateStr
  }
}

/**
 * تشخیص شمسی بودن یا نبودن رشته تاریخ
 */
export function isJalaliDate(str: string): boolean {
  if (!str) return false
  const parts = str.replace(/\//g, '-').split('-')
  if (parts.length !== 3) return false
  const year = parseInt(parts[0], 10)
  // سال شمسی بین 1200 تا 1500 هست
  return year >= 1200 && year <= 1500
}

/**
 * Format date for input[type=date] (ISO)
 */
export function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ''
  // اگر شمسی بود تبدیل کن
  if (isJalaliDate(dateStr)) {
    return jalaliToIso(dateStr)
  }
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
