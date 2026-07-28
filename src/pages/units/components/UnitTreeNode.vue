<script setup lang="ts">
import type { UnitWithTree } from '@/types/api'
import { useUnitStore } from '@/stores/units'

defineProps<{
  node: UnitWithTree
  depth: number
}>()

const store = useUnitStore()

function getTypeIcon(name?: string): string {
  const icons: Record<string, string> = {
    'ستاد': '🏛️',
    'دانشکده': '🏫',
    'بیمارستان': '🏥',
    'مرکز': '🏢',
    'اداره': '🏛️',
    'واحد': '📋',
    'مدیریت': '📊',
  }
  return icons[name || ''] || '📁'
}
</script>

<template>
  <div>
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group border border-transparent hover:border-base-300"
      :style="{ paddingRight: `${depth * 24 + 12}px` }"
      @click="store.toggleNode(node.id)"
    >
      <!-- Toggle icon -->
      <span v-if="node.has_children" class="text-xs w-4 text-center shrink-0">
        {{ node.expanded ? '▼' : '▶' }}
      </span>
      <span v-else class="w-4 shrink-0"></span>

      <!-- Folder/Type icon -->
      <span class="text-lg shrink-0">
        <template v-if="node.expanded && node.has_children">📂</template>
        <template v-else>{{ getTypeIcon(node.unit_type?.name) }}</template>
      </span>

      <!-- Name -->
      <span class="flex-1 font-medium text-sm">{{ node.name }}</span>

      <!-- Unit Type badge -->
      <span
        v-if="node.unit_type?.name"
        class="badge badge-sm badge-outline opacity-60 hidden sm:inline"
      >
        {{ node.unit_type.name }}
      </span>

      <!-- Region -->
      <span v-if="node.region?.name" class="text-xs opacity-40 hidden md:inline">
        {{ node.region.name }}
      </span>

      <!-- Children count -->
      <span v-if="node.children?.length" class="text-xs opacity-40 shrink-0 ml-1">
        {{ node.children.length }}
      </span>
    </div>

    <!-- Recursive children -->
    <div v-if="node.expanded && node.children?.length" class="border-r-2 border-base-300 mr-3 pr-1">
      <UnitTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child as UnitWithTree"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>
