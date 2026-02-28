<template>
  <div class="export-page">
    <div class="page-header">
      <h1>数据导出与备份</h1>
    </div>
    
    <div class="export-content">
      <!-- 导出设置 -->
      <el-card class="export-card">
        <template #header>
          <span>导出设置</span>
        </template>
        
        <el-form :model="exportForm" label-width="100px">
          <el-form-item label="导出格式">
            <el-radio-group v-model="exportForm.format">
              <el-radio label="json">
                <span>JSON</span>
                <span class="format-desc">完整数据备份，支持导入恢复</span>
              </el-radio>
              <el-radio label="csv">
                <span>CSV</span>
                <span class="format-desc">数据分析，可用Excel打开</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="数据范围">
            <el-radio-group v-model="exportForm.range">
              <el-radio label="all">全部数据</el-radio>
              <el-radio label="custom">指定日期范围</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="日期范围" v-if="exportForm.range === 'custom'">
            <el-date-picker
              v-model="exportForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="数据模块">
            <el-checkbox-group v-model="exportForm.modules">
              <el-checkbox label="profile">健康档案</el-checkbox>
              <el-checkbox label="records">健康记录</el-checkbox>
              <el-checkbox label="goals">目标设置</el-checkbox>
              <el-checkbox label="reminders">提醒设置</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleExport" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 数据导入 -->
      <el-card class="import-card">
        <template #header>
          <span>数据导入</span>
        </template>
        
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          @change="handleFileSelect"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将JSON文件拖到此处，或 <em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持导入 JSON 格式的备份文件
            </div>
          </template>
        </el-upload>
        
        <el-alert 
          v-if="importData"
          type="info"
          :closable="false"
          class="import-preview"
        >
          <template #title>
            备份文件信息
          </template>
          <p>导出时间: {{ importData.exportedAt }}</p>
          <p v-if="importData.profile">包含健康档案</p>
          <p v-if="importData.records">健康记录: {{ importData.records.length }} 条</p>
          <p v-if="importData.goals">目标设置: {{ importData.goals.length }} 个</p>
        </el-alert>
        
        <div class="import-actions" v-if="importData">
          <el-button type="primary" @click="handleImport" :loading="importing">
            确认导入
          </el-button>
          <el-button @click="importData = null">取消</el-button>
        </div>
      </el-card>
      
      <!-- 数据管理 -->
      <el-card class="manage-card">
        <template #header>
          <span>数据管理</span>
        </template>
        
        <div class="storage-info">
          <div class="info-item">
            <span class="label">已使用空间</span>
            <span class="value">{{ storageUsage.used }} KB</span>
          </div>
          <div class="info-item">
            <span class="label">存储使用率</span>
            <el-progress 
              :percentage="parseFloat(storageUsage.percentage)" 
              :color="storageColor"
            />
          </div>
        </div>
        
        <el-divider />
        
        <div class="danger-zone">
          <h4>危险操作</h4>
          <p>清除所有数据将删除您的健康档案、记录、目标和提醒设置。此操作不可恢复。</p>
          <el-button type="danger" @click="handleClearAll">
            <el-icon><Delete /></el-icon>
            清除所有数据
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, UploadFilled, Delete } from '@element-plus/icons-vue'
import { useProfileStore } from '@/stores/profile'
import { useHealthStore } from '@/stores/health'
import { useGoalsStore } from '@/stores/goals'
import { useRemindersStore } from '@/stores/reminders'
import { exportJSON, exportCSV, importJSON } from '@/utils/export'
import { storage } from '@/utils/storage'

const profileStore = useProfileStore()
const healthStore = useHealthStore()
const goalsStore = useGoalsStore()
const remindersStore = useRemindersStore()

const exporting = ref(false)
const importing = ref(false)
const importData = ref(null)

const exportForm = ref({
  format: 'json',
  range: 'all',
  dateRange: [],
  modules: ['profile', 'records', 'goals', 'reminders']
})

// 存储使用情况
const storageUsage = computed(() => {
  const usage = storage.getUsage()
  return {
    used: (usage.used / 1024).toFixed(2),
    percentage: usage.percentage
  }
})

// 存储颜色
const storageColor = computed(() => {
  const percent = parseFloat(storageUsage.value.percentage)
  if (percent < 50) return '#10b981'
  if (percent < 80) return '#f59e0b'
  return '#ef4444'
})

