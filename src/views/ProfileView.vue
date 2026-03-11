<template>
  <div class="profile-view p-4 mt-6 ">
    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-view {
  padding: 1.5rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}
p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}
.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #fff;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: rgba(220, 38, 38, 1);
}
.logout-btn:active {
  opacity: 0.9;
}
</style>
