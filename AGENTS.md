# H-Dashboard Vue Frontend

## نمای کلی

پروژه **vue-dash** رابط کاربری فرانت‌اند برای داشبورد مدیریت سلامت (`h-dashboard`) است. این پروژه با Vue 3 + TypeScript + DaisyUI ساخته شده و با API لاراول ارتباط برقرار می‌کند.

> **زبان**: فارسی (RTL)
> **API Base**: لاراول با Sanctum Auth
> **مود**: SPA (Single Page Application)

---

## تکنولوژی‌ها

| تکنولوژی | نسخه | توضیح |
|-----------|------|-------|
| Vue 3 | ^3.5 | Composition API + `<script setup>` |
| TypeScript | ~6.0 | type-safe |
| Vite | ^8 | build tool |
| Pinia | ^2 | state management |
| Vue Router | ^4 | routing |
| Axios | ^1 | HTTP client |
| Tailwind CSS | ^4 | utility CSS |
| DaisyUI | ^5 | UI component library |
| FullCalendar | ^7 | تقویم سازمانی |

---

## ساختار پروژه

```
vue-dash/
├── .env                    # متغیرهای محیطی (نسخه نشه)
├── .env.example            # نمونه .env
├── index.html
├── vite.config.ts          # کانفیگ Vite
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── package.json
└── src/
    ├── main.ts             # بووت اپ
    ├── App.vue             # قالب اصلی با سایدبار RTL
    ├── style.css           # Tailwind + DaisyUI themes
    ├── types/
    │   └── api.ts          # همه interfaceها و types
    ├── utils/
    │   ├── api.ts          # نمونه Axios (baseURL, interceptors)
    │   └── helpers.ts      # توابع کمکی (IP/MAC mask, تاریخ شمسی)
    ├── stores/
    │   ├── auth.ts         # احراز هویت
    │   ├── hardware.ts     # مدیریت سخت‌افزار
    │   ├── units.ts        # درختواره واحدها
    │   ├── todo.ts         # وظایف
    │   ├── TicketStore.ts  # تیکت‌ها
    │   └── data.ts         # (قدیمی) - حذف شود
    ├── router/
    │   └── index.ts        # مسیرها با lazy loading
    ├── components/
    │   └── JalaliDatePicker.vue  # انتخاب تاریخ شمسی
    └── pages/
        ├── login/LoginView.vue        # صفحه ورود
        ├── hardware/
        │   ├── HardwareView.vue        # مدیریت سخت‌افزار
        │   └── components/
        │       ├── HardwareTable.vue   # جدول موبایل/دسکتاپ
        │       ├── HardwareModal.vue   # فرم ایجاد/ویرایش
        │       └── HardwareFilters.vue # فیلترهای پیشرفته
        ├── units/
        │   ├── UnitsView.vue           # درختواره مراکز
        │   └── components/UnitTreeNode.vue
        ├── tickets/
        │   ├── TicketsView.vue         # لیست تیکت‌ها
        │   ├── TicketDetailView.vue    # جزئیات تیکت
        │   └── TicketNewView.vue       # تیکت جدید
        ├── todo/TodoView.vue           # وظایف
        ├── calendar/CalendarView.vue   # تقویم سازمانی
        └── ai/AiChatView.vue           # چت هوش مصنوعی
```

---

## API Endpoints (Laravel Backend)

همه endpointها زیر `api/` prefix هستند و با `Authorization: Bearer <token>` احراز هویت می‌شوند.

### Auth
- `POST /api/login` — ورود با `{ n_code, password }` → `{ token }`
- `GET /api/user` — اطلاعات کاربر جاری

### Hardware
- `GET /api/hardware` — لیست (پشتیبانی از page, per_page, search, type, os, cpu, ram, hdd, net_type, mark, person_name, person_ncode, unit_name, semat_name, sort_field, sort_dir)
- `POST /api/hardware` — ایجاد
- `GET /api/hardware/{id}` — جزئیات
- `PUT /api/hardware/{id}` — بروزرسانی
- `DELETE /api/hardware/{id}` — حذف

