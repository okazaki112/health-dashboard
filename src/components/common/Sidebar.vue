<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <el-icon class="logo-icon"><Odometer /></el-icon>
        <span v-show="!collapsed" class="logo-text">健康助手</span>
      </div>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      router
      class="sidebar-menu"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
    
    <div class="sidebar-footer">
      <div v-show="!collapsed" class="version">
        v1.0.0
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Odometer, User, Document, Flag, Bell, Download 
} from '@element-plus/icons-vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()

const menuItems = [
  { path: '/', title: '首页看板', icon: 'Odometer' },
  { path: '/profile', title: '个人档案', icon: 'User' },
  { path: '/records', title: '数据记录', icon: 'Document' },
  { path: '/goals', title: '目标管理', icon: 'Flag' },
  { path: '/reminders', title: '提醒设置', icon: 'Bell' },
  { path: '/export', title: '数据导出', icon: 'Download' }
]

const activeMenu = computed(() => route.path)
</script>

<style lang="less" scoped>
.sidebar {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, @bg-dark 0%, #1f2937 100%);
  display: flex;
  flex-direction: column;
  transition: width @transition-normal;
  overflow: hidden;
  
  &.collapsed {
    .sidebar-header {
      padding: @spacing-md @spacing-sm;
    }
  }
}

.sidebar-header {
  padding: @spacing-lg;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: @spacing-sm;
  color: white;
}

.logo-icon {
  font-size: 28px;
  color: @primary-color;
  flex-shrink: 0;
}

.logo-text {
  font-size: @font-size-lg;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  padding: @spacing-md 0;
  
  :deep(.el-menu-item) {
    color: rgba(255, 255, 255, 0.7);
    margin: 4px @spacing-sm;
    border-radius: @radius-md;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    &.is-active {
      background: @primary-color;
      color: white;
    }
    
    .el-icon {
      font-size: 20px;
    }
  }
  
  &.el-menu--collapse {
    :deep(.el-menu-item) {
      padding: 0 20px !important;
    }
  }
}

.sidebar-footer {
  padding: @spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.version {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: @font-size-xs;
}
</style>
