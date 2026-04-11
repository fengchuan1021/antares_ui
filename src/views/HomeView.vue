<template>
     <!-- <Button
        label="更新证书"
        icon="pi pi-refresh"
        severity="secondary"
        size="small"
        @click="handleUpdateCert"
      /> -->
  <div class="home-view p-4 pb-[140px]">
    <div class="flex flex-col gap-2 mb-4 mt-6">
      <div class="flex gap-2 items-center">
        <Button :disabled="true" size="small" class="w-[60%] executebtn" >到期时间:{{ expireTime }}</Button>
       
        <Button
        
          class="flex-1 min-w-0 executebtn"
          label="重启手机"
          icon="pi pi-replay"
          severity="secondary"
          size="small"
          @click="handleRestart"
        />
      </div>
      <div class="flex gap-2 items-center">
        <Tag :disabled="true" size="small" class="w-[60%] executebtn p-4" >{{ serial }}</Tag>
        <Button
          class="flex-1 min-w-0 executebtn"
          label="重启服务"
          icon="pi pi-replay"
          severity="secondary"
          size="small"
          @click="handleRestartService"
        />
      </div>
    </div>
    <ProgressSpinner v-if="loading" class="mx-auto my-8" />
    <Message v-else-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>

    <template v-else>
      <div class="scripts-tree grid grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-1 min-h-[320px]">
        <!-- 左侧：分类列表 -->
        <div class="flex flex-col min-h-0 border rounded-lg overflow-hidden panel">
      
          <Listbox
            v-model="activeCategoryId"
            :options="treeData"
            option-label="name"
            option-value="id"
            class="flex-1 min-h-0 border-0 rounded-none [&_.p-listbox-list]:max-h-full [&_.p-listbox-list]:overflow-auto"
            list-class="py-1"
          >
            <template #option="{ option }">
              <span class="flex items-center gap-2 w-full">
            
                <span class="flex-1 truncate font-medium">{{ option.name }}</span>
          
              </span>
            </template>
          </Listbox>
        </div>
        <!-- 右侧：当前分类的脚本列表 -->
        <div class="flex flex-col min-h-0 border rounded-lg overflow-hidden panel">
          <!-- <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ currentCategory?.name ?? '请选择分类' }}
          </div> -->
          <div class="flex-1 overflow-auto">
            <template v-if="currentCategory?.scripts?.length">
              <div class="flex flex-col gap-1">
                <div
                  v-for="script in currentCategory.scripts"
                  :key="script.id"
                  class="flex items-center gap-1 p-2 rounded-lg cursor-pointer"
                  
                  @click="toggleScript(script)"
                >
                  <span @click.stop>
                    <Checkbox
                      :model-value="selectedIds.has(script.id)"
                      :binary="true"
                      :input-id="`script-${script.id}`"
                      @update:model-value="() => toggleScript(script)"
                    />
                  </span>
                  <img
                    v-if="script.icon_url"
                    :src="script.icon_url"
                    :alt="script.name"
                    class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="flex-1 flex-col flex min-w-0">
                    <div class="font-medium truncate">{{ script.name }}</div>
                    <div v-if="script.description" class="text-sm text-gray-500 truncate">
                      {{ script.description }}
                    </div>
                    <div v-if="(script.is_in_mi_market || script.is_in_netdisk) && !script.is_installed" class="text-sm text-gray-500 truncate" @click.stop>
                      <Button style="width:1rem;height:1rem" icon="pi pi-cloud-download"  size="small" @click="handleDownloadApp(script)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              暂无脚本
            </div>
          </div>
        </div>
      </div>

      <!-- <Card v-if="selectedScripts.length > 0" class="mt-4 selected-summary">
        <template #title>已选 {{ selectedScripts.length }} 个脚本</template>
        <template #content>
          <div class="flex flex-wrap gap-2">
            <Chip
              v-for="s in selectedScripts"
              :key="s.id"
              :label="s.name"
              removable
              @remove="removeScript(s)"
            />
          </div>
        </template>
      </Card> -->
    </template>

    <div class="execute-bar fixed bottom-14 left-0 right-0 flex items-end gap-2 p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div class="flex-1 grid grid-cols-2 gap-2 min-w-0">
        <div
          ref="execColTimeEl"
          class="min-w-0 flex flex-col gap-2 overflow-hidden"
          @mousedown.capture="(e) => onExecInputColBeforePointer(e, 'time')"
          @touchstart.capture="(e) => onExecInputColBeforePointer(e, 'time')"
        >
          <label class="text-sm text-gray-600 dark:text-gray-400">执行分钟</label>
          <InputNumber
            v-model="executeTime"
            :min="1"
            placeholder="分钟"
            show-buttons
            button-layout="horizontal"
            :pt="executeTimeInputNumberPt"
            class="w-full min-w-0 max-w-full [&_.p-inputnumber]:min-w-0 [&_.p-inputnumber]:max-w-full"
            @blur="() => onExecInputNumberBlur('time')"
          />
        </div>
        <div
          ref="execColRoundsEl"
          class="min-w-0 flex flex-col gap-2 overflow-hidden"
          @mousedown.capture="(e) => onExecInputColBeforePointer(e, 'rounds')"
          @touchstart.capture="(e) => onExecInputColBeforePointer(e, 'rounds')"
        >
          <label class="text-sm text-gray-600 dark:text-gray-400">执行轮数</label>
          <InputNumber
            v-model="executeRounds"
            :min="1"
            placeholder="轮"
            show-buttons
            button-layout="horizontal"
            :pt="executeRoundsInputNumberPt"
            class="w-full min-w-0 max-w-full [&_.p-inputnumber]:min-w-0 [&_.p-inputnumber]:max-w-full"
            @blur="() => onExecInputNumberBlur('rounds')"
          />
        </div>
      </div>
      <div  class=" flex  flex-col gap-1 overflow-hidden">

      <div>
        <Button
      class="executebtn"
      icon="pi pi-th-large"
      @click="mutiExecute"
    />
      </div>
      <div  class=" flex  gap-1 overflow-hidden">
        <Button
        :label="executeCooldownRemaining > 0 ? ` (${executeCooldownRemaining}s)` : ''"
        icon="pi pi-play"
        class="executebtn"
        :disabled="selectedScripts.length === 0 || executeCooldownRemaining > 0"
        @click="handleExecute"
      />
      <Button
      
        icon="pi pi-times"
        class="executebtn"
        
        @click="handleStop"
      />
      </div>
      
    </div>
    </div>

    <MutiExecute
      v-if="mutiExecuteVisible"
      v-model:visible="mutiExecuteVisible"
      @confirm="onMutiExecuteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import Listbox from 'primevue/listbox'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import { getScriptsTree } from '../api/script'
