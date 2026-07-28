<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePersonStore } from '@/stores/person'

const store = usePersonStore()
const searchInput = ref('')
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

onMounted(() => store.fetchList())

function applySearch() {
  store.fetchList({ search: searchInput.value || undefined })
}

function onSearchInput() {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => applySearch(), 400)
}

const totalPages = computed(() => store.meta?.last_page ?? 1)
const currentPage = computed(() => store.meta?.current_page ?? 1)

function goToPage(page: number) {
  store.fetchList({ search: searchInput.value || undefined, page })
}
</script>

<template>
  <div dir="rtl">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h2 class="text-2xl font-bold">پرسنل 👤</h2>
    </div>

    <!-- Search -->
    <div class="form-control mb-4">
      <input
        v-model="searchInput"
        @input="onSearchInput"
        class="input input-bordered"
        placeholder="🔍 جستجو بر اساس نام، نام خانوادگی یا کد ملی..."
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="alert alert-error">{{ store.error }}</div>

    <!-- Desktop Table -->
    <div v-else-if="store.items.length" class="hidden md:block overflow-x-auto bg-base-100 rounded-box border border-base-300">
      <table class="table table-pin-rows">
        <thead>
          <tr>
            <th>کد ملی</th>
            <th>نام</th>
            <th>نام خانوادگی</th>
            <th>واحد</th>
            <th>سمت</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td class="font-mono text-xs">{{ item.n_code }}</td>
            <td>{{ item.f_name }}</td>
            <td>{{ item.l_name }}</td>
            <td class="text-sm opacity-70">{{ item.unit?.name || '-' }}</td>
            <td class="text-sm opacity-70">{{ item.semat?.name || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div v-else-if="store.items.length" class="md:hidden space-y-3">
      <div v-for="item in store.items" :key="item.id" class="card bg-base-100 border border-base-300 shadow-sm">
        <div class="card-body p-4">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <p class="font-medium">{{ item.f_name }} {{ item.l_name }}</p>
              <p class="text-xs font-mono opacity-50">{{ item.n_code }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs mt-3">
            <div><span class="opacity-50">واحد:</span> {{ item.unit?.name || '-' }}</div>
            <div><span class="opacity-50">سمت:</span> {{ item.semat?.name || '-' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-20 opacity-50">
      پرسنلی یافت نشد
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="join">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="goToPage(p)"
          :class="['join-item btn btn-sm', p === currentPage ? 'btn-primary' : 'btn-ghost']"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>
