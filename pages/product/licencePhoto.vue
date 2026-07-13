<template>
  <div class="wrapper">
    <p>公司名称：{{storeData.companyName}}</p>
    <p>公司地址：{{storeData.companyAddress}}</p>
    <p>公司地址地区：{{storeData.companyAddressPath}}</p>
    <p>员工人数：{{storeData.employeeNum}}</p>
    <p>法定经营范围：{{storeData.scope}}</p>
    <u-image @click="preview()" width="100%" height="400rpx" mode="aspectFit" :src="storeData.licencePhoto"></u-image>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getLicencePhoto } from '@/api/store.js'

const storeData = ref<any>({})

async function getStoreLicencePhoto(id: string) {
  const res = await getLicencePhoto(id)
  if (res.data.success) {
    storeData.value = res.data.result
  }
}

function preview() {
  uni.previewImage({
    current: 0,
    urls: [storeData.value.licencePhoto],
    longPressActions: {
      itemList: ['保存图片'],
      success: function () {},
      fail: function () {},
    },
  })
}

onLoad((options: any) => {
  getStoreLicencePhoto(options.id)
})
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 32rpx;
  > p {
    margin: 20rpx 0;
  }
}
</style>
