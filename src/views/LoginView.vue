<template>
  <div class="login-view">
    <h1>登录</h1>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    <form class="login-form" @submit.prevent="handleLogin">
      <input
        v-model="username"
        type="text"
        placeholder="用户名"
        class="input"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="密码"
        class="input"
        required
      />
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/user'
import { setUser } from '../stores/user'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await login(username.value, password.value)
    localStorage.setItem('token', res.data.token)
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    }
    router.push('/')
  } catch (error) {
    errorMsg.value = error?.response?.data?.error || error?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  padding: 2rem;
  max-width: 320px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 1rem;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input:focus {
  outline: none;
  border-color: #646cff;
}

.error-msg {
  color: #f87171;
  font-size: 0.875rem;
  margin: 0 0 1rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: #646cff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (prefers-color-scheme: light) {
  .input {
    border-color: rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.02);
  }
  .input::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
}
</style>
