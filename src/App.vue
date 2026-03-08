<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const showBottomNav = computed(() => route.path !== '/login')

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile } from './api/user'
import { useUserStore } from './stores/user'
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }else{
    try {
      const result = JSON.parse(window.AndroidBridge.setToken(token))
    if (result.code === 0) {
    
    } else {
     
    }
  } catch (e) {
    console.error('设置token失败', e)
    
  }
  }
  const userStore = useUserStore()
  userStore.loadUserFromStorage()
  try {
    const res = await getUserProfile()
    if (res?.data) {
      userStore.setUser(res.data)
    }
  } catch {
    userStore.logout()
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
