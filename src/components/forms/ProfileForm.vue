<template>
  <el-form 
    ref="formRef"
    :model="formData" 
    :rules="rules"
    label-width="100px"
    class="profile-form"
  >
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="formData.nickname" placeholder="请输入昵称" />
    </el-form-item>
    
    <el-form-item label="性别" prop="gender">
      <el-radio-group v-model="formData.gender">
        <el-radio label="male">男</el-radio>
        <el-radio label="female">女</el-radio>
        <el-radio label="other">其他</el-radio>
      </el-radio-group>
    </el-form-item>
    
    <el-form-item label="出生日期" prop="birthDate">
      <el-date-picker
        v-model="formData.birthDate"
        type="date"
        placeholder="选择出生日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>
    
    <el-form-item label="身高" prop="height">
      <el-input-number 
        v-model="formData.height" 
        :min="100" 
        :max="250"
        placeholder="请输入身高"
        style="width: 100%"
      />
      <span class="unit">cm</span>
    </el-form-item>
    
    <el-form-item label="体重" prop="weight">
      <el-input-number 
        v-model="formData.weight" 
        :min="30" 
        :max="200"
        :precision="1"
        placeholder="请输入体重"
        style="width: 100%"
      />
      <span class="unit">kg</span>
    </el-form-item>
    
    <el-form-item label="血型">
      <el-select v-model="formData.bloodType" placeholder="选择血型" style="width: 100%">
        <el-option label="A型" value="A" />
        <el-option label="B型" value="B" />
        <el-option label="AB型" value="AB" />
        <el-option label="O型" value="O" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="过敏史">
      <el-select 
        v-model="formData.allergies" 
        multiple 
        filterable 
        allow-create
        default-first-option
        placeholder="输入过敏源，按回车添加"
        style="width: 100%"
      />
    </el-form-item>
    
    <el-form-item label="基础疾病">
      <el-select 
        v-model="formData.diseases" 
        multiple 
        filterable 
        allow-create
        default-first-option
        placeholder="输入疾病名称，按回车添加"
        style="width: 100%"
      />
    </el-form-item>
    
    <el-form-item label="常用药物">
      <el-select 
        v-model="formData.medications" 
        multiple 
        filterable 
        allow-create
        default-first-option
        placeholder="输入药物名称，按回车添加"
        style="width: 100%"
      />
    </el-form-item>
    
    <el-divider>紧急联系人</el-divider>
    
    <el-form-item label="联系人姓名">
      <el-input v-model="formData.emergencyContact.name" placeholder="请输入联系人姓名" />
    </el-form-item>
    
    <el-form-item label="关系">
      <el-input v-model="formData.emergencyContact.relation" placeholder="如：父亲、母亲、配偶" />
    </el-form-item>
    
    <el-form-item label="联系电话">
      <el-input v-model="formData.emergencyContact.phone" placeholder="请输入联系电话" />
    </el-form-item>
    
    <el-form-item class="form-actions">
      <el-button type="primary" @click="handleSubmit">保存档案</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)

const formData = reactive({
  nickname: '',
  gender: 'male',
  birthDate: '',
  height: 170,
  weight: 65,
  bloodType: '',
  allergies: [],
  diseases: [],
  medications: [],
  emergencyContact: {
    name: '',
    relation: '',
    phone: ''
  }
})

// 监听初始数据
watch(() => props.initialData, (data) => {
  if (data) {
    Object.assign(formData, {
      nickname: data.nickname || '',
      gender: data.gender || 'male',
      birthDate: data.birthDate || '',
      height: data.height || 170,
      weight: data.weight || 65,
      bloodType: data.bloodType || '',
      allergies: data.allergies || [],
      diseases: data.diseases || [],
      medications: data.medications || [],
      emergencyContact: {
        name: data.emergencyContact?.name || '',
        relation: data.emergencyContact?.relation || '',
        phone: data.emergencyContact?.phone || ''
      }
    })
  }
}, { immediate: true })

const rules = {
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  height: [{ required: true, message: '请输入身高', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入体重', trigger: 'blur' }]
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
</script>

<style lang="less" scoped>
.profile-form {
  .unit {
    margin-left: @spacing-sm;
    color: @text-secondary;
  }
  
  .form-actions {
    margin-top: @spacing-lg;
    
    :deep(.el-form-item__content) {
      justify-content: flex-end;
    }
  }
}
</style>
