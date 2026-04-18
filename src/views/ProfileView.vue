<template>
  <div class="profile-view p-4 pb-24 mt-6">
    <h1 class="profile-title">我的</h1>
    <div class="profile-card">
      <div class="profile-row">
        <span class="profile-label">用户名</span>
        <span class="profile-value">{{ userStore.user.username }}</span>
      </div>
      <div class="profile-row">
        <span class="profile-label">App版本</span>
        <span class="profile-value">current:{{ appVersion }} server:{{ serverAppVersion }} </span>
      </div>
    </div>
   <!-- <div class="profile-card">
      <div class="">
        <span class="profile-value">
          <Tag v-for="app in backup_selected_apps" :key="app.packageName">{{ app.name }}</Tag>
        <Button icon="pi pi-file-edit" size="small" @click="AddApp" class="ml-2"></Button>
        </span>
      </div>
      <div class="mt-2">
        <span class="profile-label"><Button  size="small" @click="handleBackup">一键备份</Button></span>
        
      </div>
    </div>  -->
    <div class="profile-card">
      <div class="">
        <span class="profile-value">
        
          <Button icon="pi pi-replay" size="small" @click="handleResetDevice" class="ml-2" style="width:100px">重置设备</Button>
     
        </span>
      </div>
    </div>

    <div class="profile-card">
      <div class="">
        <span class="profile-value">
   
        <span>开发者选项</span>
        <ToggleSwitch
          :model-value="developerModeEnabled"
          class="ml-2"
          @update:model-value="switchDeveloperMode"
        />
        </span>
      </div>
      <div class="">
        <span class="profile-value">
   
        <Button  size="small" @click="handleChunqiuCheck" class="ml-2">春秋检测</Button>
        </span>
      </div>
     

      <div class="profile-row">
        <span class="profile-label">单个ip下最多同时运行设备数</span>
        <span class="profile-value">  <InputText
        v-model="maxDevices"
        type="number"
        class="profile-note-inputtext w-full"

        placeholder="0不限制"
        /></span>
      </div>  
    </div>

    <div class="profile-card profile-note-card">
      <div class="profile-row">
        <span class="profile-label">编号</span>
        <span class="profile-value">  <InputText
        v-model="profileSerial"
        class="profile-note-inputtext"
        placeholder="在此输入编号"
       
      /></span> 
      </div>
      <div class="profile-row profile-note-header">
        <span class="profile-label">记事本</span>
      </div>
      <Textarea
        v-model="profileNote"
        class="profile-note-textarea"
        placeholder="在此输入备忘…"
        :auto-resize="true"
        rows="5"
      />
    </div>

    <Dialog
      v-model:visible="showBackupAppPicker"
      header="选择备份应用"
      modal
      :style="{ width: 'min(92vw, 420px)' }"
      :dismissable-mask="true"
    >
      <div v-if="!installedApps.length" class="backup-app-picker-empty">暂无已安装应用数据，请在 App 内打开并重试</div>
      <div v-else class="backup-app-picker-list">
        <label
          v-for="app in installedApps"
          :key="app.packageName"
          class="backup-app-picker-row"
        >
          <Checkbox
            :model-value="pickerSelected.has(app.packageName)"
            :binary="true"
            :input-id="`pick-${app.packageName}`"
            @update:model-value="() => togglePickerApp(app.packageName)"
          />
          <span class="backup-app-picker-name">{{ app.name }}</span>
        </label>
      </div>
      <template #footer>
        <Button label="取消" text @click="showBackupAppPicker = false" />
        <Button label="确定" @click="confirmBackupAppPicker" />
      </template>
    </Dialog>

    <button type="button" class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '../stores/user'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { backupApps,listBackups } from '../api/backup'
import { saveProfileNote, getProfileNote,resetDevice,getProfileSerial,saveProfileSerial } from '../api/device'
import { getIpGroupLimit, saveIpGroupLimit } from '../api/user'
const appVersion = ref('--')
const serverAppVersion = ref('--')
const serial=ref('')
const developerModeEnabled = ref(false)

const installedApps = ref([])
const backup_selected_apps = ref([
  { packageName: 'com.tencent.mm', name: '微信' },
  { packageName: 'com.eg.android.AlipayGphone', name: '支付宝' },
  { packageName: 'com.tencent.mobileqq', name: 'QQ' },
])

