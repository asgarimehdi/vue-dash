<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const n_code = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ n_code: n_code.value, password: password.value })
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'خطا در ورود به سیستم'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="hero min-h-screen bg-base-200" dir="rtl">
    <div class="hero-content w-full max-w-md">
      <div class="card bg-base-100 w-full shadow-2xl">
        <div class="card-body p-8">
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold">H-Dashboard</h1>
            <p class="text-base-content/60 mt-2">ورود به پنل مدیریت سخت‌افزار</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">کد ملی</span>
              </label>
              <input
                v-model="n_code"
                type="text"
                required
                class="input input-bordered"
                placeholder="کد ملی خود را وارد کنید"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">رمز عبور</span>
              </label>
              <input
                v-model="password"
                type="password"
                required
                class="input input-bordered"
                placeholder="رمز عبور خود را وارد کنید"
              />
            </div>

            <div v-if="error" class="alert alert-error text-sm">{{ error }}</div>

            <button
              type="submit"
              :disabled="loading"
              class="btn btn-primary w-full"
            >
              {{ loading ? 'در حال ورود...' : 'ورود' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
