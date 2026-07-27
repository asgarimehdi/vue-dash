/* ===== Auth ===== */
export interface LoginRequest {
  n_code: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface User {
  id: number
  n_code: string
  name?: string
  person?: PersonBrief
}

export interface PersonBrief {
  f_name: string
  l_name: string
  n_code: string
}

/* ===== Person (for relationship) ===== */
export interface Person {
  id: number
  f_name: string
  l_name: string
  n_code: string
  unit?: UnitBrief
  semat?: SematBrief
}

export interface UnitBrief {
  id: number
  name: string
}

export interface SematBrief {
  id: number
  name: string
}

/* ===== Hardware ===== */
export type HardwareType = 'pc' | 'laptop' | 'server'
export type NetType = 'wired' | 'wireless' | 'both'

export interface Hardware {
  id: number
  pc_name: string
  type: HardwareType
  os: string
  ip_valid: string
  ip_local: string
  mac: string
  net_type: NetType
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
  person?: PersonBrief
  created_at?: string
  updated_at?: string
}

export interface HardwareFormData {
  pc_name: string
  type: HardwareType
  os: string
  ip_valid: string
  ip_local: string
  mac: string
  net_type: NetType
  switch: string
  port: string
  vlan: string
  motherboard: string
  cpu: string
  ram: string
  hdd: string
  comments: string
  mark: boolean
  clean_at: string
  person_id: number | null
}

/* ===== Hardware Filters ===== */
export interface HardwareFilters {
  search: string
  type: string
  os: string
  cpu: string
  ram: string
  hdd: string
  net_type: string
  mark: string
  person_name: string
  person_ncode: string
  unit_name: string
  semat_name: string
  page: number
  per_page: number
  sort_field: string
  sort_dir: 'asc' | 'desc'
}

export const DEFAULT_HARDWARE_FILTERS: HardwareFilters = {
  search: '',
  type: '',
  os: '',
  cpu: '',
  ram: '',
  hdd: '',
  net_type: '',
  mark: '',
  person_name: '',
  person_ncode: '',
  unit_name: '',
  semat_name: '',
  page: 1,
  per_page: 15,
  sort_field: 'created_at',
  sort_dir: 'desc',
}

/* ===== Quick Filters ===== */
export interface QuickFilter {
  label: string
  icon: string
  filters: Partial<HardwareFilters>
}

/* ===== Pagination ===== */
export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}

/* ===== Bulk Actions ===== */
export interface BulkAction {
  type: 'delete' | 'mark' | 'unmark'
  ids: number[]
}

/* ===== Todo ===== */
export interface Todo {
  id: number
  title: string
  start_at: string
  end_at: string | null
  is_completed: boolean
  unit_id: number | null
  created_at?: string
  updated_at?: string
  unit?: { id: number; name: string }
}

export interface TodoFormData {
  title: string
  start_at: string
  end_at: string
  unit_id: number | null
}

/* ===== AI Chat ===== */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AiChatResponse {
  status: 'ok' | 'error'
  response?: string
  message?: string
}
