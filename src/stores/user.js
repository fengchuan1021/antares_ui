import { shallowRef } from 'vue'

export const userStore = shallowRef(null)

export function setUser(user) {
  userStore.value = user
}

export function loadUserFromStorage() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    userStore.value = user
    return user
  } catch {
    userStore.value = null
    return null
  }
}
