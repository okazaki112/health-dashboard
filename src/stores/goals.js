import { defineStore } from 'pinia'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { getToday } from '@/utils/date'

// 目标类型配置
export const GOAL_TYPES = {
  steps: { name: '步数', unit: '步', icon: '🏃', color: '#10b981' },
  water: { name: '饮水', unit: 'ml', icon: '💧', color: '#3b82f6' },
  sleep: { name: '睡眠', unit: '小时', icon: '😴', color: '#8b5cf6' },
  weight: { name: '体重', unit: 'kg', icon: '⚖️', color: '#f59e0b' },
  calories_burn: { name: '消耗热量', unit: 'kcal', icon: '🔥', color: '#ef4444' },
  calories_intake: { name: '摄入热量', unit: 'kcal', icon: '🍔', color: '#f97316' },
  exercise: { name: '运动时长', unit: '分钟', icon: '💪', color: '#06b6d4' },
  heart_rate: { name: '静息心率', unit: 'bpm', icon: '❤️', color: '#ec4899' }
}

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [],
    loading: false,
    error: null
  }),

  getters: {
    // 活跃目标
    activeGoals: (state) => state.goals.filter(g => g.status === 'active'),
    
    // 已完成目标
    completedGoals: (state) => state.goals.filter(g => g.status === 'completed'),
    
    // 按类型获取目标
    goalByType: (state) => (type) => state.goals.find(g => g.type === type && g.status === 'active'),
    
    // 今日目标进度
    todayProgress: (state) => {
      return state.goals
        .filter(g => g.status === 'active' && g.period === 'daily')
        .map(goal => ({
          ...goal,
          progress: Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)),
          remaining: Math.max(0, goal.targetValue - goal.currentValue),
          typeInfo: GOAL_TYPES[goal.type]
        }))
    }
  },

  actions: {
    /**
     * 初始化目标
     */
    initGoals() {
      this.loading = true
      try {
        const data = storage.get(STORAGE_KEYS.GOALS) || []
        this.goals = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加目标
     */
    addGoal(data) {
      this.loading = true
      try {
        const goal = {
          ...data,
          id: `goal_${Date.now()}`,
          currentValue: 0,
          status: 'active',
          createdAt: new Date().toISOString()
        }
        
        this.goals.push(goal)
        this.saveToStorage()
        return goal
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新目标
     */
    updateGoal(id, data) {
      this.loading = true
      try {
        const index = this.goals.findIndex(g => g.id === id)
        if (index === -1) return false
        
        this.goals[index] = { ...this.goals[index], ...data }
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
     * 更新目标进度
     */
    updateProgress(id, currentValue) {
      const goal = this.goals.find(g => g.id === id)
      if (!goal) return false
      
      goal.currentValue = currentValue
      
      // 检查是否完成
      if (currentValue >= goal.targetValue) {
        goal.status = 'completed'
      }
      
      this.saveToStorage()
      return true
    },

    /**
     * 暂停目标
     */
    pauseGoal(id) {
      return this.updateGoal(id, { status: 'paused' })
    },

    /**
     * 恢复目标
     */
    resumeGoal(id) {
      return this.updateGoal(id, { status: 'active' })
    },

    /**
     * 删除目标
     */
    deleteGoal(id) {
      this.loading = true
      try {
        this.goals = this.goals.filter(g => g.id !== id)
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
     * 重置每日目标进度
     */
    resetDailyProgress() {
      this.goals.forEach(goal => {
        if (goal.period === 'daily') {
          goal.currentValue = 0
          if (goal.status === 'completed') {
            goal.status = 'active'
          }
        }
      })
      this.saveToStorage()
    },

    /**
     * 保存到存储
     */
    saveToStorage() {
      storage.set(STORAGE_KEYS.GOALS, this.goals)
    },

    /**
     * 导出目标数据
     */
    exportGoals() {
      return {
        goals: this.goals,
        exportedAt: new Date().toISOString()
      }
    }
  }
})
