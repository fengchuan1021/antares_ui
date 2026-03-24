<template>
  <div class="profile-view p-4 pb-24 mt-6">
    <h1 class="profile-title">我的</h1>
    <div class="profile-card">
      <div class="profile-row">
        <span class="profile-label">用户名</span>
        <span class="profile-value">{{ userStore.user.username }}</span>
      </div>
    </div>
    <button type="button" class="logout-btn" @click="handleLogout">退出登录</button>
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
  color: #3b2b10;
}

.profile-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.profile-card {
  background: rgba(255, 249, 230, 0.95);
  border: 1px solid #f4c769;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.profile-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.profile-label {
  flex-shrink: 0;
  font-size: 1rem;
  color: rgba(59, 43, 16, 0.58);
}

.profile-value {
  font-size: 1rem;
  font-weight: 600;
  color: #3b2b10;
  text-align: right;
  word-break: break-word;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
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
