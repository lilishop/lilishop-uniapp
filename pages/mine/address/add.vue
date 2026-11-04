<template>
  <view :style="themeStyle" class="address-page add-address">
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechat-import">
      <button class="wechat-import-button" :disabled="importing" @click="importWechatAddress">
        <view class="wechat-icon"><u-icon name="weixin-fill" color="#07b75b" size="26" /></view>
        <view class="wechat-copy">
          <text class="wechat-title">{{ importing ? '正在导入微信地址…' : '导入微信收货地址' }}</text>
        </view>
        <u-icon name="arrow-right" color="#77a38a" size="14" />
      </button>
    </view>
    <!-- #endif -->
    <view v-if="importNotice" class="import-notice">{{ importNotice }}</view>
    <view class="section-heading">收货信息</view>
    <view class="address-card form-card">
    <up-form
      :model="form"
      ref="uForm"
      error-type="toast"
      :rules="rules"
      label-position="left"
      label-width="180rpx"
      :label-style="{ color: '#5b606b', fontSize: '28rpx' }"
    >
      <up-form-item label="收货人" label-width="160rpx" prop="name" :border-bottom="true" :custom-style="fieldStyle">
        <u-input
          v-model="form.name"
          border="none"
          input-align="left"
          clearable
          placeholder="姓名"
        />
      </up-form-item>

      <up-form-item label="手机号码" label-width="160rpx" prop="mobile" :border-bottom="true" :custom-style="fieldStyle">
        <u-input
          v-model="form.mobile"
          type="number"
          maxlength="11"
          border="none"
          input-align="left"
          placeholder="收货人的手机号码"
        />
      </up-form-item>

      <up-form-item label="所在地区" label-width="160rpx" prop="___path" :border-bottom="true" :custom-style="fieldStyle" @click="showPicker">
        <view class="form-value" :class="{ 'is-placeholder': !form.___path }">
          {{ form.___path || '请选择所在地区' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </up-form-item>

      <up-form-item label="详细地址" label-width="160rpx" prop="detail" :border-bottom="true" :custom-style="{ ...fieldStyle, alignItems: 'flex-start' }">
        <textarea
          class="address-textarea"
          v-model="form.detail"
          maxlength="100"
          :auto-height="true"
          placeholder="街道、门牌号等详细信息"
          placeholder-style="color: #b1b5bd; font-size: 28rpx;"
        />
      </up-form-item>

      <up-form-item label="地址标签" label-width="160rpx" :border-bottom="false" :custom-style="fieldStyle">
        <u-input
          v-model="form.alias"
          border="none"
          input-align="left"
          placeholder="如：家、公司（选填）"
        />
      </up-form-item>

    </up-form>
    </view>
    <view class="address-card default-row">
      <view>
        <text class="default-title">设为默认地址</text>
        <text class="default-hint">下单时优先使用这个地址</text>
      </view>
      <switch :checked="!!form.isDefault" :color="mainColor" @change="form.isDefault = $event.detail.value" />
    </view>
    <view class="address-footer">
      <button class="address-primary-button" :disabled="importing" @click="save">保存收货地址</button>
    </view>

    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getpickerParentValue"
      pickerSize="4"
    ></m-city>

    <uniMap v-if="mapFlag" @close="closeMap" @callback="callBackAddress" />
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { onLoad, onShow, onReady } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { addAddress as addAddressApi, editAddress, getAddressDetail } from '@/api/address.js'
import MCity from '@/components/m-city/m-city.vue'
import uniMap from '@/components/uniMap'
import permision from '@/js_sdk/wa-permission/permission.js'
import { getThemeStyle } from '@/utils/theme'
import { getRegionsById } from '@/api/common.js'
import { resolveWechatRegion, getWechatAddressErrorType } from '@/utils/wechatAddress.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const { proxy } = getCurrentInstance()!

const mainColor = computed(() => store.getters.mainColor)
const fieldStyle = { padding: '28rpx 0', minHeight: '100rpx', boxSizing: 'border-box', alignItems: 'center' }
const mapFlag = ref(false)
const routerVal = ref<Record<string, string>>({})
const uForm = ref<any>(null)
const cityPicker = ref<any>(null)
const importing = ref(false)
const importNotice = ref('')

// #ifdef MP-WEIXIN
function importWechatAddress() {
  if (importing.value) return
  importing.value = true
  uni.chooseAddress({
    success: async (address: any) => {
      uni.showLoading({ title: '正在匹配地区', mask: true })
      // Clear the old region and coordinates, including when editing an existing address.
      Object.assign(form, {
        name: address.userName || '',
        mobile: address.telNumber || '',
        detail: address.detailInfoNew || address.detailInfo || '',
        consigneeAddressIdPath: [],
        consigneeAddressPath: [],
        ___path: '',
        lat: '',
        lon: '',
      })
      importNotice.value = ''
      try {
        const regions = await resolveWechatRegion(address, getRegionsById)
        if (regions) {
          if (regions.length < 4 && address.streetName) {
            form.detail = address.detailInfo || [address.streetName, address.detailInfoNew].filter(Boolean).join('')
          }
          const names = regions.map((item: any) => item.name || item.localName)
          form.consigneeAddressIdPath = regions.map((item: any) => item.id)
          form.consigneeAddressPath = names
          form.___path = names.join('')
          const center = String(regions[regions.length - 1].center || '').split(',')
          if (center.length === 2) [form.lon, form.lat] = center
          importNotice.value = '已导入微信地址，请核对后保存'
        } else {
          showImportedRegionHint(address)
        }
      } catch {
        showImportedRegionHint(address)
      } finally {
        importing.value = false
        uni.hideLoading()
        uForm.value?.clearValidate()
      }
    },
    fail: (error: any) => {
      importing.value = false
      const type = getWechatAddressErrorType(error)
      if (type === 'cancel') return
      let platform = ''
      try { platform = (globalThis as any).wx?.getDeviceInfo?.()?.platform || '' } catch {}
      // Log diagnostics only, never the selected address or other personal information.
      console.warn('[微信地址导入失败]', {
        errMsg: String(error?.errMsg || error?.message || ''),
        errCode: error?.errCode ?? error?.errno ?? '',
        type,
        platform,
      })
      if (type === 'auth') {
        uni.showModal({
          title: '开启收货地址授权',
          content: '需要允许使用微信收货地址才能导入，也可以继续手动填写。',
          confirmText: '去设置',
          success: (result) => { if (result.confirm) uni.openSetting({}) },
        })
        return
      }
      if (type === 'privacy') {
        console.warn('[微信地址导入] 请核对小程序后台的用户隐私保护指引是否声明收货地址，以及用户隐私授权状态。')
      }
      if (type === 'configuration') {
        console.warn('[微信地址导入] manifest.json 的 mp-weixin.requiredPrivateInfos 必须包含 chooseAddress，修改后需重新编译小程序。')
      }
      const content = type === 'configuration'
        ? '收货地址导入暂未配置完成，请稍后再试，也可以手动填写。'
        : type === 'privacy'
        ? '暂时无法获取微信收货地址，请稍后重试，也可以手动填写。'
        : platform === 'devtools'
          ? '当前开发工具中未能打开微信地址簿，请使用手机微信扫码预览测试，也可以手动填写。'
          : type === 'unsupported'
            ? '当前微信环境不支持导入收货地址，请更新微信后重试，也可以手动填写。'
            : '暂时无法打开微信地址簿，请稍后重试，也可以手动填写。'
      uni.showModal({ title: '微信地址未导入', content, showCancel: false })
    },
  })
}

function showImportedRegionHint(address: any) {
  const region = [address.provinceName, address.cityName, address.countyName, address.streetName].filter(Boolean).join('')
  // Preserve the street if the user has to select it manually and the new detail field omits it.
  form.detail = address.detailInfo || [address.streetName, address.detailInfoNew].filter(Boolean).join('')
  importNotice.value = `已导入姓名、电话和详细地址，请补选所在地区${region ? '（微信地址：' + region + '）' : ''}`
}
// #endif

const form = reactive<Record<string, any>>({
  detail: '',
  name: '',
  mobile: '',
  consigneeAddressIdPath: [],
  consigneeAddressPath: [],
  ___path: '',
  isDefault: false,
})

const list = ref([
  {
    id: '',
    localName: '请选择',
    children: [],
  },
])

const rules = {
  name: [
    {
      required: true,
      message: '收货人姓名不能为空',
      trigger: ['blur', 'change'],
    },
  ],
  mobile: [
    {
      required: true,
      message: '手机号码不能为空',
      trigger: ['blur', 'change'],
    },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.mobile(value),
      message: '手机号码不正确',
      trigger: ['change', 'blur'],
    },
  ],
  ___path: [
    {
      required: true,
      message: '请选择所在区域',
      trigger: ['change'],
    },
  ],
  detail: [
    {
      required: true,
      message: '请填写详细地址',
      trigger: ['blur', 'change'],
    },
  ],
}

onShow(() => {})

onLoad(async (option) => {
  routerVal.value = option || {}
  uni.setNavigationBarTitle({ title: option?.id ? '编辑收货地址' : '新增收货地址' })
  if (!option?.id) return
  uni.showLoading({ title: '加载中' })
  try {
    const res = await getAddressDetail(option.id)
    const params = res.data?.result
    if (!res.data?.success || !params) {
      uni.showToast({ title: '地址加载失败，请重试', icon: 'none' })
      return
    }
    Object.assign(form, params, { ___path: params.consigneeAddressPath || '' })
  } catch {
    uni.showToast({ title: '地址加载失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
})

onReady(() => {
  uForm.value?.setRules(rules)
})

function closeMap() {
  mapFlag.value = false
}

function refuseMap() {
  uni.showModal({
    title: '温馨提示',
    content: '您已拒绝定位,请开启',
    confirmText: '去设置',
    success(res) {
      if (res.confirm) {
        // #ifndef MP-WEIXIN
        uni.getSystemInfo({
          success(sysRes) {
            if (sysRes.platform == 'ios') {
              plus.runtime.openURL('app-settings://')
            } else if (sysRes.platform == 'android') {
              const main = plus.android.runtimeMainActivity()
              const Intent = plus.android.importClass('android.content.Intent')
              const mIntent = new Intent('android.settings.ACTION_SETTINGS')
              main.startActivity(mIntent)
            }
          },
        })
        // #endif
      }
    },
  })
}

async function requestAndroidPermission(permisionID: string) {
  const result = await permision.requestAndroidPermission(permisionID)
  if (result == 1) {
    mapFlag.value = true
  } else {
    refuseMap()
  }
}

function callBackAddress(val: any) {
  uni.showLoading({ title: '加载中' })
  if (val.regeocode && val) {
    const address = val.regeocode
    form.detail = address.formatted_address
    form.___path = val.data.result.name
    form.consigneeAddressIdPath = val.data.result.id
    form.consigneeAddressPath = val.data.result.name
    form.lat = val.latitude
    form.lon = val.longitude
    uni.hideLoading()
  }
  mapFlag.value = !mapFlag.value
}

function save() {
  if (importing.value) return
  uForm.value?.validate().then(() => {
    const params = { ...form }
    delete params.___path

    if (Array.isArray(params.consigneeAddressIdPath)) {
      params.consigneeAddressIdPath = params.consigneeAddressIdPath.join(',')
    }
    if (Array.isArray(params.consigneeAddressPath)) {
      params.consigneeAddressPath = params.consigneeAddressPath.join(',')
    }

    if (!params.id) {
      addAddressApi(params).then((res) => {
        if (res.data.success) {
          uni.navigateBack()
        } else {
          uni.showToast({ title: res.data.message || '保存失败', icon: 'none' })
        }
      })
    } else {
      delete params.updateBy
      delete params.updateTime
      editAddress(params).then((res) => {
        if (res.data.success) {
          uni.navigateBack()
        } else {
          uni.showToast({ title: res.data.message || '保存失败', icon: 'none' })
        }
      })
    }
  }).catch(() => {})
}

function getpickerParentValue(e: any[]) {
  form.consigneeAddressIdPath = []
  form.consigneeAddressPath = []
  let name = ''
  e.forEach((item, index) => {
    if (item.id) {
      form.consigneeAddressIdPath.push(item.id)
      form.consigneeAddressPath.push(item.localName)
      name += item.localName
      form.___path = name
    }
    if (index == e.length - 1) {
      const center = String(item.center || item.children?.find((_child: any) => _child.id == item.id)?.center || '').split(',')
      form.lat = center.length === 2 ? center[1] : ''
      form.lon = center.length === 2 ? center[0] : ''
    }
  })
  importNotice.value = ''
}

function showPicker() {
  cityPicker.value?.show()
}
</script>
<style scoped lang="scss">
@import "./address-page.scss";
.wechat-import { margin-bottom: 28rpx; }
.wechat-import-button {
  display: flex; align-items: center; padding: 28rpx; margin: 0; width: 100%; text-align: left;
  background: #eef9f2; border-radius: 24rpx; line-height: 1.5;
  &::after { border: 1rpx solid #dcefe3; border-radius: 24rpx; }
  &[disabled] { background: #eef9f2; opacity: .65; }
}
.wechat-icon { width: 76rpx; height: 76rpx; border-radius: 20rpx; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 22rpx; }
.wechat-copy { flex: 1; min-width: 0; }
.wechat-title { display: block; color: #253e30; font-size: 30rpx; font-weight: 600; }
.import-notice { margin-bottom: 24rpx; padding: 20rpx 24rpx; border-radius: 16rpx; background: #fff5e5; color: #a47a3b; font-size: 24rpx; line-height: 1.6; }
.section-heading { padding: 0 8rpx 20rpx; font-size: 26rpx; color: #858b96; }
.form-card { padding: 0 28rpx; }
.form-value { width: 100%; line-height: 1.6; font-size: 28rpx; color: #303744; overflow-wrap: anywhere; }
.is-placeholder { color: #b1b5bd; }
.address-textarea { width: 100%; min-height: 88rpx; font-size: 28rpx; color: #303744; line-height: 1.6; padding: 0; }
.default-row { display: flex; justify-content: space-between; align-items: center; margin-top: 24rpx; padding: 28rpx; }
.default-title { display: block; font-size: 28rpx; color: #353b47; }
.default-hint { display: block; font-size: 23rpx; color: #a0a5af; margin-top: 8rpx; }
.default-row switch { transform: scale(.8); transform-origin: right center; }
</style>
