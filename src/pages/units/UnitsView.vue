<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUnitStore } from '@/stores/units'
import UnitTreeNode from './components/UnitTreeNode.vue'
import type { UnitWithTree } from '@/types/api'

const store = useUnitStore()
const searchQuery = ref('')

onMounted(() => store.fetchAllUnits())

const filteredTree = computed(() => {
  if (!searchQuery.value.trim()) return store.treeItems
  const q = searchQuery.value.trim().toLowerCase()
  return filterNodes(store.treeItems, q)
})

function filterNodes(nodes: UnitWithTree[], query: string): UnitWithTree[] {
  const result: UnitWithTree[] = []
  for (const n of nodes) {
    const match = n.name.toLowerCase().includes(query)
    const filteredChildren = n.children?.length
      ? filterNodes(n.children as UnitWithTree[], query)
      : []
    if (match || filteredChildren.length > 0) {
      result.push({
        ...n,
        expanded: true,
        children: filteredChildren.length > 0 ? filteredChildren : n.children,
      } as UnitWithTree)
    }
  }
  return result
}
</script>

<template>
  <div dir="rtl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold">درختواره مراکز</h2>
      <div class="flex gap-2 flex-wrap">
        <button @click="store.expandAll()" class="btn btn-outline btn-sm">🗂️ گسترش همه</button>
        <button @click="store.collapseAll()" class="btn btn-outline btn-sm">📁 بستن همه</button>
        <button @click="store.fetchAllUnits()" :disabled="store.loading" class="btn btn-outline btn-sm">
          <span v-if="store.loading" class="loading loading-spinner loading-xs"></span>
          <span v-else>🔄</span>
          بروزرسانی
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="form-control mb-4">
      <input
        v-model="searchQuery"
        class="input input-bordered"
        placeholder="🔍 جستجوی مرکز..."
      />
    </div>

    <!-- Status -->
    <div v-if="store.loading && store.allUnits.length === 0" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="store.error" class="alert alert-error">{{ store.error }}</div>

    <div v-else-if="filteredTree.length === 0" class="text-center py-20 opacity-50">
      مرکزی یافت نشد
    </div>

    <!-- Tree -->
    <div v-else class="bg-base-100 rounded-box border border-base-300 p-3 space-y-0.5">
      <UnitTreeNode
        v-for="node in filteredTree"
        :key="node.id"
        :node="node"
        :depth="0"
      />
    </div>

    <!-- Stats -->
    <div v-if="store.allUnits.length > 0" class="mt-4 text-xs opacity-50 text-center">
      مجموعاً {{ store.allUnits.length }} مرکز
    </div>
  </div>
</template>
