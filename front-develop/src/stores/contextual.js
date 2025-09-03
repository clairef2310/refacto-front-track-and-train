import { defineStore } from 'pinia'
export const useContextualStore = defineStore('contextual', {
  state: () => ({
    userProfileId: null, // null ou string
  }),
  actions: {
    setUserProfileId(id) {
      this.userProfileId = id
    },
    clearUserProfileId() {
      this.userProfileId = null
    },
  },
})
