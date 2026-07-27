import { describe, it, expect } from 'vitest'
import {
  persianToEnglish,
  isJalaliDate,
  jalaliToIso,
  isoToJalali,
  formatJalali,
  maskIP,
  maskMAC,
  cleanAiResponse,
} from './helpers'

describe('persianToEnglish', () => {
  it('converts Persian numerals to English', () => {
    expect(persianToEnglish('۱۴۰۳/۰۶/۱۵')).toBe('1403/06/15')
  })

  it('converts Arabic numerals to English', () => {
    expect(persianToEnglish('٢٠٢٤/٠٩/٠٥')).toBe('2024/09/05')
  })

  it('leaves English numerals unchanged', () => {
    expect(persianToEnglish('2024/09/05')).toBe('2024/09/05')
  })

  it('handles mixed Persian and English', () => {
    expect(persianToEnglish('۱۴۰۳/09/۱۵')).toBe('1403/09/15')
  })

  it('returns empty string for empty input', () => {
    expect(persianToEnglish('')).toBe('')
  })

  it('handles mixed text', () => {
    expect(persianToEnglish('تاریخ ۱۴۰۳')).toBe('تاریخ 1403')
  })
})

describe('isJalaliDate', () => {
  it('detects Persian numeral date as Jalali', () => {
    expect(isJalaliDate('۱۴۰۳/۰۶/۱۵')).toBe(true)
  })

  it('detects English numeral date as Jalali when year >= 1200', () => {
    expect(isJalaliDate('1403/06/15')).toBe(true)
  })

  it('detects Gregorian date as NOT Jalali', () => {
    expect(isJalaliDate('2024-09-05')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isJalaliDate('')).toBe(false)
  })

  it('handles dash separator', () => {
    expect(isJalaliDate('1403-06-15')).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isJalaliDate('foo')).toBe(false)
  })
})

describe('jalaliToIso', () => {
  it('converts Persian numeral Jalali to Gregorian ISO', () => {
    expect(jalaliToIso('۱۴۰۳/۰۶/۱۵')).toBe('2024-09-05')
  })

  it('converts English numeral Jalali to Gregorian ISO', () => {
    expect(jalaliToIso('1403/06/15')).toBe('2024-09-05')
  })

  it('returns empty string for empty input', () => {
    expect(jalaliToIso('')).toBe('')
  })

  it('handles first day of year', () => {
    // 1403/01/01 = 2024-03-20
    expect(jalaliToIso('۱۴۰۳/۰۱/۰۱')).toBe('2024-03-20')
  })

  it('handles date at the end of year', () => {
    expect(jalaliToIso('۱۴۰۳/۱۲/۳۰')).toBe('2025-03-20')
  })

  it('returns input unchanged if parsing fails', () => {
    expect(jalaliToIso('not-a-date')).toBe('not-a-date')
  })
})

describe('isoToJalali', () => {
  it('converts Gregorian ISO to Jalali', () => {
    expect(isoToJalali('2024-09-05')).toBe('1403/06/15')
  })

  it('returns empty string for null/empty', () => {
    expect(isoToJalali(null)).toBe('')
    expect(isoToJalali('')).toBe('')
  })
})

describe('formatJalali', () => {
  it('formats ISO date to Jalali display', () => {
    expect(formatJalali('2024-09-05')).toBe('1403/06/15')
  })

  it('returns dash for null', () => {
    expect(formatJalali(null)).toBe('-')
  })

  it('passes through Jalali string unchanged', () => {
    expect(formatJalali('1403/06/15')).toBe('1403/06/15')
  })
})

describe('maskIP', () => {
  it('formats IP with dots as typed', () => {
    // "19216811" -> digits: [192, 168, 11] -> "192.168.11" (قاعده فعلی)
    const result = maskIP('19216811')
    expect(result.includes('.')).toBe(true)
    expect(result.split('.')[0]).toBe('192')
    expect(result.split('.')[1]).toBe('168')
  })

  it('limits to 4 octets', () => {
    const result = maskIP('1921681123456')
    const parts = result.split('.')
    expect(parts.length).toBeLessThanOrEqual(4)
  })
})

describe('maskMAC', () => {
  it('formats MAC with colons', () => {
    const result = maskMAC('aabbccddeeff')
    expect(result.includes(':')).toBe(true)
    expect(result).toBe(result.toUpperCase())
    // 12 hex chars = 6 pairs با colon = 17 کاراکتر
    expect(result.replace(/:/g, '').length).toBe(12)
  })

  it('converts lowercase to uppercase', () => {
    expect(maskMAC('aabbccddeeff')).toBe('AA:BB:CC:DD:EE:FF')
  })
})

describe('cleanAiResponse', () => {
  it('removes markdown code blocks', () => {
    const input = 'Here is the code:\n```python\nprint("hello")\n```\nEnd.'
    expect(cleanAiResponse(input)).toBe('Here is the code:\n\nEnd.')
  })

  it('returns text unchanged when no code blocks', () => {
    expect(cleanAiResponse('Hello world')).toBe('Hello world')
  })
})
