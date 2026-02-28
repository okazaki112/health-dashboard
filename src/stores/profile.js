import { defineStore } from 'pinia'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { getAge, getToday } from '@/utils/date'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    loading: false,
    error: null
  }),

  getters: {
    // 是否已设置档案
    hasProfile: (state) => !!state.profile,
    
    // 用户年龄
    age: (state) => {
      if (!state.profile?.birthDate) return null
      return getAge(state.profile.birthDate)
    },
    
    // BMI计算
    bmi: (state) => {
      if (!state.profile?.height || !state.profile?.weight) return null
      const heightM = state.profile.height / 100
      return (state.profile.weight / (heightM * heightM)).toFixed(1)
    },
    
    // BMI状态
    bmiStatus: (state) => {
      const bmiValue = state.profile?.height && state.profile?.weight
        ? (state.profile.weight / Math.pow(state.profile.height / 100, 2))
        : null
      
      if (!bmiValue) return { status: 'unknown', text: '未知', color: '#9ca3af' }
      if (bmiValue < 18.5) return { status: 'underweight', text: '偏瘦', color: '#3b82f6' }
      if (bmiValue < 24) return { status: 'normal', text: '正常', color: '#10b981' }
      if (bmiValue < 28) return { status: 'overweight', text: '偏胖', color: '#f59e0b' }
      return { status: 'obese', text: '肥胖', color: '#ef4444' }
    },
    
    // 今日健康评分（简化版）
    todayHealthScore: () => {
      return 85 // 后续根据实际数据计算
    }
  },

  actions: {
    /**
     * 初始化档案
     */
    initProfile() {
      this.loading = true
      try {
        const data = storage.get(STORAGE_KEYS.PROFILE)
        this.profile = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 保存档案
     */
    saveProfile(data) {
      this.loading = true
      try {
        const profile = {
          ...data,
          id: this.profile?.id || `user_${Date.now()}`,
          createdAt: this.profile?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        storage.set(STORAGE_KEYS.PROFILE, profile)
        this.profile = profile
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新档案
     */
    updateProfile(data) {
      if (!this.profile) return false
      return this.saveProfile({ ...this.profile, ...data })
    },

    /**
     * 清除档案
     */
    clearProfile() {
      storage.remove(STORAGE_KEYS.PROFILE)
      this.profile = null
    },

    /**
     * 导出档案数据
     */
    exportProfile() {
      return {
        profile: this.profile,
        exportedAt: new Date().toISOString()
      }
    }
  }
})
