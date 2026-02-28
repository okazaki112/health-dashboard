<template>
  <div class="records-page">
    <div class="page-header">
      <h1>健康数据记录</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
    </div>
    
    <!-- 快速录入 -->
    <el-card class="quick-input-card">
      <template #header>
        <span>快速录入 - {{ todayDate }}</span>
      </template>
      <div class="quick-input-grid">
        <div class="quick-item" v-for="item in quickItems" :key="item.type" @click="openQuickInput(item)">
          <div class="quick-icon">{{ item.icon }}</div>
          <div class="quick-value">{{ getQuickValue(item.type) }}</div>
          <div class="quick-label">{{ item.label }}</div>
        </div>
      </div>
    </el-card>
    
    <!-- 记录列表 -->
    <el-card class="records-list-card">
      <template #header>
        <div class="list-header">
          <span>历史记录</span>
          <div class="filter-section">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateFilter"
            />
          </div>
        </div>
      </template>
      
      <el-table :data="filteredRecords" style="width: 100%" v-loading="healthStore.loading">
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column label="步数" width="100">
          <template #default="{ row }">
            {{ row.steps?.toLocaleString() || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="饮水" width="100">
          <template #default="{ row }">
            {{ row.water ? `${row.water}ml` : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="睡眠" width="100">
          <template #default="{ row }">
            {{ row.sleep?.duration ? `${row.sleep.duration}h` : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="体重" width="100">
          <template #default="{ row }">
            {{ row.weight ? `${row.weight}kg` : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="心情" width="80">
          <template #default="{ row }">
            {{ getMoodEmoji(row.mood) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="editRecord(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="filteredRecords.length === 0" description="暂无记录" />
    </el-card>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingRecord ? '编辑记录' : '添加记录'"
      width="720px"
      top="5vh"
    >
      <HealthForm 
        :initial-data="editingRecord"
        @submit="handleFormSubmit"
        @cancel="closeDialog"
      />
    </el-dialog>
    
    <!-- 快速录入对话框 -->
    <el-dialog v-model="showQuickDialog" :title="`快速录入 - ${currentQuickItem?.label}`" width="400px">
      <el-form label-width="80px">
        <el-form-item :label="currentQuickItem?.label">
          <!-- 心情特殊处理 -->
          <el-radio-group v-if="currentQuickItem?.isMood" v-model="quickMoodValue">
            <el-radio label="good">😊 开心</el-radio>
            <el-radio label="normal">😐 一般</el-radio>
            <el-radio label="bad">😔 低落</el-radio>
          </el-radio-group>
          <!-- 其他数值类型 -->
          <template v-else>
            <el-input-number 
              v-model="quickInputValue" 
              :min="0" 
              :max="quickInputMax"
              :step="quickInputStep"
            />
            <span class="ml-2">{{ currentQuickItem?.unit }}</span>
          </template>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuickDialog = false">取消</el-button>
        <el-button type="primary" @click="submitQuickInput">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useHealthStore } from '@/stores/health'
import { getToday, formatDate } from '@/utils/date'
import HealthForm from '@/components/forms/HealthForm.vue'

const healthStore = useHealthStore()

const todayDate = getToday()
const showAddDialog = ref(false)
const showQuickDialog = ref(false)
const editingRecord = ref(null)
const dateRange = ref([])
const currentQuickItem = ref(null)
const quickInputValue = ref(0)
const quickMoodValue = ref('normal') // 心情特殊值

// 快速录入项目
const quickItems = [
  { type: 'steps', label: '步数', icon: '🏃', unit: '步', max: 50000, step: 100 },
  { type: 'water', label: '饮水', icon: '💧', unit: 'ml', max: 5000, step: 100 },
  { type: 'sleep', label: '睡眠', icon: '😴', unit: '小时', max: 24, step: 0.5 },
  { type: 'weight', label: '体重', icon: '⚖️', unit: 'kg', max: 300, step: 0.1 },
  { type: 'mood', label: '心情', icon: '😊', unit: '', max: 3, step: 1, isMood: true }
]

// 筛选后的记录
const filteredRecords = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return healthStore.records
  }
  const [start, end] = dateRange.value
  return healthStore.recordsByRange(start, end)
})

// 获取快速录入值
const getQuickValue = (type) => {
  const record = healthStore.todayRecord
  if (!record) return '--'
  
  switch (type) {
    case 'steps': return record.steps?.toLocaleString() || '--'
    case 'water': return record.water ? `${record.water}ml` : '--'
    case 'sleep': return record.sleep?.duration ? `${record.sleep.duration}h` : '--'
    case 'weight': return record.weight ? `${record.weight}kg` : '--'
    case 'mood': return getMoodEmoji(record.mood)
    default: return '--'
  }
}

// 心情表情
const getMoodEmoji = (mood) => {
  const moods = { good: '😊', normal: '😐', bad: '😔' }
  return moods[mood] || '--'
}

// 打开快速录入
const openQuickInput = (item) => {
  currentQuickItem.value = item
  // 初始化值
  if (item.isMood) {
    const record = healthStore.todayRecord
    quickMoodValue.value = record?.mood || 'normal'
  } else {
    quickInputValue.value = 0
  }
  showQuickDialog.value = true
}

// 快速录入属性
const quickInputMax = computed(() => currentQuickItem.value?.max || 100)
const quickInputStep = computed(() => currentQuickItem.value?.step || 1)

// 提交快速录入
const submitQuickInput = async () => {
  const record = healthStore.todayRecord || { date: todayDate }
  const type = currentQuickItem.value.type
  
  const updateData = {}
  if (type === 'steps') updateData.steps = quickInputValue.value
  else if (type === 'water') updateData.water = quickInputValue.value
  else if (type === 'sleep') updateData.sleep = { duration: quickInputValue.value }
  else if (type === 'weight') updateData.weight = quickInputValue.value
  else if (type === 'mood') {
    updateData.mood = quickMoodValue.value
  }
  
  if (record.id) {
    await healthStore.updateRecord(record.id, updateData)
  } else {
    await healthStore.addRecord({ ...record, ...updateData })
  }
  
  ElMessage.success('记录已保存')
  showQuickDialog.value = false
}

// 日期筛选
const handleDateFilter = () => {
  // 由 computed 自动处理
}

// 编辑记录
const editRecord = (record) => {
  editingRecord.value = { ...record }
  showAddDialog.value = true
}

// 删除记录
const deleteRecord = async (record) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      type: 'warning'
    })
    await healthStore.deleteRecord(record.id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 表单提交
const handleFormSubmit = async (data) => {
  if (editingRecord.value) {
    await healthStore.updateRecord(editingRecord.value.id, data)
  } else {
    await healthStore.addRecord(data)
  }
  ElMessage.success('保存成功')
  closeDialog()
}

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
  editingRecord.value = null
}

onMounted(() => {
  healthStore.initRecords()
})
</script>

<style lang="less" scoped>
.records-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-lg;
    
    h1 {
      font-size: @font-size-2xl;
      font-weight: 700;
    }
  }
  
  .quick-input-card {
    margin-bottom: @spacing-lg;
    
    .quick-input-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: @spacing-md;
      
      @media (max-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .quick-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: @spacing-md;
      background: @bg-secondary;
      border-radius: @radius-md;
      cursor: pointer;
      transition: all @transition-fast;
      
      &:hover {
        background: @bg-tertiary;
        transform: translateY(-2px);
      }
      
      .quick-icon {
        font-size: 32px;
        margin-bottom: @spacing-sm;
      }
      
      .quick-value {
        font-size: @font-size-lg;
        font-weight: 600;
        color: @text-primary;
      }
      
      .quick-label {
        font-size: @font-size-xs;
        color: @text-secondary;
      }
    }
  }
  
  .records-list-card {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: @spacing-md;
      }
    }
  }
  
  .ml-2 {
    margin-left: @spacing-sm;
  }
}
</style>
