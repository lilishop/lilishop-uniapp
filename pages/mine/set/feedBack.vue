<template>
  <view class="feedBack" :style="themeStyle">
    <view class="feedBack-box">
      <view class="box-title">猜你想问</view>
      <view
        class="feedBack-item"
        :class="{ active: feedbackForm.type == item.value }"
        @click="selectFeedbackType(index)"
        v-for="(item, index) in feedbackTypeList"
        :key="index"
      >
        {{ item.text }}
      </view>
    </view>

    <view class="feedBack-box">
      <view class="box-title">问题反馈
        <text class="box-tag" v-if="feedbackForm.type">@{{ feedbackTypeList.find(item => item.value == feedbackForm.type)?.text }}</text>
      </view>
      <u-textarea
        class="field-textarea"
        v-model="feedbackForm.context"
        placeholder="请输入反馈信息"
        border="none"
        height="240"
        maxlength="500"
      ></u-textarea>
    </view>

    <!-- 上传凭证 -->
    <view class="feedBack-box">
      <view class="box-title">上传凭证（最多2张）</view>
      <view class="images-view">
        <u-upload :file-list="uploadFileList" :auto-upload="false" width="150" @afterRead="onUploadAfterRead" :max-count="2"></u-upload>
      </view>
    </view>

    <view class="feedBack-box">
      <view class="box-title">手机号</view>
      <u-input
        class="field-input"
        v-model="feedbackForm.mobile"
        type="number"
        maxlength="11"
        border="none"
        placeholder="请输入您的手机号"
        :custom-style="inputStyle"
      ></u-input>
    </view>

    <view class="submit" @click="submitFeedback">提交</view>
  </view>

</template>

<script setup lang="ts">
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { feedBack as submitFeedBackApi } from '@/api/members.js'
import { handleUploadAfterRead } from '@/utils/uploadHelper.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'

const { proxy } = getCurrentInstance()!
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const feedbackForm = reactive({
	type: 'FUNCTION',
	context: '',
	mobile: '',
	images: '',
})
const inputStyle = {
	background: '#fafafa',
	borderRadius: '12rpx',
	padding: '0 24rpx',
	height: '80rpx',
}
const uploadFileList = ref<any[]>([])
const feedbackTypeList = [
	{ text: '功能相关', value: 'FUNCTION' },
	{ text: '优化反馈', value: 'OPTIMIZE' },
	{ text: '其他', value: 'OTHER' },
]

function selectFeedbackType(index: number) {
	feedbackForm.type = feedbackTypeList[index].value
}

function onUploadAfterRead(event: any) {
	handleUploadAfterRead(event, uploadFileList.value, (urls) => {
		feedbackForm.images = urls.join(',')
	})
}

function submitFeedback() {
	if (!feedbackForm.type) {
		uni.showToast({ title: '请填写反馈类型', duration: 2000, icon: 'none' })
		return
	}
	if (!feedbackForm.context) {
		uni.showToast({ title: '请填写反馈信息', duration: 2000, icon: 'none' })
		return
	}
	if (feedbackForm.mobile && !proxy.$u.test.mobile(feedbackForm.mobile)) {
		uni.showToast({ title: '请填写您的正确手机号', duration: 2000, icon: 'none' })
		return
	}
	submitFeedBackApi(feedbackForm).then((res) => {
		if (res.data.success) {
			uni.showToast({ title: '提交成功!', duration: 2000, icon: 'none' })
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 500)
		}
	})
}
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.submit {
  text-align: center;
  background: $light-color;
  height: 88rpx;
  line-height: 88rpx;
  color: #fff;
  width: 92%;
  margin: 40rpx auto 60rpx;
  border-radius: 100px;
  font-size: 30rpx;
}

.active {
  color: $light-color !important;
  font-weight: bold;
}

.feedBack {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 24rpx 40rpx;
  min-height: 100vh;
  background: #f8f8f8;
}

.feedBack-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.box-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.box-tag {
  margin-left: 10rpx;
  font-size: 26rpx;
  font-weight: normal;
  color: $light-color;
}

.feedBack-item {
  margin: 20rpx 0;
  font-size: 28rpx;
  color: #666;
}

.field-textarea {
  margin-top: 20rpx;

  :deep(.u-textarea) {
    background: #fafafa !important;
    border-radius: 12rpx;
    padding: 20rpx;
    box-sizing: border-box;
  }

  :deep(.u-textarea__field) {
    width: 100%;
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
  }
}

.field-input {
  margin-top: 20rpx;
  width: 100%;
}

.images-view {
  margin-top: 20rpx;
}
</style>
