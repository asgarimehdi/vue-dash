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

/* ===== Ticket ===== */
export type TicketPriority = 'urgent' | 'normal' | 'low'
export type TicketStatus = 'created' | 'forwarded' | 'accepted' | 'completed' | 'rejected'

export interface Ticket {
  id: number
  ticket_code: string
  user_id: number
  unit_id: number
  subject: string
  content: string
  priority: TicketPriority
  status: TicketStatus
  deadline?: string
  current_assignee_id?: number
  accepted_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  unit?: { id: number; name: string }
  user?: { id: number; n_code: string }
  assignee?: { id: number; n_code: string }
  status_name?: string
  waiting_duration?: { text: string; class: string }
  activities?: TicketActivity[]
}

export interface TicketActivity {
  id: number
  description: string
  user_id?: number
  created_at: string
  user?: { id: number; n_code: string }
}

/* ===== Unit / Organization ===== */
export interface UnitType {
  id: number
  name: string
  description?: string
  allowed_parent_types?: UnitType[]
}

export interface Unit {
  id: number
  name: string
  description?: string
  region_id?: number
  parent_id?: number
  unit_type_id?: number
  lat?: number
  lng?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
  unit_type?: UnitType
  region?: Region
  parent?: UnitBrief
  children?: Unit[]
}

export interface Region {
  id: number
  name: string
  type?: string // 'province' | 'county'
  parent_id?: number
}

export interface UnitWithTree extends Unit {
  depth?: number
  has_children?: boolean
  expanded?: boolean
  loading?: boolean
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
