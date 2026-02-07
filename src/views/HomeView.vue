<template>
  <div class="home-view">
    <h1>脚本中心</h1>
    <p class="subtitle">选择要执行的脚本</p>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else>
      <div class="scripts-tree">
        <div
          v-for="category in treeData"
          :key="category.id"
          class="category-card"
        >
          <button
            class="category-header"
            :class="{ expanded: expandedCategories.has(category.id) }"
            @click="toggleCategory(category.id)"
          >
            <span class="category-name">{{ category.name }}</span>
            <span v-if="category.is_new" class="badge new">新</span>
            <span v-if="category.is_hot" class="badge hot">热</span>
            <span class="expand-icon">{{ expandedCategories.has(category.id) ? '▼' : '▶' }}</span>
          </button>

          <Transition name="slide">
            <div v-show="expandedCategories.has(category.id)" class="scripts-list">
              <label
                v-for="script in category.scripts"
                :key="script.id"
                class="script-item"
                :class="{ selected: selectedIds.has(script.id) }"
              >
                <input
                  type="checkbox"
                  :value="script.id"
                  :checked="selectedIds.has(script.id)"
                  @change="toggleScript(script)"
                />
                <img
                  v-if="script.icon_url"
                  :src="script.icon_url"
                  :alt="script.name"
                  class="script-icon"
                />
                <div class="script-info">
                  <span class="script-name">{{ script.name }}</span>
                  <span v-if="script.description" class="script-desc">{{ script.description }}</span>
                </div>
              </label>
            </div>
          </Transition>
        </div>
      </div>

      <div v-if="selectedScripts.length > 0" class="selected-summary">
        <h3>已选 {{ selectedScripts.length }} 个脚本</h3>
        <div class="selected-tags">
          <span
            v-for="s in selectedScripts"
            :key="s.id"
            class="tag"
          >
            {{ s.name }}
            <button type="button" class="tag-remove" @click="removeScript(s)" aria-label="移除">×</button>
          </span>
        </div>
      </div>
    </template>

    <div class="execute-bar">
      <div class="execute-inputs">
        <div class="input-group">
          <label>执行时间</label>
          <input
            v-model="executeTime"
            type="number"
            min="1"
            placeholder="分钟"
          />
        </div>
        <div class="input-group">
          <label>执行轮数</label>
          <input
            v-model="executeRounds"
            type="number"
            min="1"
            placeholder="轮"
          />
        </div>
      </div>
      <button
        class="execute-btn"
        :disabled="selectedScripts.length === 0"
        @click="handleExecute"
      >
        执行
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getScriptsTree } from '../api/script'

const loading = ref(true)
const error = ref('')
const treeData = ref([])
const expandedCategories = ref(new Set())
const selectedIds = ref(new Set())
const selectedScriptsMap = ref(new Map()) // id -> script

const selectedScripts = computed(() => Array.from(selectedScriptsMap.value.values()))

const executeTime = ref('')
const executeRounds = ref('')

function handleExecute() {
  if (selectedScripts.value.length === 0) return
  // TODO: 调用执行接口
  const time = Number(executeTime.value) || 0
  const rounds = Number(executeRounds.value) || 0
  console.log('执行', { executeTime: time, executeRounds: rounds, scripts: selectedScripts.value })
}

function toggleCategory(id) {
  const next = new Set(expandedCategories.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedCategories.value = next
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

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await getScriptsTree()
    treeData.value = res?.data ?? []
    // 默认展开第一个分类
    if (treeData.value.length > 0) {
      expandedCategories.value = new Set([treeData.value[0].id])
    }
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-view {
  padding: 1rem 1.25rem;
  padding-bottom: 140px; /* 为底部执行栏和导航栏留出空间 */
}

.execute-bar {
  position: fixed;
  bottom: 56px; /* 在 BottomNav 上方 */
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 99;
}

.execute-inputs {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-group label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.input-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.95rem;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.input-group input:focus {
  outline: none;
  border-color: #6366f1;
}

.execute-btn {
  padding: 0.6rem 1.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.execute-btn:hover:not(:disabled) {
  background: #5558e3;
}

.execute-btn:disabled {
  background: rgba(99, 102, 241, 0.4);
  cursor: not-allowed;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  margin: 0 0 1.25rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.error {
  color: #f87171;
}

.scripts-tree {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 1rem;
  text-align: left;
  transition: background 0.2s;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.06);
}

.category-name {
  flex: 1;
  font-weight: 500;
}

.badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.badge.new {
  background: #22c55e33;
  color: #22c55e;
}

.badge.hot {
  background: #ef444433;
  color: #ef4444;
}

.expand-icon {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.scripts-list {
  padding: 0 0.5rem 0.75rem;
}

.script-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.script-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.script-item.selected {
  background: rgba(99, 102, 241, 0.15);
}

.script-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}

.script-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.script-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.script-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.script-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.selected-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.selected-summary h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  background: rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  font-size: 0.85rem;
}

.tag-remove {
  padding: 0;
  margin: 0;
  width: 18px;
  height: 18px;
  border: none;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  color: inherit;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.tag-remove:hover {
  background: rgba(0, 0, 0, 0.35);
}

@media (prefers-color-scheme: light) {
  .execute-bar {
    background: #ffffff;
    border-top-color: rgba(0, 0, 0, 0.1);
  }
  .input-group label {
    color: rgba(0, 0, 0, 0.6);
  }
  .input-group input {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.15);
  }
  .input-group input::placeholder {
    color: rgba(0, 0, 0, 0.35);
  }
}
</style>
