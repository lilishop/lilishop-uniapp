// TODO 第一版本暂无此功能 后续优化以及更新
<template>
  <view class="face-login">
    <u-cell-group>
      <u-cell class="border-top" :isLink="false" title="面容登录">
        <template #right-icon>
          <u-switch @change="onFaceSwitchChange" active-color="#1abc9c" size="40" v-model="enabled"></u-switch>
        </template>
      </u-cell>
    </u-cell-group>
    <view class="describe">开启后可使用面容认证完成快捷登录，设置仅对本机生效。</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import storage from '@/utils/storage.js'
import { setBiolofy } from '@/api/passport.js'

const enabled = ref(false)

onLoad(() => {
  // #ifdef APP-PLUS
  uni.checkIsSupportSoterAuthentication({
    success(res) {
      if (!res.supportMode.find((e) => e === 'facial')) {
        plus.nativeUI.toast('此设备不支持面部识别')
        uni.navigateBack()
      }
      uni.checkIsSoterEnrolledInDevice({
        checkAuthMode: 'facial',
        success(_res) {
          if (!_res.isEnrolled) {
            plus.nativeUI.toast('此设备未录入面部信息')
            uni.navigateBack()
          }
        },
        fail() {
          uni.navigateBack()
        },
      })
    },
    fail() {
      uni.navigateBack()
    },
  })
  enabled.value = storage.getFaceLogin() || false
  // #endif
})

function onFaceSwitchChange(value: boolean) {
  if (value) {
    const systemInfo = uni.getSystemInfoSync()
    plus.device.getInfo({
      success(e) {
        setBiolofy({
          mobile_type: systemInfo.model,
          secret_key: e.uuid,
        }).then((res) => {
          if (res.statusCode === 200) {
            storage.setFaceLogin(true)
          }
        })
      },
      fail(err) {
        console.error('getDeviceInfo failed: ' + JSON.stringify(err))
      },
    })
  } else {
    storage.setFaceLogin(false)
  }
}
</script>

<style lang="scss" scoped>
.face-login {
}
</style>
