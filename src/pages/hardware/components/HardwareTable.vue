<script setup lang="ts">
import { useHardwareStore } from '@/stores/hardware'
import { HARDWARE_TYPE_LABELS, formatDate } from '@/utils/helpers'

const store = useHardwareStore()

const emit = defineEmits<{
  (e: 'toggle-select-all'): void
  (e: 'open-edit', id: number): void
}>()

const sortField = (field: string) => store.setSort(field)

function sortIcon(field: string): string {
  if (store.filters.sort_field !== field) return '↕'
  return store.filters.sort_dir === 'asc' ? '↑' : '↓'
}

async function removeOne(id: number) {
  if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) return
  await store.remove(id)
  await store.fetchList()
}

const typeBadge: Record<string, string> = {
  pc: 'badge-info',
  laptop: 'badge-warning',
  server: 'badge-error',
}

const columns = [
  { key: 'pc_name', label: 'نام سیستم' },
  { key: 'type', label: 'نوع' },
  { key: 'os', label: 'OS' },
  { key: 'ip_valid', label: 'IP معتبر' },
  { key: 'cpu', label: 'CPU' },
  { key: 'ram', label: 'RAM' },
  { key: 'hdd', label: 'HDD' },
  { key: 'person?.f_name', label: 'پرسنل' },
]
</script>

<template>
  <!-- Desktop Table -->
  <div class="hidden md:block overflow-x-auto bg-base-100 rounded-box border border-base-300">
    <table class="table table-zebra table-pin-rows">
      <thead>
        <tr>
          <th class="w-8">
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="store.items.length > 0 && store.selectedIds.size === store.items.length"
              :indeterminate="store.selectedIds.size > 0 && store.selectedIds.size < store.items.length"
              @change="emit('toggle-select-all')"
            />
          </th>
          <th v-for="col in columns" :key="col.key" class="cursor-pointer select-none" @click="sortField(col.key)">
            {{ col.label }}
            <span class="text-xs opacity-50">{{ sortIcon(col.key) }}</span>
          </th>
          <th class="w-24">عملیات</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in store.items"
          :key="item.id"
          :class="{ 'bg-warning/20': item.mark }"
        >
          <td>
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="store.selectedIds.has(item.id)"
              @change="store.toggleSelect(item.id)"
            />
          </td>
          <td class="font-medium">{{ item.pc_name }}</td>
          <td>
            <span :class="['badge', 'badge-sm', typeBadge[item.type] || '']">
              {{ HARDWARE_TYPE_LABELS[item.type] || item.type }}
            </span>
          </td>
          <td>{{ item.os }}</td>
          <td class="font-mono text-xs">{{ item.ip_valid }}</td>
          <td>{{ item.cpu }}</td>
          <td>{{ item.ram }}</td>
          <td>{{ item.hdd }}</td>
          <td>{{ item.person?.f_name }} {{ item.person?.l_name }}</td>
          <td>
            <div class="flex gap-1">
              <button @click="emit('open-edit', item.id)" class="btn btn-ghost btn-xs">✏️</button>
              <button @click="removeOne(item.id)" class="btn btn-ghost btn-xs text-error">🗑️</button>
            </div>
          </td>
        </tr>
        <tr v-if="store.items.length === 0">
          <td :colspan="columns.length + 2" class="text-center py-10 opacity-50">داده‌ای یافت نشد</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Mobile Cards -->
  <div class="md:hidden space-y-3">
    <div
      v-for="item in store.items"
      :key="item.id"
      class="card bg-base-100 border border-base-300 shadow-sm"
      :class="{ 'border-warning/50 bg-warning/10': item.mark }"
    >
      <div class="card-body p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="store.selectedIds.has(item.id)"
              @change="store.toggleSelect(item.id)"
            />
            <div>
              <h3 class="font-bold">{{ item.pc_name }}</h3>
              <span :class="['badge', 'badge-sm', typeBadge[item.type] || '']">
                {{ HARDWARE_TYPE_LABELS[item.type] || item.type }}
              </span>
            </div>
          </div>
          <div class="flex gap-1">
            <button @click="emit('open-edit', item.id)" class="btn btn-ghost btn-xs">✏️</button>
            <button @click="removeOne(item.id)" class="btn btn-ghost btn-xs text-error">🗑️</button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3">
          <div><span class="opacity-60">OS:</span> {{ item.os }}</div>
          <div><span class="opacity-60">IP:</span> {{ item.ip_valid }}</div>
          <div><span class="opacity-60">CPU:</span> {{ item.cpu }}</div>
          <div><span class="opacity-60">RAM:</span> {{ item.ram }}</div>
          <div><span class="opacity-60">HDD:</span> {{ item.hdd }}</div>
          <div v-if="item.person"><span class="opacity-60">پرسنل:</span> {{ item.person.f_name }} {{ item.person.l_name }}</div>
        </div>
        <div v-if="item.comments" class="text-xs opacity-50 mt-2">{{ item.comments }}</div>
      </div>
    </div>
    <div v-if="store.items.length === 0" class="text-center py-10 opacity-50">داده‌ای یافت نشد</div>
  </div>

  <!-- Pagination -->
  <div v-if="store.meta && store.meta.last_page > 1" class="flex justify-center mt-6">
    <div class="join">
      <button
        v-for="p in store.meta.last_page"
        :key="p"
        @click="store.setPage(p)"
        :class="['join-item', 'btn', 'btn-sm', p === store.meta.current_page ? 'btn-primary' : 'btn-ghost']"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>
