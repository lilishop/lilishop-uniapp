<template>
  <view class="add-address">
    <up-form
      :model="form"
      ref="uForm"
      error-type="toast"
      :rules="rules"
      label-position="left"
      label-width="180rpx"
    >
      <up-form-item label="收货人" label-width="180rpx" prop="name" :border-bottom="true">
        <u-input
          v-model="form.name"
          border="none"
          input-align="right"
          clearable
          placeholder="请输入收货人姓名"
        />
      </up-form-item>

      <up-form-item label="手机号码" label-width="180rpx" prop="mobile" :border-bottom="true">
        <u-input
          v-model="form.mobile"
          type="number"
          maxlength="11"
          border="none"
          input-align="right"
          placeholder="请输入收货人手机号码"
        />
      </up-form-item>

      <up-form-item label="所在区域" label-width="180rpx" prop="___path" :border-bottom="true">
        <view class="form-value" @click="showPicker">
          {{ form.___path || '请选择所在地区' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </up-form-item>

      <up-form-item class="detailAddress" label="详细地址" label-width="180rpx" prop="detail" :border-bottom="true">
        <u-input
          type="textarea"
          v-model="form.detail"
          maxlength="100"
          height="150"
          border="none"
          placeholder="街道楼牌号等"
        />
      </up-form-item>

      <up-form-item label="地址别名" label-width="180rpx" :border-bottom="false">
        <u-input
          v-model="form.alias"
          border="none"
          input-align="right"
          placeholder="请输入地址别名"
        />
      </up-form-item>

      <view class="default-row">
        <u-checkbox
          usedAlone
          shape="circle"
          size="30"
          :active-color="lightColor"
          v-model:checked="form.isDefault"
          label="设为默认地址"
        ></u-checkbox>
      </view>

      <view class="saveBtn" @click="save">保存</view>
    </up-form>

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

const store = useStore()
const { proxy } = getCurrentInstance()!

const lightColor = computed(() => store.getters.lightColor)
const mapFlag = ref(false)
const routerVal = ref<Record<string, string>>({})
const uForm = ref<any>(null)
const cityPicker = ref<any>(null)

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

onLoad((option) => {
  uni.showLoading({ title: '加载中' })
  routerVal.value = option || {}
  if (option.id) {
    getAddressDetail(option.id).then((res) => {
      const params = res.data.result
      params.___path = params.consigneeAddressPath
      Object.assign(form, params)
      if (store.state.isShowToast) uni.hideLoading()
    })
  }
  uni.hideLoading()
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
      const _town = item.children.filter((_child: any) => _child.id == item.id)
      form.lat = _town[0].center.split(',')[1]
      form.lon = _town[0].center.split(',')[0]
    }
  })
}

function showPicker() {
  cityPicker.value?.show()
}
</script>
<style scoped lang="scss">
page {
  background: #f5f5f5;
}

.add-address {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 40rpx;
}

:deep(.u-form-item) {
  padding: 0 30rpx;
  min-height: 100rpx;
}

:deep(.u-form-item__body) {
  min-height: 100rpx;
  align-items: center;
}

:deep(.u-form-item__body__left__content__label) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-form-item__body__right__content__slot) {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.u-input) {
  padding: 0 !important;
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 28rpx !important;
  color: #666 !important;
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;
}

.detailAddress {
  :deep(.u-form-item__body) {
    align-items: flex-start;
    padding-top: 24rpx;
    padding-bottom: 24rpx;
    min-height: auto;
  }

  :deep(.u-form-item__body__left) {
    padding-top: 8rpx;
  }

  :deep(.u-form-item__body__right__content__slot) {
    justify-content: flex-start;
    align-items: flex-start;
  }
}

.default-row {
  padding: 24rpx 30rpx;
}

:deep(.default-row .u-checkbox__label) {
  font-size: 28rpx;
  color: $font-color-light;
}

.saveBtn {
  margin: 40rpx 30rpx 0;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  background: $light-color;
  color: #fff;
  border-radius: 40rpx;
}
</style>