<template>
  <div class="quna-task-add p-4">
    <h2 class="title">上传去哪儿任务</h2>
    <p class="hint">支持 JSON 文件，内容为数组对象：cityUrl/city/hotelId/hotelName</p>

    <div class="upload-row">
      <input
        ref="fileInputRef"
        class="file-input-hidden"
        type="file"
        accept=".json,application/json,text/json"
        @change="handleFileChange"
      />
      <Button label="选择文件" icon="pi pi-file" outlined @click="handleSelectFile" />
      <input
        class="file-display"
        type="text"
        :value="selectedFileName || '未选择文件'"
        readonly
      />
      <Button label="上传文件" icon="pi pi-upload" :loading="uploading" @click="handleUpload" />
    </div>

    <Message v-if="message.text" :severity="message.type" class="mt-3">{{ message.text }}</Message>

    <Card v-if="summary" class="mt-4">
      <template #title>本次新增任务概览</template>
      <template #content>
        <div class="summary-grid">
          <div class="summary-item"><span>汇总ID</span><b>{{ summary.id }}</b></div>
          <div class="summary-item"><span>总任务数</span><b>{{ summary.total_tasks }}</b></div>
          <div class="summary-item"><span>完成任务数</span><b>{{ summary.completed_tasks }}</b></div>
          <div class="summary-item"><span>超时任务数</span><b>{{ summary.timeout_tasks }}</b></div>
          <div class="summary-item"><span>发布者ID</span><b>{{ summary.publisher_id }}</b></div>
          <div class="summary-item"><span>发布者</span><b>{{ summary.publisher_username }}</b></div>
          <div class="summary-item"><span>开始时间</span><b>{{ formatTime(summary.start_time) }}</b></div>
          <div class="summary-item"><span>结束时间</span><b>{{ formatTime(summary.end_time) }}</b></div>
          <div class="summary-item"><span>创建时间</span><b>{{ formatTime(summary.created_at) }}</b></div>
          <div class="summary-item"><span>更新时间</span><b>{{ formatTime(summary.updated_at) }}</b></div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { uploadQuNaTask } from '../../api/qunatask'

const fileInputRef = ref(null)
const selectedFile = ref(null)
const selectedFileName = ref('')
const uploading = ref(false)
const summary = ref(null)
const message = ref({ type: 'info', text: '' })

function handleFileChange(event) {
  const file = event.target?.files?.[0]
  selectedFile.value = file || null
  selectedFileName.value = file?.name || ''
}

function handleSelectFile() {
  fileInputRef.value?.click()
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

async function handleUpload() {
  if (!selectedFile.value) {
    message.value = { type: 'warn', text: '请先选择 JSON 文件' }
    return
  }
  uploading.value = true
  message.value = { type: 'info', text: '' }
  try {
    const res = await uploadQuNaTask(selectedFile.value)
    if (res.code !== 0) {
      message.value = { type: 'error', text: res.msg || '上传失败' }
      return
    }
    summary.value = res.data
    message.value = { type: 'success', text: res.msg || '上传成功' }
    selectedFile.value = null
    selectedFileName.value = ''
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    message.value = { type: 'error', text: error?.message || '上传失败，请稍后重试' }
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.quna-task-add {
  color: #333;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hint {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

.upload-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.file-display {
  min-width: 220px;
  flex: 1;
  max-width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  color: #555;
  background: #fafafa;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.summary-item {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item span {
  font-size: 0.8rem;
  color: #777;
}

.summary-item b {
  font-size: 0.95rem;
  color: #222;
}
</style>
