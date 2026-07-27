<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHardwareStore } from '@/stores/hardware'
import { QUICK_FILTERS } from '@/utils/helpers'
import HardwareTable from './components/HardwareTable.vue'
import HardwareModal from './components/HardwareModal.vue'
import HardwareFilters from './components/HardwareFilters.vue'

const store = useHardwareStore()

const showModal = ref(false)
const editingId = ref<number | null>(null)

onMounted(() => {
  store.fetchList()
})

function openCreate() {
  editingId.value = null
  showModal.value = true
}

function openEdit(id: number) {
  editingId.value = id
  showModal.value = true
}

async function onSaved() {
  showModal.value = false
  editingId.value = null
  await store.fetchList()
}

async function onBulkDelete() {
  const count = store.selectedIds.size
  if (!confirm(`آیا از حذف ${count} آیتم اطمینان دارید؟`)) return
  await store.bulkDelete([...store.selectedIds])
  store.clearSelection()
  await store.fetchList()
}

async function onBulkMark(mark: boolean) {
  await store.bulkMark([...store.selectedIds], mark)
  store.clearSelection()
  await store.fetchList()
}

function onQuickFilter(ff: any) {
  store.applyQuickFilter(ff)
}

function toggleSelectAll() {
  if (store.selectedIds.size === store.items.length) {
    store.clearSelection()
  } else {
    store.selectAll(store.items.map((i) => i.id))
  }
}
</script>

<template>
  <div dir="rtl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold">مدیریت سخت‌افزار</h2>
      <div class="flex gap-2 flex-wrap">
        <!-- Bulk Actions -->
        <div v-if="store.selectedIds.size > 0" class="flex gap-2 items-center">
          <span class="text-sm font-medium">{{ store.selectedIds.size }} انتخاب</span>
          <button @click="onBulkDelete" class="btn btn-error btn-sm">🗑️ حذف</button>
          <button @click="onBulkMark(true)" class="btn btn-warning btn-sm">⭐ علامت‌دار</button>
          <button @click="onBulkMark(false)" class="btn btn-ghost btn-sm">取消 علامت</button>
        </div>
        <button @click="openCreate" class="btn btn-primary">
          + سخت‌افزار جدید
        </button>
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="qf in QUICK_FILTERS"
        :key="qf.label"
        @click="onQuickFilter(qf.filters)"
        class="btn btn-outline btn-sm gap-1"
      >
        <span>{{ qf.icon }}</span>
        <span>{{ qf.label }}</span>
      </button>
      <button
        @click="store.resetFilters(); store.fetchList()"
        class="btn btn-ghost btn-sm text-error"
      >
        ✕ پاک کردن فیلترها
      </button>
    </div>

    <!-- Advanced Filters -->
    <HardwareFilters />

    <!-- Table -->
    <HardwareTable
      @toggle-select-all="toggleSelectAll"
      @open-edit="openEdit"
    />

    <!-- Modal -->
    <HardwareModal
      v-if="showModal"
      :edit-id="editingId"
      @close="showModal = false"
      @saved="onSaved"
    />
  </div>
</template>
