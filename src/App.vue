<template>
  <div class="app-container">
    <div class="sidebar-wrapper" :class="{ collapsed: isSidebarCollapsed }">
      <Sidebar :collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    </div>
    <div class="main-wrapper" :class="{ expanded: isSidebarCollapsed }">
      <Header @toggle-sidebar="toggleSidebar" />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/common/Header.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Footer from '@/components/common/Footer.vue'

const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style lang="less" scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: @bg-secondary;
}

.sidebar-wrapper {
  width: @sidebar-width;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width @transition-normal;
  
  &.collapsed {
    width: 64px;
  }
}

.main-wrapper {
  flex: 1;
  margin-left: @sidebar-width;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left @transition-normal;
  
  &.expanded {
    margin-left: 64px;
  }
}

.main-content {
  flex: 1;
  padding: @spacing-lg;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity @transition-fast;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    transform: translateX(-100%);
    
    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
  
  .main-wrapper {
    margin-left: 0;
    
    &.expanded {
      margin-left: 0;
    }
  }
}
</style>
