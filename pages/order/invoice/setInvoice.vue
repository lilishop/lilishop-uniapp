<template>
  <u-popup :style="themeStyle" closeable border-radius="28" @close="onPopupClose" mode="bottom" height="80%" v-model:show="show">

    <div class="wrapper">
      <!-- 发票类型 -->
      <div class="invoice-title">发票类型</div>
      <div class="flex">
        <div class="invoice-item" @click="handleClickHeader(typeItem,index,invoiceType)"
          :class="{'active':typeItem.active,disabled:typeItem.disabled}" v-for="(typeItem,index) in invoiceType" :key="index">
          {{typeItem.title}}
        </div>
      </div>
      <div class="tips">
        {{tips}}
      </div>
      <div class="divider">
      </div>
      <!-- 发票抬头 -->
      <div class="invoice-title">发票抬头</div>

      <div class="flex" v-if="!isSpecialInvoice">
        <div class="invoice-item" @click="handleClickHeader(headerItem,index,invoiceHeader)" :class="{'active':headerItem.active,disabled:headerItem.disabled}"
          v-for="(headerItem,index) in invoiceHeader" :key="index">
          {{headerItem.title}}
        </div>
      </div>
      <div class="flex" v-else>
        <div class="invoice-item active">
          单位
        </div>
      </div>
      <div>
        <div class="form-item">
          <span> {{isSpecialInvoice ? '单位' : title}}名称</span>
          <u-input :placeholder="'请输入'+(isSpecialInvoice ? '单位' : title)+'名称'" v-model="titleName" />
        </div>
        <div class="form-item" v-if="taxpayerFlag || isSpecialInvoice">
          <span>纳税人识别号</span>
          <u-input placeholder="请输入纳税人识别号" v-model="submitData.taxpayerId" />
        </div>
        <div v-if="isSpecialInvoice">
          <div class="form-item">
            <span>单位地址</span>
            <u-input placeholder="请输入单位地址" v-model="submitData.companyAddress" />
          </div>
          <div class="form-item">
            <span>单位电话</span>
            <u-input placeholder="请输入单位电话" v-model="submitData.companyPhone" />
          </div>
          <div class="form-item">
            <span>开户银行</span>
            <u-input placeholder="请输入开户银行" v-model="submitData.bankName" />
          </div>
          <div class="form-item">
            <span>银行账号</span>
            <u-input placeholder="请输入银行账号" v-model="submitData.bankAccount" />
          </div>
        </div>

      </div>
      <div class="divider">
      </div>
      <div class="invoice-title">收票人信息</div>
      <div>
        <div class="form-item">
          <span>收票人手机</span>
          <u-input placeholder="请输入收票人手机" v-model="submitData.receiptPhone" />
        </div>
        <div class="form-item">
          <span>收票人邮箱</span>
          <u-input placeholder="请输入收票人邮箱(选填)" v-model="submitData.receiptEmail" />
        </div>
      </div>
      <div class="divider">
      </div>
      <div class="invoice-title">
        发票内容
      </div>
      <div class="flex" v-if="!isSpecialInvoice">
        <div class="invoice-item" @click="handleClickHeader(goodsItem,index,goodsType)" :class="{'active':goodsItem.active,disabled:goodsItem.disabled}" v-for="(goodsItem,index) in goodsType"
          :key="index">
          {{goodsItem.title}}
        </div>
      </div>
      <div class="flex" v-else>
        <div class="invoice-item active">
          商品明细
        </div>
      </div>

      <div class="submit" @click="submitInvoice()">确定</div>
    </div>
  </u-popup>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

interface InvoiceOption {
  title: string
  active: boolean
  disabled?: boolean
}

interface SubmitData {
  receiptTitle: string
  receiptType: string
  personalName: string
  companyName: string
  taxpayerId: string
  receiptContent: string
  companyAddress: string
  companyPhone: string
  bankName: string
  bankAccount: string
  receiptPhone: string
  receiptEmail: string
}

const props = defineProps<{
  res?: Record<string, any>
}>()

const emit = defineEmits<{
  callbackInvoice: [val: SubmitData | boolean]
}>()

const { proxy } = getCurrentInstance()!

const shouldClearOnTypeChange = ref(false)
const taxpayerFlag = ref(false)
const submitData = reactive<SubmitData>({
  receiptTitle: '',
  receiptType: '1',
  personalName: '',
  companyName: '',
  taxpayerId: '',
  receiptContent: '',
  companyAddress: '',
  companyPhone: '',
  bankName: '',
  bankAccount: '',
  receiptPhone: '',
  receiptEmail: '',
})
const show = ref(true)
const confirmed = ref(false)
const title = ref('')
const tips =
  '电子发票即电子增值税发票，是税局认可的有效凭证，其法律效力、基本用途及使用规定同纸质发票。'

