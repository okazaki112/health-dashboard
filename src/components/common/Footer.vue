<template>
  <footer class="footer">
    <div class="footer-content">
      <span class="copyright">
        © {{ currentYear }} 健康助手看板 - 您的个人健康管理专家
      </span>
      <div class="footer-links">
        <a href="#" @click.prevent>使用帮助</a>
        <span class="divider">|</span>
        <a href="#" @click.prevent>隐私政策</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style lang="less" scoped>
.footer {
  height: @footer-height;
  background: @bg-primary;
  border-top: 1px solid @border-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  padding: 0 @spacing-lg;
}

.copyright {
  font-size: @font-size-xs;
  color: @text-secondary;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: @spacing-sm;
  
  a {
    font-size: @font-size-xs;
    color: @text-secondary;
    transition: color @transition-fast;
    
    &:hover {
      color: @primary-color;
    }
  }
  
  .divider {
    color: @text-placeholder;
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: @spacing-xs;
  }
}
</style>
