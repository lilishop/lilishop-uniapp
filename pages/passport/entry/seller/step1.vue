<template>
  <div class="wrapper" :style="themeStyle">
    <up-form label-position="top" :model="form" :rules="rules" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <up-form-item
          required
          :border-bottom="false"
          prop="companyName"
          label="公司名称"
          ><u-input border="none" class="field-input"
            v-model="form.companyName"
            :custom-style="fieldInputStyle"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="companyAddressPath"
          label="公司所在地"
          >
          <view class="field-row">
            <u-input
              disabled
              border="none"
              class="field-input"
              :custom-style="fieldInputStyle"
              v-model="form.companyAddressPath"
            />
            <view class="picker-action" @click="showPicker()">选择</view>
          </view>
        </up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="companyAddress"
          label="公司详细地址"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.companyAddress"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="employeeNum"
          label="员工人数"
          ><u-input border="none" class="field-input"
            type="number"
            :custom-style="fieldInputStyle"
            v-model="form.employeeNum"
        /></up-form-item>

        <up-form-item
          required
          :border-bottom="false"
          prop="companyPhone"
          label="公司电话"
          ><u-input border="none" class="field-input"
            type="number"
            :custom-style="fieldInputStyle"
            v-model="form.companyPhone"
        /></up-form-item>
        <up-form-item
          :border-bottom="false"
          prop="registeredCapital"
          label="注册资金"
          required
          ><u-input border="none" class="field-input"
            type="number"
            :custom-style="fieldInputStyle"
            v-model="form.registeredCapital"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="linkName"
          label="联系人姓名"
          ><u-input border="none" class="field-input" :custom-style="fieldInputStyle" v-model="form.linkName"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="linkPhone"
          label="联系人电话"
          ><u-input border="none" class="field-input"
            type="number"
            :custom-style="fieldInputStyle"
            v-model="form.linkPhone"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="companyEmail"
          label="电子邮箱"
          ><u-input border="none" class="field-input"
            :custom-style="fieldInputStyle"
            v-model="form.companyEmail"
        /></up-form-item>
      </div>
      <div class="column">
        <div class="flag-title light-color">营业执照信息</div>
        <up-form-item
          required
          :border-bottom="false"
          prop="licenseNum"
          label="营业执照号"
          ><u-input border="none" class="field-input" :custom-style="fieldInputStyle" v-model="form.licenseNum"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="scope"
          label="法定经营范围"
          ><u-input border="none" class="field-input" :custom-style="fieldInputStyle" v-model="form.scope"
        /></up-form-item>
        <up-form-item
          :border-bottom="false"
          prop="licencePhoto"
          label="营业执照电子版"
          required
        >
          <div>
            <u-upload
              :file-list="licencePhotoFileList"
              :auto-upload="false"
              width="200"
              @afterRead="onUploadAfterRead($event, 'licencePhoto', 'licencePhotoFileList')"
              @delete="onUploadDelete($event, 'licencePhoto', 'licencePhotoFileList')"
              :max-count="1"
            ></u-upload>

            <div class="tips">
              请压缩图片在2M以内，确保文字清晰以免上传或审核失败
            </div>
          </div>
        </up-form-item>
      </div>
      <div class="column">
        <div class="flag-title light-color">法人信息</div>
        <up-form-item
          required
          :border-bottom="false"
          prop="legalName"
          label="法人姓名"
          ><u-input border="none" class="field-input" :custom-style="fieldInputStyle" v-model="form.legalName"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="legalId"
          label="法人证件号"
          ><u-input border="none" class="field-input" :custom-style="fieldInputStyle" v-model="form.legalId"
        /></up-form-item>
        <up-form-item
          required
          :border-bottom="false"
          prop="legalPhoto"
          label="法人证件电子版"
        >
          <div>
            <u-upload
              :file-list="legalPhotoFileList"
              :auto-upload="false"
              width="200"
              @afterRead="onUploadAfterRead($event, 'legalPhoto', 'legalPhotoFileList')"
              @delete="onUploadDelete($event, 'legalPhoto', 'legalPhotoFileList')"
              :max-count="1"
            ></u-upload>
            <u-upload
              :file-list="legalPhotoBackFileList"
              :auto-upload="false"
              width="200"
              @afterRead="onUploadAfterRead($event, 'legalPhoto', 'legalPhotoBackFileList')"
              @delete="onUploadDelete($event, 'legalPhoto', 'legalPhotoBackFileList')"
              :max-count="1"
            ></u-upload>
          </div>
        </up-form-item>
      </div>
    </up-form>
    <view class="submit" @click="validatorStep1Form">提交/下一步</view>
    <m-city
      :provinceData="list"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    >
    </m-city>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, getCurrentInstance, onMounted } from 'vue'
