<template>
  <div class="wrapper" :style="themeStyle">
    <u-navbar
      :border="false"
      :fixed="true"
      :placeholder="true"
      :auto-back="true"
    ></u-navbar>
    <div class="entry-content">
      <div class="title">店铺入驻</div>
      <div class="step-list">
        <div
          class="step-item"
          :class="{ active: current == index, done: current > index }"
          v-for="(item, index) in flowSteps"
          :key="item.value"
        >
          <div class="step-mark">{{ index + 1 }}</div>
          <div class="step-title">{{ item.title }}</div>
        </div>
      </div>
      <div v-if="statusTip" class="status-tip" :class="statusTip.value">
        {{ statusTip.title }}
      </div>
      <div class="actions">
        <div v-if="showFillButton" class="submit" @click="keepOn()">开始填写</div>
        <div class="notice" @click="getEntryNotice">查看店铺入驻协议</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { tipsToLogin } from '@/utils/filters.js'
import { getCompanyDetail } from '@/api/entry'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const current = ref(-1)
const companyData = ref<any>('')
const showFillButton = computed(() => companyData.value?.storeDisable !== 'OPEN')
const flowSteps = computed(() =>
  entrySteps.value.filter((item) => item.value === 'APPLY' || item.value === 'APPLYING')
)
const statusTip = computed(() =>
  entrySteps.value.find((item) => item.value !== 'APPLY' && item.value !== 'APPLYING')
)

const entrySteps = ref([
  {
    title: '填写资质信息',
    value: 'APPLY',
  },
  {
    title: '提交审核',
    value: 'APPLYING',
  },
])

const storeStatusWay = [
  {
    title: '申请已通过，请联系管理员',
    value: 'OPEN',
  },
  {
    title: '店铺已关闭，重申请联系管理员',
    value: 'CLOSED',
  },
  {
    title: '审核未通过,请修改资质信息',
    value: 'REFUSED',
  },
]

onShow(() => {
  if (tipsToLogin()) {
    init()
  }
})

onLoad(() => {})

function getEntryNotice() {
  uni.navigateTo({
    url: '/pages/mine/help/tips?type=STORE_REGISTER',
  })
}

function keepOn() {
  if (companyData.value && companyData.value.storeDisable == 'OPEN') {
    uni.showToast({
      title: '审核已通过',
      icon: 'none',
    })
  } else {
    uni.navigateTo({
      url: '/pages/passport/entry/seller/control',
    })
  }
}

async function init() {
  entrySteps.value = [
    {
      title: '填写资质信息',
      value: 'APPLY',
    },
    {
      title: '提交审核',
      value: 'APPLYING',
    },
  ]
  const res = await getCompanyDetail()
  if (res.data.success) {
    companyData.value = res.data.result

    if (companyData.value) {
      storeStatusWay.forEach((item) => {
        if (item.value == companyData.value.storeDisable) {
          entrySteps.value.push(item)
        }
      })

      current.value =
        entrySteps.value.findIndex(
          (item) => item.value == companyData.value.storeDisable
        ) || 0
    } else {
      current.value = 0
    }
  }
}
</script>
<style lang="scss">
page {
  background: #fff;
}
</style>
<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  background: #fff;
  box-sizing: border-box;
}

.entry-content {
  padding: 48rpx 48rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.title {
  line-height: 1.2;
  font-weight: 600;
  font-size: 48rpx;
  color: #222;
}

.step-list {
  margin-top: 64rpx;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  color: #999;
}

.step-mark {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
  border-radius: 50%;
  background: #f2f2f2;
  color: #999;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-title {
  font-size: 32rpx;
  font-weight: 500;
  line-height: 1.4;
}

.step-item.done .step-mark,
.step-item.active .step-mark {
  background: var(--theme-light, #ff6b35);
  color: #fff;
}

.step-item.done .step-title {
  color: #333;
}

.step-item.active .step-title {
  color: var(--theme-light, #ff6b35);
}

.status-tip {
  margin-top: 24rpx;
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: var(--theme-light, #ff6b35);
  background: var(--theme-light-10, rgba(255, 107, 53, 0.1));
}

.status-tip.REFUSED {
  color: var(--theme-primary, #ff3c2a);
  background: #fff1f0;
}

.status-tip.CLOSED {
  color: #666;
  background: #f5f5f5;
}

.actions {
  margin-top: 72rpx;
}

.submit,
.notice {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  border-radius: 44rpx;
}

.submit {
  color: #fff;
  background: var(--theme-light, #ff6b35);
  margin-bottom: 24rpx;
}

.notice {
  color: #333;
  background: #f5f5f5;
}
</style>