// 导出数据
const handleExport = async () => {
  if (exportForm.value.modules.length === 0) {
    ElMessage.warning('请至少选择一个数据模块')
    return
  }
  
  exporting.value = true
  
  try {
    const data = {}
    const { startDate, endDate } = exportForm.value.range === 'custom' && exportForm.value.dateRange 
      ? { startDate: exportForm.value.dateRange[0], endDate: exportForm.value.dateRange[1] }
      : {}
    
    if (exportForm.value.modules.includes('profile')) {
      data.profile = profileStore.profile
    }
    
    if (exportForm.value.modules.includes('records')) {
      const exportResult = await healthStore.exportData({ startDate, endDate })
      data.records = exportResult.records
    }
    
    if (exportForm.value.modules.includes('goals')) {
      data.goals = goalsStore.goals
    }
    
    if (exportForm.value.modules.includes('reminders')) {
      data.reminders = remindersStore.reminders
    }
    
    data.exportedAt = new Date().toISOString()
    
    if (exportForm.value.format === 'json') {
      exportJSON(data, 'health_backup')
    } else {
      if (data.records) {
        exportCSV(data.records, 'health_records')
      } else {
        ElMessage.warning('CSV格式仅支持导出健康记录')
      }
    }
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  } finally {
    exporting.value = false
  }
}

// 选择导入文件
const handleFileSelect = async (uploadFile) => {
  try {
    const data = await importJSON(uploadFile.raw)
    importData.value = data
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 执行导入
const handleImport = async () => {
  try {
    await ElMessageBox.confirm(
      '导入将覆盖现有数据，是否继续？',
      '确认导入',
      { type: 'warning' }
    )
    
    importing.value = true
    
    if (importData.value.profile) {
      profileStore.saveProfile(importData.value.profile)
    }
    
    if (importData.value.records) {
      await healthStore.importRecords(importData.value.records)
    }
    
    if (importData.value.goals) {
      goalsStore.goals = importData.value.goals
      goalsStore.saveToStorage()
    }
    
    if (importData.value.reminders) {
      remindersStore.reminders = importData.value.reminders
      remindersStore.saveToStorage()
    }
    
    ElMessage.success('数据导入成功')
    importData.value = null
  } catch {
    // 取消导入
  } finally {
    importing.value = false
  }
}

// 清除所有数据
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有数据吗？此操作不可恢复！',
      '危险操作',
      { 
        type: 'warning',
        confirmButtonText: '确定清除',
        cancelButtonText: '取消'
      }
    )
    
    await ElMessageBox.confirm(
      '再次确认：您真的要清除所有健康数据吗？',
      '最后确认',
      { 
        type: 'error',
        confirmButtonText: '确定清除',
        cancelButtonText: '取消'
      }
    )
    
    storage.clear()
    profileStore.clearProfile()
    healthStore.records = []
    goalsStore.goals = []
    remindersStore.reminders = []
    
    ElMessage.success('数据已清除')
  } catch {
    // 取消操作
  }
}

onMounted(() => {
  // 初始化stores
  profileStore.initProfile()
  healthStore.initRecords()
  goalsStore.initGoals()
  remindersStore.initReminders()
})
</script>

<style lang="less" scoped>
.export-page {
  .page-header {
    margin-bottom: @spacing-lg;
    
    h1 {
      font-size: @font-size-2xl;
      font-weight: 700;
    }
  }
  
  .export-content {
    display: grid;
    gap: @spacing-lg;
    max-width: 800px;
  }
  
  .export-card {
    .format-desc {
      font-size: @font-size-xs;
      color: @text-secondary;
      margin-left: @spacing-sm;
    }
  }
  
  .import-card {
    :deep(.el-upload-dragger) {
      padding: @spacing-xl;
    }
    
    .import-preview {
      margin-top: @spacing-md;
      
      p {
        margin-bottom: @spacing-xs;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .import-actions {
      margin-top: @spacing-md;
      display: flex;
      gap: @spacing-sm;
    }
  }
  
  .manage-card {
    .storage-info {
      .info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: @spacing-md;
        
        .label {
          color: @text-secondary;
        }
        
        .value {
          font-weight: 600;
        }
        
        &:last-child {
          flex-direction: column;
          align-items: stretch;
          gap: @spacing-sm;
        }
      }
    }
    
    .danger-zone {
      h4 {
        color: @danger-color;
        margin-bottom: @spacing-sm;
      }
      
      p {
        font-size: @font-size-sm;
        color: @text-secondary;
        margin-bottom: @spacing-md;
      }
    }
  }
}
</style>
