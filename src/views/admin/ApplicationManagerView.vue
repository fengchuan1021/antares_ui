<template>
  <div class="application-manager-view p-2">
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

    <Dialog
      v-model:visible="categoryPickerVisible"
      header="选择分类"
      modal
      :style="{ width: '22rem' }"
      @hide="onCategoryPickerHide"
    >
      <div class="flex flex-col gap-3">
        <label class="text-sm opacity-80">分类</label>
        <Select
          v-model="pickedCategoryId"
          :options="categoryList"
          option-label="name"
          option-value="id"
          placeholder="请选择分类"
          class="w-full"
        />
        <div class="flex justify-end gap-2 pt-2">
          <Button label="取消" severity="secondary" text @click="categoryPickerVisible = false" />
          <Button label="确定" :loading="addToCategoryLoading" :disabled="pickedCategoryId == null" @click="confirmAddToCategory" />
        </div>
      </div>
    </Dialog>

    <div v-if="apps.length" class="app-list space-y-2">
      <Card v-for="app in apps" :key="app.packageName" class="app-item">
        <template #content>
          <div class="flex items-center gap-2">
            <div class="flex flex-col items-center flex-shrink-0 w-12">
            
              <img
                v-if="app.iconBase64"
                :src="app.iconBase64"
                :alt="app.name"
                class="app-icon w-12 h-12 rounded-lg object-contain"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ app.name }}</div>
              <div class="text-sm opacity-70 truncate">{{ app.packageName }}</div>
            </div>
            <div class="flex gap-4 flex-shrink-0">
              <div class="flex items-center gap-1">
                <Checkbox v-model="app.whitelist" :binary="true" :input-id="`whitelist-${app.packageName}`" />
                <label :for="`whitelist-${app.packageName}`" class="text-sm cursor-pointer">白名单</label>
              </div>
              <!-- <div class="flex items-center gap-1">
                <Checkbox v-model="app.backupData" :binary="true" :input-id="`backup-${app.packageName}`" />
                <label :for="`backup-${app.packageName}`" class="text-sm cursor-pointer">备份数据</label>
              </div> -->
              <Button
                label=""
                icon="pi pi-upload"
                text
                size="small"
                @click="uploadtoserver(app)"
              />
              <Button
                label=""
                icon="pi pi-plus"
                text
                size="small"
                @click="addtoCategory(app)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    
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
import { getScriptCategories, addScriptToCategory } from '../../api/script'
import { getApplications, saveApplications as saveAppsApi } from '../../api/application'


const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const apps = ref([])
const savedAppsMap = ref({})


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
const categoryList = ref([])
const categoryPickerVisible = ref(false)
const pickedCategoryId = ref(null)
const addToCategoryLoading = ref(false)
const appPendingCategory = ref(null)

const getCategoryList = async () => {
  try {
    const res = await getScriptCategories()
    categoryList.value = res?.data ?? []
  } catch (_) {
    categoryList.value = []
  }
}

function onCategoryPickerHide() {
  appPendingCategory.value = null
  pickedCategoryId.value = null
}

const addtoCategory = async (app) => {
  errorMsg.value = ''
  successMsg.value = ''
  if (!categoryList.value.length) {
    await getCategoryList()
  }
  if (!categoryList.value.length) {
    errorMsg.value = '暂无脚本分类，请先在脚本分类管理中创建'
    return
  }
  appPendingCategory.value = app
  pickedCategoryId.value = null
  categoryPickerVisible.value = true
}

const confirmAddToCategory = async () => {
  const app = appPendingCategory.value
  if (!app || pickedCategoryId.value == null) return
  addToCategoryLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await addScriptToCategory({
      name: app.name,
      category_id: pickedCategoryId.value,
      icon_base64: app.iconBase64 || '',
      package_name: app.packageName || '',
    })
    successMsg.value = '已添加到分类'
    categoryPickerVisible.value = false
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '添加失败'
  } finally {
    addToCategoryLoading.value = false
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
    const json = window.AndroidBridge.getInstalledApps(false)
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data)) {
      const map = savedAppsMap.value
      apps.value = res.data.map(a => {
        const saved = map[a.packageName]
        return {
          ...a,
          whitelist: saved?.whitelist ?? false,
          backupData: saved?.backup_data ?? false,

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
      whitelist: a.whitelist,
      backupData: a.backupData,

    }))
    await saveAppsApi(payload)
    successMsg.value = '保存成功'
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const uploadtoserver = async (app) => {
  try {
    const payload = {
      packageName: app.packageName,
      name: app.name,
    }
    try {
    const json = window.AndroidBridge.uploadapptoserver(app.packageName)
    const res = JSON.parse(json)
    if (res.code === 200 ) {
      errorMsg.value = '后台上传中'
    } else {
      errorMsg.value = '上传失败'
    }
  } catch (e) {
    errorMsg.value = e?.message || '读取失败'
  }
    successMsg.value = '上传成功'
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '上传失败'
  }
}

onMounted(() => {

})
</script>

<style scoped>
.app-icon {
  background: transparent;
}
.app-item :deep(.p-card-content) {
  padding: 0.25rem;
}
.app-item :deep(.p-card) {
  margin-bottom: 0;
}
</style>
