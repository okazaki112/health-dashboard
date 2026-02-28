<template>
  <div class="home-page">
    <div class="page-header">
      <h1>健康看板</h1>
      <p>欢迎回来，{{ profileStore.profile?.nickname || '健康达人' }}！今天是 {{ todayDate }}</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card" v-for="stat in todayStats" :key="stat.type">
        <div class="stat-card-icon" :style="{ background: stat.bgColor }">
          <span>{{ stat.icon }}</span>
        </div>
        <div class="stat-card-value">{{ stat.value }}</div>
        <div class="stat-card-label">{{ stat.label }}</div>
        <div class="stat-card-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="stat.trend">
          <el-icon><component :is="stat.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
          {{ Math.abs(stat.trend) }}%
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">本周步数趋势</span>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" ref="stepsChartRef"></div>
        </div>
        
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">睡眠质量分析</span>
          </div>
          <div class="chart-container" ref="sleepChartRef"></div>
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-card small">
          <div class="card-header">
            <span class="card-title">心率分布</span>
          </div>
          <div class="chart-container" ref="heartRateChartRef"></div>
        </div>
        
        <div class="chart-card small">
          <div class="card-header">
            <span class="card-title">心情统计</span>
          </div>
          <div class="chart-container" ref="moodChartRef"></div>
        </div>
        
        <div class="chart-card small">
          <div class="card-header">
            <span class="card-title">饮水完成度</span>
          </div>
          <div class="chart-container" ref="waterChartRef"></div>
        </div>
      </div>
    </div>
    
    <!-- 目标进度 -->
    <div class="goals-section" v-if="goalsStore.activeGoals.length > 0">
      <div class="section-header">
        <h2>今日目标</h2>
        <router-link to="/goals">查看全部</router-link>
      </div>
      <div class="goals-list">
        <div class="goal-item" v-for="goal in goalsStore.todayProgress.slice(0, 4)" :key="goal.id">
          <div class="goal-info">
            <span class="goal-icon">{{ goal.typeInfo?.icon }}</span>
            <span class="goal-name">{{ goal.name }}</span>
          </div>
          <div class="goal-progress">
            <el-progress 
              :percentage="goal.progress" 
              :color="goal.typeInfo?.color"
              :stroke-width="10"
            />
            <span class="goal-text">
              {{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.typeInfo?.unit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useHealthStore } from '@/stores/health'
import { useGoalsStore } from '@/stores/goals'
import { getToday, formatDate, getWeekDay } from '@/utils/date'
import * as echarts from 'echarts'

const profileStore = useProfileStore()
const healthStore = useHealthStore()
const goalsStore = useGoalsStore()

const chartPeriod = ref('week')
const stepsChartRef = ref(null)
const sleepChartRef = ref(null)
const heartRateChartRef = ref(null)
const moodChartRef = ref(null)
const waterChartRef = ref(null)

let stepsChart = null
let sleepChart = null
let heartRateChart = null
let moodChart = null
let waterChart = null

// 今天日期
const todayDate = computed(() => {
  const today = getToday()
  const weekday = getWeekDay(today)
  return `${today} ${weekday}`
})

// 今日统计数据
const todayStats = computed(() => {
  const record = healthStore.todayRecord
  return [
    {
      type: 'steps',
      icon: '🏃',
      label: '今日步数',
      value: record?.steps?.toLocaleString() || '0',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: 12
    },
    {
      type: 'water',
      icon: '💧',
      label: '饮水量',
      value: `${record?.water || 0} ml`,
      bgColor: 'rgba(59, 130, 246, 0.1)',
      trend: -5
    },
    {
      type: 'sleep',
      icon: '😴',
      label: '睡眠时长',
      value: `${record?.sleep?.duration || 0} h`,
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: 8
    },
    {
      type: 'heart',
      icon: '❤️',
      label: '静息心率',
      value: `${record?.heartRate?.resting || '--'} bpm`,
      bgColor: 'rgba(239, 68, 68, 0.1)',
      trend: 0
    }
  ]
})

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initStepsChart()
    initSleepChart()
    initHeartRateChart()
    initMoodChart()
    initWaterChart()
  })
}

// 步数趋势图
const initStepsChart = () => {
  if (!stepsChartRef.value) return
  stepsChart = echarts.init(stepsChartRef.value)
  
  const trend = healthStore.stepsTrend
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trend.map(t => formatDate(t.date, 'MM/DD')),
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0
    },
    series: [{
      name: '步数',
      type: 'line',
      smooth: true,
      data: trend.map(t => t.value),
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
        ])
      },
      lineStyle: {
        color: '#10b981',
        width: 3
      },
      itemStyle: {
        color: '#10b981'
      }
    }]
  }
  
  stepsChart.setOption(option)
}

