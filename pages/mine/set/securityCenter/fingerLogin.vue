// TODO 第一版本暂无此功能 后续优化以及更新
<template>
  <view class="finger">
    <u-cell-group>
      <u-cell class="border-top" :isLink="false" title="指纹登录">
        <template #right-icon>
          <u-switch @change="onFingerSwitchChange" :active-color="lightColor" size="40" v-model="enabled"></u-switch>
        </template>
      </u-cell>
    </u-cell-group>
    <view class="describe">开启后可使用指纹认证完成快捷登录，设置仅对本机生效。如需修改指纹，请在系统设置中操作。</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import storage from '@/utils/storage.js'
import { setBiolofy } from '@/api/passport.js'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const enabled = ref(false)

onLoad(() => {
  // #ifdef APP-PLUS
  if (!plus.fingerprint.isSupport()) {
    plus.nativeUI.toast('此设备不支持指纹识别')
    uni.navigateBack()
  }
  if (!plus.fingerprint.isKeyguardSecure()) {
    plus.nativeUI.toast('此设备未设置密码锁屏')
    uni.navigateBack()
  }
  if (!plus.fingerprint.isEnrolledFingerprints()) {
    plus.nativeUI.toast('此设备未录入指纹')
    uni.navigateBack()
  }
  enabled.value = storage.getFingerLogin() || false
  // #endif
})

function onFingerSwitchChange(value: boolean) {
  if (value) {
    const systemInfo = uni.getSystemInfoSync()
    plus.device.getInfo({
      success(e) {
        setBiolofy({
          mobile_type: systemInfo.model,
          secret_key: e.uuid,
        }).then((res) => {
          if (res.statusCode === 200) {
            storage.setFingerLogin(true)
          }
        })
      },
      fail(err) {
        console.error('getDeviceInfo failed: ' + JSON.stringify(err))
      },
    })
  } else {
    storage.setFingerLogin(false)
  }
}
</script>

<style scoped lang="scss">
</style>
