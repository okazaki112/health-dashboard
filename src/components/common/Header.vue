<template>
  <header class="header">
    <div class="header-left">
      <el-button 
        class="toggle-btn" 
        :icon="Fold" 
        @click="$emit('toggle-sidebar')"
        text
      />
      <div class="header-title">
        <h1>{{ pageTitle }}</h1>
      </div>
    </div>
    <div class="header-right">
      <el-tooltip content="今日健康状态" placement="bottom">
        <el-badge :value="todayScore" :max="100" class="health-badge">
          <el-button :icon="Star" circle />
        </el-badge>
      </el-tooltip>
      <el-tooltip content="通知" placement="bottom">
        <el-badge :value="notifications" :hidden="notifications === 0">
          <el-button :icon="Bell" circle />
        </el-badge>
      </el-tooltip>
      <el-dropdown trigger="click">
        <el-avatar :size="36" class="avatar">
          {{ userInitial }}
        </el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/profile')">
              <el-icon><User /></el-icon>
              个人档案
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/export')">
              <el-icon><Download /></el-icon>
              数据导出
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { 
  Fold, Bell, User, Download, Setting, Star 
} from '@element-plus/icons-vue'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const profileStore = useProfileStore()

const pageTitle = computed(() => route.meta.title || '健康助手')

const userInitial = computed(() => {
  const name = profileStore.profile?.nickname || '健'
  return name.charAt(0).toUpperCase()
})

const todayScore = computed(() => {
  return profileStore.todayHealthScore || 85
})

const notifications = computed(() => {
  return 0
})
</script>

<style lang="less" scoped>
.header {
  height: @header-height;
  background: @bg-primary;
  border-bottom: 1px solid @border-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 @spacing-lg;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: @spacing-md;
}

.toggle-btn {
  font-size: 20px;
  color: @text-secondary;
  
  &:hover {
    color: @primary-color;
  }
}

.header-title {
  h1 {
    font-size: @font-size-lg;
    font-weight: 600;
    color: @text-primary;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: @spacing-md;
}

.health-badge {
  :deep(.el-badge__content) {
    background: @primary-color;
  }
}

.avatar {
  cursor: pointer;
  background: linear-gradient(135deg, @primary-color, @primary-light);
  color: white;
  font-weight: 600;
}

:deep(.el-button.is-circle) {
  border: 1px solid @border-color;
  background: @bg-primary;
  
  &:hover {
    border-color: @primary-color;
    color: @primary-color;
  }
}
</style>
