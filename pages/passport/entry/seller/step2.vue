<template>
  <div class="wrapper" :style="themeStyle">
    <up-form label-position="top" :model="form" :rules="rules" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <up-form-item
          required
          :border-bottom="false"
          prop="settlementBankAccountName"
          label="银行开户名"
          ><u-input border="none" class="field-input"
            v-model="form.settlementBankAccountName"
            :custom-style="fieldInputStyle"
        /></up-form-item>

        <up-form-item
          required
          :border-bottom="false"
          prop="settlementBankAccountNum"
          label="银行账号"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.settlementBankAccountNum"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="settlementBankBranchName"
          label="开户银行支行名称"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.settlementBankBranchName"
        /></up-form-item>

        <up-form-item
          required
          :border-bottom="false"
          prop="settlementBankJointName"
          label="支行联行号"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.settlementBankJointName"
        /></up-form-item>
      </div>
    </up-form>
    <view class="submit" @click="validatorStep2Form">提交/下一步</view>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from '@/store'
import { applySecond } from '@/api/entry'
import { getThemeStyle } from '@/utils/theme'
import { fieldInputStyle } from '@/utils/form-style.js'

const props = defineProps<{ companyData?: any }>()
const emit = defineEmits<{ callback: [] }>()

const store = useStore()

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const uForm = ref<any>(null)

const form = reactive({
  settlementBankAccountName: '',
  settlementBankAccountNum: '',
  settlementBankBranchName: '',
  settlementBankJointName: '',
})

const rules = {
  settlementBankAccountName: [
    { required: true, message: '请填写银行开户名称' },
  ],
  settlementBankAccountNum: [
    { required: true, message: '请填写银行账号' },
  ],
  settlementBankBranchName: [
    { required: true, message: '请填写开户银行支行名称' },
  ],
  settlementBankJointName: [
    { required: true, message: '请填写支行联行号' },
  ],
}

watch(
  () => props.companyData,
  (val) => {
    if (val) {
      Object.assign(form, val)
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  uForm.value?.setRules(rules)
})

async function validatorStep2Form() {
  try {
    await uForm.value?.validate()
  } catch {
    return
  }
  const params = { ...form }
  const res = await applySecond(params)
  if (res.data.success) {
    uni.showToast({
      title: '提交成功!',
      icon: 'none',
    })
    emit('callback')
  }
}
</script>
<style lang="scss">
page {
  background: #f8f8f8;
}
</style>
<style lang="scss" scoped>
@import "./entry.scss";
@import "./entry-form.scss";

.wrapper {
  @include seller-entry-form;
}

.submit {
  @include seller-entry-submit;
}
</style>
