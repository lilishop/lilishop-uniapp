<template>
  <div class="wrapper" :style="themeStyle">
    <up-form label-position="top" :model="form" :rules="rules" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <up-form-item
          required
          :border-bottom="false"
          prop="storeName"
          label="店铺名称"
          ><u-input border="none" class="field-input" v-model="form.storeName" :custom-style="fieldInputStyle"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="storeLogo"
          label="店铺logo"
        >
          <div>
            <u-upload
              :file-list="storeLogoFileList"
              :auto-upload="false"
              width="200"
              @afterRead="onUploadAfterRead($event, 'storeLogo', 'storeLogoFileList')"
              :max-count="1"
            ></u-upload>
          </div>
        </up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="goodsManagementCategory"
          label="店铺经营类目"
        >
          <view class="field-row">
            <u-input
              border="none"
              class="field-input"
              :custom-style="fieldInputStyle"
              v-model="goodsManagementCategory"
              disabled
              @click="showCategory()"
            />
            <view class="picker-action" @click="showCategory()">选择</view>
          </view>
        </up-form-item>

        <up-form-item
          required
          :border-bottom="false"
          prop="storeAddressPath"
          label="店铺所在地"
        >
          <view class="field-row">
            <u-input
              border="none"
              class="field-input"
              :custom-style="fieldInputStyle"
              v-model="form.storeAddressPath"
              disabled
            />
            <view class="picker-action" @click="showPicker()">选择</view>
          </view>
        </up-form-item>
       
        <!-- <up-form-item
          required
          :border-bottom="false"
          prop="storeAddressPath"
          label="店铺定位"
        >
          <div class="get-center" @click="clickUniMap()">开始定位</div>
          <div class="tips-success" v-if="form.storeCenter">已成功定位</div>
        </up-form-item> -->

        <up-form-item
          required
          :border-bottom="false"
          prop="storeAddressDetail"
          label="店铺详细地址"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.storeAddressDetail"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="storeDesc"
          label="店铺简介"
        >
          <u-textarea
            class="field-textarea"
            border="none"
            height="240"
            maxlength="500"
            v-model="form.storeDesc"
            placeholder="请输入店铺简介"
          />
        </up-form-item>
      </div>
    </up-form>
    <view class="submit" @click="validatorStep3Form">提交平台审核</view>
    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    >
    </m-city>

    <u-picker
      v-model:show="enableCategory"
      :columns="[categoryList]"
      keyName="label"
      valueName="value"
      title="店铺经营类目"
      @confirm="confirmCategory"
    ></u-picker>

    <uniMap v-if="mapFlag" @close="closeMap" @callback="callBackAddress" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from '@/store'
import { applyThird } from '@/api/entry'
import { getCategoryList } from '@/api/goods'
import MCity from '@/components/m-city/m-city.vue'
import uniMap from '@/components/uniMap'
import permision from '@/js_sdk/wa-permission/permission.js'
import { handleUploadAfterRead } from '@/utils/uploadHelper.js'
import { getThemeStyle } from '@/utils/theme'
import { fieldInputStyle } from '@/utils/form-style.js'

const props = defineProps<{ companyData?: any }>()
const emit = defineEmits<{ callback: [] }>()

const store = useStore()

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const uForm = ref<any>(null)
const cityPicker = ref<any>(null)

const mapFlag = ref(false)
const enableCategory = ref(false)
const goodsManagementCategory = ref('')
const storeLogoFileList = ref<any[]>([])
const categoryList = ref<any[]>([])

const form = reactive<Record<string, any>>({
  storeName: '',
  storeLogo: '',
  goodsManagementCategory: '',
  storeAddressPath: '',
  storeAddressDetail: '',
  storeDesc: '',
})

const list = ref([
  {
    id: '',
    localName: '请选择',
    children: [],
  },
])

const rules = {
  goodsManagementCategory: [
    { required: true, message: '请选择店铺经营类目' },
  ],
  storeName: [{ required: true, message: '请填写店铺名称' }],
  storeLogo: [{ required: true, message: '请上传店铺logo' }],
  storeDesc: [{ required: true, message: '请填写店铺简介' }],
  storeCenter: [{ required: true, message: '请选择店铺位置' }],
  storeAddressIdPath: [{ required: true, message: '请选择店铺位置' }],
  storeAddressDetail: [{ required: true, message: '请输入店铺详细地址' }],
}

watch(
  () => props.companyData,
  (val) => {
    if (val) {
      Object.assign(form, val)
      const judgeDeepPhoto = ['storeLogo']

      judgeDeepPhoto.forEach((key) => {
        if (form[key]) {
          storeLogoFileList.value = []
          form[key].split(',').forEach((item: string) => {
            storeLogoFileList.value.push({ url: item })
          })
        }
      })
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  uForm.value?.setRules(rules)
  fetchCategoryList()
})

function callBackAddress(val: any) {
  form.storeAddressDetail = val.address
  form.storeCenter = `${val.longitude},${val.latitude}`
}

function closeMap() {
  mapFlag.value = false
}

function clickUniMap() {
  // #ifdef APP-PLUS
  if (plus.os.name == 'iOS') {
    permision.judgeIosPermission('location')
      ? (mapFlag.value = true)
      : refuseMap()
  } else {
    requestAndroidPermission('android.permission.ACCESS_FINE_LOCATION')
  }
  // #endif

  // #ifndef APP-PLUS
  mapFlag.value = true
  // #endif
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

function confirmCategory(val: any) {
  const selected = val?.value?.[0] || val?.[0]
  if (!selected) {
    return
  }
  form.goodsManagementCategory = selected.value
  goodsManagementCategory.value = selected.label
}

async function fetchCategoryList() {
  const res = await getCategoryList(0)
  if (res.data.success) {
    if (res.data.result.length) {
      categoryList.value = res.data.result.map((item: any) => {
        return { label: item.name, value: item.id }
      })

      if (form.goodsManagementCategory) {
        goodsManagementCategory.value = categoryList.value.find(
          (item) => form.goodsManagementCategory == item.value
        )?.label || ''
      }
    }
  }
}

function onUploadAfterRead(
  event: any,
  key: string,
  fileListKey: 'storeLogoFileList'
) {
  handleUploadAfterRead(event, storeLogoFileList.value, (urls) => {
    form[key] = urls
  })
}

function getPickerParentValue(e: any[]) {
  form.storeAddressIdPath = []
  let name = ''
  e.forEach((item, index) => {
    if (item.id) {
      form.storeAddressIdPath.push(item.id)
      if (index == e.length - 1) {
        name += item.localName
      } else {
        name += item.localName + ','
      }
      form.storeAddressPath = name
    }
  })

  form.storeCenter = e[e.length - 1].center
}

function showPicker() {
  cityPicker.value?.show()
}

function showCategory() {
  enableCategory.value = true
}

async function validatorStep3Form() {
  try {
    await uForm.value?.validate()
  } catch {
    return
  }
  const params = { ...form }
  params.storeLogo = params.storeLogo.toString()
  params.storeAddressIdPath = params.storeAddressIdPath.toString()
  const res = await applyThird(params)
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

.get-center {
  padding: 12rpx 30rpx;
  background: var(--theme-light, #ff6b35);
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
  display: inline-block;
}

.submit {
  @include seller-entry-submit;
}

.tips-success {
  color: $weChat-color;
  font-size: 24rpx;
}
</style>