const showBackupAppPicker = ref(false)
const pickerSelected = ref(new Set())


const profileNote = ref('')
const profileSerial=ref('')
const maxDevices=ref(null)
const PROFILE_NOTE_SAVE_DEBOUNCE_MS = 5000
let profileNoteSaveTimer = null
/** 从接口回填 v-model 时不应触发保存 */
let profileNoteHydrating = false

const PROFILE_SERIAL_SAVE_DEBOUNCE_MS = 5000
let profileSerialSaveTimer = null
/** 从接口回填 v-model 时不应触发保存 */
let profileSerialHydrating = false

const MAX_DEVICES_SAVE_DEBOUNCE_MS = 5000
let maxDevicesSaveTimer = null
/** 从接口回填 v-model 时不应触发保存 */
let maxDevicesHydrating = false
watch(maxDevices, () => {
  if (maxDevicesHydrating) return
  if (maxDevicesSaveTimer !== null) {
    clearTimeout(maxDevicesSaveTimer)
    maxDevicesSaveTimer = null
  }
  maxDevicesSaveTimer = setTimeout(() => {
    maxDevicesSaveTimer = null
    try {
      let tmp=parseInt(maxDevices.value)
      if (isNaN(tmp)) {
        tmp = 0
      }
      saveIpGroupLimit(uid.value, tmp)
    } catch (e) {}
  }, MAX_DEVICES_SAVE_DEBOUNCE_MS)
})
watch(profileNote, () => {
  if (profileNoteHydrating) return
  if (profileNoteSaveTimer !== null) {
    clearTimeout(profileNoteSaveTimer)
    profileNoteSaveTimer = null
  }
  profileNoteSaveTimer = setTimeout(() => {
    profileNoteSaveTimer = null
    try {
      saveProfileNote(serial.value, profileNote.value)
    } catch (e) {}
  }, PROFILE_NOTE_SAVE_DEBOUNCE_MS)
})
watch(profileSerial, () => {
  if (profileSerialHydrating) return
  if (profileSerialSaveTimer !== null) {
    clearTimeout(profileSerialSaveTimer)
    profileSerialSaveTimer = null
  }
  profileSerialSaveTimer = setTimeout(() => {
    profileSerialSaveTimer = null
    try {
      saveProfileSerial(serial.value, profileSerial.value)
    } catch (e) {}
  }, PROFILE_SERIAL_SAVE_DEBOUNCE_MS)
})
onUnmounted(() => {
  if (profileNoteSaveTimer !== null) {
    clearTimeout(profileNoteSaveTimer)
    profileNoteSaveTimer = null
  }
  if (maxDevicesSaveTimer !== null) {
    clearTimeout(maxDevicesSaveTimer)
    maxDevicesSaveTimer = null
  }
  if (profileSerialSaveTimer !== null) {
    clearTimeout(profileSerialSaveTimer)
    profileSerialSaveTimer = null
  }
})

const CHUNQIU_CHECK_DEBOUNCE_MS = 5000
let lastChunqiuCheckAt = 0
const toast = useToast()
const handleResetDevice=()=>{
  try{
    resetDevice(serial.value);
  }catch(e){}
}

function switchDeveloperMode(value) {
  const enabled = Boolean(value)
  developerModeEnabled.value = enabled
  try {
  
    if (typeof window !== 'undefined' && window.AndroidBridge?.setDeveloperMode) {
      window.AndroidBridge.setDeveloperMode(enabled)
    }
  } catch (e) {}
}

const handleChunqiuCheck = () => {
  if (typeof window === 'undefined' || !window.AndroidBridge?.chunqiuCheck) return
  const now = Date.now()
  if (lastChunqiuCheckAt !== 0 && now - lastChunqiuCheckAt < CHUNQIU_CHECK_DEBOUNCE_MS) {
    toast.add({
      severity: 'info',
      detail: '后台处理中',
      life: 2000,
    })
    return
  }
  lastChunqiuCheckAt = now
  try {
    window.AndroidBridge.chunqiuCheck()
  } catch (e) {}
}
function loadInstalledApps() {
  try {
    if (typeof window === 'undefined' || !window.AndroidBridge?.getInstalledApps) return
    const json = window.AndroidBridge.getInstalledApps(true)
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data)) {
      installedApps.value = res.data
    }
  } catch (e) {}
}