import { getDeviceExpireTime } from '../api/device'
import { clientAddTask,clientStopTask } from '../api/task'
import MutiExecute from '../components/MutiExecute.vue'

const toast = useToast()
const loading = ref(true)
const error = ref('')
const treeData = ref([])
const activeCategoryId = ref(null)
const selectedIds = ref(new Set())
const installedApps=ref([])
const currentCategory = computed(() =>
  treeData.value.find(c => c.id === activeCategoryId.value) ?? null
)
const selectedScriptsMap = ref(new Map())

const selectedScripts = computed(() => Array.from(selectedScriptsMap.value.values()))

const executeTime = ref(40)
const executeRounds = ref(1)

const execColTimeEl = ref(null)
const execColRoundsEl = ref(null)
/** false：inputmode none（按加减 focus 时不弹软键盘）；true：numeric（点在数字框上要能输入） */
const execInputKeyboardMode = reactive({ time: false, rounds: false })

function isInputNumberStepButtonTarget(el) {
  return !!(
    el &&
    typeof el.closest === 'function' &&
    (el.closest('.p-inputnumber-increment-button') || el.closest('.p-inputnumber-decrement-button'))
  )
}

function getExecInputColEl(key) {
  return key === 'time' ? execColTimeEl.value : execColRoundsEl.value
}

function setExecInputColInputmode(colEl, mode) {
  if (!colEl) return
  const input =
    colEl.querySelector('input.p-inputnumber-input') ||
    colEl.querySelector('.p-inputnumber input')
  if (input instanceof HTMLInputElement) {
    input.setAttribute('inputmode', mode)
  }
}

/** 在 PrimeVue mousedown 把焦点塞进 input 之前同步改 inputmode（仅靠 blur 在部分 WebView 无效） */
function onExecInputColBeforePointer(e, key) {
  const col = e.currentTarget
  const t = e.target
  if (isInputNumberStepButtonTarget(t)) {
    execInputKeyboardMode[key] = false
    setExecInputColInputmode(col, 'none')
  } else if (!t.closest?.('.p-inputnumber-button')) {
    execInputKeyboardMode[key] = true
    setExecInputColInputmode(col, 'numeric')
  }
}

