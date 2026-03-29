<template>
  <Dialog
    v-model:visible="visible"
    header="选择设备"
    modal
    :style="{ width: 'min(92vw, 420px)' }"
    :dismissable-mask="true"
    @hide="onHide"
  >
    <ProgressSpinner v-if="loading" class="mx-auto my-6 block" />
    <Message v-else-if="errorMsg" severity="error" :closable="false" class="mb-2">
      {{ errorMsg }}
    </Message>
    <div v-else class="max-h-[50vh] overflow-auto flex flex-col gap-1">
      <div
        v-for="d in devices"
        :key="d.id"
        class="flex items-center gap-2 p-2 rounded-lg border border-[#f4c769]/60 bg-[#fff9e6]/90"
      >
        <Checkbox
          :model-value="selectedSerials.has(d.serial)"
          :binary="true"
          :input-id="`dev-${d.id}`"
          @update:model-value="() => toggleSerial(d.serial)"
        />
        <label :for="`dev-${d.id}`" class="flex-1 min-w-0 cursor-pointer">
          <div class="font-medium truncate">{{ d.serial }}</div>
          <div v-if="d.username" class="text-sm text-gray-500 truncate">{{ d.username }}</div>
        </label>
      </div>
      <div v-if="!devices.length" class="text-center text-gray-500 text-sm py-6">暂无设备</div>
    </div>
    <template #footer>
      <Button label="取消" text @click="visible = false" />
      <Button label="确定" class="executebtn border-0" :disabled="loading || !selectedSerials.size" @click="onConfirm" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { listDevices } from '../api/device'

const visible = defineModel('visible', { type: Boolean, default: false })

const emit = defineEmits(['confirm'])

const loading = ref(false)
const errorMsg = ref('')
const devices = ref([])
const selectedSerials = ref(new Set())

async function loadDevices() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await listDevices()
    const list = res?.data ?? []
    devices.value = list
    selectedSerials.value = new Set(list.map((d) => d.serial))
  } catch (e) {
    devices.value = []
    selectedSerials.value = new Set()
    errorMsg.value = e?.response?.data?.msg || e?.message || '加载设备失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDevices()
})

function toggleSerial(serial) {
  const next = new Set(selectedSerials.value)
  if (next.has(serial)) next.delete(serial)
  else next.add(serial)
  selectedSerials.value = next
}

function onConfirm() {
  emit('confirm', Array.from(selectedSerials.value))
  visible.value = false
}

function onHide() {
  errorMsg.value = ''
}
</script>

<style scoped>
.executebtn {
  border-radius: 8px;
  background: linear-gradient(135deg, #f6b148, #e08b00);
  color: white;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
}
</style>
