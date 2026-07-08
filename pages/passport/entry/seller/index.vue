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
          :class="{ active: current == index }"
          v-for="(item, index) in entrySteps"
          :key="index"
        >
          {{ item.title }}
        </div>
      </div>
      <div class="submit" @click="keepOn()">开始填写</div>
      <div class="notice" @click="getEntryNotice">查看店铺入驻协议</div>
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

const current = ref(999)
const companyData = ref<any>('')

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
  padding: 32rpx 80rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.title {
  line-height: 1.2;
  font-weight: 500;
  font-size: 56rpx;
  color: #333;
}

.step-list {
  margin: 80rpx 0;
}

.step-item {
  padding: 30rpx 20rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #666;
}

.step-item.active {
  color: var(--theme-light, #ff6b35);
  background: var(--theme-light-10, rgba(255, 107, 53, 0.1));
  border-radius: 20rpx;
}

.submit,
.notice {
  font-weight: bold;
  font-size: 28rpx;
  height: 92rpx;
  text-align: center;
  letter-spacing: 4rpx;
  line-height: 92rpx;
  border-radius: 20rpx;
}

.submit {
  color: #fff;
  margin-top: 120rpx;
  background: var(--theme-light, #ff6b35);
}

.notice {
  margin-top: 40rpx;
  color: #333;
  background: $bg-color;
}
</style>
