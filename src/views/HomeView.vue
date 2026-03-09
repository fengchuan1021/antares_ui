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
        <Tag class="w-[60%] shrink-0">到期时间:{{ expireTime }}</Tag>
       
        <Button
          class="flex-1 min-w-0"
          label="重启手机"
          icon="pi pi-replay"
          severity="secondary"
          size="small"
          @click="handleRestart"
        />
      </div>
      <div class="flex gap-2 items-center">
        <Tag class="w-[60%] shrink-0">序列号:{{ serial }}</Tag>
        <Button
          class="flex-1 min-w-0"
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
        <div class="flex flex-col min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      
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
                <Tag v-if="option.is_new" value="新" severity="success" class="text-xs shrink-0" />
                <Tag v-if="option.is_hot" value="热" severity="danger" class="text-xs shrink-0" />
              </span>
            </template>
          </Listbox>
        </div>
        <!-- 右侧：当前分类的脚本列表 -->
        <div class="flex flex-col min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <!-- <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ currentCategory?.name ?? '请选择分类' }}
          </div> -->
          <div class="flex-1 overflow-auto">
            <template v-if="currentCategory?.scripts?.length">
              <div class="flex flex-col gap-1">
                <div
                  v-for="script in currentCategory.scripts"
                  :key="script.id"
                  class="flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  :class="{ 'bg-indigo-500/15': selectedIds.has(script.id) }"
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
                    class="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">{{ script.name }}</div>
                    <div v-if="script.description" class="text-sm text-gray-500 truncate">
                      {{ script.description }}
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
        <div class="min-w-0 flex flex-col gap-2 overflow-hidden">
          <label class="text-sm text-gray-600 dark:text-gray-400">执行时间</label>
          <InputNumber
            v-model="executeTime"
            :min="1"
            placeholder="分钟"
            show-buttons
            button-layout="horizontal"
            class="w-full min-w-0 max-w-full [&_.p-inputnumber]:min-w-0 [&_.p-inputnumber]:max-w-full"
          />
        </div>
        <div class="min-w-0 flex flex-col gap-2 overflow-hidden">
          <label class="text-sm text-gray-600 dark:text-gray-400">执行轮数</label>
          <InputNumber
            v-model="executeRounds"
            :min="1"
            placeholder="轮"
            show-buttons
            button-layout="horizontal"
            class="w-full min-w-0 max-w-full [&_.p-inputnumber]:min-w-0 [&_.p-inputnumber]:max-w-full"
          />
        </div>
      </div>
      <Button
        label="执行"
        icon="pi pi-play"
        :disabled="selectedScripts.length === 0"
        @click="handleExecute"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Listbox from 'primevue/listbox'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { getScriptsTree } from '../api/script'
import { getDeviceExpireTime } from '../api/device'
import { clientAddTask } from '../api/task'
const loading = ref(true)
const error = ref('')
const treeData = ref([])
const activeCategoryId = ref(null)
const selectedIds = ref(new Set())

const currentCategory = computed(() =>
  treeData.value.find(c => c.id === activeCategoryId.value) ?? null
)
const selectedScriptsMap = ref(new Map())

const selectedScripts = computed(() => Array.from(selectedScriptsMap.value.values()))

const executeTime = ref(120)
const executeRounds = ref(2)
const serial = ref('')

function handleUpdateCert() {
  // TODO: 调用更新证书接口
  console.log('更新证书')
}

function handleRestart() {
  
  try {
    const result = JSON.parse(window.AndroidBridge.reboot())
    if (result.code === 0) {
      alert('重启命令已执行，设备即将重启')
    } else {
      alert(result.msg || '重启失败')
    }
  } catch (e) {
    console.error('重启失败:', e)
    alert('重启失败: ' + (e?.message || '未知错误'))
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
  const time = Number(executeTime.value) || 0
  const rounds = Number(executeRounds.value) || 0
  console.log('执行', { executeTime: time, executeRounds: rounds, scripts: selectedScripts.value })
  const scriptIds = selectedScripts.value.map(s => s.id)
  const res = await clientAddTask([serial.value],scriptIds, time, rounds)
  if (res.code === 200) {
   
  } else {
   
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
  try {
    loading.value = true
    error.value = ''
    serial.value = window.AndroidBridge.getSerial()

    const res = await getScriptsTree()
    treeData.value = res?.data ?? []
    if (treeData.value.length > 0 && !activeCategoryId.value) {
      activeCategoryId.value = treeData.value[0].id
    }
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
})
</script>
<style scoped>
.execute-bar :deep(.p-inputnumber) {
  min-width: 0;
  max-width: 100%;
}
.execute-bar :deep(.p-inputnumber input) {
  min-width: 0;
}
</style>

