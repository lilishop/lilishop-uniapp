<template>
  <view class="person-msg">
    <view class="head" @click="changeFace">
      <image :src="form.face || '/static/missing-face.png'" mode="aspectFill"></image>
      <view>点击修改头像</view>
    </view>

    <up-form
      :model="form"
      ref="uForm"
      class="form"
      label-position="left"
      label-width="180rpx"
    >
      <up-form-item label="昵称" label-width="180rpx" :border-bottom="true">
        <u-input
          v-model="form.nickName"
          border="none"
          input-align="right"
          placeholder="请输入昵称"
        />
      </up-form-item>

      <up-form-item label="性别" label-width="180rpx" :border-bottom="true">
        <view class="sex-row">
          <u-radio-group v-model="form.sex" :active-color="lightColor" :gap="40">
            <u-radio name="1" label="男" shape="circle"></u-radio>
            <u-radio name="0" label="女" shape="circle"></u-radio>
          </u-radio-group>
        </view>
      </up-form-item>

      <up-form-item label="生日" label-width="180rpx" :border-bottom="true">
        <view class="form-value" @click="showBirthday = true">
          {{ birthday || '请选择出生日期' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </up-form-item>

      <up-form-item label="城市" label-width="180rpx" :border-bottom="true">
        <view class="form-value" @click="clickRegion">
          {{ form.regionPath || '请选择城市' }}
        </view>
        <template #right>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </template>
      </up-form-item>

      <up-form-item label="手机号" label-width="180rpx" :border-bottom="false">
        <view v-if="form.mobile" class="form-value">{{ form.mobile }}</view>
        <view v-else class="bind-mobile" @click="navigateToBindMobile(form.username)">绑定手机号码</view>
      </up-form-item>
    </up-form>

    <view class="bottom">
      <view class="submit" @click="submit">保存</view>
      <view class="submit light" @click="quiteLoginOut">退出登录</view>
    </view>

    <u-datetime-picker
      v-model:show="showBirthday"
      v-model="birthdayValue"
      mode="date"
      :min-date="minBirthdayDate"
      :max-date="maxBirthdayDate"
      :confirm-color="lightColor"
      @confirm="selectTime"
      @cancel="closeBirthdayPicker"
    ></u-datetime-picker>

    <m-city
      :provinceData="region"
      headTitle="区域选择"
      ref="cityPicker"
      @funcValue="getPickerParentValue"
      pickerSize="4"
    ></m-city>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { quiteLoginOut } from '@/utils/filters.js'
import { saveUserInfo } from '@/api/members.js'
import { upload } from '@/api/common.js'
import storage from '@/utils/storage.js'
import MCity from '@/components/m-city/m-city.vue'

function parseBirthdayTimestamp(str?: string) {
	if (!str) return Date.now()
	const timestamp = Date.parse(String(str).replace(/-/g, '/'))
	return Number.isFinite(timestamp) ? timestamp : Date.now()
}

function formatBirthday(timestamp: number) {
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)

const userInfo = storage.getUserInfo() || {}
const form = reactive<Record<string, any>>({
	nickName: userInfo.nickName || '',
	birthday: userInfo.birthday || '',
	face: userInfo.face || '/static/missing-face.png',
	regionId: [],
	region: userInfo.region || [],
	sex: userInfo.sex != null ? String(userInfo.sex) : '1',
	regionPath: userInfo.region,
	mobile: userInfo.mobile,
	username: userInfo.username,
})
const birthday = ref(userInfo.birthday || '')
const birthdayValue = ref(parseBirthdayTimestamp(userInfo.birthday))
const minBirthdayDate = new Date('1950-01-01').getTime()
const maxBirthdayDate = Date.now()
const region = ref([{ id: '', localName: '请选择', children: [] }])
const showBirthday = ref(false)
const cityPicker = ref<any>(null)

function getPickerParentValue(selected: any[]) {
	form.region = []
	form.regionId = []
	let name = ''
	selected.forEach((item, index) => {
		if (item.id) {
			form.region.push(item.localName)
			form.regionId.push(item.id)
			name += index === selected.length - 1 ? item.localName : `${item.localName},`
			form.regionPath = name
		}
	})
}

function clickRegion() {
	cityPicker.value?.show()
}

function submit() {
	const params = JSON.parse(JSON.stringify(form))
	delete params.regionPath
	saveUserInfo(params).then((res) => {
		if (res.statusCode === 200) {
			storage.setUserInfo(res.data.result)
			uni.navigateBack()
		}
	})
}

function changeFace() {
	uni.chooseImage({
		success: (chooseImageRes) => {
			uni.uploadFile({
				url: upload,
				filePath: chooseImageRes.tempFilePaths[0],
				name: 'file',
				header: { accessToken: storage.getAccessToken() },
				success: (uploadFileRes) => {
					const data = JSON.parse(uploadFileRes.data)
					form.face = data.result
				},
			})
		},
	})
}

function selectTime(e: any) {
	const timestamp = typeof e?.value === 'number' ? e.value : birthdayValue.value
	const formatted = formatBirthday(timestamp)
	birthdayValue.value = timestamp
	form.birthday = formatted
	birthday.value = formatted
	showBirthday.value = false
}

function closeBirthdayPicker() {
	showBirthday.value = false
}

function navigateToBindMobile(username: string) {
	uni.navigateTo({
		url: `/pages/mine/set/securityCenter/bindMobile?username=${username}`,
	})
}

function syncUserInfo() {
	const latest = storage.getUserInfo() || {}
	form.nickName = latest.nickName || ''
	form.birthday = latest.birthday || ''
	form.face = latest.face || '/static/missing-face.png'
	form.region = latest.region || []
	form.sex = latest.sex != null ? String(latest.sex) : '1'
	form.regionPath = latest.region
	form.mobile = latest.mobile
	form.username = latest.username
	birthday.value = latest.birthday || ''
	birthdayValue.value = parseBirthdayTimestamp(latest.birthday)
}

onShow(() => {
	syncUserInfo()
})
</script>

<style lang="scss" scoped>
page {
  background: #fff;
}

.person-msg {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 180rpx;
}

.head {
  padding: 40rpx 0 20rpx;
  color: $font-color-light;
  font-size: $font-sm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 2em;

  image {
    width: 144rpx;
    height: 144rpx;
    border-radius: 50%;
  }
}

.form {
  background: #fff;
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

.sex-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.sex-row .u-radio-group) {
  flex: 1;
  justify-content: flex-end;
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;
}

.bind-mobile {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: $main-color;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
}

.submit {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 100px;
  font-size: 30rpx;
  background: $light-color;
  color: #fff;
}

.submit + .submit {
  margin-left: 24rpx;
}

.light {
  background: rgba($color: $light-color, $alpha: 0.2) !important;
  color: $light-color !important;
}
</style>
