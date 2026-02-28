import { defineStore } from 'pinia'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import idb from '@/utils/idb'
import { getToday, getWeekRange, getMonthRange, formatDate } from '@/utils/date'
import { useGoalsStore, GOAL_TYPES } from './goals'

export const useHealthStore = defineStore('health', {
  state: () => ({
    records: [],
    todayRecord: null,
    loading: false,
    error: null
  }),

  getters: {
    // 本周记录
    weekRecords: (state) => {
      const { start, end } = getWeekRange()
      return state.records.filter(r => r.date >= start && r.date <= end)
    },
    
    // 本月记录
    monthRecords: (state) => {
      const { start, end } = getMonthRange()
      return state.records.filter(r => r.date >= start && r.date <= end)
    },
    
    // 按日期范围查询
    recordsByRange: (state) => (start, end) => {
      return state.records.filter(r => r.date >= start && r.date <= end)
    },
    
    // 统计数据
    statistics: (state) => {
      if (state.records.length === 0) {
        return {
          totalDays: 0,
          totalSteps: 0,
          avgSteps: 0,
          totalWater: 0,
          avgWater: 0,
          totalSleep: 0,
          avgSleep: 0
        }
      }
      
      const totalSteps = state.records.reduce((sum, r) => sum + (r.steps || 0), 0)
      const totalWater = state.records.reduce((sum, r) => sum + (r.water || 0), 0)
      const totalSleep = state.records.reduce((sum, r) => sum + (r.sleep?.duration || 0), 0)
      
      return {
        totalDays: state.records.length,
        totalSteps,
        avgSteps: Math.round(totalSteps / state.records.length),
        totalWater,
        avgWater: Math.round(totalWater / state.records.length),
        totalSleep,
        avgSleep: +(totalSleep / state.records.length).toFixed(1)
      }
    },
    
    // 步数趋势数据（最近7天）
    stepsTrend: (state) => {
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = formatDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
        const record = state.records.find(r => r.date === date)
        last7Days.push({
          date,
          value: record?.steps || 0
        })
      }
      return last7Days
    },
    
    // 睡眠趋势数据（最近7天）
    sleepTrend: (state) => {
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = formatDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
        const record = state.records.find(r => r.date === date)
        last7Days.push({
          date,
          duration: record?.sleep?.duration || 0,
          deep: record?.sleep?.deep || 0,
          light: record?.sleep?.light || 0
        })
      }
      return last7Days
    }
  },

  actions: {
    /**
     * 初始化数据
     */
    async initRecords() {
      this.loading = true
      try {
        // 从 IndexedDB 加载记录
        const records = await idb.getAll('records')
        this.records = records.sort((a, b) => new Date(b.date) - new Date(a.date))
        
        // 获取今日记录
        const today = getToday()
        this.todayRecord = this.records.find(r => r.date === today) || null
      } catch (error) {
        this.error = error.message
        // 降级到 localStorage
        const index = storage.get(STORAGE_KEYS.RECORDS_INDEX) || []
        this.records = index.map(id => storage.get(`record_${id}`))
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加记录
     */
    async addRecord(data) {
      this.loading = true
      try {
        // 默认值模板
        const defaults = {
          steps: null,
          distance: null,
          calories: null,
          heartRate: { resting: null, max: null, avg: null },
          sleep: { duration: null, deep: null, light: null, quality: null },
          water: null,
          weight: null,
          bloodPressure: { systolic: null, diastolic: null },
          food: { breakfast: null, lunch: null, dinner: null, calories: null },
          mood: 'normal',
          notes: ''
        }
        
        const record = {
          ...defaults,
          ...data,
          // 深度合并嵌套对象
          heartRate: { ...defaults.heartRate, ...data.heartRate },
          sleep: { ...defaults.sleep, ...data.sleep },
          bloodPressure: { ...defaults.bloodPressure, ...data.bloodPressure },
          food: { ...defaults.food, ...data.food },
          id: `record_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await idb.add('records', record)
        this.records.unshift(record)
        
        if (record.date === getToday()) {
          this.todayRecord = record
          // 同步更新目标进度
          this.syncGoalsProgress(record)
        }
        
        return record
      } catch (error) {
        this.error = error.message
        console.error('Failed to add record:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新记录
     */
    async updateRecord(id, data) {
      this.loading = true
      try {
        const index = this.records.findIndex(r => r.id === id)
        if (index === -1) return false
        
        const oldRecord = this.records[index]
        
        // 深度合并嵌套对象
        const record = {
          ...oldRecord,
          ...data,
          // 保留原有的嵌套对象并合并新数据
          heartRate: {
            ...oldRecord.heartRate,
            ...data.heartRate
          },
          sleep: {
            ...oldRecord.sleep,
            ...data.sleep
          },
          bloodPressure: {
            ...oldRecord.bloodPressure,
            ...data.bloodPressure
          },
          food: {
            ...oldRecord.food,
            ...data.food
          },
          updatedAt: new Date().toISOString()
        }
        
        await idb.update('records', record)
        this.records[index] = record
        
        if (record.date === getToday()) {
          this.todayRecord = record
          // 同步更新目标进度
          this.syncGoalsProgress(record)
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
     * 同步目标进度
     */
    syncGoalsProgress(record) {
      try {
        const goalsStore = useGoalsStore()
        
        // 遍历所有活跃的每日目标
        goalsStore.activeGoals.forEach(goal => {
          if (goal.period !== 'daily') return
          
          let currentValue = 0
          switch (goal.type) {
            case 'steps':
              currentValue = record.steps || 0
              break
            case 'water':
              currentValue = record.water || 0
              break
            case 'sleep':
              currentValue = record.sleep?.duration || 0
              break
            case 'weight':
              currentValue = record.weight || 0
              break
            case 'calories_burn':
              currentValue = record.calories || 0
              break
            case 'heart_rate':
              currentValue = record.heartRate?.resting || 0
              break
          }
          
          goalsStore.updateProgress(goal.id, currentValue)
        })
      } catch (e) {
        console.error('Failed to sync goals progress:', e)
      }
    },

    /**
     * 删除记录
     */
    async deleteRecord(id) {
      this.loading = true
      try {
        await idb.delete('records', id)
        this.records = this.records.filter(r => r.id !== id)
        
        if (this.todayRecord?.id === id) {
          this.todayRecord = null
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
     * 获取指定日期记录
     */
    getRecordByDate(date) {
      return this.records.find(r => r.date === date) || null
    },

    /**
     * 批量导入记录
     */
    async importRecords(records) {
      this.loading = true
      try {
        await idb.addBatch('records', records)
        await this.initRecords()
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 导出数据
     */
    async exportData(options = {}) {
      const { startDate, endDate } = options
      let data = this.records
      
      if (startDate && endDate) {
        data = this.recordsByRange(startDate, endDate)
      }
      
      return {
        records: data,
        exportedAt: new Date().toISOString()
      }
    }
  }
})
