import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import dayjs from 'dayjs'

/**
 * 导出为JSON文件
 */
export function exportJSON(data, filename = 'health_backup') {
  const timestamp = dayjs().format('YYYY_MM_DD_HHmmss')
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  saveAs(blob, `${filename}_${timestamp}.json`)
}

/**
 * 导出为CSV文件
 */
export function exportCSV(data, filename = 'health_records') {
  const timestamp = dayjs().format('YYYY_MM_DD_HHmmss')
  
  // 处理嵌套对象
  const flattenedData = data.map(item => flattenObject(item))
  
  const csv = Papa.unparse(flattenedData, {
    quotes: true,
    header: true
  })
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}_${timestamp}.csv`)
}

/**
 * 导入JSON文件
 */
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('无效的JSON文件'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 导入CSV文件
 */
export function importCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 扁平化对象
 */
function flattenObject(obj, prefix = '') {
  const result = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey))
      } else if (Array.isArray(obj[key])) {
        result[newKey] = JSON.stringify(obj[key])
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  
  return result
}

/**
 * 生成健康报告数据
 */
export function generateReport(profile, records, goals) {
  const today = dayjs().format('YYYY-MM-DD')
  
  return {
    reportDate: today,
    profile: {
      nickname: profile.nickname,
      age: profile.birthDate ? dayjs().diff(dayjs(profile.birthDate), 'year') : '-',
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      bmi: calculateBMI(profile.height, profile.weight)
    },
    statistics: calculateStatistics(records),
    goalsProgress: calculateGoalsProgress(goals)
  }
}

/**
 * 计算BMI
 */
function calculateBMI(height, weight) {
  if (!height || !weight) return null
  const heightM = height / 100
  return (weight / (heightM * heightM)).toFixed(1)
}

/**
 * 计算统计数据
 */
function calculateStatistics(records) {
  if (!records || records.length === 0) {
    return {
      totalDays: 0,
      avgSteps: 0,
      avgSleep: 0,
      avgWater: 0
    }
  }
  
  const totalSteps = records.reduce((sum, r) => sum + (r.steps || 0), 0)
  const totalSleep = records.reduce((sum, r) => sum + (r.sleep?.duration || 0), 0)
  const totalWater = records.reduce((sum, r) => sum + (r.water || 0), 0)
  
  return {
    totalDays: records.length,
    avgSteps: Math.round(totalSteps / records.length),
    avgSleep: (totalSleep / records.length).toFixed(1),
    avgWater: Math.round(totalWater / records.length)
  }
}

/**
 * 计算目标进度
 */
function calculateGoalsProgress(goals) {
  if (!goals || goals.length === 0) return []
  
  return goals.map(goal => ({
    type: goal.type,
    name: goal.name,
    target: goal.targetValue,
    current: goal.currentValue,
    progress: Math.round((goal.currentValue / goal.targetValue) * 100)
  }))
}
