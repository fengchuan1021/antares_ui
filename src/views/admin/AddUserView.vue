<template>
  <div class="add-user-view p-4">
    <h2 class="text-lg font-semibold mb-4">添加用户</h2>
    <Button label="添加用户" icon="pi pi-user-plus" @click="showDialog = true" />
    <Dialog
      v-model:visible="showDialog"
      header="添加用户"
      modal
      :style="{ width: '340px' }"
      :closable="true"
      @hide="resetForm"
    >
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="field">
          <label for="username" class="block text-sm font-medium mb-1">用户名</label>
          <InputText
            id="username"
            v-model="username"
            class="w-full"
            placeholder="请输入用户名"
            :invalid="!!errors.username"
            required
          />
          <small v-if="errors.username" class="text-red-500">{{ errors.username }}</small>
        </div>
        <div class="field">
          <label for="password" class="block text-sm font-medium mb-1">密码</label>
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggleMask
            class="w-full"
            placeholder="请输入密码"
            :invalid="!!errors.password"
            input-class="w-full"
            required
          />
          <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
        </div>
      </form>
      <template #footer>
        <Button label="取消" text @click="showDialog = false" />
        <Button label="确定" :loading="loading" @click="handleSubmit" />
      </template>
    </Dialog>
    <Message v-if="successMsg" severity="success" :closable="false" class="mt-4">
      {{ successMsg }}
    </Message>
    <Message v-if="errorMsg" severity="error" :closable="false" class="mt-4">
      {{ errorMsg }}
    </Message>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import { createUser as createUserApi } from '../../api/user'

const showDialog = ref(false)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const errors = reactive({ username: '', password: '' })

const resetForm = () => {
  username.value = ''
  password.value = ''
  errors.username = ''
  errors.password = ''
  errorMsg.value = ''
}

const handleSubmit = async () => {
  errors.username = ''
  errors.password = ''
  errorMsg.value = ''
  successMsg.value = ''

  if (!username.value?.trim()) {
    errors.username = '请输入用户名'
    return
  }
  if (!password.value?.trim()) {
    errors.password = '请输入密码'
    return
  }
  if (password.value.length < 6) {
    errors.password = '密码至少6位'
    return
  }

  loading.value = true
  try {
    await createUserApi(username.value.trim(), password.value)
    successMsg.value = '添加成功'
    showDialog.value = false
    resetForm()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '添加失败'
  } finally {
    loading.value = false
  }
}
</script>