import { useStore } from '@/store'
import { applyFirst } from '@/api/entry'
import MCity from '@/components/m-city/m-city.vue'
import { handleUploadAfterRead, getUploadedUrls } from '@/utils/uploadHelper.js'
import * as RegExp from '@/utils/RegExp.js'
import { getThemeStyle } from '@/utils/theme'
import { fieldInputStyle } from '@/utils/form-style.js'

const props = defineProps<{ companyData?: any }>()
const emit = defineEmits<{ callback: [] }>()

const store = useStore()
const { proxy } = getCurrentInstance()!

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const uForm = ref<any>(null)
const cityPicker = ref<any>(null)

const legalPhotoFileList = ref<any[]>([])
const legalPhotoBackFileList = ref<any[]>([])
const licencePhotoFileList = ref<any[]>([])

const form = reactive<Record<string, any>>({
  companyName: '',
  companyAddressIdPath: [],
  companyAddressPath: '',
  companyAddress: '',
  employeeNum: '',
  registeredCapital: '',
  linkName: '',
  linkPhone: '',
  companyPhone: '',
  companyEmail: '',
  licenseNum: '',
  scope: '',
  legalPhoto: '',
  licencePhoto: '',
  legalName: '',
  legalId: '',
})

const list = ref([
  {
    id: '',
    localName: '请选择',
    children: [],
  },
])

const rules = {
  companyName: [{ required: true, message: '请填写公司信息' }],
  companyAddressPath: [{ required: true, message: '请选择公司所在地' }],
  companyAddress: [{ required: true, message: '请填写公司详细地址' }],
  employeeNum: [{ required: true, message: '请填写公司员工总数' }],
  registeredCapital: [{ required: true, message: '请填写公司注册资金' }],
  linkName: [{ required: true, message: '请填写联系人姓名' }],
  linkPhone: [
    { required: true, message: '请填写联系人电话' },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.mobile(value),
      message: '手机号码不正确',
      trigger: ['change', 'blur'],
    },
  ],
  companyPhone: [
    { required: true, message: '请填写公司电话' },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.mobile(value),
      message: '请填写正确的号码',
      trigger: ['change', 'blur'],
    },
  ],
  companyEmail: [
    { required: true, message: '请填写电子邮箱' },
    {
      validator: (_rule: unknown, value: string) => proxy.$u.test.email(value),
      message: '请填写正确的电子邮箱',
      trigger: ['change', 'blur'],
    },
  ],
  licenseNum: [
    { required: true, message: '请填写营业执照号' },
    { pattern: RegExp.licenseNum, message: '请输入正确的营业执照号' },
  ],
  scope: [{ required: true, message: '请填写营业执照所示经营范围' }],
  legalPhoto: [
    { required: true, message: '请上传法人身份证照片' },
    {
      validator: (_rule: unknown, value: string | string[]) => {
        const urls = normalizePhotoUrls(value)
        return urls.length === 2
      },
      message: '请上传法人身份证正反照片',
      trigger: ['change', 'blur'],
    },
  ],
  licencePhoto: [{ required: true, message: '请上传营业执照' }],
  legalName: [{ required: true, message: '请输入法人姓名' }],
  legalId: [
    { required: true, message: '请输入法人证件号' },
    { pattern: RegExp.IDCard, message: '请输入正确的证件号' },
  ],
}

