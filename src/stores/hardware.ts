import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '@/utils/api'
import type {
  Hardware,
  HardwareFormData,
  HardwareFilters,
  PaginatedMeta,
  PaginatedResponse,
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
        sort_field: filters.sort_field,
        sort_dir: filters.sort_dir,
      }
      // Attach non-empty filters
      const filterMap: Record<string, string> = {
        search: filters.search,
        type: filters.type,
        os: filters.os,
        cpu: filters.cpu,
        ram: filters.ram,
        hdd: filters.hdd,
        net_type: filters.net_type,
        mark: filters.mark,
        person_name: filters.person_name,
        person_ncode: filters.person_ncode,
        unit_name: filters.unit_name,
        semat_name: filters.semat_name,
      }
      for (const [key, val] of Object.entries(filterMap)) {
        if (val) params[key] = val
      }

      const { data } = await api.get<PaginatedResponse<Hardware>>('/hardware', { params })
      items.value = data.data
      meta.value = data.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number): Promise<Hardware> {
    const { data } = await api.get<{ data: Hardware }>(`/hardware/${id}`)
    current.value = data.data
    return data.data
  }

  async function create(payload: HardwareFormData): Promise<Hardware> {
    const { data } = await api.post<{ data: Hardware }>('/hardware', payload)
    return data.data
  }

  async function update(id: number, payload: Partial<HardwareFormData>): Promise<Hardware> {
    const { data } = await api.put<{ data: Hardware }>(`/hardware/${id}`, payload)
    return data.data
  }

  async function remove(id: number) {
    await api.delete(`/hardware/${id}`)
  }

  async function bulkDelete(ids: number[]) {
    await Promise.all(ids.map((id) => api.delete(`/hardware/${id}`)))
  }

  async function bulkMark(ids: number[], mark: boolean) {
    await Promise.all(ids.map((id) => api.put(`/hardware/${id}`, { mark })))
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
    if (filters.sort_field === field) {
      filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc'
    } else {
      filters.sort_field = field
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