const invoiceType = reactive<InvoiceOption[]>([
  { title: '电子普通发票', active: true },
  { title: '增值税专用发票', active: false },
])

const invoiceHeader = reactive<InvoiceOption[]>([
  { title: '个人', active: false },
  { title: '单位', active: false },
])

const goodsType = reactive<InvoiceOption[]>([
  { title: '商品明细', active: false },
  { title: '商品类别', active: false },
])

const isSpecialInvoice = computed(
  () => getActiveTitle(invoiceType) === '增值税专用发票'
)

const titleName = computed({
  get() {
    return isUnitTitle() ? submitData.companyName : submitData.personalName
  },
  set(value: string) {
    if (isUnitTitle()) {
      submitData.companyName = value
    } else {
      submitData.personalName = value
    }
    syncReceiptTitle()
  },
})

watch(
  invoiceType,
  (val) => {
    const currentType = getActiveTitle(val)
    const nextReceiptType = currentType === '增值税专用发票' ? '2' : '1'
    const previousReceiptType = submitData.receiptType
    submitData.receiptType = nextReceiptType

    if (
      shouldClearOnTypeChange.value &&
      previousReceiptType &&
      previousReceiptType !== nextReceiptType
    ) {
      clearInvoiceInfo()
    }

    if (currentType === '增值税专用发票') {
      setActiveByTitle(invoiceHeader, '单位')
      setActiveByTitle(goodsType, '商品明细')
      title.value = '单位'
      taxpayerFlag.value = true
      submitData.receiptContent = '商品明细'
      syncReceiptTitle()
    } else {
      setActiveByTitle(invoiceHeader, '个人')
      setActiveByTitle(goodsType, '商品明细')
      title.value = '个人'
      taxpayerFlag.value = false
      submitData.receiptContent = '商品明细'
      syncReceiptTitle()
    }
    shouldClearOnTypeChange.value = false
  },
  { deep: true }
)

watch(
  invoiceHeader,
  (val) => {
    if (isSpecialInvoice.value) {
      title.value = '单位'
      taxpayerFlag.value = true
      return
    }

    title.value = getActiveTitle(val) || '个人'
    taxpayerFlag.value = title.value == '单位'
    if (!taxpayerFlag.value) {
      submitData.taxpayerId = ''
    }
    syncReceiptTitle()
  },
  { deep: true }
)

watch(
  goodsType,
  (val) => {
    submitData.receiptContent = val.filter((item) => item.active == true)[0].title
  },
  { deep: true }
)

onMounted(() => {
  if (props.res) {
    submitData.receiptType = normalizeReceiptType(props.res.receiptType)
    submitData.personalName =
      props.res.personalName ||
      (!props.res.companyName && !props.res.taxpayerId
        ? props.res.receiptTitle || ''
        : '')
    submitData.companyName =
      props.res.companyName ||
      (props.res.taxpayerId ? props.res.receiptTitle || '' : '')
    submitData.taxpayerId = props.res.taxpayerId
    submitData.receiptContent = props.res.receiptContent
    submitData.companyAddress = props.res.companyAddress || ''
    submitData.companyPhone = props.res.companyPhone || ''
    submitData.bankName = props.res.bankName || ''
    submitData.bankAccount = props.res.bankAccount || ''
    submitData.receiptPhone = props.res.receiptPhone || ''
    submitData.receiptEmail = props.res.receiptEmail || ''
    if (submitData.receiptType === '2') {
      setActiveByTitle(invoiceType, '增值税专用发票')
      setActiveByTitle(invoiceHeader, '单位')
      setActiveByTitle(goodsType, '商品明细')
    } else {
      setActiveByTitle(invoiceType, '电子普通发票')
      props.res.receiptContent == '商品类别'
        ? setActiveByTitle(goodsType, '商品类别')
        : setActiveByTitle(goodsType, '商品明细')
      props.res.taxpayerId
        ? setActiveByTitle(invoiceHeader, '单位')
        : setActiveByTitle(invoiceHeader, '个人')
    }
    syncReceiptTitle()
  } else {
    setActiveByTitle(invoiceType, '电子普通发票')
    setActiveByTitle(invoiceHeader, '个人')
    setActiveByTitle(goodsType, '商品明细')
    syncReceiptTitle()
  }
})

function normalizeReceiptType(type: string) {
  return type === '2' || type === 'VATOSPECIAL' ? '2' : '1'
}

function getActiveTitle(list: InvoiceOption[]) {
  const current = list.find((item) => item.active)
  return current ? current.title : ''
}