function onExecInputNumberBlur(key) {
  execInputKeyboardMode[key] = false
  setExecInputColInputmode(getExecInputColEl(key), 'none')
}

const executeTimeInputNumberPt = computed(() => ({
  pcInputText: {
    root: {
      inputmode: execInputKeyboardMode.time ? 'numeric' : 'none'
    }
  }
}))

const executeRoundsInputNumberPt = computed(() => ({
  pcInputText: {
    root: {
      inputmode: execInputKeyboardMode.rounds ? 'numeric' : 'none'
    }
  }
}))
const serial = ref('')
const EXECUTE_COOLDOWN_SEC = 5
const lastExecuteTime = ref(0)
const executeCooldownRemaining = ref(0)
let executeCooldownTimer = null

const mutiExecuteVisible = ref(false)
/** 多设备执行时在对话框确认后的序列号列表；为空则使用当前机 serial */
const taskSerials = ref([])

function resolveTaskSerials() {
  if (taskSerials.value.length > 0) return taskSerials.value
  return serial.value ? [serial.value] : []
}

function mutiExecute() {
  mutiExecuteVisible.value = true
}

function onMutiExecuteConfirm(serials) {
  taskSerials.value = serials
}

function handleUpdateCert() {
  // TODO: 调用更新证书接口
  console.log('更新证书')
}

function handleRestart() {
  
  try {
    const result = JSON.parse(window.AndroidBridge.reboot())
    if (result.code === 0) {
      //alert('重启命令已执行，设备即将重启')
    } else {
      //alert(result.msg || '重启失败')
    }
  } catch (e) {
    console.error('重启失败:', e)
    //alert('重启失败: ' + (e?.message || '未知错误'))
  }
}
async function handleDownloadApp (script) {
  console.log("packgename",script.package_name)
 // window.alert(script.package_name);
 toast.add({
        severity: 'success',
        detail: `后台下载中，请稍后查看`,
        life: 2000
      })
  try {
    if(script.is_in_mi_market){
      const result = JSON.parse(window.AndroidBridge.goToMiMarketDetail(script.package_name))
      if (result.code === 200) {
    
      } else {
  
      }
    }else if(script.is_in_netdisk){
      const result = JSON.parse(window.AndroidBridge.downloadAppFromNetdisk(script.package_name))
      if (result.code === 200) {
  
      } else {
  
      }
  }} catch (e) {
    console.error('重启失败:', e)
 
  }
}
function handleRestartService() {
  
  try {
    const result = JSON.parse(window.AndroidBridge.restartService())
    if (result.code === 0) {
      alert('重启服务命令已执行，服务即将重启')
    } else {
      alert(result.msg || '重启服务失败')
    }
  } catch (e) {
    console.error('重启服务失败:', e)
    alert('重启失败: ' + (e?.message || '未知错误'))
  }
}

async function handleExecute() {
  if (selectedScripts.value.length === 0) return
  const now = Date.now()
  if (lastExecuteTime.value && now - lastExecuteTime.value < EXECUTE_COOLDOWN_SEC * 1000) {
    toast.add({
      severity: 'warn',
      detail: `操作过于频繁，${EXECUTE_COOLDOWN_SEC} 秒内仅可执行一次`,
      life: 2000
    })
    return
  }
  lastExecuteTime.value = now
  executeCooldownRemaining.value = EXECUTE_COOLDOWN_SEC
  if (executeCooldownTimer) clearInterval(executeCooldownTimer)
  executeCooldownTimer = setInterval(() => {
    executeCooldownRemaining.value = Math.max(0, executeCooldownRemaining.value - 1)
    if (executeCooldownRemaining.value <= 0 && executeCooldownTimer) {
      clearInterval(executeCooldownTimer)
      executeCooldownTimer = null
    }
  }, 1000)

  const time = Number(executeTime.value) || 0
  const rounds = Number(executeRounds.value) || 0
  console.log('执行', { executeTime: time, executeRounds: rounds, scripts: selectedScripts.value })
  const scriptIds = selectedScripts.value.map(s => s.id)
  const serials = resolveTaskSerials()
  const res = await clientAddTask(serials, scriptIds, time, rounds)
  if (res.code === 200) {
   
  } else {
   toast.add({
    severity: 'error',

    detail: res.msg,
    life: 3000
   })
  }
}
const lastStopTime=ref(0)
async function handleStop() {
  
  const now = Date.now()
  if (lastStopTime.value && now - lastStopTime.value < EXECUTE_COOLDOWN_SEC * 1000) {
    toast.add({
      severity: 'warn',
      detail: `操作过于频繁，${EXECUTE_COOLDOWN_SEC} 秒内仅可执行一次`,
      life: 2000
    })
    return
  }
  lastStopTime.value = now
 
  const res = await clientStopTask(resolveTaskSerials())
  if (res.code === 200) {
   
  } else {
   toast.add({
    severity: 'error',

    detail: res.msg,
    life: 3000
   })
  }
}

