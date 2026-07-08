<template>
  <view class="wrapper">
    <view>
      <h4>实名认证（请上传真实的个人信息，认证通过后将无法修改）</h4>
      <view>
        <up-form
          :model="formData"
          label-position="left"
          label-width="180rpx"
          ref="uFormRef"
        >
        <up-form-item label="姓名" prop="name">
            <u-input v-model="formData.name" placeholder="请输入您的真实姓名" />
          </up-form-item>
          <up-form-item label="身份证" prop="idNumber">
            <u-input v-model="formData.idNumber" placeholder="请输入身份证号码" />
          </up-form-item>
          <up-form-item label="银行开户行" prop="settlementBankBranchName">
            <u-input v-model="formData.settlementBankBranchName" placeholder="请输入银行开户行" />
          </up-form-item>
          <up-form-item label="银行开户名" prop="settlementBankAccountName">
            <u-input v-model="formData.settlementBankAccountName" placeholder="请输入银行开户名" />
          </up-form-item>
          <up-form-item label="银行账号" prop="settlementBankAccountNum">
            <u-input v-model="formData.settlementBankAccountNum" placeholder="请输入银行账号" />
          </up-form-item>
        </up-form>
        <u-button :customStyle="{ background: lightColor, color: '#fff' }" @click="submitForm">提交</u-button>
      </view>
    </view>
    <view class="tips">
      <view>您提交的信息正在审核</view>
      <view>提交认证申请后，工作人员将在三个工作日进行核对完成审核</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, getCurrentInstance } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { applyDistribution } from '@/api/goods'

const store = useStore()
const { proxy } = getCurrentInstance()!

const lightColor = computed(() => store.getters.lightColor)
const uFormRef = ref<any>(null)

const formData = reactive({
  name: '',
  idNumber: '',
  settlementBankBranchName: '',
  settlementBankAccountName: '',
  settlementBankAccountNum: '',
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.chinese(value),
      message: '姓名输入不正确',
      trigger: ['change', 'blur'],
    },
  ],
  settlementBankBranchName: [{ required: true, message: '请输入银行开户行', trigger: 'blur' }],
  settlementBankAccountName: [{ required: true, message: '银行开户名', trigger: 'blur' }],
  settlementBankAccountNum: [{ required: true, message: '请输入银行账号', trigger: 'blur' }],
  idNumber: [
    { required: true, message: '请输入身份证', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.idCard(value),
      message: '身份证号码不正确',
      trigger: ['change', 'blur'],
    },
  ],
}

onReady(() => {
  uFormRef.value?.setRules(rules)
})

function submitForm() {
  uFormRef.value?.validate().then(() => {
    applyDistribution(formData).then((res) => {
      if (res.data.success) {
        uni.showToast({ title: '认证提交成功!', duration: 2000, icon: 'none' })
        setTimeout(() => uni.navigateBack(), 500)
      } else {
        uni.showToast({ title: res.data.message, duration: 2000, icon: 'none' })
      }
    })
  }).catch(() => {
    uni.showToast({ title: '请填写有效信息', duration: 2000, icon: 'none' })
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 32rpx;
}
.tips {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
