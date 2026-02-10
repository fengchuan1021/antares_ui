<template>
  <div class="application-manager-view p-4">
    <div class="flex gap-2 mb-4">
      <Button
        label="读取手机中已安装app"
        icon="pi pi-refresh"
        :loading="loading"
        :disabled="!isInWebView"
        @click="loadInstalledApps"
      />
      <Button
        label="保存"
        icon="pi pi-save"
        :loading="saving"
        :disabled="!apps.length"
        severity="success"
        @click="saveApplications"
      />
    </div>

    <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">
      {{ errorMsg }}
    </Message>
    <Message v-else-if="successMsg" severity="success" :closable="false" class="mb-4">
      {{ successMsg }}
    </Message>
    <Message v-else-if="!isInWebView && !apps.length" severity="info" :closable="false" class="mb-4">
      请在手机应用中打开此页面
    </Message>

    <div v-if="apps.length" class="app-list space-y-2">
      <Card v-for="app in apps" :key="app.packageName" class="app-item">
        <template #content>
          <div class="flex items-center gap-3">
            <img
              v-if="app.iconBase64"
              :src="app.iconBase64"
              :alt="app.name"
              class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ app.name }}</div>
              <div class="text-sm opacity-70 truncate">{{ app.packageName }}</div>
            </div>
            <div class="flex gap-4 flex-shrink-0">
              <div class="flex items-center gap-1">
                <Checkbox v-model="app.toClean" :binary="true" :input-id="`clean-${app.packageName}`" />
                <label :for="`clean-${app.packageName}`" class="text-sm cursor-pointer">被清理</label>
              </div>
              <div class="flex items-center gap-1">
                <Checkbox v-model="app.backupData" :binary="true" :input-id="`backup-${app.packageName}`" />
                <label :for="`backup-${app.packageName}`" class="text-sm cursor-pointer">备份数据</label>
              </div>
              <Button
                label="分类"
                icon="pi pi-folder"
                text
                size="small"
                @click="openScriptCategoryDialog(app)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="scriptCategoryDialogVisible"
      header="设置脚本分类"
      modal
      :style="{ width: '360px' }"
      @hide="scriptCategoryTarget = null"
    >
      <div class="field">
        <label class="block text-sm font-medium mb-1">分类</label>
        <Select
          v-model="scriptCategoryId"
          :options="scriptCategories"
          option-label="name"
          option-value="id"
          placeholder="选择分类（可不选）"
          class="w-full"
          show-clear
        />
      </div>
      <template #footer>
        <Button label="取消" text @click="scriptCategoryDialogVisible = false" />
        <Button label="确定" @click="confirmScriptCategory" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { getApplications, saveApplications as saveAppsApi } from '../../api/application'
import { getScriptCategories } from '../../api/script'

const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const apps = ref([])
const savedAppsMap = ref({})
const scriptCategories = ref([])
const scriptCategoryDialogVisible = ref(false)
const scriptCategoryTarget = ref(null)
const scriptCategoryId = ref(null)

const isInWebView = computed(() => typeof window !== 'undefined' && !!window.AndroidBridge)

async function loadSavedApplications() {
  try {
    const res = await getApplications()
    const list = res?.data ?? []
    const map = {}
    for (const a of list) {
      map[a.package_name] = a
    }
    savedAppsMap.value = map
  } catch (_) {
    savedAppsMap.value = {}
  }
}

async function loadScriptCategories() {
  try {
    const res = await getScriptCategories()
    scriptCategories.value = res?.data ?? []
  } catch (_) {
    scriptCategories.value = []
  }
}

const loadInstalledApps = async () => {
  if (!isInWebView.value) {
    errorMsg.value = '请在手机应用中打开此页面'
    return
  }
  await loadSavedApplications()
  loading.value = true
  errorMsg.value = ''
  try {
    const json = window.AndroidBridge.getInstalledApps()
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data)) {
      const map = savedAppsMap.value
      apps.value = res.data.map(a => {
        const saved = map[a.packageName]
        return {
          ...a,
          toClean: saved?.to_clean ?? false,
          backupData: saved?.backup_data ?? false,
          scriptCategoryId: saved?.script_category_id ?? 0
        }
      })
    } else {
      errorMsg.value = '获取失败'
    }
  } catch (e) {
    errorMsg.value = e?.message || '读取失败'
  } finally {
    loading.value = false
  }
}

function openScriptCategoryDialog(app) {
  scriptCategoryTarget.value = app
  scriptCategoryId.value = app.scriptCategoryId || null
  scriptCategoryDialogVisible.value = true
}

function confirmScriptCategory() {
  if (scriptCategoryTarget.value) {
    scriptCategoryTarget.value.scriptCategoryId = scriptCategoryId.value ?? 0
  }
  scriptCategoryDialogVisible.value = false
  scriptCategoryTarget.value = null
}

const saveApplications = async () => {
  if (!apps.value.length) return
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const payload = apps.value.map(a => ({
      packageName: a.packageName,
      name: a.name,
      iconBase64: a.iconBase64 || '',
      toClean: a.toClean,
      backupData: a.backupData,
      script_category_id: a.scriptCategoryId ?? 0
    }))
    await saveAppsApi(payload)
    successMsg.value = '保存成功'
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadScriptCategories()
})
</script>

<style scoped>
.app-item :deep(.p-card-content) {
  padding: 0.75rem 1rem;
}
.app-item :deep(.p-card) {
  margin-bottom: 0;
}
</style>
