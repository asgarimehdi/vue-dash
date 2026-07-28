import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitStore } from './units'
import api from '@/utils/api'
import type { UnitWithTree } from '@/types/api'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockUnits = [
  { id: 1, name: 'وزارت بهداشت', parent_id: null, unit_type: { id: 1, name: 'وزارت' }, region: { id: 1, name: 'تهران' } },
  { id: 2, name: 'دانشگاه علوم پزشکی', parent_id: 1, unit_type: { id: 2, name: 'دانشکده' }, region: { id: 2, name: 'اصفهان' } },
  { id: 3, name: 'بیمارستان شریعتی', parent_id: 2, unit_type: { id: 3, name: 'بیمارستان' }, region: { id: 2, name: 'اصفهان' } },
  { id: 4, name: 'شبکه بهداشت', parent_id: 1, unit_type: { id: 4, name: 'شبکه' }, region: { id: 3, name: 'شیراز' } },
]

describe('useUnitStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches all units and builds tree', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockUnits, meta: { total: 4 } } })

    const store = useUnitStore()
    await store.fetchAllUnits()

    expect(store.allUnits).toHaveLength(4)
    expect(api.get).toHaveBeenCalledWith('/units', { params: { per_page: 200 } })

    // Tree should have 1 root (وزارت بهداشت)
    expect(store.treeItems).toHaveLength(1)
    expect(store.treeItems[0].name).toBe('وزارت بهداشت')

    // وزارت بهداشت should have 2 children: دانشگاه and شبکه
    expect(store.treeItems[0].children).toHaveLength(2)
    expect(store.treeItems[0].has_children).toBe(true)
  })

  it('handles fetch error gracefully', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

    const store = useUnitStore()
    await store.fetchAllUnits()

    expect(store.allUnits).toEqual([])
    expect(store.error).toBeTruthy()
  })

  it('builds correct tree depth', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockUnits } })

    const store = useUnitStore()
    await store.fetchAllUnits()

    // Hospital should be at depth 2
    const hospital = store.treeItems[0].children![0].children![0]
    expect(hospital.name).toBe('بیمارستان شریعتی')
    expect((hospital as any).depth).toBe(2)
  })

  it('toggleNode expands/collapses after fetch', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockUnits } })

    const store = useUnitStore()
    await store.fetchAllUnits()

    const root = store.treeItems[0]
    expect(root.expanded).toBe(false)

    store.toggleNode(root.id)
    expect(root.expanded).toBe(true)

    store.toggleNode(root.id)
    expect(root.expanded).toBe(false)
  })

  it('expandAll expands all nodes after fetch', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockUnits } })

    const store = useUnitStore()
    await store.fetchAllUnits()

    store.expandAll()

    const checkExpanded = (nodes: UnitWithTree[]) => {
      for (const n of nodes) {
        expect(n.expanded).toBe(true)
        if (n.children?.length) checkExpanded(n.children as UnitWithTree[])
      }
    }
    checkExpanded(store.treeItems)
  })

  it('collapseAll collapses all nodes', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockUnits } })

    const store = useUnitStore()
    await store.fetchAllUnits()

    store.expandAll()
    store.collapseAll()

    const checkCollapsed = (nodes: UnitWithTree[]) => {
      for (const n of nodes) {
        expect(n.expanded).toBe(false)
        if (n.children?.length) checkCollapsed(n.children as UnitWithTree[])
      }
    }
    checkCollapsed(store.treeItems)
  })

  it('toggles loading state during fetch', async () => {
    vi.mocked(api.get).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ data: { data: mockUnits } }), 50)
      })
    })

    const store = useUnitStore()
    const fetchPromise = store.fetchAllUnits()

    expect(store.loading).toBe(true)

    await fetchPromise
    expect(store.loading).toBe(false)
  })
})