// 睡眠质量图
const initSleepChart = () => {
  if (!sleepChartRef.value) return
  sleepChart = echarts.init(sleepChartRef.value)
  
  const trend = healthStore.sleepTrend
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['深睡', '浅睡']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trend.map(t => formatDate(t.date, 'MM/DD'))
    },
    yAxis: {
      type: 'value',
      name: '小时'
    },
    series: [
      {
        name: '深睡',
        type: 'bar',
        stack: 'total',
        data: trend.map(t => t.deep),
        itemStyle: { color: '#8b5cf6' }
      },
      {
        name: '浅睡',
        type: 'bar',
        stack: 'total',
        data: trend.map(t => t.light),
        itemStyle: { color: '#c4b5fd' }
      }
    ]
  }
  
  sleepChart.setOption(option)
}

// 心率分布图
const initHeartRateChart = () => {
  if (!heartRateChartRef.value) return
  heartRateChart = echarts.init(heartRateChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 40,
      max: 120,
      splitNumber: 4,
      axisLine: {
        lineStyle: {
          width: 15,
          color: [
            [0.33, '#10b981'],
            [0.66, '#f59e0b'],
            [1, '#ef4444']
          ]
        }
      },
      pointer: {
        length: '60%',
        width: 6,
        itemStyle: { color: '#1f2937' }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        fontSize: 24,
        offsetCenter: [0, '40%'],
        formatter: '{value} bpm'
      },
      data: [{
        value: healthStore.todayRecord?.heartRate?.resting || 72
      }]
    }]
  }
  
  heartRateChart.setOption(option)
}

// 心情统计图
const initMoodChart = () => {
  if (!moodChartRef.value) return
  moodChart = echarts.init(moodChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      data: [
        { value: 5, name: '开心', itemStyle: { color: '#10b981' } },
        { value: 3, name: '一般', itemStyle: { color: '#f59e0b' } },
        { value: 1, name: '低落', itemStyle: { color: '#ef4444' } }
      ]
    }]
  }
  
  moodChart.setOption(option)
}

// 饮水完成度
const initWaterChart = () => {
  if (!waterChartRef.value) return
  waterChart = echarts.init(waterChartRef.value)
  
  const waterGoal = goalsStore.goalByType('water')
  const current = healthStore.todayRecord?.water || 0
  const target = waterGoal?.targetValue || 2000
  const percentage = Math.min(100, Math.round((current / target) * 100))
  
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 5,
      itemStyle: {
        color: '#3b82f6'
      },
      progress: {
        show: true,
        width: 20
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[1, '#e5e7eb']]
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: {
        offsetCenter: [0, '50%'],
        fontSize: 14,
        color: '#6b7280'
      },
      detail: {
        fontSize: 28,
        offsetCenter: [0, '0%'],
        formatter: '{value}%',
        color: '#1f2937'
      },
      data: [{
        value: percentage,
        name: '目标: ' + target + 'ml'
      }]
    }]
  }
  
  waterChart.setOption(option)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  stepsChart?.resize()
  sleepChart?.resize()
  heartRateChart?.resize()
  moodChart?.resize()
  waterChart?.resize()
}

onMounted(async () => {
  await healthStore.initRecords()
  await goalsStore.initGoals()
  initCharts()
  window.addEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.home-page {
  .page-header {
    margin-bottom: @spacing-lg;
    
    h1 {
      font-size: @font-size-2xl;
      font-weight: 700;
      color: @text-primary;
      margin-bottom: @spacing-xs;
    }
    
    p {
      font-size: @font-size-sm;
      color: @text-secondary;
    }
  }
  
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: @spacing-md;
    margin-bottom: @spacing-lg;
    
    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .charts-section {
    margin-bottom: @spacing-lg;
    
    .chart-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: @spacing-md;
      margin-bottom: @spacing-md;
      
      &:last-child {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        
        &:last-child {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 768px) {
        &:last-child {
          grid-template-columns: 1fr;
        }
      }
    }
    
    .chart-card {
      background: @bg-primary;
      border-radius: @radius-lg;
      box-shadow: @shadow-sm;
      border: 1px solid @border-color;
      padding: @spacing-lg;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: @spacing-md;
      }
      
      .chart-container {
        height: 280px;
      }
      
      &.small .chart-container {
        height: 200px;
      }
    }
  }
  
  .goals-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: @spacing-md;
      
      h2 {
        font-size: @font-size-lg;
        font-weight: 600;
      }
      
      a {
        font-size: @font-size-sm;
        color: @primary-color;
      }
    }
    
    .goals-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: @spacing-md;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .goal-item {
      background: @bg-primary;
      border-radius: @radius-lg;
      border: 1px solid @border-color;
      padding: @spacing-md;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: @spacing-md;
      
      .goal-info {
        display: flex;
        align-items: center;
        gap: @spacing-sm;
        
        .goal-icon {
          font-size: 24px;
        }
        
        .goal-name {
          font-weight: 500;
        }
      }
      
      .goal-progress {
        flex: 1;
        max-width: 200px;
        
        .goal-text {
          font-size: @font-size-xs;
          color: @text-secondary;
        }
      }
    }
  }
}
</style>
