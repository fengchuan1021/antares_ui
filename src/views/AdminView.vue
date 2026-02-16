<template>
  <div class="admin-view">
    <div v-if="currentMenu === null" class="menu-list p-4 mt-6">
      <h1 class="text-xl font-semibold mb-4 ">管理</h1>
      <div class="menu-grid">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item"
          @click="currentMenu = item.id"
        >
          <i :class="['pi', item.icon, 'menu-icon']"></i>
          <span class="menu-label">{{ item.label }}</span>
          <i class="pi pi-chevron-right menu-arrow"></i>
        </div>
      </div>
    </div>
    <div v-else class="menu-content mt-6">
      <div class="menu-header">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="currentMenu = null"
        />
        <span class="menu-title">{{ currentMenuLabel }}</span>
      </div>
      <div class="menu-body">
        <component :is="currentComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import ApplicationManagerView from './admin/ApplicationManagerView.vue'
import ScriptCategoryManagerView from './admin/ScriptCategoryManagerView.vue'
import ScriptManagerView from './admin/ScriptManagerView.vue'
import AddUserView from './admin/AddUserView.vue'
import DeviceActivationView from './admin/DeviceActivationView.vue'
import DomainBlacklistView from './admin/DomainBlacklistView.vue'
import CustomerManagementView from './admin/CustomerManagementView.vue'

const menuItems = [
  { id: 'app', label: 'app管理', icon: 'pi-mobile', component: ApplicationManagerView },
  //{ id: 'scriptCategory', label: '脚本分类', icon: 'pi-folder', component: ScriptCategoryManagerView },
  // { id: 'script', label: '脚本管理', icon: 'pi-code', component: ScriptManagerView },
  { id: 'user', label: '添加用户', icon: 'pi-user-plus', component: AddUserView },
  { id: 'device', label: '设备激活续费', icon: 'pi-tablet', component: DeviceActivationView },
  { id: 'domain', label: '域名黑名单', icon: 'pi-ban', component: DomainBlacklistView },
  { id: 'customer', label: '客户管理', icon: 'pi-users', component: CustomerManagementView }
]

const currentMenu = ref(null)

const currentMenuLabel = computed(() => {
  const item = menuItems.find(m => m.id === currentMenu.value)
  return item?.label ?? ''
})

const currentComponent = computed(() => {
  const item = menuItems.find(m => m.id === currentMenu.value)
  return item?.component ?? null
})
</script>

<style scoped>
.admin-view {
  min-height: 100%;
}
.menu-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-item:active {
  background: rgba(255, 255, 255, 0.1);
}
.menu-icon {
  font-size: 1.25rem;
  color: var(--p-primary-color);
}
.menu-label {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
}
.menu-arrow {
  font-size: 0.875rem;
  opacity: 0.5;
}
.menu-content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.menu-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.menu-title {
  font-size: 1.125rem;
  font-weight: 600;
}
.menu-body {
  flex: 1;
  overflow-y: auto;
}
@media (prefers-color-scheme: light) {
  .menu-item {
    background: rgba(0, 0, 0, 0.04);
  }
  .menu-item:active {
    background: rgba(0, 0, 0, 0.08);
  }
  .menu-header {
    border-bottom-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
