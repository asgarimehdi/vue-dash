import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTicketStore } from './TicketStore'
import api from '@/utils/api'

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockTickets = [
  { id: 1, ticket_code: 'T-ABC123', subject: 'نیاز به تعمیر', content: 'سیستم تهویه مشکل دارد', priority: 'urgent', status: 'created', unit_id: 1, unit: { id: 1, name: 'واحد فنی' }, created_at: '2024-09-05T10:00:00.000000Z' },
  { id: 2, ticket_code: 'T-DEF456', subject: 'درخواست نرم‌افزار', content: 'نیاز به نصب Office دارم', priority: 'normal', status: 'accepted', unit_id: 2, unit: { id: 2, name: 'واحد اداری' }, assignee: { id: 1, n_code: '001' }, created_at: '2024-09-06T10:00:00.000000Z' },
]

const mockMeta = { current_page: 1, last_page: 1, per_page: 20, total: 2 }

describe('useTicketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches ticket list', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockTickets, meta: mockMeta } })

    const store = useTicketStore()
    await store.fetchAll()

    expect(store.tickets).toHaveLength(2)
    expect(store.meta?.total).toBe(2)
  })

  it('handles empty ticket response', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

    const store = useTicketStore()
    await store.fetchAll()

    expect(store.tickets).toEqual([])
    expect(store.meta).toBeNull()
  })

  it('fetchAll sends filter params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], meta: null } })

    const store = useTicketStore()
    await store.fetchAll({ status: 'created', priority: 'urgent', assigned_to_me: true })

    expect(api.get).toHaveBeenCalledWith('/tickets', {
      params: { status: 'created', priority: 'urgent', assigned_to_me: true },
    })
  })

  it('fetches single ticket', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockTickets[0] } })

    const store = useTicketStore()
    const result = await store.fetchOne(1)

    expect(api.get).toHaveBeenCalledWith('/tickets/1')
    expect(result?.subject).toBe('نیاز به تعمیر')
  })

  it('handles fetchOne failure', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Not found'))

    const store = useTicketStore()
    const result = await store.fetchOne(999)

    expect(result).toBeNull()
  })

  it('creates ticket', async () => {
    const newTicket = { subject: 'تیکت تست', content: 'متن تست', priority: 'normal' as const, unit_id: 1 }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { id: 3, ...newTicket, status: 'created' } } })

    const store = useTicketStore()
    const result = await store.create(newTicket)

    expect(api.post).toHaveBeenCalledWith('/tickets', newTicket)
    expect(result?.id).toBe(3)
  })

  it('creates ticket with deadline', async () => {
    const newTicket = { subject: 'تیکت', content: 'متن', priority: 'normal' as const, unit_id: 1, deadline: '2024-09-20' }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { id: 4, ...newTicket, status: 'created' } } })

    const store = useTicketStore()
    await store.create(newTicket)

    expect(api.post).toHaveBeenCalledWith('/tickets', expect.objectContaining({
      deadline: '2024-09-20',
    }))
  })

  it('assigns ticket', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...mockTickets[0], status: 'forwarded', current_assignee_id: 2 } } })

    const store = useTicketStore()
    const result = await store.assign(1, 2)

    expect(api.post).toHaveBeenCalledWith('/tickets/1/assign', { assignee_id: 2 })
    expect(result?.status).toBe('forwarded')
  })

  it('accepts ticket', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...mockTickets[0], status: 'accepted' } } })

    const store = useTicketStore()
    const result = await store.accept(1)

    expect(api.post).toHaveBeenCalledWith('/tickets/1/accept')
    expect(result?.status).toBe('accepted')
  })

  it('completes ticket', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { ...mockTickets[1], status: 'completed' } } })

    const store = useTicketStore()
    const result = await store.complete(2)

    expect(api.post).toHaveBeenCalledWith('/tickets/2/complete')
    expect(result?.status).toBe('completed')
  })

  it('deletes ticket', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({})

    const store = useTicketStore()
    await store.remove(1)

    expect(api.delete).toHaveBeenCalledWith('/tickets/1')
  })

  it('handles delete error', async () => {
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('Network error'))

    const store = useTicketStore()
    const result = await store.remove(999)

    expect(result).toBe(false)
  })

  it('updates ticket', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { data: { ...mockTickets[0], subject: 'به‌روز شده' } } })

    const store = useTicketStore()
    const result = await store.update(1, { subject: 'به‌روز شده' })

    expect(api.put).toHaveBeenCalledWith('/tickets/1', { subject: 'به‌روز شده' })
    expect(result?.subject).toBe('به‌روز شده')
  })
})
