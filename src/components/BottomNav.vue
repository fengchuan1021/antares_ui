<template>
  <nav class="bottom-nav">
    <router-link
      to="/"
      class="nav-item"
      :class="{ active: $route.path === '/' }"
    >
      <span class="nav-icon">🏠</span>
      <span class="nav-label">首页</span>
    </router-link>
    <!-- <router-link
      to="/backup"
      class="nav-item"
      :class="{ active: $route.path === '/backup' }"
    >
      <span class="nav-icon">📦</span>
      <span class="nav-label">备份</span>
    </router-link> -->
    <router-link
      v-if="userStore.isAdmin"
      to="/admin"
      class="nav-item"
      :class="{ active: $route.path === '/admin' }"
    >
      <span class="nav-icon">⚙️</span>
      <span class="nav-label">管理</span> 
    </router-link>
    <router-link
      to="/profile"
      class="nav-item"
      :class="{ active: $route.path === '/profile' }"
    >
      <span class="nav-icon">👤</span>
      <span class="nav-label">我的</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 0.75rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  background: rgba(255, 249, 230, 0.96);
  border-top: 1px solid #f4c769;
  backdrop-filter: blur(8px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  text-decoration: none;
  color: #b86a00;
  transition: color 0.2s, transform 0.15s ease-out;
}

.nav-item:hover {
  color: #e08b00;
  transform: translateY(-1px);
}

.nav-item.active {
  color: #e08b00;
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-label {
  font-size: 0.78rem;
}
</style>
