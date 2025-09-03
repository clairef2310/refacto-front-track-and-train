import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    show: false,
    message: '',
    color: 'info',
    timeout: 4000,
  }),
  actions: {
    notify({ message, color = 'info', timeout = 4000 }) {
      this.message = message
      this.color = color
      this.timeout = timeout
      this.show = true
    },
    success(message, timeout = 4000) {
      this.notify({ message, color: 'success', timeout })
    },
    error(message, timeout = 5000) {
      this.notify({ message, color: 'error', timeout })
    },
    info(message, timeout = 4000) {
      this.notify({ message, color: 'info', timeout })
    },
    warning(message, timeout = 4000) {
      this.notify({ message, color: 'warning', timeout })
    },
    close() {
      this.show = false
    },
  },
})
