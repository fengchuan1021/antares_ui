<template>
  <div class="device-activation-view p-4">
    <h2 class="text-lg font-semibold mb-4">设备激活</h2>
    <div class="flex gap-2 mb-4">
      <InputText
        v-model="searchSerial"
        placeholder="输入设备序列号搜索"
        class="flex-1"
        @keyup.enter="doSearch"
      />
      <Button label="搜索" icon="pi pi-search" @click="doSearch" />
    </div>
    <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">
      {{ errorMsg }}
    </Message>
    <Message v-if="devices.length === 0 && searched" severity="info" :closable="false" class="mb-4">
      未找到设备
    </Message>
    <div v-if="devices.length" class="device-list space-y-3">
      <Card v-for="d in devices" :key="d.id" class="device-card">
        <template #content>
          <div class="device-info">
            <div class="info-row">
              <span class="label">序列号</span>
              <span class="value">{{ d.serial }}</span>
            </div>
            <div class="info-row">
              <span class="label">用户名</span>
              <span class="value">{{ d.username || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Codename</span>
              <span class="value">{{ d.codename || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">到期时间</span>
              <span class="value">{{ formatExpire(d.expire_at) }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建时间</span>
              <span class="value">{{ formatDate(d.created_at) }}</span>
            </div>
          </div>
          <div class="device-actions">
            <Button label="绑定用户" icon="pi pi-user" size="small" @click="openBindUser(d)" />
            <Button label="到期时间" icon="pi pi-calendar" size="small" severity="secondary" @click="openSetExpire(d)" />
          </div>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="bindUserVisible" header="绑定用户" modal :style="{ width: '320px' }" @hide="bindUserForm = {}">
      <div class="field">
        <label class="block text-sm font-medium mb-1">用户名</label>
        <InputText v-model="bindUserForm.username" placeholder="输入要绑定的用户名" class="w-full" />
      </div>
      <template #footer>
        <Button label="取消" text @click="bindUserVisible = false" />
        <Button label="确定" :loading="bindLoading" @click="submitBindUser" />
      </template>
    </Dialog>

    <Dialog v-model:visible="expireVisible" header="设置到期时间" modal :style="{ width: '320px' }" @hide="expireForm = {}">
      <div class="field">
        <label class="block text-sm font-medium mb-1">到期日期</label>
        <DatePicker v-model="expireForm.date" dateFormat="yy-mm-dd" showIcon class="w-full" />
      </div>
      <div class="flex gap-2">
        <Button label="设为永久" severity="secondary" size="small" @click="setPermanent" />
      </div>
      <template #footer>
        <Button label="取消" text @click="expireVisible = false" />
        <Button label="确定" :loading="expireLoading" @click="submitExpire" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import { searchDevices as searchDevicesApi, updateDevice as updateDeviceApi } from '../../api/device'

const searchSerial = ref('')
const devices = ref([])
const searched = ref(false)
const errorMsg = ref('')

const bindUserVisible = ref(false)
const bindUserForm = reactive({ deviceId: null, username: '' })
const bindLoading = ref(false)

const expireVisible = ref(false)
const expireForm = reactive({ deviceId: null, date: null })
const expireLoading = ref(false)

const doSearch = async () => {
  if (!searchSerial.value?.trim()) return
  searched.value = true
  errorMsg.value = ''
  try {
    const res = await searchDevicesApi(searchSerial.value.trim())
    devices.value = res?.data ?? []
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '搜索失败'
    devices.value = []
  }
}

const formatExpire = (v) => {
  if (!v) return '永久'
  return formatDate(v)
}

const formatDate = (v) => {
  if (!v) return '-'
  const d = new Date(v)
  return d.toISOString().slice(0, 10)
}

const openBindUser = (d) => {
  bindUserForm.deviceId = d.id
  bindUserForm.username = d.username || ''
  bindUserVisible.value = true
}

const submitBindUser = async () => {
  if (!bindUserForm.username?.trim()) return
  bindLoading.value = true
  errorMsg.value = ''
  try {
    await updateDeviceApi(bindUserForm.deviceId, { username: bindUserForm.username.trim() })
    bindUserVisible.value = false
    doSearch()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '绑定失败'
  } finally {
    bindLoading.value = false
  }
}

const openSetExpire = (d) => {
  expireForm.deviceId = d.id
  expireForm.date = d.expire_at ? new Date(d.expire_at) : null
  expireVisible.value = true
}

const setPermanent = () => {
  expireForm.date = null
}

const submitExpire = async () => {
  expireLoading.value = true
  errorMsg.value = ''
  try {
    const data = expireForm.date
      ? { expire_at: formatDate(expireForm.date) }
      : { expire_at: '' }
    await updateDeviceApi(expireForm.deviceId, data)
    expireVisible.value = false
    doSearch()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '设置失败'
  } finally {
    expireLoading.value = false
  }
}
</script>

<style scoped>
.device-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.info-row {
  display: flex;
  gap: 0.5rem;
}
.label {
  color: rgba(255, 255, 255, 0.6);
  min-width: 80px;
  font-size: 0.875rem;
}
.value {
  font-size: 0.875rem;
}
.device-actions {
  display: flex;
  gap: 0.5rem;
}
.device-card :deep(.p-card-content) {
  padding: 1rem;
}
@media (prefers-color-scheme: light) {
  .label {
    color: rgba(0, 0, 0, 0.6);
  }
}
</style>
