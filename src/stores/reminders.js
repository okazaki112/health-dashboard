import { defineStore } from 'pinia'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { 
  checkPermission, 
  requestPermission, 
  sendHealthReminder,
  setRecurringReminder,
  clearRecurringReminder
} from '@/utils/notification'

// 提醒类型配置
export const REMINDER_TYPES = {
  water: { name: '喝水提醒', icon: '💧', defaultInterval: 60, defaultMessage: '记得喝水，保持身体水分' },
  exercise: { name: '运动提醒', icon: '🏃', defaultInterval: 120, defaultMessage: '该起来活动一下了' },
  medicine: { name: '服药提醒', icon: '💊', defaultInterval: 0, defaultMessage: '记得按时服药' },
  sleep: { name: '睡眠提醒', icon: '😴', defaultInterval: 0, defaultMessage: '该休息了，保证充足睡眠' },
  measure: { name: '测量提醒', icon: '📊', defaultInterval: 0, defaultMessage: '该记录健康数据了' },
  custom: { name: '自定义提醒', icon: '⏰', defaultInterval: 0, defaultMessage: '' }
}

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    reminders: [],
    timers: {},
    loading: false,
    error: null,
    permissionStatus: 'default'
  }),

  getters: {
    // 启用的提醒
    enabledReminders: (state) => state.reminders.filter(r => r.enabled),
    
    // 按类型获取提醒
    remindersByType: (state) => (type) => state.reminders.filter(r => r.type === type)
  },

  actions: {
    /**
     * 初始化提醒
     */
    async initReminders() {
      this.loading = true
      try {
        const data = storage.get(STORAGE_KEYS.REMINDERS) || []
        this.reminders = data
        
        // 检查通知权限
        this.permissionStatus = checkPermission()
        
        // 启动已启用的提醒
        this.startAllReminders()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
      const granted = await requestPermission()
      this.permissionStatus = granted ? 'granted' : 'denied'
      return granted
    },

    /**
     * 添加提醒
     */
    addReminder(data) {
      this.loading = true
      try {
        const reminder = {
          ...data,
          id: `reminder_${Date.now()}`,
          enabled: true,
          createdAt: new Date().toISOString()
        }
        
        this.reminders.push(reminder)
        this.saveToStorage()
        
        if (reminder.enabled) {
          this.startReminder(reminder)
        }
        
        return reminder
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新提醒
     */
    updateReminder(id, data) {
      this.loading = true
      try {
        const index = this.reminders.findIndex(r => r.id === id)
        if (index === -1) return false
        
        const wasEnabled = this.reminders[index].enabled
        this.reminders[index] = { ...this.reminders[index], ...data }
        
        this.saveToStorage()
        
        // 重新启动提醒
        if (wasEnabled && !data.enabled) {
          this.stopReminder(id)
        } else if (!wasEnabled && data.enabled) {
          this.startReminder(this.reminders[index])
        }
        
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除提醒
     */
    deleteReminder(id) {
      this.loading = true
      try {
        this.stopReminder(id)
        this.reminders = this.reminders.filter(r => r.id !== id)
        this.saveToStorage()
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 切换提醒状态
     */
    toggleReminder(id) {
      const reminder = this.reminders.find(r => r.id === id)
      if (!reminder) return false
      
      return this.updateReminder(id, { enabled: !reminder.enabled })
    },

    /**
     * 启动提醒
     */
    startReminder(reminder) {
      if (this.permissionStatus !== 'granted') return
      
      const typeInfo = REMINDER_TYPES[reminder.type]
      
      if (reminder.type === 'water' && reminder.interval) {
        // 间隔提醒
        const timerId = setRecurringReminder(() => {
          sendHealthReminder(reminder.type, reminder.message || typeInfo.defaultMessage)
        }, reminder.interval * 60 * 1000)
        
        this.timers[reminder.id] = timerId
      } else if (reminder.time) {
        // 定时提醒
        this.scheduleTimeReminder(reminder)
      }
    },

    /**
     * 定时提醒调度
     */
    scheduleTimeReminder(reminder) {
      const [hours, minutes] = reminder.time.split(':').map(Number)
      const now = new Date()
      const targetTime = new Date()
      targetTime.setHours(hours, minutes, 0, 0)
      
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }
      
      const delay = targetTime - now
      
      const timerId = setTimeout(() => {
        const typeInfo = REMINDER_TYPES[reminder.type]
        sendHealthReminder(reminder.type, reminder.message || typeInfo.defaultMessage)
        
        // 如果是每日重复，重新调度
        if (reminder.repeat === 'daily') {
          this.scheduleTimeReminder(reminder)
        }
      }, delay)
      
      this.timers[reminder.id] = timerId
    },

    /**
     * 停止提醒
     */
    stopReminder(id) {
      if (this.timers[id]) {
        clearRecurringReminder(this.timers[id])
        delete this.timers[id]
      }
    },

    /**
     * 启动所有提醒
     */
    startAllReminders() {
      this.reminders.forEach(reminder => {
        if (reminder.enabled) {
          this.startReminder(reminder)
        }
      })
    },

    /**
     * 停止所有提醒
     */
    stopAllReminders() {
      Object.keys(this.timers).forEach(id => {
        this.stopReminder(id)
      })
    },

    /**
     * 保存到存储
     */
    saveToStorage() {
      storage.set(STORAGE_KEYS.REMINDERS, this.reminders)
    },

    /**
     * 导出提醒数据
     */
    exportReminders() {
      return {
        reminders: this.reminders,
        exportedAt: new Date().toISOString()
      }
    }
  }
})
