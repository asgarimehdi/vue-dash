import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock APIs before any imports
vi.mock('@/utils/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'
import api from '@/utils/api'

// Mock localStorage with getter for length
const createMockStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((_i: number) => null),
  }
}
const localStorageMock = createMockStorage()
Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true })

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('initializes with no token', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('initializes with existing token in localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('test-token')
    const store = useAuthStore()
    expect(store.token).toBe('test-token')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login stores token and fetches user', async () => {
    const mockToken = { token: 'new-token-123' }
    const mockUser = { id: 1, n_code: '4411015056' }

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockToken })
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser })

    const store = useAuthStore()
    await store.login({ n_code: '4411015056', password: '12345678' })

    expect(api.post).toHaveBeenCalledWith('/login', { n_code: '4411015056', password: '12345678' })
    expect(store.token).toBe('new-token-123')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token-123')
    expect(api.get).toHaveBeenCalledWith('/user')
    expect(store.user).toEqual(mockUser)
  })

  it('login handles failure gracefully', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Credentials not match'))

    const store = useAuthStore()
    try {
      await store.login({ n_code: 'wrong', password: 'wrong' })
    } catch {
      // expected
    }

    expect(store.isAuthenticated).toBe(false)
    expect(store.token).toBeNull()
  })

  it('fetchUser with invalid token calls logout', async () => {
    localStorageMock.getItem.mockReturnValueOnce('bad-token')
    const store = useAuthStore()

    vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

    // Don't trigger actual redirect
    const origLocation = window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })

    store.token = 'bad-token'
    await store.fetchUser()

    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)

    // Restore
    Object.defineProperty(window, 'location', {
      value: { href: origLocation },
      configurable: true,
    })
  })

  it('logout clears everything', () => {
    localStorageMock.getItem.mockReturnValueOnce('some-token')
    const store = useAuthStore()

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })

    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('userName returns person name when available', () => {
    const store = useAuthStore()
    store.user = {
      id: 1,
      n_code: '4411015056',
      person: { f_name: 'مهدی', l_name: 'عسگری', n_code: '4411015056' },
    }
    expect(store.userName).toBe('مهدی عسگری')
  })

  it('userName returns fallback when no person', () => {
    const store = useAuthStore()
    store.user = { id: 1, n_code: '4411015056' }
    expect(store.userName).toBe('کاربر')
  })
})
