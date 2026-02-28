<template>
  <div class="reminders-page">
    <div class="page-header">
      <h1>健康提醒设置</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        新增提醒
      </el-button>
    </div>
    
    <!-- 通知权限提示 -->
    <el-alert 
      v-if="remindersStore.permissionStatus !== 'granted'"
      title="需要开启通知权限"
      type="warning"
      show-icon
      :closable="false"
      class="permission-alert"
    >
      <template #default>
        <p>为了正常接收健康提醒，请在浏览器中开启通知权限。</p>
        <el-button type="primary" size="small" @click="requestPermission">
          开启通知权限
        </el-button>
      </template>
    </el-alert>
    
    <!-- 提醒列表 -->
    <div class="reminders-list">
      <el-card 
        v-for="reminder in remindersStore.reminders" 
        :key="reminder.id" 
        class="reminder-card"
      >
        <div class="reminder-content">
          <div class="reminder-header">
            <div class="reminder-title">
              <span class="reminder-icon">{{ REMINDER_TYPES[reminder.type]?.icon }}</span>
              <span class="reminder-name">{{ reminder.title }}</span>
            </div>
            <el-switch 
              v-model="reminder.enabled" 
              @change="toggleReminder(reminder.id)"
            />
          </div>
          
          <div class="reminder-info">
            <p v-if="reminder.type === 'water'">
              每 {{ reminder.interval }} 分钟提醒一次
            </p>
            <p v-else>
              每天 {{ reminder.time }}
            </p>
            <p class="reminder-message">{{ reminder.message || REMINDER_TYPES[reminder.type]?.defaultMessage }}</p>
          </div>
          
          <div class="reminder-actions">
            <el-button link type="primary" @click="editReminder(reminder)">编辑</el-button>
            <el-button link type="danger" @click="deleteReminder(reminder)">删除</el-button>
          </div>
        </div>
      </el-card>
      
      <el-empty v-if="remindersStore.reminders.length === 0" description="暂无提醒，点击上方按钮添加" />
    </div>
    
    <!-- 添加/编辑提醒对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingReminder ? '编辑提醒' : '新增提醒'"
      width="500px"
    >
      <el-form :model="reminderForm" label-width="80px">
        <el-form-item label="提醒类型">
          <el-select v-model="reminderForm.type" placeholder="选择提醒类型" style="width: 100%" @change="handleTypeChange">
            <el-option 
              v-for="(info, key) in REMINDER_TYPES" 
              :key="key"
              :label="`${info.icon} ${info.name}`"
              :value="key"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒标题">
          <el-input v-model="reminderForm.title" placeholder="输入提醒标题" />
        </el-form-item>
        
        <el-form-item label="提醒内容">
          <el-input 
            v-model="reminderForm.message" 
            type="textarea"
            :rows="2"
            placeholder="输入提醒内容"
          />
        </el-form-item>
        
        <el-form-item label="提醒方式">
          <el-radio-group v-model="reminderForm.mode">
            <el-radio label="interval">间隔提醒</el-radio>
            <el-radio label="time">定时提醒</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="间隔时间" v-if="reminderForm.mode === 'interval'">
          <el-input-number 
            v-model="reminderForm.interval" 
            :min="10"
            :max="240"
            :step="10"
          />
          <span class="ml-2">分钟</span>
        </el-form-item>
        
        <el-form-item label="提醒时间" v-if="reminderForm.mode === 'time'">
          <el-time-select 
            v-model="reminderForm.time"
            start="06:00"
            step="00:30"
            end="22:00"
            placeholder="选择提醒时间"
          />
        </el-form-item>
        
        <el-form-item label="重复方式" v-if="reminderForm.mode === 'time'">
          <el-select v-model="reminderForm.repeat" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="工作日" value="workday" />
            <el-option label="仅一次" value="once" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒声音">
          <el-switch v-model="reminderForm.sound" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitReminder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRemindersStore, REMINDER_TYPES } from '@/stores/reminders'

