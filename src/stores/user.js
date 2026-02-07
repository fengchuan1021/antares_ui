import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role_id === 1
  },

  actions: {
    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },

    loadUserFromStorage() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        this.user = user
        return user
      } catch {
        this.user = null
        return null
      }
    },

    logout() {
      this.user = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
})