watch(
  () => props.companyData,
  (val) => {
    if (val) {
      Object.assign(form, val)
      restorePhotoFields(val)
    }
  },
  { deep: true }
)

function normalizePhotoUrls(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  if (typeof value === 'string' && value) {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function createUploadedFileItem(url: string) {
  return {
    url,
    status: 'success',
  }
}

function restorePhotoFields(data: Record<string, any>) {
  licencePhotoFileList.value = []
  legalPhotoFileList.value = []
  legalPhotoBackFileList.value = []

  const licenceUrls = normalizePhotoUrls(data.licencePhoto)
  if (licenceUrls.length) {
    licencePhotoFileList.value = licenceUrls.map(createUploadedFileItem)
    form.licencePhoto = licenceUrls
  }

  const legalUrls = normalizePhotoUrls(data.legalPhoto)
  if (legalUrls.length) {
    legalPhotoFileList.value = legalUrls[0]
      ? [createUploadedFileItem(legalUrls[0])]
      : []
    legalPhotoBackFileList.value = legalUrls[1]
      ? [createUploadedFileItem(legalUrls[1])]
      : []
    form.legalPhoto = legalUrls
  }
}

onMounted(() => {
  uForm.value?.setRules(rules)
})

function onUploadAfterRead(
  event: any,
  key: string,
  fileListKey: 'licencePhotoFileList' | 'legalPhotoFileList' | 'legalPhotoBackFileList'
) {
  const fileListMap = {
    licencePhotoFileList,
    legalPhotoFileList,
    legalPhotoBackFileList,
  }

  if (!Array.isArray(form[key])) {
    form[key] = []
  }

  handleUploadAfterRead(event, fileListMap[fileListKey].value, () => {
    syncUploadFormValue(key)
  })
}

function onUploadDelete(
  event: { index: number },
  key: string,
  fileListKey: 'licencePhotoFileList' | 'legalPhotoFileList' | 'legalPhotoBackFileList'
) {
  const fileListMap = {
    licencePhotoFileList,
    legalPhotoFileList,
    legalPhotoBackFileList,
  }
  const list = fileListMap[fileListKey].value
  if (event.index >= 0 && event.index < list.length) {
    list.splice(event.index, 1)
  }
  syncUploadFormValue(key)
}

function syncUploadFormValue(key: string) {
  if (key === 'legalPhoto') {
    form[key] = [
      ...getUploadedUrls(legalPhotoFileList.value),
      ...getUploadedUrls(legalPhotoBackFileList.value),
    ]
    return
  }
  if (key === 'licencePhoto') {
    form[key] = getUploadedUrls(licencePhotoFileList.value)
  }
}

function getPickerParentValue(e: any[]) {
  form.companyAddressIdPath = []

  let name = ''
  e.forEach((item, index) => {
    if (item.id) {
      form.companyAddressIdPath.push(item.id)
      if (index == e.length - 1) {
        name += item.localName
      } else {
        name += item.localName + ','
      }
      form.companyAddressPath = name
    }
  })
}

function showPicker() {
  cityPicker.value?.show()
}

async function validatorStep1Form() {
  try {
    await uForm.value?.validate()
  } catch {
    return
  }

  const params = { ...form }

  params.legalPhoto = params.legalPhoto.toString()
  params.licencePhoto = params.licencePhoto.toString()
  params.companyAddressIdPath = params.companyAddressIdPath.toString()
  delete params.complexAddress

  const res = await applyFirst(params)
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

  :deep(.u-upload__deletable) {
    width: 24rpx;
    height: 24rpx;
    border-bottom-left-radius: 24rpx;
  }

  :deep(.u-upload__deletable__icon) {
    transform: scale(1);
  }

  :deep(.u-upload__deletable .u-icon__icon) {
    font-size: 16rpx !important;
    line-height: 16rpx !important;
  }
}

.submit {
  @include seller-entry-submit;
}
</style>
