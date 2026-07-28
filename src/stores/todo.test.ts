import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from './todo'
import api from '@/utils/api'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockTodos = [
  { id: 1, title: 'جلسه فنی', start_at: '2024-09-05 10:00:00', end_at: '2024-09-05 12:00:00', is_completed: false, unit_id: null, unit: null },
  { id: 2, title: 'گزارش ماهانه', start_at: '2024-09-10 08:00:00', end_at: null, is_completed: true, unit_id: 1, unit: { id: 1, name: 'واحد فناوری' } },
]

describe('useTodoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches todo list (array response)', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTodos })

    const store = useTodoStore()
    await store.fetchList()

    expect(store.items).toHaveLength(2)
    expect(store.items[0].title).toBe('جلسه فنی')
  })

  it('fetches todo list (paginated response)', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockTodos, meta: { total: 2 } } })

    const store = useTodoStore()
    await store.fetchList()

    expect(store.items).toHaveLength(2)
  })

  it('handles fetch error gracefully', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

    const store = useTodoStore()
    await store.fetchList()

    expect(store.items).toEqual([])
  })

  it('fetchList sends correct filter params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] })

    const store = useTodoStore()
    await store.fetchList({ is_completed: false, year: 1403, month: 6 })

    expect(api.get).toHaveBeenCalledWith('/todos', {
      params: { is_completed: false, year: 1403, month: 6 },
    })
  })

  it('creates todo', async () => {
    const newTodo = { title: 'تست جدید', start_at: '2024-09-05 10:00:00', end_at: '', unit_id: null }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { id: 3, ...newTodo, is_completed: false } } })

    const store = useTodoStore()
    const result = await store.create(newTodo)

    expect(api.post).toHaveBeenCalledWith('/todos', newTodo)
    expect(result.id).toBe(3)
  })

  it('updates todo', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { data: { ...mockTodos[0], title: 'بروز شده' } } })

    const store = useTodoStore()
    const result = await store.update(1, { title: 'بروز شده' })

    expect(api.put).toHaveBeenCalledWith('/todos/1', { title: 'بروز شده' })
    expect(result.title).toBe('بروز شده')
  })

  it('deletes todo', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({})

    const store = useTodoStore()
    await store.remove(1)

    expect(api.delete).toHaveBeenCalledWith('/todos/1')
  })

  it('toggles todo completion', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...mockTodos[0], is_completed: true } } })

    const store = useTodoStore()
    const result = await store.toggleComplete(1)

    expect(api.post).toHaveBeenCalledWith('/todos/1/toggle-complete')
    expect(result).not.toBeNull()
    expect(result!.is_completed).toBe(true)
  })
})
