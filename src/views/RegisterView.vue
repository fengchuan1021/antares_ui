<template>
  <div class="auth-view">
    <h1>注册</h1>
    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    <form class="auth-form" @submit.prevent="handleRegister">
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
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="确认密码"
        class="input"
        required
      />
      <button type="submit" class="btn" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    <button type="button" class="link-btn" @click="goLogin">
      已有账号？去登录
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleRegister = async () => {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true
  try {
    // 这里预留真实注册接口调用位置
    // await register(username.value, password.value)
    // 注册成功后直接跳回登录页
    router.push('/login')
  } catch (error) {
    errorMsg.value = error?.response?.data?.error || error?.message || '注册失败'
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.auth-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  max-width: 320px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  color: #3b2b10;
  font-size: 1rem;
}

.input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.input:focus {
  outline: none;
  border-color: #e08b00;
}

.error-msg {
  color: #d32f2f;
  font-size: 0.875rem;
  margin: 0 0 1rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f6b148, #e08b00);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-btn {
  margin-top: 1rem;
  background: transparent;
  border: none;
  color: #b86a00;
  padding: 0;
}

.link-btn:hover {
  opacity: 0.8;
}
</style>

