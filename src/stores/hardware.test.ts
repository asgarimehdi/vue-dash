import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHardwareStore } from './hardware'
import { DEFAULT_HARDWARE_FILTERS } from '@/types/api'
import api from '@/utils/api'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockHardware = [
  { id: 1, n_code: '001', pc_name: 'PC-001', type: 'pc', os: 'Windows 10', ip_valid: '192.168.1.1', cpu: 'i5', ram: '8', hdd: 'SSD 256', mark: false, person: { name: 'کاربر یک', unit: 'واحد فناوری' } },
  { id: 2, n_code: '002', pc_name: 'LAP-001', type: 'laptop', os: 'Windows 11', ip_valid: '192.168.1.2', cpu: 'i7', ram: '16', hdd: 'SSD 512', mark: true, person: { name: 'کاربر دو', unit: 'واحد شبکه' } },
]

const mockMeta = { current_page: 1, last_page: 1, per_page: 15, total: 2 }

describe('useHardwareStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches hardware list', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockHardware, meta: mockMeta } })

    const store = useHardwareStore()
    await store.fetchList()

    expect(api.get).toHaveBeenCalledWith('/hardware', expect.objectContaining({
      params: expect.objectContaining({ page: 1, per_page: 15, sort_by: 'id', sort_dir: 'desc' }),
    }))
    expect(store.items).toHaveLength(2)
    expect(store.meta?.total).toBe(2)
  })

  it('handles empty response gracefully', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

    const store = useHardwareStore()
    await store.fetchList()

    expect(store.items).toEqual([])
    expect(store.meta).toBeNull()
  })

  it('fetches single hardware item', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockHardware[0] } })

    const store = useHardwareStore()
    const result = await store.fetchOne(1)

    expect(api.get).toHaveBeenCalledWith('/hardware/1')
    expect(result.pc_name).toBe('PC-001')
  })

  it('creates hardware', async () => {
    const newItem = { n_code: '003', pc_name: 'SRV-001', type: 'server' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { id: 3, ...newItem } } })

    const store = useHardwareStore()
    const result = await store.create(newItem as any)

    expect(api.post).toHaveBeenCalledWith('/hardware', newItem)
    expect(result.id).toBe(3)
  })

  it('updates hardware', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { data: { ...mockHardware[0], pc_name: 'PC-001-UPDATED' } } })

    const store = useHardwareStore()
    const result = await store.update(1, { pc_name: 'PC-001-UPDATED' })

    expect(api.put).toHaveBeenCalledWith('/hardware/1', { pc_name: 'PC-001-UPDATED' })
    expect(result.pc_name).toBe('PC-001-UPDATED')
  })

  it('deletes hardware', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} })

    const store = useHardwareStore()
    await store.remove(1)

    expect(api.delete).toHaveBeenCalledWith('/hardware/1')
  })

  it('bulk delete sends to correct endpoint', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} })

    const store = useHardwareStore()
    await store.bulkDelete([1, 2, 3])

    expect(api.post).toHaveBeenCalledWith('/hardware/bulk-delete', { ids: [1, 2, 3] })
  })

  it('bulk mark sends to correct endpoint', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} })

    const store = useHardwareStore()
    await store.bulkMark([1, 2], true)

    expect(api.post).toHaveBeenCalledWith('/hardware/bulk-mark', { ids: [1, 2], mark: true })
  })

  it('toggleSelect adds/removes from selectedIds', () => {
    const store = useHardwareStore()
    expect(store.selectedIds.size).toBe(0)

    store.toggleSelect(1)
    expect(store.selectedIds.has(1)).toBe(true)

    store.toggleSelect(1)
    expect(store.selectedIds.has(1)).toBe(false)
  })

  it('selectAll and clearSelection work', () => {
    const store = useHardwareStore()
    store.selectAll([1, 2, 3])
    expect(store.selectedIds.size).toBe(3)

    store.clearSelection()
    expect(store.selectedIds.size).toBe(0)
  })

  it('setPage updates page and fetches', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], meta: null } })

    const store = useHardwareStore()
    store.setPage(3)

    expect(store.filters.page).toBe(3)
    expect(api.get).toHaveBeenCalled()
  })

  it('setSort toggles direction on same field', () => {
    const store = useHardwareStore()

    store.setSort('pc_name')
    expect(store.filters.sort_by).toBe('pc_name')
    expect(store.filters.sort_dir).toBe('asc')

    store.setSort('pc_name')
    expect(store.filters.sort_dir).toBe('desc')
  })

  it('applyQuickFilter sets filters and resets page', () => {
    const store = useHardwareStore()
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: null } })

    store.filters.page = 5
    store.applyQuickFilter({ type: 'laptop', mark: 'true' })

    expect(store.filters.type).toBe('laptop')
    expect(store.filters.mark).toBe('true')
    expect(store.filters.page).toBe(1)
  })

  it('resetFilters restores defaults', () => {
    const store = useHardwareStore()
    store.filters.type = 'server'
    store.filters.search = 'test'

    store.resetFilters()

    expect(store.filters.type).toBe(DEFAULT_HARDWARE_FILTERS.type)
    expect(store.filters.search).toBe(DEFAULT_HARDWARE_FILTERS.search)
    expect(store.filters.page).toBe(DEFAULT_HARDWARE_FILTERS.page)
  })
})
