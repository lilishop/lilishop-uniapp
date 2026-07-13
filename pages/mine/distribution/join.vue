<template>
  <view class="wrapper" :style="themeStyle">
    <u-tabs
      :list="stepList"
      :scrollable="false"
      v-model:current="currentStep"
      :lineColor="lightColor"
      :activeStyle="{ color: lightColor }"
    ></u-tabs>

    <view class="feedBack-box">
      <up-form
        :model="formData"
        label-position="top"
        ref="uFormRef"
      >
        <up-form-item label="会员昵称" prop="name">
          <u-input
            border="none"
            class="field-input"
            v-model="formData.name"
            :custom-style="fieldInputStyle"
          />
        </up-form-item>
        <up-form-item label="账户类型" prop="name"></up-form-item>
        <up-form-item label="收款人姓名" prop="name">
          <u-input
            border="none"
            class="field-input"
            v-model="formData.name"
            placeholder="请输入收款人姓名"
            :custom-style="fieldInputStyle"
          />
        </up-form-item>
        <up-form-item label="收款账号" prop="name">
          <u-input
            border="none"
            class="field-input"
            v-model="formData.name"
            placeholder="请输入收款人账号"
            :custom-style="fieldInputStyle"
          />
        </up-form-item>
        <up-form-item label="银行名称" prop="name">
          <u-input
            border="none"
            class="field-input"
            v-model="formData.name"
            placeholder="请输入开户银行支行名称"
            :custom-style="fieldInputStyle"
          />
        </up-form-item>
      </up-form>
    </view>

    <view class="submit" @click="submitForm">提交</view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { fieldInputStyle } from '@/utils/form-style.js'

const store = useStore()

const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)
const currentStep = ref(0)
const uFormRef = ref<any>(null)

const stepList = [
  { name: '推广人资料' },
  { name: '平台审核' },
  { name: '完成' },
]

const formData = reactive({
  name: '',
  radio: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

onReady(() => {
  uFormRef.value?.setRules(rules)
})

function submitForm() {
  uFormRef.value?.validate().catch(() => {
    uni.showToast({ title: '请填写有效信息', icon: 'none' })
  })
}
</script>

<style lang="scss">
page {
  background: #f8f8f8;
}
</style>

<style lang="scss" scoped>
@import '@/pages/passport/entry/seller/entry-form.scss';

.wrapper {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 20rpx 24rpx 40rpx;
  background: #f8f8f8;
  @include seller-entry-form;
}

.feedBack-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-top: 20rpx;
}

.submit {
  @include seller-entry-submit;
}
</style>
