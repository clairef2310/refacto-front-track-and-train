import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import { useSnackbarStore } from '@/stores/snackbar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    hasRole: (state) => (role) => {
      if (!state.user?.roles) return false
      if (Array.isArray(role)) {
        return state.user.roles.some((r) => role.includes(r))
      }
      return state.user.roles.includes(role)
    },
    isAdmin: (state) => state.user?.roles?.includes('admin') || false,
    isCoach: (state) => state.user?.roles?.includes('coach') || false,
    userRoles: (state) => state.user?.roles || [],
    userId: (state) => state.user?.id || null,
    userName: (state) => state.user?.name || null,
    userEmail: (state) => state.user?.email || null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return
      this.initialized = true

      if (this.token) {
        await this.fetchUser()
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      const snackbar = useSnackbarStore()
      try {
        const response = await api.post('/profiles/login', { email, password })
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)
        await this.fetchUser()
        snackbar.success(`Bienvenue ${this.user?.name || email} !`)
      } catch (err) {
        console.error('Erreur de connexion', err)
        if (err.response?.status === 401) {
          this.error = 'Identifiants incorrects. Veuillez réessayer.'
        } else if (err.response?.status === 400) {
          this.error = "Le format de l'email est invalide."
        } else {
          this.error = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
        }
        this.token = null
        snackbar.error(this.error)
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')

      const snackbar = useSnackbarStore()
      snackbar.info('Vous avez été déconnecté.')
    },

    async fetchUser() {
      if (!this.token) return
      const snackbar = useSnackbarStore()

      try {
        const response = await api.get('/profiles/me')
        this.user = response.data
        this.error = null
      } catch (err) {
        console.error('Erreur fetch user', err)
        if (err.response?.status === 401) {
          snackbar.error('Session expirée, veuillez vous reconnecter.')
          this.logout()
        }
      }
    },
    clearError() {
      this.error = null
    },
  },
})
