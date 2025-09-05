import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNavigationStore } from '@/stores/navigation'
import { useSnackbarStore } from '@/stores/snackbar'

vi.mock('@/stores/snackbar', () => {
  return {
    useSnackbarStore: vi.fn()
  }
})

describe('Navigation Store', () => {
  let store
  let mockSnackbar

  beforeEach(() => {
    mockSnackbar = {
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn()
    }
    
    useSnackbarStore.mockReturnValue(mockSnackbar)
    
    setActivePinia(createPinia())
    store = useNavigationStore()
  })

  it('initializes with null pendingError', () => {
    expect(store.pendingError).toBe(null)
  })

  it('setError sets error type and data', () => {
    store.setError('auth_required')
    expect(store.pendingError).toEqual({ type: 'auth_required', data: {} })

    store.setError('insufficient_role', { role: 'admin' })
    expect(store.pendingError).toEqual({ type: 'insufficient_role', data: { role: 'admin' } })
  })

  it('showPendingError shows auth_required error message', () => {
    store.pendingError = { type: 'auth_required', data: {} }
    
    store.showPendingError()
    
    expect(mockSnackbar.error).toHaveBeenCalledWith('Vous devez être connecté pour accéder à cette page.')
    expect(store.pendingError).toBe(null)
  })

  it('showPendingError shows insufficient_role error message', () => {
    store.pendingError = { type: 'insufficient_role', data: { role: 'admin' } }
    
    store.showPendingError()
    
    expect(mockSnackbar.error).toHaveBeenCalledWith('Accès refusé. Vous devez avoir le rôle admin.')
    expect(store.pendingError).toBe(null)
  })

  it('showPendingError does nothing when no error', () => {
    store.pendingError = null
    
    store.showPendingError()
    
    expect(mockSnackbar.error).not.toHaveBeenCalled()
  })
})