function toggleScript(script) {
  const nextIds = new Set(selectedIds.value)
  const nextMap = new Map(selectedScriptsMap.value)
  if (nextIds.has(script.id)) {
    nextIds.delete(script.id)
    nextMap.delete(script.id)
  } else {
    nextIds.add(script.id)
    nextMap.set(script.id, script)
  }
  selectedIds.value = nextIds
  selectedScriptsMap.value = nextMap
}

function removeScript(script) {
  toggleScript(script)
}
const expireTime=ref('')
watch(serial,()=>{
  if(!serial.value) return ''
  getDeviceExpireTime(serial.value).then(ret=>{
    
    expireTime.value = ret?.data || ''
  })
})
onMounted(async () => {
  try{
    const json = window.AndroidBridge.getInstalledApps(true)
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data)) {
      installedApps.value = res.data
    }
  }catch(e){}
  try {
    loading.value = true
    error.value = ''
    try{
      serial.value = window.AndroidBridge.getSerial()
    }catch(e){
      serial.value=""
    }
    

    const res = await getScriptsTree()
    treeData.value = res?.data ?? []
    if (treeData.value.length > 0 && !activeCategoryId.value) {
      activeCategoryId.value = treeData.value[0].id
    }
    treeData.value.forEach(item=>{
      item.scripts.forEach(script=>{
        console.log("script.package_name",script.package_name)
        script.is_installed = installedApps.value.some(app=>app.packageName === script.package_name)
        console.log("script.is_installed",script.is_installed)
      })
    })
  
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (executeCooldownTimer) {
    clearInterval(executeCooldownTimer)
    executeCooldownTimer = null
  }
})
</script>
<style scoped>
.home-view {
  color: #3b2b10;
}

.panel {
  background: rgba(255, 249, 230, 0.95);
  border-color: #f4c769;
}

.scripts-tree :deep(.p-listbox),
.scripts-tree :deep(.p-listbox-list-wrapper),
.scripts-tree :deep(.p-listbox-list) {
  background: transparent;
  border: none;
}

/* Checkbox 勾选为金色，方框背景保持白色（PrimeVue 4 选中态在根上为 .p-checkbox-checked） */
.scripts-tree :deep(.p-checkbox.p-checkbox-checked .p-checkbox-box),
.scripts-tree :deep(.p-checkbox.p-checkbox-checked .p-checkbox-box:hover),
.scripts-tree :deep(.p-checkbox.p-checkbox-checked .p-checkbox-box.p-focus) {
  border-color: #e0a300 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
}

.scripts-tree :deep(.p-checkbox.p-checkbox-checked .p-checkbox-box .p-checkbox-icon),
.scripts-tree :deep(.p-checkbox .p-checkbox-box .p-checkbox-icon) {
  color: #e0a300 !important;
  fill: #e0a300 !important;
}

.scripts-tree :deep(.p-listbox-item),
.scripts-tree :deep(.p-listbox-item.p-highlight),
.scripts-tree :deep(.p-listbox-item.p-focus) {
  background: transparent !important;
  color: #3b2b10;
}

.execute-bar {
  background: rgba(255, 249, 230, 0.96);
  border-top: 1px solid #f4c769;
  backdrop-filter: blur(8px);
}

.execute-bar :deep(.p-inputnumber) {
  min-width: 0;
  max-width: 100%;
}
.execute-bar :deep(.p-inputnumber input) {
  min-width: 0;
}
.executebtn {

  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f6b148, #e08b00);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 0.5rem;
 
}
</style>