const remindersStore = useRemindersStore()

const showAddDialog = ref(false)
const editingReminder = ref(null)
const reminderForm = ref({
  type: 'water',
  title: '',
  message: '',
  mode: 'interval',
  interval: 60,
  time: '',
  repeat: 'daily',
  sound: true
})

// 请求通知权限
const requestPermission = async () => {
  const granted = await remindersStore.requestNotificationPermission()
  if (granted) {
    ElMessage.success('通知权限已开启')
  } else {
    ElMessage.error('无法开启通知权限，请在浏览器设置中手动开启')
  }
}

// 切换提醒状态
const toggleReminder = (id) => {
  remindersStore.toggleReminder(id)
}

// 处理类型变化
const handleTypeChange = (type) => {
  const info = REMINDER_TYPES[type]
  reminderForm.value.title = info?.name || ''
  reminderForm.value.message = info?.defaultMessage || ''
  if (type === 'water') {
    reminderForm.value.mode = 'interval'
    reminderForm.value.interval = info?.defaultInterval || 60
  }
}

// 编辑提醒
const editReminder = (reminder) => {
  editingReminder.value = reminder
  reminderForm.value = {
    type: reminder.type,
    title: reminder.title,
    message: reminder.message || '',
    mode: reminder.interval ? 'interval' : 'time',
    interval: reminder.interval || 60,
    time: reminder.time || '',
    repeat: reminder.repeat || 'daily',
    sound: reminder.sound !== false
  }
  showAddDialog.value = true
}

// 删除提醒
const deleteReminder = async (reminder) => {
  try {
    await ElMessageBox.confirm(`确定要删除提醒"${reminder.title}"吗？`, '提示', {
      type: 'warning'
    })
    remindersStore.deleteReminder(reminder.id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 提交提醒
const submitReminder = () => {
  if (!reminderForm.value.title) {
    ElMessage.warning('请输入提醒标题')
    return
  }
  
  const data = {
    type: reminderForm.value.type,
    title: reminderForm.value.title,
    message: reminderForm.value.message,
    sound: reminderForm.value.sound
  }
  
  if (reminderForm.value.mode === 'interval') {
    data.interval = reminderForm.value.interval
  } else {
    data.time = reminderForm.value.time
    data.repeat = reminderForm.value.repeat
  }
  
  if (editingReminder.value) {
    remindersStore.updateReminder(editingReminder.value.id, data)
    ElMessage.success('提醒更新成功')
  } else {
    remindersStore.addReminder(data)
    ElMessage.success('提醒创建成功')
  }
  
  closeDialog()
}

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
  editingReminder.value = null
  reminderForm.value = {
    type: 'water',
    title: '',
    message: '',
    mode: 'interval',
    interval: 60,
    time: '',
    repeat: 'daily',
    sound: true
  }
}

onMounted(() => {
  remindersStore.initReminders()
})
</script>

<style lang="less" scoped>
.reminders-page {
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
  
  .permission-alert {
    margin-bottom: @spacing-lg;
    
    p {
      margin-bottom: @spacing-sm;
    }
  }
  
  .reminders-list {
    display: grid;
    gap: @spacing-md;
  }
  
  .reminder-card {
    .reminder-content {
      .reminder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: @spacing-md;
        
        .reminder-title {
          display: flex;
          align-items: center;
          gap: @spacing-sm;
          
          .reminder-icon {
            font-size: 24px;
          }
          
          .reminder-name {
            font-size: @font-size-lg;
            font-weight: 600;
          }
        }
      }
      
      .reminder-info {
        margin-bottom: @spacing-md;
        
        p {
          font-size: @font-size-sm;
          color: @text-secondary;
          margin-bottom: @spacing-xs;
        }
        
        .reminder-message {
          color: @text-primary;
        }
      }
      
      .reminder-actions {
        display: flex;
        gap: @spacing-sm;
      }
    }
  }
  
  .ml-2 {
    margin-left: @spacing-sm;
  }
}
</style>
