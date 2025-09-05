import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

vi.mock('@/plugins/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn()
}))

describe('Auth Store', () => {
  let store
  let mockSnackbar

  beforeEach(() => {

    vi.clearAllMocks()
    localStorageMock.clear()

    mockSnackbar = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn()
    }
    useSnackbarStore.mockReturnValue(mockSnackbar)
    
    setActivePinia(createPinia())
    store = useAuthStore()
  })
  
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Actions', () => {
    it('initialize fetches user when token exists', async () => {
      store.token = 'fake-token'
      api.get.mockResolvedValueOnce({ data: { id: '123', name: 'Test User' } })

      await store.initialize()

      expect(api.get).toHaveBeenCalledWith('/profiles/me')
      expect(store.user).toEqual({ id: '123', name: 'Test User' })
    })

    it('login handles successful login', async () => {
      const userData = { id: '123', name: 'Test User', email: 'test@example.com' }
      api.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } })
      api.get.mockResolvedValueOnce({ data: userData })

      await store.login('test@example.com', 'password123')

      expect(api.post).toHaveBeenCalledWith('/profiles/login', { 
        email: 'test@example.com',
        password: 'password123'
      })
      expect(store.token).toBe('fake-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
      expect(store.user).toEqual(userData)
      expect(mockSnackbar.success).toHaveBeenCalledWith('Bienvenue Test User !')
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('login handles 401 error', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 401 } })

      await store.login('wrong@example.com', 'wrongpass')

      expect(store.error).toBe('Identifiants incorrects. Veuillez réessayer.')
      expect(store.token).toBe(null)
      expect(mockSnackbar.error).toHaveBeenCalledWith('Identifiants incorrects. Veuillez réessayer.')
      expect(store.loading).toBe(false)
    })

    it('login handles 400 error', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 400 } })

      await store.login('invalid-email', 'password123')

      expect(store.error).toBe("Le format de l'email est invalide.")
      expect(store.token).toBe(null)
      expect(mockSnackbar.error).toHaveBeenCalledWith("Le format de l'email est invalide.")
      expect(store.loading).toBe(false)
    })

    it('logout clears user data and token', () => {
      store.token = 'fake-token'
      store.user = { id: '123', name: 'Test User' }
      localStorageMock.setItem('token', 'fake-token')

      store.logout()

      expect(store.token).toBe(null)
      expect(store.user).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(mockSnackbar.info).toHaveBeenCalledWith('Vous avez été déconnecté.')
    })

    it('fetchUser handles successful fetch', async () => {
      store.token = 'fake-token'
      const userData = { id: '123', name: 'Test User' }
      api.get.mockResolvedValueOnce({ data: userData })

      await store.fetchUser()

      expect(api.get).toHaveBeenCalledWith('/profiles/me')
      expect(store.user).toEqual(userData)
      expect(store.error).toBe(null)
    })

    it('fetchUser handles 401 error', async () => {
      store.token = 'expired-token'
      api.get.mockRejectedValueOnce({ response: { status: 401 } })

      await store.fetchUser()

      expect(mockSnackbar.error).toHaveBeenCalledWith('Session expirée, veuillez vous reconnecter.')
      expect(store.token).toBe(null)
      expect(store.user).toBe(null)
    })

    it('clearError resets error state', () => {
      store.error = 'Some error'
      
      store.clearError()
      
      expect(store.error).toBe(null)
    })
  })
})