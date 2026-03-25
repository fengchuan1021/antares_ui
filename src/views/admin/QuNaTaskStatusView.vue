<template>
  <div class="quna-task-status p-4">
    <h2 class="title">去哪儿任务状态</h2>
    <Button label="刷新" icon="pi pi-refresh" text @click="loadList" />
    <DataTable :value="list" class="mt-3" stripedRows>
      <Column field="id" header="ID" />
      <Column field="publisher_username" header="发布者" />
      <Column field="total_tasks" header="总任务数" />
      <Column field="completed_tasks" header="完成数" />
      <Column field="timeout_tasks" header="超时数" />
      <Column header="创建时间">
        <template #body="{ data }">{{ formatTime(data.created_at) }}</template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { getQuNaTaskSummaryList } from '../../api/qunatask'

const list = ref([])

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

async function loadList() {
  const res = await getQuNaTaskSummaryList()
  if (res?.code === 0) {
    list.value = res.data || []
  }
}

onMounted(loadList)
</script>

<style scoped>
.title {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
