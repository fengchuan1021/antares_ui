<template>
  <div class="script-category-manager p-4">

    <div class="flex gap-2 mb-4">
      <Button label="新增分类" icon="pi pi-plus" @click="openEdit(null)" />
    </div>
    <Message v-if="errorMsg" severity="error" :closable="false" class="mb-4">
      {{ errorMsg }}
    </Message>
    <Message v-if="successMsg" severity="success" :closable="false" class="mb-4">
      {{ successMsg }}
    </Message>
    <div v-if="loading && list.length === 0" class="opacity-70">加载中...</div>
    <div v-else-if="list.length === 0" class="opacity-70">暂无分类，点击「新增分类」添加</div>
    <div v-else class="category-list space-y-3">
      <Card v-for="item in list" :key="item.id" class="category-card">
        <template #content>
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium">{{ item.name }}</span>
                <span v-if="item.is_new" class="tag tag-new">新</span>
                <span v-if="item.is_hot" class="tag tag-hot">热</span>
                <span class="text-sm opacity-70">排序 {{ item.sort_order }}</span>
              </div>
              <p v-if="item.description" class="text-sm opacity-80 mt-1">{{ item.description }}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <Button icon="pi pi-pencil" text rounded size="small" @click="openEdit(item)" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDelete(item)" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :header="editId ? '编辑分类' : '新增分类'"
      modal
      :style="{ width: '400px' }"
      @hide="resetForm"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label class="block text-sm font-medium mb-1">名称</label>
          <InputText v-model="form.name" placeholder="分类名称" class="w-full" />
        </div>
        <div class="field">
          <label class="block text-sm font-medium mb-1">描述</label>
          <InputText v-model="form.description" placeholder="可选" class="w-full" />
        </div>
        <div class="field flex gap-4">
          <div class="flex items-center gap-2">
            <Checkbox v-model="form.is_new" input-id="is_new" :binary="true" />
            <label for="is_new">标为新</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox v-model="form.is_hot" input-id="is_hot" :binary="true" />
            <label for="is_hot">标为热</label>
          </div>
        </div>
        <div class="field">
          <label class="block text-sm font-medium mb-1">排序（数字越小越靠前）</label>
          <InputNumber v-model="form.sort_order" :min="0" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="取消" text @click="dialogVisible = false" />
        <Button label="保存" :loading="submitLoading" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteConfirmVisible"
      header="确认删除"
      modal
      :style="{ width: '320px' }"
    >
      <p>确定要删除分类「{{ deleteTarget?.name }}」吗？</p>
      <template #footer>
        <Button label="取消" text @click="deleteConfirmVisible = false" />
        <Button label="删除" severity="danger" :loading="deleteLoading" @click="doDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import {
  getScriptCategories,
  createScriptCategory,
  updateScriptCategory,
  deleteScriptCategory
} from '../../api/script'

const list = ref([])
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const dialogVisible = ref(false)
const editId = ref(null)
const form = reactive({
  name: '',
  description: '',
  is_new: false,
  is_hot: false,
  sort_order: 0
})
const submitLoading = ref(false)
const deleteConfirmVisible = ref(false)
const deleteTarget = ref(null)
const deleteLoading = ref(false)

async function loadList() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getScriptCategories()
    list.value = res?.data ?? []
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function openEdit(item) {
  if (item) {
    editId.value = item.id
    form.name = item.name
    form.description = item.description || ''
    form.is_new = !!item.is_new
    form.is_hot = !!item.is_hot
    form.sort_order = item.sort_order ?? 0
  } else {
    editId.value = null
    form.name = ''
    form.description = ''
    form.is_new = false
    form.is_hot = false
    form.sort_order = 0
  }
  dialogVisible.value = true
}

function resetForm() {
  editId.value = null
  form.name = ''
  form.description = ''
  form.is_new = false
  form.is_hot = false
  form.sort_order = 0
}

async function submitForm() {
  if (!form.name?.trim()) {
    errorMsg.value = '请输入分类名称'
    return
  }
  submitLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      is_new: form.is_new,
      is_hot: form.is_hot,
      sort_order: form.sort_order ?? 0
    }
    if (editId.value) {
      await updateScriptCategory(editId.value, payload)
      successMsg.value = '更新成功'
    } else {
      await createScriptCategory(payload)
      successMsg.value = '添加成功'
    }
    dialogVisible.value = false
    await loadList()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '保存失败'
  } finally {
    submitLoading.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
  deleteConfirmVisible.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await deleteScriptCategory(deleteTarget.value.id)
    successMsg.value = '已删除'
    deleteConfirmVisible.value = false
    deleteTarget.value = null
    await loadList()
  } catch (e) {
    errorMsg.value = e?.response?.data?.error || e?.message || '删除失败'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => loadList())
</script>

<style scoped>
.tag {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}
.tag-new { background: rgba(34, 197, 94, 0.2); color: rgb(34, 197, 94); }
.tag-hot { background: rgba(239, 68, 68, 0.2); color: rgb(239, 68, 68); }
</style>