function setActiveByTitle(list: InvoiceOption[], activeTitle: string) {
  list.forEach((item) => {
    item.active = item.title === activeTitle
  })
}

function isUnitTitle() {
  return isSpecialInvoice.value || title.value === '单位'
}

function syncReceiptTitle() {
  submitData.receiptTitle = isUnitTitle()
    ? submitData.companyName
    : submitData.personalName
}

function clearInvoiceInfo() {
  submitData.receiptTitle = ''
  submitData.personalName = ''
  submitData.companyName = ''
  submitData.taxpayerId = ''
  submitData.receiptContent = ''
  submitData.companyAddress = ''
  submitData.companyPhone = ''
  submitData.bankName = ''
  submitData.bankAccount = ''
  submitData.receiptPhone = ''
  submitData.receiptEmail = ''
}

function handleClickHeader(
  val: InvoiceOption,
  _index: number,
  arr: InvoiceOption[]
) {
  if (val.disabled) {
    return
  }
  const previousTitle = getActiveTitle(arr)
  if (arr === invoiceType && previousTitle !== val.title) {
    shouldClearOnTypeChange.value = true
  }
  arr.forEach((item) => {
    item.active = false
  })
  val.active = true
}

function onPopupClose() {
  if (confirmed.value) return
  show.value = false
  emit('callbackInvoice', false)
}

function submitInvoice() {
  const {
    receiptTitle,
    taxpayerId,
    companyAddress,
    companyPhone,
    bankName,
    bankAccount,
    receiptPhone,
    receiptEmail,
  } = submitData
  syncReceiptTitle()

  if (proxy.$u.test.isEmpty(receiptTitle)) {
    uni.showToast({
      title: '请您填写发票抬头!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (
    !proxy.$u.test.isEmpty(receiptTitle) &&
    proxy.$u.test.isEmpty(taxpayerId) &&
    invoiceHeader[1].active == true
  ) {
    uni.showToast({
      title: '请您填写纳税人识别号!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (isSpecialInvoice.value && proxy.$u.test.isEmpty(companyAddress)) {
    uni.showToast({
      title: '请您填写单位地址!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (isSpecialInvoice.value && proxy.$u.test.isEmpty(companyPhone)) {
    uni.showToast({
      title: '请您填写单位电话!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (isSpecialInvoice.value && proxy.$u.test.isEmpty(bankName)) {
    uni.showToast({
      title: '请您填写开户银行!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (isSpecialInvoice.value && proxy.$u.test.isEmpty(bankAccount)) {
    uni.showToast({
      title: '请您填写银行账号!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (proxy.$u.test.isEmpty(receiptPhone)) {
    uni.showToast({
      title: '请您填写收票人手机!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (!proxy.$u.test.mobile(receiptPhone)) {
    uni.showToast({
      title: '请输入正确的收票人手机号!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }
  if (
    !proxy.$u.test.isEmpty(receiptEmail) &&
    !proxy.$u.test.email(receiptEmail)
  ) {
    uni.showToast({
      title: '请输入正确的收票人邮箱!',
      duration: 2000,
      icon: 'none',
    })
    return false
  }

  confirmed.value = true
  show.value = false
  emit('callbackInvoice', { ...submitData })
}
</script>
<style scoped lang="scss">
.form-item {
  display: flex;
  margin: 30rpx 0;
  align-items: center;
  > span {
    margin-right: 50rpx;
  }
}
.submit {
  width: 100%;
  margin-top: 100rpx;
  background: $main-color;
  text-align: center;
  line-height: 80rpx;
  height: 80rpx;
  margin: 100rpx auto 0 auto;
  color: #f2f2f2;
  border-radius: 100px;
}
.invoice-item {
  margin-right: 30rpx;
  color: #333;
  font-weight: 24rpx;

  padding: 12rpx 46rpx;
  border-radius: 100px;
  background: #eee;
  min-width: 100rpx;
  text-align: center;
}
.active {
  font-weight: bold;
  color: $main-color;
  border: 2rpx solid $main-color;
  background: var(--theme-primary-10, rgba(255, 60, 42, 0.1));
}
.disabled {
  color: #b5b5b6;
}
.wrapper {
  padding: 30rpx;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}
.invoice-title {
  margin-bottom: 30rpx;
  font-weight: bold;
  font-size: 30rpx;
}
.tips {
  margin-top: 30rpx;
  color: #999;
  font-size: 24rpx;
}
.divider {
  margin: 30rpx 0;
  height: 1rpx;
  border-bottom: 1px solid #f2f3f5;
}
.flex {
  display: flex;
}
</style>
