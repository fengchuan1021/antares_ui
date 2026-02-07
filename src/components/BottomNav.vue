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
    <router-link
      v-if="isAdmin"
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
import { computed } from 'vue'
import { userStore } from '../stores/user'

const isAdmin = computed(() => userStore.value?.role_id === 1)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-item.active {
  color: #646cff;
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-label {
  font-size: 0.75rem;
}

@media (prefers-color-scheme: light) {
  .bottom-nav {
    background-color: #ffffff;
    border-top-color: rgba(0, 0, 0, 0.1);
  }
  .nav-item {
    color: rgba(0, 0, 0, 0.6);
  }
  .nav-item:hover {
    color: rgba(0, 0, 0, 0.9);
  }
  .nav-item.active {
    color: #535bf2;
  }
}
</style>
