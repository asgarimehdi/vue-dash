declare module 'jalaali-js' {
  interface JalaaliDate {
    jy: number
    jm: number
    jd: number
  }

  interface GregorianDate {
    year: number
    month: number
    day: number
  }

  export function toJalaali(year: number, month: number, day: number): JalaaliDate
  export function toGregorian(jy: number, jm: number, jd: number): GregorianDate
  export function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean
  export function isLeapJalaaliYear(jy: number): boolean
  export function jalaaliMonthLength(jy: number, jm: number): number
  export function jalCal(jy: number): { leap: number; gy: number; march: number }
  export function j2d(jy: number, jm: number, jd: number): number
  export function d2j(jdn: number): JalaaliDate
  export function g2d(gy: number, gm: number, gd: number): number
  export function d2g(jdn: number): GregorianDate
}
