<template>
  <el-form 
    ref="formRef"
    :model="formData" 
    :rules="rules"
    label-width="90px"
    class="health-form"
  >
    <el-divider content-position="left">运动数据</el-divider>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="步数" prop="steps">
          <el-input-number 
            v-model="formData.steps" 
            :min="0" 
            :max="100000"
            placeholder="今日步数"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="距离(km)">
          <el-input-number 
            v-model="formData.distance" 
            :min="0" 
            :max="200"
            :precision="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="热量消耗">
          <el-input-number 
            v-model="formData.calories" 
            :min="0" 
            :max="5000"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">kcal</span>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-divider content-position="left">心率数据</el-divider>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="静息心率">
          <el-input-number 
            v-model="formData.heartRate.resting" 
            :min="40" 
            :max="120"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="最大心率">
          <el-input-number 
            v-model="formData.heartRate.max" 
            :min="60" 
            :max="220"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="平均心率">
          <el-input-number 
            v-model="formData.heartRate.avg" 
            :min="40" 
            :max="180"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-divider content-position="left">睡眠数据</el-divider>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="总时长">
          <el-input-number 
            v-model="formData.sleep.duration" 
            :min="0" 
            :max="24"
            :precision="1"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">小时</span>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="深睡时长">
          <el-input-number 
            v-model="formData.sleep.deep" 
            :min="0" 
            :max="12"
            :precision="1"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">小时</span>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="睡眠质量">
          <el-rate 
            v-model="formData.sleep.quality" 
            :max="5"
            show-score
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-divider content-position="left">其他数据</el-divider>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="饮水量">
          <el-input-number 
            v-model="formData.water" 
            :min="0" 
            :max="10000"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">ml</span>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="体重">
          <el-input-number 
            v-model="formData.weight" 
            :min="30" 
            :max="200"
            :precision="1"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">kg</span>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="收缩压">
          <el-input-number 
            v-model="formData.bloodPressure.systolic" 
            :min="60" 
            :max="250"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">mmHg</span>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="舒张压">
          <el-input-number 
            v-model="formData.bloodPressure.diastolic" 
            :min="40" 
            :max="150"
            controls-position="right"
            style="width: 100%"
          />
          <span class="unit-label">mmHg</span>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="心情">
          <el-radio-group v-model="formData.mood" class="mood-radio">
            <el-radio label="good">😊 开心</el-radio>
            <el-radio label="normal">😐 一般</el-radio>
            <el-radio label="bad">😔 低落</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="记录日期">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-form-item label="备注">
      <el-input 
        v-model="formData.notes" 
        type="textarea"
        :rows="2"
        placeholder="添加备注..."
      />
    </el-form-item>
    
    <el-form-item class="form-actions">
      <el-button type="primary" @click="handleSubmit">保存记录</el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getToday } from '@/utils/date'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)

const getDefaultForm = () => ({
  date: getToday(),
  steps: null,
  distance: null,
  calories: null,
  heartRate: {
    resting: null,
    max: null,
    avg: null
  },
  sleep: {
    duration: null,
    deep: null,
    light: null,
    quality: 3
  },
  water: null,
  weight: null,
  bloodPressure: {
    systolic: null,
    diastolic: null
  },
  mood: 'normal',
  notes: ''
})

const formData = reactive(getDefaultForm())

// 监听初始数据
watch(() => props.initialData, (data) => {
  if (data) {
    Object.assign(formData, {
      ...getDefaultForm(),
      ...data,
      heartRate: {
        ...getDefaultForm().heartRate,
        ...data.heartRate
      },
      sleep: {
        ...getDefaultForm().sleep,
        ...data.sleep
      },
      bloodPressure: {
        ...getDefaultForm().bloodPressure,
        ...data.bloodPressure
      }
    })
  }
}, { immediate: true })

const rules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...formData })
  } catch {
    // 验证失败
  }
}

const handleReset = () => {
  Object.assign(formData, getDefaultForm())
}
</script>

<style lang="less" scoped>
.health-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.el-divider) {
    margin: 16px 0;
  }
  
  .unit-label {
    margin-left: 8px;
    color: @text-secondary;
    font-size: 13px;
  }
  
  .mood-radio {
    :deep(.el-radio) {
      margin-right: 16px;
    }
  }
  
  .form-actions {
    margin-top: @spacing-lg;
    
    :deep(.el-form-item__content) {
      justify-content: flex-end;
    }
  }
}
</style>