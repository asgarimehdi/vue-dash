<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { useHardwareStore } from '@/stores/hardware'
import { formatJalali } from '@/utils/helpers'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import type { TodoFormData } from '@/types/api'

const store = useTodoStore()
const unitStore = useHardwareStore()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const filter = ref<'all' | 'pending' | 'completed'>('all')
const monthFilter = ref<string>('')

const form = ref<TodoFormData>({
  title: '',
  start_at: '',
  end_at: '',
  unit_id: null,
})

onMounted(() => {
  load()
  unitStore.fetchList()
})

async function load() {
  const params: any = {}
  if (filter.value === 'pending') params.is_completed = false
  else if (filter.value === 'completed') params.is_completed = true
  if (monthFilter.value) {
    const [y, m] = monthFilter.value.split('-')
    params.year = parseInt(y)
    params.month = parseInt(m)
  }
  await store.fetchList(params)
}

function openCreate() {
  editingId.value = null
  form.value = { title: '', start_at: '', end_at: '', unit_id: null }
  showModal.value = true
}

function openEdit(todo: any) {
  editingId.value = todo.id
  form.value = {
    title: todo.title,
    start_at: todo.start_at || '',
    end_at: todo.end_at || '',
    unit_id: todo.unit_id,
  }
  showModal.value = true
}

async function save() {
  if (editingId.value) {
    await store.update(editingId.value, form.value)
  } else {
    await store.create(form.value)
  }
  showModal.value = false
  await load()
}

async function toggleTodo(id: number) {
  await store.toggleComplete(id)
  await load()
}

async function deleteTodo(id: number) {
  if (!confirm('آیا از حذف این وظیفه اطمینان دارید؟')) return
  await store.remove(id)
  await load()
}

const pendingCount = computed(() => store.items.filter(i => !i.is_completed).length)
const completedCount = computed(() => store.items.filter(i => i.is_completed).length)
</script>

<template>
  <div dir="rtl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h2 class="text-2xl font-bold">وظایف (Todo)</h2>
        <div class="flex gap-3 text-sm opacity-60 mt-1">
          <span class="text-warning font-medium">{{ pendingCount }} در انتظار</span>
          <span class="text-success font-medium">{{ completedCount }} تکمیل</span>
        </div>
      </div>
      <button @click="openCreate" class="btn btn-primary">+ وظیفه جدید</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <div class="join">
        <button @click="filter = 'all'; load()" :class="['join-item btn btn-sm', filter === 'all' ? 'btn-active' : '']">همه</button>
        <button @click="filter = 'pending'; load()" :class="['join-item btn btn-sm', filter === 'pending' ? 'btn-active' : '']">در انتظار</button>
        <button @click="filter = 'completed'; load()" :class="['join-item btn btn-sm', filter === 'completed' ? 'btn-active' : '']">تکمیل</button>
      </div>
      <input v-model="monthFilter" type="month" @change="load" class="input input-bordered input-sm" />
    </div>

    <!-- Todo List -->
    <div class="space-y-2">
      <div
        v-for="todo in store.items"
        :key="todo.id"
        class="card bg-base-100 border border-base-300 shadow-sm"
      >
        <div class="card-body p-4">
          <div class="flex items-start gap-3">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="todo.is_completed"
              @change="toggleTodo(todo.id)"
              class="checkbox checkbox-success mt-1"
            />

            <div class="flex-1 min-w-0">
              <!-- Title -->
              <p :class="['font-medium', todo.is_completed ? 'line-through opacity-50' : '']">
                {{ todo.title }}
              </p>

              <!-- Meta with Jalali dates -->
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-60 mt-1">
                <span v-if="todo.start_at">📅 شروع: {{ formatJalali(todo.start_at) }}</span>
                <span v-if="todo.end_at">🔚 پایان: {{ formatJalali(todo.end_at) }}</span>
                <span v-if="todo.unit">🏢 {{ todo.unit.name }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-1">
              <button @click="openEdit(todo)" class="btn btn-ghost btn-xs">✏️</button>
              <button @click="deleteTodo(todo.id)" class="btn btn-ghost btn-xs text-error">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.items.length === 0" class="text-center py-10 opacity-50">
        وظیفه‌ای یافت نشد
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal modal-open" @click.self="showModal = false">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4">{{ editingId ? 'ویرایش وظیفه' : 'وظیفه جدید' }}</h3>
        <form @submit.prevent="save" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">عنوان *</span></label>
            <input v-model="form.title" required class="input input-bordered" placeholder="عنوان وظیفه" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label"><span class="label-text">تاریخ شروع *</span></label>
              <JalaliDatePicker v-model="form.start_at" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">تاریخ پایان</span></label>
              <JalaliDatePicker v-model="form.end_at" />
            </div>
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'بروزرسانی' : 'ایجاد' }}</button>
            <button type="button" @click="showModal = false" class="btn btn-ghost">انصراف</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