### Units (واحدها)
- `GET /api/units` — لیست صفحه‌بندی شده
- `POST /api/units` — ایجاد
- `GET /api/units/{unit}` — جزئیات
- `PUT /api/units/{unit}` — بروزرسانی
- `DELETE /api/units/{unit}` — حذف

### Tickets
- `GET /api/tickets` — لیست (فیلتر: status, priority, assigned_to_me)
- `POST /api/tickets` — ایجاد `{ subject, content, priority, unit_id }`
- `GET /api/tickets/{ticket}` — جزئیات (با activities, attachments)
- `PUT /api/tickets/{ticket}` — بروزرسانی
- `DELETE /api/tickets/{ticket}` — حذف
- `POST /api/tickets/{ticket}/assign` — ارجاع `{ user_id }`
- `POST /api/tickets/{ticket}/accept` — قبول
- `POST /api/tickets/{ticket}/complete` — تکمیل

### Todo (وظایف)
- `GET /api/todos` — لیست (فیلتر: date, month, year, is_completed)
- `POST /api/todos` — ایجاد `{ title, start_at, end_at, unit_id }`
- `GET /api/todos/{todo}` — جزئیات
- `PUT /api/todos/{todo}` — بروزرسانی
- `DELETE /api/todos/{todo}` — حذف
- `POST /api/todos/{todo}/toggle-complete` — تغییر وضعیت

### Reports
- `GET /api/reports/units` — آمار واحدها
- `GET /api/reports/todos` — آمار وظایف
- `GET /api/reports/tickets` — آمار تیکت‌ها

### AI
- `POST /api/ai/chat` — چت عمومی
- `POST /api/ai/hardware` — چت سخت‌افزار `{ message }`

---

## مدل‌های داده (TypeScript)

همه در `src/types/api.ts` تعریف شده‌اند.

### Hardware
```typescript
interface Hardware {
  id: number
  pc_name: string
  type: 'pc' | 'laptop' | 'server'
  os: string
  ip_valid: string
  ip_local: string
  mac: string
  net_type: 'wired' | 'wireless' | 'both'
  switch: string
  port: string
  vlan: string
  motherboard: string
  cpu: string
  ram: string
  hdd: string
  comments: string
  mark: boolean
  clean_at: string | null
  person_id: number | null
  person?: { f_name: string; l_name: string; n_code: string }
}
```

### Ticket
```typescript
interface Ticket {
  id: number
  ticket_code: string
  subject: string
  content: string
  priority: 'urgent' | 'normal' | 'low'
  status: 'created' | 'forwarded' | 'accepted' | 'completed' | 'rejected'
  unit_id: number
  current_assignee_id?: number
  created_at: string
  unit?: { id: number; name: string }
  assignee?: { id: number; n_code: string }
  activities?: TicketActivity[]
  waiting_duration?: { text: string; class: string }
}
```

### Todo
```typescript
interface Todo {
  id: number
  title: string
  start_at: string
  end_at: string | null
  is_completed: boolean
  unit_id: number | null
  unit?: { id: number; name: string }
}
```

### Unit (واحد سازمانی)
```typescript
interface Unit {
  id: number
  name: string
  description?: string
  parent_id?: number
  unit_type_id?: number
  region_id?: number
  lat?: number
  lng?: number
  unit_type?: { id: number; name: string }
  region?: { id: number; name: string }
  parent?: { id: number; name: string }
  children?: Unit[]
}
```

---

## تاریخ شمسی (Jalali)

از کتابخونه `jalaali-js` (۳KB، بدون وابستگی) برای تبدیل تاریخ شمسی↔میلادی استفاده می‌شه.

### توابع کمکی در `src/utils/helpers.ts`
| تابع | توضیح |
|------|-------|
| `jalaliToIso("۱۴۰۳/۰۶/۱۵")` | شمسی → میلادی (`2024-09-05`) |
| `isoToJalali("2024-09-05")` | میلادی → شمسی (`۱۴۰۳/۰۶/۱۵`) |
| `formatJalali(dateStr)` | نمایش شمسی در UI |
| `isJalaliDate(str)` | تشخیص شمسی یا میلادی بودن |
| `persianToEnglish(str)` | تبدیل اعداد فارسی/عربی به انگلیسی |

