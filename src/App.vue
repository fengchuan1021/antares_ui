<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showBottomNav = computed(() => route.path !== '/login')

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile } from './api/user'
import { setUser, loadUserFromStorage } from './stores/user'
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  loadUserFromStorage()
  try {
    const res = await getUserProfile()
    if (res?.data) {
      localStorage.setItem('user', JSON.stringify(res.data))
      setUser(res.data)
    }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }
})
</script>

<template>
  <div class="app-layout">
    <main class="main-content" :class="{ 'no-nav-padding': !showBottomNav }">
      <router-view />
    </main>
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 72px; /* 为底部导航栏留出空间 */
}

.main-content.no-nav-padding {
  padding-bottom: 0;
}
</style>
