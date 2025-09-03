import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    pendingError: null,
  }),

  actions: {
    setError(type, data = {}) {
      this.pendingError = { type, data }
    },

    showPendingError() {
      if (!this.pendingError) return

      const snackbar = useSnackbarStore()

      switch (this.pendingError.type) {
        case 'auth_required':
          snackbar.error('Vous devez être connecté pour accéder à cette page.')
          break
        case 'insufficient_role':
          snackbar.error(`Accès refusé. Vous devez avoir le rôle ${this.pendingError.data.role}.`)
          break
      }

      this.pendingError = null
    },
  },
})
