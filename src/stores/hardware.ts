import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '@/utils/api'
import type {
  Hardware,
  HardwareFormData,
  HardwareFilters,
  PaginatedMeta,
} from '@/types/api'
import { DEFAULT_HARDWARE_FILTERS } from '@/types/api'

export const useHardwareStore = defineStore('hardware', () => {
  const items = ref<Hardware[]>([])
  const meta = ref<PaginatedMeta | null>(null)
  const current = ref<Hardware | null>(null)
  const loading = ref(false)
  const selectedIds = ref<Set<number>>(new Set())

  const filters = reactive<HardwareFilters>({ ...DEFAULT_HARDWARE_FILTERS })

  async function fetchList() {
    loading.value = true
    try {
      const params: Record<string, any> = {
        page: filters.page,
        per_page: filters.per_page,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
      }
      const filterMap: Record<string, string> = {
        search: filters.search,
        type: filters.type,
        os: filters.os,
        cpu: filters.cpu,
        ram: filters.ram,
        hdd: filters.hdd,
        net_type: filters.net_type,
        mark: filters.mark,
        shutdown: filters.shutdown,
        person: filters.person,
        unit: filters.unit,
        semat: filters.semat,
      }
      for (const [key, val] of Object.entries(filterMap)) {
        if (val) params[key] = val
      }

      const { data } = await api.get('/hardware', { params })
      // پاسخ API: { data: [...], meta: {...} }
      items.value = data.data ?? []
      meta.value = data.meta ?? null
    } catch {
      items.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number): Promise<Hardware | null> {
    try {
      const { data } = await api.get(`/hardware/${id}`)
      current.value = data.data ?? data
      return current.value!
    } catch {
      current.value = null
      return null
    }
  }

  async function create(payload: HardwareFormData): Promise<Hardware | null> {
    try {
      const { data } = await api.post('/hardware', payload)
      return data.data ?? data
    } catch {
      return null
    }
  }

  async function update(id: number, payload: Partial<HardwareFormData>): Promise<Hardware | null> {
    try {
      const { data } = await api.put(`/hardware/${id}`, payload)
      return data.data ?? data
    } catch {
      return null
    }
  }

  async function remove(id: number) {
    try {
      await api.delete(`/hardware/${id}`)
    } catch {
      // Component caller handles user-facing feedback
    }
  }

  async function bulkDelete(ids: number[]) {
    try {
      await api.post('/hardware/bulk-delete', { ids })
    } catch {
      // Component caller handles user-facing feedback
    }
  }

  async function bulkMark(ids: number[], mark: boolean) {
    try {
      await api.post('/hardware/bulk-mark', { ids, mark })
    } catch {
      // Component caller handles user-facing feedback
    }
  }

  function toggleSelect(id: number) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function selectAll(ids: number[]) {
    selectedIds.value = new Set(ids)
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function resetFilters() {
    Object.assign(filters, DEFAULT_HARDWARE_FILTERS)
  }

  function setPage(page: number) {
    filters.page = page
    fetchList()
  }

  function setSort(field: string) {
    if (filters.sort_by === field) {
      filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc'
    } else {
      filters.sort_by = field
      filters.sort_dir = 'asc'
    }
    fetchList()
  }

  function applyQuickFilter(ff: Partial<HardwareFilters>) {
    Object.assign(filters, ff)
    filters.page = 1
    fetchList()
  }

  return {
    items, meta, current, loading, selectedIds, filters,
    fetchList, fetchOne, create, update, remove,
    bulkDelete, bulkMark,
    toggleSelect, selectAll, clearSelection,
    resetFilters, setPage, setSort, applyQuickFilter,
  }
})
