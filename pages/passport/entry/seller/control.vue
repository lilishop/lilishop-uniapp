<template>
  <div class="seller-control" :style="themeStyle">
    <u-navbar
      :border="false"
      :fixed="true"
      :placeholder="true"
      left-icon="arrow-left"
      :auto-back="false"
      @left-click="back"
    ></u-navbar>
    <step1 v-if="current == 1" :companyData="companyData" @callback="next()" />
    <step2 v-if="current == 2" :companyData="companyData" @callback="next()" />
    <step3
      v-if="current == 3"
      :companyData="companyData"
      @callback="finished()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { getCompanyDetail } from '@/api/entry'
import step1 from './step1.vue'
import step2 from './step2.vue'
import step3 from './step3.vue'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const companyData = ref<any>('')
const current = ref(1)

onMounted(() => {
  init()
})

function back() {
  if (current.value > 1) {
    current.value--
    return
  }
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/tabbar/home/index' })
    },
  })
}

async function init(next?: string) {
  const res = await getCompanyDetail()
  if (res.data.success) {
    companyData.value = res.data.result
    if (next) {
      current.value++
    }
  }
}

function next() {
  init('next')
}

function finished() {
  uni.navigateTo({
    url: '/pages/passport/entry/seller/index',
  })
}
</script>

<style lang="scss">
page {
  background: #f7f7f7;
}
</style>

<style lang="scss" scoped>
@import "./entry.scss";

.seller-control {
  min-height: 100vh;
  background: #f7f7f7;
}
</style>
