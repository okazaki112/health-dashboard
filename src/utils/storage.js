/**
 * 本地存储工具类
 */

const STORAGE_PREFIX = 'health_'

export const storage = {
  /**
   * 保存数据到 localStorage
   */
  set(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(STORAGE_PREFIX + key, data)
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  },

  /**
   * 从 localStorage 获取数据
   */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  },

  /**
   * 删除 localStorage 数据
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  },

  /**
   * 清空所有健康相关数据
   */
  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  },

  /**
   * 获取存储大小 (字节)
   */
  getSize() {
    let size = 0
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        size += localStorage.getItem(key).length * 2 // UTF-16
      }
    })
    return size
  },

  /**
   * 获取存储使用情况
   */
  getUsage() {
    const size = this.getSize()
    const maxSize = 5 * 1024 * 1024 // 5MB
    return {
      used: size,
      total: maxSize,
      percentage: ((size / maxSize) * 100).toFixed(2)
    }
  }
}

// 存储键名常量
export const STORAGE_KEYS = {
  PROFILE: 'profile',
  GOALS: 'goals',
  REMINDERS: 'reminders',
  SETTINGS: 'settings',
  RECORDS_INDEX: 'records_index',
  ACHIEVEMENTS: 'achievements'
}