onMounted(() => {
  try {
    const json = window.AndroidBridge.getDeveloperMode()
    const res = JSON.parse(json)
    if (res.code === 0 && res.enabled !== undefined) {
      developerModeEnabled.value = res.enabled
    }
  } catch (e) {}
  
  try{
    serial.value = window.AndroidBridge.getSerial()
  }catch(e){}
  try{
    getProfileSerial(serial.value).then(async (res) => {
      profileSerialHydrating = true
      try {
        profileSerial.value = res.data || ''
        await nextTick()
      } finally {
        profileSerialHydrating = false
      }
    })
  }catch(e){}
  try{
    getIpGroupLimit(uid.value).then(async (res) => {
      maxDevicesHydrating = true
      try {
        maxDevices.value = res.data || ''
        await nextTick()
      } finally {
        maxDevicesHydrating = false
      }
    })
  }catch(e){}
  try {
    getProfileNote(serial.value).then(async (res) => {
      profileNoteHydrating = true
      try {
        profileNote.value = res.data || ''
        await nextTick()
      } finally {
        profileNoteHydrating = false
      }
    })
  } catch (e) {}
 
  try {
    if (typeof window === 'undefined' || !window.AndroidBridge || !window.AndroidBridge.getAppVersion) {
      return
    }
    const result = JSON.parse(window.AndroidBridge.getAppVersion())
    if (result?.code === 0 && result?.version) {
      appVersion.value = result.version
    }
  } catch (error) {
    console.error('getAppVersion failed', error)
  }
  try {
    if (typeof window === 'undefined' || !window.AndroidBridge || !window.AndroidBridge.getServerAppVersion) {
      return
    }
    const result = JSON.parse(window.AndroidBridge.getServerAppVersion())
    if (result?.code === 0 && result?.version) {
      serverAppVersion.value = result.version
    }
  } catch (error) {
    console.error('getServerAppVersion failed', error)
  }
  loadInstalledApps()
})

function togglePickerApp(packageName) {
  const next = new Set(pickerSelected.value)
  if (next.has(packageName)) next.delete(packageName)
  else next.add(packageName)
  pickerSelected.value = next
}

function AddApp() {
  loadInstalledApps()
  const next = new Set()
  for (const a of backup_selected_apps.value) {
    if (a?.packageName) next.add(a.packageName)
  }
  pickerSelected.value = next
  showBackupAppPicker.value = true
}

function confirmBackupAppPicker() {
  const sel = pickerSelected.value
  const list = installedApps.value
    .filter((app) => sel.has(app.packageName))
    .map((app) => ({
      packageName: app.packageName,
      name: app.name || app.packageName,
    }))
  backup_selected_apps.value = list
  showBackupAppPicker.value = false
}

function handleBackup() {
 
  const pkgs = backup_selected_apps.value.map((a) => a.packageName).filter(Boolean)
  if (!pkgs.length) return
  try {
    console.log("backup:",serial.value,pkgs)
    backupApps(serial.value,pkgs);
  } catch (e) {}
}

const handleFixEnvironment = () => {
  try {
    const result = JSON.parse(window.AndroidBridge.fixEnvironment())
    if (result.code === 200) {
    } else {
    }
  } catch (e) {}
}

const router = useRouter()
const userStore = useUserStore()
const uid = ref(userStore.user.id)
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

.backup-app-picker-empty {
  padding: 0.75rem 0;
  font-size: 0.9rem;
  color: rgba(59, 43, 16, 0.65);
}

.backup-app-picker-list {
  max-height: min(55vh, 360px);
  overflow-y: auto;
  margin: 0 -0.25rem;
  padding-right: 0.25rem;
}

.backup-app-picker-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.35rem;
  border-radius: 8px;
  cursor: pointer;
}

.backup-app-picker-row:hover {
  background: rgba(244, 199, 105, 0.2);
}

.backup-app-picker-name {
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #3b2b10;
  word-break: break-word;
}

.profile-note-card .profile-note-header {
  margin-bottom: 0.65rem;
}

.profile-note-textarea {
  width: 100%;
  min-height: 7rem;
  font-size: 0.95rem;
  line-height: 1.45;
}
</style>
