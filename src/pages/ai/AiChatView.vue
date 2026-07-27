<script setup lang="ts">
import { ref, nextTick } from 'vue'
import api from '@/utils/api'
import { cleanAiResponse } from '@/utils/helpers'
import type { ChatMessage, AiChatResponse } from '@/types/api'

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: 'سلام! من دستیار هوشمند سخت‌افزار هستم. می‌توانم درباره سخت‌افزارهای ثبت‌شده به شما اطلاعات بدم و به سوالات مرتبط پاسخ بدم.',
    timestamp: new Date(),
  },
])

const input = ref('')
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const quickQuestions = [
  'وضعیت کلی سخت‌افزارها چطور است؟',
  'چند تا لپ‌تاپ داریم؟',
  'سیستم‌هایی با رم بالای ۱۶ گیگ را نمایش بده',
  'آمار کلی سرورها را بده',
  'چه سیستم‌هایی هارد SSD دارند؟',
]

async function sendMessage() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text, timestamp: new Date() })
  input.value = ''
  loading.value = true

  try {
    const { data } = await api.post<AiChatResponse>('/ai/hardware', { message: text })
    const reply = data.status === 'ok' && data.response
      ? cleanAiResponse(data.response)
      : data.message || 'پاسخی دریافت نشد'

    messages.value.push({ role: 'assistant', content: reply, timestamp: new Date() })
  } catch (e: any) {
    messages.value.push({
      role: 'assistant',
      content: '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.',
      timestamp: new Date(),
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function askQuick(q: string) {
  input.value = q
  sendMessage()
}
</script>

<template>
  <div dir="rtl" class="flex flex-col h-[calc(100vh-8rem)]">
    <h2 class="text-2xl font-bold mb-4">چت هوش مصنوعی سخت‌افزار 🤖</h2>

    <!-- Chat Messages -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-base-200 rounded-box"
    >
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['chat', msg.role === 'user' ? 'chat-end' : 'chat-start']"
      >
        <div class="chat-image avatar">
          <div class="w-10 rounded-full bg-base-300 flex items-center justify-center text-lg">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
        </div>
        <div :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble-primary' : '']">
          <p class="whitespace-pre-wrap">{{ msg.content }}</p>
        </div>
        <div class="chat-footer text-xs opacity-50 mt-1">
          {{ msg.timestamp.toLocaleTimeString('fa-IR') }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-10 rounded-full bg-base-300 flex items-center justify-center text-lg">🤖</div>
        </div>
        <div class="chat-bubble">
          <span class="loading loading-dots loading-sm"></span>
        </div>
      </div>
    </div>

    <!-- Quick Questions -->
    <div class="flex flex-wrap gap-2 mb-3">
      <button
        v-for="q in quickQuestions"
        :key="q"
        @click="askQuick(q)"
        class="btn btn-outline btn-xs"
        :disabled="loading"
      >
        {{ q }}
      </button>
    </div>

    <!-- Input -->
    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input
        v-model="input"
        class="input input-bordered flex-1"
        placeholder="سوال خود را بپرسید..."
        :disabled="loading"
      />
      <button type="submit" :disabled="loading || !input.trim()" class="btn btn-primary">
        {{ loading ? '...' : 'ارسال' }}
      </button>
    </form>
  </div>
</template>
