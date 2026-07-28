<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/TicketStore'
import { useUnitStore } from '@/stores/units'
import { isJalaliDate, jalaliToIso } from '@/utils/helpers'
import JalaliDatePicker from '@/components/JalaliDatePicker.vue'
import type { TicketPriority } from '@/types/api'

const router = useRouter()
const store = useTicketStore()
const unitStore = useUnitStore()

const saving = ref(false)
const error = ref('')

const form = ref({
  subject: '',
  content: '',
  priority: 'normal' as TicketPriority,
  unit_id: 0,
  deadline: '',
})

onMounted(() => unitStore.fetchAllUnits())

async function handleSubmit() {
  if (!form.value.subject.trim() || !form.value.content.trim() || !form.value.unit_id) {
    error.value = 'لطفاً همه فیلدهای ضروری را پر کنید'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const payload: Parameters<typeof store.create>[0] = {
      subject: form.value.subject,
      content: form.value.content,
      priority: form.value.priority,
      unit_id: form.value.unit_id,
    }
    if (form.value.deadline) {
      payload.deadline = isJalaliDate(form.value.deadline)
        ? jalaliToIso(form.value.deadline)
        : form.value.deadline
    }

    const result = await store.create(payload)
    if (result) {
      router.push(`/tickets/${result.id}`)
    } else {
      error.value = 'خطا در ایجاد تیکت'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'خطا در ایجاد تیکت'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div dir="rtl" class="max-w-2xl mx-auto">
    <button @click="router.push('/tickets')" class="text-blue-600 hover:underline text-sm mb-4 inline-block">
      &larr; بازگشت به لیست تیکت‌ها
    </button>

    <h2 class="text-2xl font-bold mb-6">تیکت جدید 🎫</h2>

    <form @submit.prevent="handleSubmit" class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body space-y-4">
        <!-- Subject -->
        <div class="form-control">
          <label class="label"><span class="label-text">موضوع *</span></label>
          <input v-model="form.subject" required class="input input-bordered" placeholder="موضوع تیکت" />
        </div>

        <!-- Content -->
        <div class="form-control">
          <label class="label"><span class="label-text">محتوا *</span></label>
          <textarea v-model="form.content" required rows="5" class="textarea textarea-bordered" placeholder="شرح کامل درخواست..."></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Priority -->
          <div class="form-control">
            <label class="label"><span class="label-text">اولویت *</span></label>
            <select v-model="form.priority" class="select select-bordered">
              <option value="urgent">🔴 فوری</option>
              <option value="normal">🔵 معمولی</option>
              <option value="low">⚪ کم</option>
            </select>
          </div>

          <!-- Unit -->
          <div class="form-control">
            <label class="label"><span class="label-text">واحد *</span></label>
            <select v-model.number="form.unit_id" class="select select-bordered">
              <option value="0" disabled>انتخاب واحد</option>
              <option v-for="u in unitStore.allUnits" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
          </div>

          <!-- Deadline -->
          <div class="form-control">
            <label class="label"><span class="label-text">مهلت</span></label>
            <JalaliDatePicker v-model="form.deadline" />
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="alert alert-error text-sm">{{ error }}</div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <button type="submit" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="loading loading-spinner loading-sm"></span>
            {{ saving ? 'در حال ارسال...' : 'ارسال تیکت' }}
          </button>
          <button type="button" @click="router.push('/tickets')" class="btn btn-ghost">انصراف</button>
        </div>
      </div>
    </form>
  </div>
</template>
