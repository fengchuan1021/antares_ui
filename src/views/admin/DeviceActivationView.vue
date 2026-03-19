<template>
  <div class="device-activation-view p-4">
   
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
            <!-- <div class="info-row">
              <span class="label">Codename</span>
              <span class="value">{{ d.codename || '-' }}</span>
            </div> -->
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
            <Button label="激活用户" icon="pi pi-user" size="small" severity="secondary" @click="openBindUser(d)" />
             
            <Button label="到期时间" icon="pi pi-calendar" size="small"  @click="openSetExpire(d)" />
          </div>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="bindUserVisible" header="激活用户" modal :style="{ width: '320px' }" @hide="bindUserForm.deviceId = null; bindUserForm.username = ''">
      <div class="field">
        <label class="block text-sm font-medium mb-1">用户名</label>
        <InputText disabled v-model="bindUserForm.username"  class="w-full" />
      </div>
      <template #footer>
        <Button label="取消" text @click="bindUserVisible = false" />
        <Button label="确定" :loading="bindLoading" @click="submitBindUser" />
      </template>
    </Dialog>

    <Dialog v-model:visible="expireVisible" header="增加到期时间" modal :style="{ width: '320px' }" @hide="expireForm.deviceId = null; expireForm.duration = null">
      <div class="field">
        <label class="block text-sm font-medium mb-1">增加时长</label>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm">
            <RadioButton v-model="expireForm.duration" inputId="expire_1m" :value="1" />
            <span>一个月</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <RadioButton v-model="expireForm.duration" inputId="expire_2m" :value="2" />
            <span>两个月</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <RadioButton v-model="expireForm.duration" inputId="expire_3m" :value="3" />
            <span>三个月</span>
          </label>
        </div>
      </div>
      <!-- <div class="flex gap-2">
        <Button label="设为永久" severity="secondary" size="small" @click="setPermanent" />
      </div> -->
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
import RadioButton from 'primevue/radiobutton'
import { useToast } from 'primevue/usetoast'
import { searchDevices as searchDevicesApi, updateDevice as updateDeviceApi } from '../../api/device'
import { activateUser as activateUserApi } from '../../api/user'

const searchSerial = ref('')
const devices = ref([])
const searched = ref(false)
const errorMsg = ref('')

const toast = useToast()

const bindUserVisible = ref(false)
const bindUserForm = reactive({ deviceId: null, username: '' })
const bindLoading = ref(false)

const expireVisible = ref(false)
const expireForm = reactive({ deviceId: null, duration: null })
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
    const res = await activateUserApi(bindUserForm.username.trim())
    if (res.code === 200) {
      toast.add({
        severity: 'success',
        detail: res.msg || '激活成功',
        life: 3000
      })  
    } else {
      toast.add({
        severity: 'error',
        detail: res.msg || '激活失败',
        life: 3000
      })  
    }
    bindUserVisible.value = false
    doSearch()
  } catch (e) {
    errorMsg.value = e?.response?.data?.msg || e?.message || '激活失败'
  } finally {
    bindLoading.value = false
  }
}

const openSetExpire = (d) => {
  expireForm.deviceId = d.id
  expireForm.duration = d.expire_at ? inferDuration(d.expire_at) : null
  expireVisible.value = true
}

const addMonths = (baseDate, months) => {
  const d = new Date(baseDate)
  const targetMonth = d.getMonth() + months
  d.setMonth(targetMonth)
  return d
}

// 把已有的 `expire_at` 映射到最接近的 1/2/3 月选项
const inferDuration = (expireAt) => {
  const exp = new Date(expireAt)
  if (Number.isNaN(exp.getTime())) return null

  const now = new Date()
  const options = [1, 2, 3]
  let best = null
  let bestDiff = Infinity
  for (const m of options) {
    const candidate = addMonths(now, m).getTime()
    const diff = Math.abs(candidate - exp.getTime())
    if (diff < bestDiff) {
      bestDiff = diff
      best = m
    }
  }
  return best
}

const submitExpire = async () => {
  expireLoading.value = true
  errorMsg.value = ''
  try {
    // 只提交用户选择的“增加时长(月数)”，由后端计算到期时间
    // 未选择时传 null，避免后端把 '' 当成数字解析失败
    const data = expireForm.duration ? { add_duration: expireForm.duration } : { add_duration: null }
    const res = await updateDeviceApi(expireForm.deviceId, data)
    if (res.code === 200) {
  toast.add({
    severity: 'success',
    detail: res.msg || '增加成功',
    life: 3000
  })  
    } else {
      toast.add({
        severity: 'error',
        detail: res.msg || '增加失败',
        life: 3000
      })  
    }
    expireVisible.value = false
    doSearch()
  } catch (e) {
    errorMsg.value = e?.response?.data?.msg || e?.message || '增加失败'
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
