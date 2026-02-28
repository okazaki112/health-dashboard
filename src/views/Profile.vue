<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人健康档案</h1>
      <div class="header-actions">
        <el-button type="primary" @click="editMode = true" v-if="!editMode">
          <el-icon><Edit /></el-icon>
          编辑档案
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出档案
        </el-button>
      </div>
    </div>
    
    <!-- 档案不存在时显示创建表单 -->
    <div v-if="!profileStore.hasProfile" class="create-profile">
      <el-card>
        <template #header>
          <span>创建您的健康档案</span>
        </template>
        <ProfileForm @submit="handleCreate" />
      </el-card>
    </div>
    
    <!-- 档案详情 -->
    <div v-else class="profile-content">
      <!-- 基本信息 -->
      <el-card class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="100" class="avatar">
              {{ profileStore.profile?.nickname?.charAt(0) || '健' }}
            </el-avatar>
            <div class="profile-info">
              <h2>{{ profileStore.profile?.nickname || '健康达人' }}</h2>
              <div class="info-tags">
                <el-tag>{{ genderText }}</el-tag>
                <el-tag type="info">{{ profileStore.age || '--' }}岁</el-tag>
              </div>
            </div>
          </div>
          <div class="bmi-section">
            <div class="bmi-value">{{ profileStore.bmi || '--' }}</div>
            <div class="bmi-label">BMI</div>
            <el-tag :type="bmiTagType" size="small">{{ profileStore.bmiStatus?.text }}</el-tag>
          </div>
        </div>
      </el-card>
      
      <!-- 详细信息 -->
      <div class="info-grid">
        <el-card class="info-card">
          <template #header>
            <div class="card-title">
              <el-icon><User /></el-icon>
              基础信息
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">
              {{ profileStore.profile?.nickname || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ genderText }}
            </el-descriptions-item>
            <el-descriptions-item label="出生日期">
              {{ profileStore.profile?.birthDate || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="年龄">
              {{ profileStore.age || '--' }}岁
            </el-descriptions-item>
            <el-descriptions-item label="身高">
              {{ profileStore.profile?.height || '--' }} cm
            </el-descriptions-item>
            <el-descriptions-item label="体重">
              {{ profileStore.profile?.weight || '--' }} kg
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <el-card class="info-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              健康背景
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="血型">
              {{ profileStore.profile?.bloodType || '--' }}型
            </el-descriptions-item>
            <el-descriptions-item label="过敏史">
              <el-tag 
                v-for="(allergy, index) in profileStore.profile?.allergies" 
                :key="index"
                type="warning"
                size="small"
                class="mr-1"
              >
                {{ allergy }}
              </el-tag>
              <span v-if="!profileStore.profile?.allergies?.length">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="基础疾病">
              <el-tag 
                v-for="(disease, index) in profileStore.profile?.diseases" 
                :key="index"
                type="danger"
                size="small"
                class="mr-1"
              >
                {{ disease }}
              </el-tag>
              <span v-if="!profileStore.profile?.diseases?.length">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="常用药物">
              <el-tag 
                v-for="(med, index) in profileStore.profile?.medications" 
                :key="index"
                type="info"
                size="small"
                class="mr-1"
              >
                {{ med }}
              </el-tag>
              <span v-if="!profileStore.profile?.medications?.length">无</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <el-card class="info-card">
          <template #header>
            <div class="card-title">
              <el-icon><Phone /></el-icon>
              紧急联系人
            </div>
          </template>
          <div v-if="profileStore.profile?.emergencyContact" class="emergency-contact">
            <p><strong>姓名：</strong>{{ profileStore.profile.emergencyContact.name }}</p>
            <p><strong>关系：</strong>{{ profileStore.profile.emergencyContact.relation }}</p>
            <p><strong>电话：</strong>{{ profileStore.profile.emergencyContact.phone }}</p>
          </div>
          <el-empty v-else description="未设置紧急联系人" :image-size="60" />
        </el-card>
      </div>
    </div>
    
    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="editMode" 
      title="编辑个人档案" 
      width="600px"
      :close-on-click-modal="false"
    >
      <ProfileForm 
        :initial-data="profileStore.profile" 
        @submit="handleUpdate"
        @cancel="editMode = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Download, User, Document, Phone } from '@element-plus/icons-vue'
import { useProfileStore } from '@/stores/profile'
import { exportJSON } from '@/utils/export'
import ProfileForm from '@/components/forms/ProfileForm.vue'

const profileStore = useProfileStore()
const editMode = ref(false)

// 性别文本
const genderText = computed(() => {
  const genders = { male: '男', female: '女', other: '其他' }
  return genders[profileStore.profile?.gender] || '--'
})

// BMI标签类型
const bmiTagType = computed(() => {
  const statusColors = {
    underweight: 'info',
    normal: 'success',
    overweight: 'warning',
    obese: 'danger'
  }
  return statusColors[profileStore.bmiStatus?.status] || 'info'
})

// 创建档案
const handleCreate = async (data) => {
  const success = profileStore.saveProfile(data)
  if (success) {
    ElMessage.success('档案创建成功')
  } else {
    ElMessage.error('创建失败，请重试')
  }
}

// 更新档案
const handleUpdate = async (data) => {
  const success = profileStore.updateProfile(data)
  if (success) {
    ElMessage.success('档案更新成功')
    editMode.value = false
  } else {
    ElMessage.error('更新失败，请重试')
  }
}

// 导出档案
const handleExport = () => {
  const data = profileStore.exportProfile()
  exportJSON(data, 'health_profile')
  ElMessage.success('档案导出成功')
}

onMounted(() => {
  profileStore.initProfile()
})
</script>

<style lang="less" scoped>
.profile-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-lg;
    
    h1 {
      font-size: @font-size-2xl;
      font-weight: 700;
    }
    
    .header-actions {
      display: flex;
      gap: @spacing-sm;
    }
  }
  
  .create-profile {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .profile-card {
    margin-bottom: @spacing-lg;
    
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: @spacing-lg;
      }
    }
    
    .avatar-section {
      display: flex;
      align-items: center;
      gap: @spacing-lg;
    }
    
    .avatar {
      background: linear-gradient(135deg, @primary-color, @primary-light);
      color: white;
      font-size: 36px;
      font-weight: 600;
    }
    
    .profile-info {
      h2 {
        font-size: @font-size-xl;
        margin-bottom: @spacing-sm;
      }
      
      .info-tags {
        display: flex;
        gap: @spacing-sm;
      }
    }
    
    .bmi-section {
      text-align: center;
      padding: @spacing-md;
      background: @bg-secondary;
      border-radius: @radius-lg;
      min-width: 120px;
      
      .bmi-value {
        font-size: @font-size-3xl;
        font-weight: 700;
        color: @text-primary;
      }
      
      .bmi-label {
        font-size: @font-size-sm;
        color: @text-secondary;
        margin-bottom: @spacing-xs;
      }
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: @spacing-lg;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
    
    .info-card {
      .card-title {
        display: flex;
        align-items: center;
        gap: @spacing-sm;
        font-weight: 600;
      }
    }
  }
  
  .emergency-contact {
    p {
      margin-bottom: @spacing-sm;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .mr-1 {
    margin-right: @spacing-xs;
  }
}
</style>
