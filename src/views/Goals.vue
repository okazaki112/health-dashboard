<template>
  <div class="goals-page">
    <div class="page-header">
      <h1>健康目标管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        新增目标
      </el-button>
    </div>
    
    <!-- 目标列表 -->
    <div class="goals-list">
      <el-card 
        v-for="goal in goalsStore.activeGoals" 
        :key="goal.id" 
        class="goal-card"
      >
        <div class="goal-content">
          <div class="goal-header">
            <div class="goal-title">
              <span class="goal-icon">{{ GOAL_TYPES[goal.type]?.icon }}</span>
              <span class="goal-name">{{ goal.name }}</span>
            </div>
            <div class="goal-actions">
              <el-switch v-model="goal.enabled" @change="toggleGoal(goal.id)" />
              <el-button link type="primary" @click="editGoal(goal)">编辑</el-button>
              <el-button link type="danger" @click="deleteGoal(goal)">删除</el-button>
            </div>
          </div>
          
          <div class="goal-progress">
            <el-progress 
              :percentage="getProgress(goal)" 
              :color="GOAL_TYPES[goal.type]?.color"
              :stroke-width="12"
            />
          </div>
          
          <div class="goal-info">
            <span>当前: {{ goal.currentValue }} {{ GOAL_TYPES[goal.type]?.unit }}</span>
            <span>目标: {{ goal.targetValue }} {{ GOAL_TYPES[goal.type]?.unit }}</span>
            <span v-if="goal.period === 'daily'">每日目标</span>
            <span v-else-if="goal.period === 'weekly'">每周目标</span>
          </div>
        </div>
      </el-card>
      
      <el-empty v-if="goalsStore.activeGoals.length === 0" description="暂无目标，点击上方按钮添加" />
    </div>
    
    <!-- 成就展示 -->
    <el-card class="achievements-card" v-if="goalsStore.completedGoals.length > 0">
      <template #header>
        <span>本周成就</span>
      </template>
      <div class="achievements">
        <div 
          v-for="(achievement, index) in recentAchievements" 
          :key="index"
          class="achievement-badge"
        >
          <span class="badge-icon">🏅</span>
          <span class="badge-text">{{ achievement }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 添加/编辑目标对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingGoal ? '编辑目标' : '新增目标'"
      width="500px"
    >
      <el-form :model="goalForm" label-width="80px">
        <el-form-item label="目标类型">
          <el-select v-model="goalForm.type" placeholder="选择目标类型" style="width: 100%">
            <el-option 
              v-for="(info, key) in GOAL_TYPES" 
              :key="key"
              :label="`${info.icon} ${info.name}`"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标名称">
          <el-input v-model="goalForm.name" placeholder="输入目标名称" />
        </el-form-item>
        
        <el-form-item label="目标值">
          <el-input-number 
            v-model="goalForm.targetValue" 
            :min="1"
            style="width: 100%"
          />
          <span class="ml-2">{{ GOAL_TYPES[goalForm.type]?.unit }}</span>
        </el-form-item>
        
        <el-form-item label="周期">
          <el-radio-group v-model="goalForm.period">
            <el-radio label="daily">每日</el-radio>
            <el-radio label="weekly">每周</el-radio>
            <el-radio label="monthly">每月</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="开启提醒">
          <el-switch v-model="goalForm.reminder" />
        </el-form-item>
        
        <el-form-item label="提醒时间" v-if="goalForm.reminder">
          <el-time-select 
            v-model="goalForm.reminderTime"
            start="06:00"
            step="00:30"
            end="22:00"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitGoal">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useGoalsStore, GOAL_TYPES } from '@/stores/goals'
import { useHealthStore } from '@/stores/health'

const goalsStore = useGoalsStore()
const healthStore = useHealthStore()

const showAddDialog = ref(false)
const editingGoal = ref(null)
const goalForm = ref({
  type: 'steps',
  name: '',
  targetValue: 8000,
  period: 'daily',
  reminder: false,
  reminderTime: ''
})

// 计算进度
const getProgress = (goal) => {
  if (!goal.targetValue) return 0
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
}

// 最近成就
const recentAchievements = computed(() => {
  // 简化实现，后续可基于实际数据
  return [
    '步数达标3天',
    '饮水达标5天',
    '早睡早起2天'
  ]
})

// 切换目标状态
const toggleGoal = (id) => {
  goalsStore.toggleReminder?.(id)
}

// 编辑目标
const editGoal = (goal) => {
  editingGoal.value = goal
  goalForm.value = {
    type: goal.type,
    name: goal.name,
    targetValue: goal.targetValue,
    period: goal.period,
    reminder: goal.reminder,
    reminderTime: goal.reminderTime || ''
  }
  showAddDialog.value = true
}

// 删除目标
const deleteGoal = async (goal) => {
  try {
    await ElMessageBox.confirm(`确定要删除目标"${goal.name}"吗？`, '提示', {
      type: 'warning'
    })
    goalsStore.deleteGoal(goal.id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 提交目标
const submitGoal = () => {
  if (!goalForm.value.name) {
    ElMessage.warning('请输入目标名称')
    return
  }
  
  if (editingGoal.value) {
    goalsStore.updateGoal(editingGoal.value.id, goalForm.value)
    ElMessage.success('目标更新成功')
  } else {
    goalsStore.addGoal(goalForm.value)
    ElMessage.success('目标创建成功')
  }
  
  closeDialog()
}

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
  editingGoal.value = null
  goalForm.value = {
    type: 'steps',
    name: '',
    targetValue: 8000,
    period: 'daily',
    reminder: false,
    reminderTime: ''
  }
}

onMounted(async () => {
  goalsStore.initGoals()
  // 加载今日健康数据并同步目标进度
  await healthStore.initRecords()
  if (healthStore.todayRecord) {
    goalsStore.activeGoals.forEach(goal => {
      if (goal.period === 'daily') {
        let currentValue = 0
        switch (goal.type) {
          case 'steps':
            currentValue = healthStore.todayRecord.steps || 0
            break
          case 'water':
            currentValue = healthStore.todayRecord.water || 0
            break
          case 'sleep':
            currentValue = healthStore.todayRecord.sleep?.duration || 0
            break
          case 'weight':
            currentValue = healthStore.todayRecord.weight || 0
            break
          case 'calories_burn':
            currentValue = healthStore.todayRecord.calories || 0
            break
        }
        goalsStore.updateProgress(goal.id, currentValue)
      }
    })
  }
})
</script>

<style lang="less" scoped>
.goals-page {
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
  
  .goals-list {
    display: grid;
    gap: @spacing-md;
    margin-bottom: @spacing-lg;
  }
  
  .goal-card {
    .goal-content {
      .goal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: @spacing-md;
        
        .goal-title {
          display: flex;
          align-items: center;
          gap: @spacing-sm;
          
          .goal-icon {
            font-size: 24px;
          }
          
          .goal-name {
            font-size: @font-size-lg;
            font-weight: 600;
          }
        }
        
        .goal-actions {
          display: flex;
          align-items: center;
          gap: @spacing-sm;
        }
      }
      
      .goal-progress {
        margin-bottom: @spacing-sm;
      }
      
      .goal-info {
        display: flex;
        gap: @spacing-lg;
        font-size: @font-size-sm;
        color: @text-secondary;
      }
    }
  }
  
  .achievements-card {
    .achievements {
      display: flex;
      flex-wrap: wrap;
      gap: @spacing-md;
    }
    
    .achievement-badge {
      display: flex;
      align-items: center;
      gap: @spacing-xs;
      padding: @spacing-sm @spacing-md;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-radius: @radius-md;
      
      .badge-icon {
        font-size: 20px;
      }
      
      .badge-text {
        font-size: @font-size-sm;
        color: #92400e;
      }
    }
  }
  
  .ml-2 {
    margin-left: @spacing-sm;
  }
}
</style>
