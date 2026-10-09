<template>
  <view :style="themeStyle" class="person-msg">
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
import { saveUserInfo } from '@/api/members.js'
import { upload } from '@/api/common.js'
import storage from '@/utils/storage.js'
import MCity from '@/components/m-city/m-city.vue'
import { getThemeStyle } from '@/utils/theme'

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
const themeStyle = computed(() => getThemeStyle(store.state.theme))
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

<style lang="scss">
page {
  background: #f5f5f5;
}
</style>
<style lang="scss" scoped>
.person-msg {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.head {
  margin-bottom: 20rpx;
  padding: 48rpx 0 32rpx;
  background: #fff;
  color: #999;
  font-size: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  image {
    width: 144rpx;
    height: 144rpx;
    border-radius: 50%;
    background: #f3f4f6;
  }

  view {
    margin-top: 16rpx;
    line-height: 1.4;
  }
}

.form {
  background: #fff;
}

:deep(.u-form-item) {
  padding: 0 32rpx;
}

:deep(.u-form-item__body) {
  min-height: 108rpx;
  align-items: center;
  padding: 16rpx 0 !important;
}

:deep(.u-form-item__body__left__content__label) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-form-item__body__right) {
  min-width: 0;
}

:deep(.u-form-item__body__right__content__slot) {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.u-input) {
  padding: 0 !important;
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 28rpx !important;
  color: #333 !important;
  text-align: right;
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
  min-width: 0;
  text-align: right;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.bind-mobile {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: $light-color;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.submit {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 30rpx;
  background: $light-color;
  color: #fff;
}
</style>
