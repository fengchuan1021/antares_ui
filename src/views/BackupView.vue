<template>
  <div class="backup-view p-4 pb-24">
    <h1 class="mb-4 text-xl font-semibold">备份</h1>

    <Message v-if="!isInWebView" severity="info" :closable="false" class="mb-4">
      请在手机应用中打开此页面
    </Message>

    <div v-else>
      <div class="flex gap-2 mb-4">
        <Button
          label="加载应用列表"
          icon="pi pi-refresh"
          :loading="loading"
          @click="loadApps"
        />
      </div>

      <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">
        {{ errorMsg }}
      </Message>
      <Message v-else-if="successMsg" severity="success" :closable="false" class="mb-4">
        {{ successMsg }}
      </Message>

      <div v-if="apps.length" class="app-list mb-6">
        <div
          v-for="app in apps"
          :key="app.packageName"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          :class="{ 'bg-indigo-500/10': selectedPackages.has(app.packageName) }"
          @click="toggleApp(app.packageName)"
        >
          <Checkbox
            :model-value="selectedPackages.has(app.packageName)"
            :binary="true"
            :input-id="`backup-${app.packageName}`"
            @update:model-value="() => toggleApp(app.packageName)"
          />
          <img
            v-if="app.iconBase64"
            :src="app.iconBase64"
            :alt="app.name"
            class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ app.name }}</div>
            <div class="text-sm text-gray-500 truncate">{{ app.packageName }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-8 text-gray-500">
        点击「加载应用列表」获取已安装应用
      </div>
    </div>

    <div class="fixed bottom-16 left-0 right-0 flex gap-2 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
      <Button
        label="查看备份"
        icon="pi pi-folder-open"
        severity="secondary"
        class="flex-1"
        @click="handleViewBackups"
      />
      <Button
        label="保存备份"
        icon="pi pi-save"
        severity="success"
        class="flex-1"
        :disabled="selectedPackages.size === 0"
        :loading="saving"
        @click="handleSaveBackup"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'

const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const apps = ref([])
const selectedPackages = ref(new Set())

const isInWebView = computed(() => typeof window !== 'undefined' && !!window.AndroidBridge)

function toggleApp(pkg) {
  const next = new Set(selectedPackages.value)
  if (next.has(pkg)) next.delete(pkg)
  else next.add(pkg)
  selectedPackages.value = next
}

async function loadApps() {
  if (!isInWebView.value) return
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const json = window.AndroidBridge.getInstalledApps()
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data)) {
      apps.value = res.data
    } else {
      errorMsg.value = '获取应用列表失败'
    }
  } catch (e) {
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function handleViewBackups() {
  if (!isInWebView.value) {
    errorMsg.value = '请在手机应用中打开此页面'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const json = window.AndroidBridge.listBackups()
    const res = JSON.parse(json)
    if (res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
      const list = res.data
        .map(
          (b) =>
            `${b.name} (${formatSize(b.size)})\n${b.path}`
        )
        .join('\n\n')
      alert('已备份文件：\n\n' + list)
    } else {
      alert('暂无备份文件')
    }
  } catch (e) {
    errorMsg.value = e?.message || '查看失败'
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleSaveBackup() {
  if (!isInWebView.value || selectedPackages.value.size === 0) return
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const arr = Array.from(selectedPackages.value)
    const json = window.AndroidBridge.backupApps(JSON.stringify(arr))
    const res = JSON.parse(json)
    if (res.code === 0) {
      successMsg.value = `备份完成：${res.path}`
    } else {
      errorMsg.value = res.msg || '备份失败'
    }
  } catch (e) {
    errorMsg.value = e?.message || '备份失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.backup-view {
  min-height: 100vh;
}
</style>
