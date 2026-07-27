import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'
import type { Unit, UnitType, Region, UnitWithTree } from '@/types/api'

export const useUnitStore = defineStore('units', () => {
  const treeItems = ref<UnitWithTree[]>([])
  const allUnits = ref<Unit[]>([])
  const loading = ref(false)
  const error = ref('')

  /**
   * گرفتن لیست کامل واحدها برای ساخت درخت
   */
  async function fetchAllUnits() {
    loading.value = true
    error.value = ''
    try {
      // API returns paginated, we fetch first page with large per_page
      const { data } = await api.get('/units', { params: { per_page: 200 } })
      allUnits.value = data.data ?? []
      buildTree()
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'خطا در دریافت واحدها'
      allUnits.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * ساخت درخت از لیست واحدها (بدون نیاز به API جدا)
   */
  function buildTree() {
    const units = allUnits.value
    const map = new Map<number, UnitWithTree>()
    const roots: UnitWithTree[] = []

    // Create all nodes
    for (const u of units) {
      map.set(u.id, {
        ...u,
        depth: 0,
        has_children: false,
        expanded: false,
        loading: false,
      } as UnitWithTree)
    }

    // Build parent-child relationships
    for (const [id, node] of map) {
      if (node.parent_id && map.has(node.parent_id)) {
        const parent = map.get(node.parent_id)!
        if (!parent.children) parent.children = []
        parent.children.push(node)
        parent.has_children = true
        node.depth = (parent.depth || 0) + 1
      } else {
        roots.push(node)
      }
    }

    treeItems.value = roots
  }

  /**
   * باز/بسته کردن یک گره
   */
  function toggleNode(id: number) {
    const node = findNode(treeItems.value, id)
    if (node) {
      node.expanded = !node.expanded
    }
  }

  function findNode(nodes: UnitWithTree[], id: number): UnitWithTree | null {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children?.length) {
        const found = findNode(n.children as UnitWithTree[], id)
        if (found) return found
      }
    }
    return null
  }

  /**
   * گسترش کامل درخت
   */
  function expandAll() {
    expandAllRecursive(treeItems.value)
  }

  function expandAllRecursive(nodes: UnitWithTree[]) {
    for (const n of nodes) {
      n.expanded = true
      if (n.children?.length) {
        expandAllRecursive(n.children as UnitWithTree[])
      }
    }
  }

  /**
   * بستن کامل درخت
   */
  function collapseAll() {
    collapseAllRecursive(treeItems.value)
  }

  function collapseAllRecursive(nodes: UnitWithTree[]) {
    for (const n of nodes) {
      n.expanded = false
      if (n.children?.length) {
        collapseAllRecursive(n.children as UnitWithTree[])
      }
    }
  }

  return {
    treeItems,
    allUnits,
    loading,
    error,
    fetchAllUnits,
    toggleNode,
    expandAll,
    collapseAll,
  }
})