### کامپوننت انتخاب تاریخ
`JalaliDatePicker.vue` از `jalalidatepicker` برای انتخاب تاریخ شمسی استفاده می‌کنه:

```vue
<JalaliDatePicker v-model="myDate" />
```

### قانون مهم
**قبل از ارسال به API، حتماً تاریخ شمسی رو به میلادی تبدیل کن:**

```typescript
if (isJalaliDate(form.start_at)) {
  form.start_at = jalaliToIso(form.start_at)
}
```

---

## کنوانسیون‌های کدنویسی

### 1. Composition API + `<script setup>`
همه کامپوننت‌ها با `<script setup lang="ts">` نوشته بشن.
برای props از `defineProps` و برای emit از `defineEmits` استفاده کن.

### 2. State Management (Pinia)
هر ماژول فروشگاه (Store) مختص به خودش رو داره. برای فراخوانی API حتماً try/catch داشته باش.

### 3. Route Naming Convention
| صفحه | مسیر | نام |
|------|------|-----|
| ورود | `/login` | `login` |
| سخت‌افزار | `/` | `hardware` |
| واحدها | `/units` | `units` |
| تیکت‌ها | `/tickets` | `tickets` |
| تیکت جدید | `/tickets/new` | `tickets-new` |
| جزئیات تیکت | `/tickets/:id` | `ticket-detail` |
| وظایف | `/todos` | `todos` |
| تقویم | `/calendar` | `calendar` |
| چت AI | `/ai-chat` | `ai-chat` |

### 4. احراز هویت
- توکن در `localStorage` ذخیره میشه
- `api/utils/api.ts` به صورت خودکار هدر `Authorization` رو اضافه می‌کنه
- در صورت ۴۰۱، خودکار به صفحه لاگین هدایت میشه
- Vue Router guard قبل از هر مسیر محافظت‌شده چک می‌کنه

### 5. اضافه کردن بخش جدید
1. typeهای جدید رو به `src/types/api.ts` اضافه کن
2. store جدید توی `src/stores/` بساز
3. صفحه‌های جدید توی `src/pages/` بساز
4. route به `src/router/index.ts` اضافه کن
5. منو به `src/App.vue` (آرایه `navItems`) اضافه کن

### 6. قالب‌بندی HTML
- همیشه `dir="rtl"` روی المان روت صفحه
- استفاده از کلاس‌های DaisyUI
- responsive: `hidden md:block` برای دسکتاپ، `md:hidden` برای موبایل

### 7. مدیریت خطا
- حتماً try/catch توی store functions
- نمایش خطا با `alert alert-error`
- دکمه ذخیره در حین ارسال disabled بشه + loading spinner

### 8. مسیرها
- lazy loading: `component: () => import('...')`
- `meta.requiresAuth` برای مسیرهای نیازمند لاگین
- `meta.guest` برای مسیرهای مهمان (لاگین)

---

## دستورات

```bash
# توسعه
npm run dev

# بیلد
npm run build

# type check
npx vue-tsc --noEmit

# پیش‌نمایش بیلد
npm run preview
```

> `.env` رو از `.env.example` کپی کن و `VITE_API_BASE_URL` رو تنظیم کن.

---

## وضعیت پیاده‌سازی

| بخش | وضعیت | توضیحات |
|-----|--------|---------|
| 🔐 Auth | ✅ | Login + token management |
| 🖥️ Hardware | ✅ | CRUD + filters + bulk + IP/MAC mask |
| 🏢 Units | ✅ | درختواره (نیاز به CRUD کامل ندارد) |
| 🎫 Tickets | ✅ | CRUD + workflow (assign/accept/complete) |
| ✅ Todos | ✅ | CRUD + toggle + تاریخ شمسی |
| 📅 Calendar | ✅ | FullCalendar (Todo + Ticket events) |
| 🤖 AI Chat | ✅ | `/api/ai/hardware` chat |
| 📊 Reports | ❌ | نیاز به پیاده‌سازی |
| 📡 Zabbix | ❌ | نیاز به پیاده‌سازی |
