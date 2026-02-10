<template>
  <div class="script-manager-view p-4">
    <h2 class="text-lg font-semibold mb-4">脚本管理</h2>
    <p class="text-sm opacity-70 mb-4">为每个脚本设置所属分类。</p>
    <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">
      {{ errorMsg }}
    </Message>
    <Message v-if="successMsg" severity="success" :closable="false" class="mb-4">
      {{ successMsg }}
    </Message>
    <div v-if="loading && list.length === 0" class="opacity-70">加载中...</div>
    <div v-else-if="list.length === 0" class="opacity-70">暂无脚本</div>
    <div v-else class="script-list space-y-3">
      <Card v-for="script in list" :key="script.id" class="script-card">
        <template #content>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ script.name }}</div>
              <div class="text-sm opacity-70 truncate">{{ script.package_name || '—' }}</div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <label class="text-sm opacity-70">分类</label>
              <Select
                :model-value="script.category_id"
                :options="scriptCategories"
                option-label="name"
                option-value="id"
                placeholder="选择分类"
                class="script-category-select"
                @update:model-value="(v) => onCategoryChange(script, v)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Message from 'primevue/message'
import { getScripts, getScriptCategories, updateScriptCategoryOnly } from '../../api/script'

const list = ref([])
const scriptCategories = ref([])
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function loadScripts() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getScripts()
    list.value = res?.data ?? []
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const res = await getScriptCategories()
    scriptCategories.value = res?.data ?? []
  } catch (_) {
    scriptCategories.value = []
  }
}

async function onCategoryChange(script, categoryId) {
  if (categoryId === undefined || categoryId === null) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await updateScriptCategoryOnly(script.id, categoryId)
    script.category_id = categoryId
    successMsg.value = '已更新「' + script.name + '」的分类'
    setTimeout(() => { successMsg.value = '' }, 2000)
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '更新失败'
  }
}

onMounted(async () => {
  await loadCategories()
  await loadScripts()
})
</script>

<style scoped>
.script-category-select {
  min-width: 140px;
}
.script-card :deep(.p-card-content) {
  padding: 0.75rem 1rem;
}
</style>
