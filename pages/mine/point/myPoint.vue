<template>
  <view :style="themeStyle" class="content">
    <u-navbar
      title="我的积分"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="false"
      @leftClick="handleBack"
    ></u-navbar>
    <view class="portrait-box">
      <image src="/pages/mine/static/point_bg_1.png" mode=""></image>
      <image class="point-img" src="/pages/mine/static/tradehall.png" />
      <view class="position-point">


      </view>
    </view>
    <view class="point-summary">
      <view class="point-summary-item">
        <text>累计获得：</text>
        <text class="pcolor">{{ pointSummary.totalPoint || 0 }}</text>
      </view>
      <view class="point-summary-divider"></view>
      <view class="point-summary-item">
        <text>剩余积分：</text>
        <text class="pcolor">{{ pointSummary.point || 0 }}</text>
      </view>
    </view>

    <view class="point-list">
      <view class="point-item" v-for="(item, index) in pointList" :key="index">
        <view class="point-item-left">
          <view class="point-label">{{ item.content }}</view>
          <view class="point-item-time">{{ item.createTime }}</view>
        </view>
        <view class="point-item-value" :class="[item.pointType == 'INCREASE' ? 'plus' : 'reduce']">
          <text>{{ item.pointType == "INCREASE" ? "+" : "-" }}</text>{{ item.variablePoint }}
        </view>
      </view>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getPointsData, getMemberPointSum } from '@/api/members.js'
import { getThemeStyle } from '@/utils/theme'
import {
  prefetchMpMessageTemplates,
  subscribeMpMessageByScenes,
} from '@/js_sdk/lili-pay/wx-pay.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const loadStatus = ref('more')
const pointList = ref<any[]>([])
const params = ref({ pageNumber: 1, pageSize: 10 })
const pointSummary = ref<Record<string, any>>({})

onLoad(() => {
	// #ifdef MP-WEIXIN
	prefetchMpMessageTemplates()
	// #endif
	fetchPointSummary()
	fetchPointLogList()
})

function handleBack() {
	const doBack = () => {
		uni.navigateBack({
			fail: () => {
				uni.switchTab({ url: '/pages/tabbar/user/my' })
			},
		})
	}
	// #ifdef MP-WEIXIN
	subscribeMpMessageByScenes(['POINT_CHANGE'], doBack)
	// #endif
	// #ifndef MP-WEIXIN
	doBack()
	// #endif
}

onReachBottom(() => {
	params.value.pageNumber++
	fetchPointLogList()
})

function hideLoadingIfNeeded() {
	if (store.state.isShowToast) uni.hideLoading()
}

function fetchPointLogList() {
	uni.showLoading({ title: '加载中' })
	getPointsData(params.value).then((res) => {
		hideLoadingIfNeeded()
		if (res.data.success) {
			const data = res.data.result.records || []
			if (data.length < params.value.pageSize) {
				loadStatus.value = 'noMore'
			}
			pointList.value.push(...data)
		}
	})
}

function fetchPointSummary() {
	getMemberPointSum().then((res) => {
		pointSummary.value = res.data.result
	})
}
</script>

<style lang="scss">
page,
.content {
  min-height: 100vh;
  background: #f9f9f9;
}

.content {
  overflow: hidden;
}

.point-list {
  margin-top: 20rpx;
  background: #f9f9f9;
  min-height: calc(100vh - 390rpx);
  padding-bottom: 24rpx;
  box-sizing: border-box;
}
.title {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.plus{
  color: $light-color;
  font-weight: bold;
}
.reduce{
  color: $weChat-color;
  font-weight: bold;
}

.point-item {
  width: 100%;
  min-height: 130rpx;
  padding: 24rpx 20rpx;
  background: #ffffff;
  font-size: $font-sm;
  border-bottom: 1px solid $border-color-light;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .point-item-left {
    flex: 1;
    min-width: 0;
    line-height: 40rpx;
  }

  .point-item-time {
    color: #999;
  }

  .point-item-value {
    flex-shrink: 0;
    width: 100rpx;
    text-align: center;
  }
}

.point-summary {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  padding: 28rpx 0;
  background: #ffffff;
  border-radius: 0 0 20rpx 20rpx;
  margin: 0 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;

  .point-summary-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .point-summary-divider {
    width: 1px;
    height: 48rpx;
    background: $border-color-light;
    flex-shrink: 0;
  }

  .pcolor {
    color: $light-color;
    margin-left: 8rpx;
  }
}

.more {
  text-align: right;
  color: $u-tips-color;
  font-size: 24rpx;
  padding-right: 40rpx !important;
}

.portrait-box {
  background-color: $main-color;
  height: 250rpx;
   background: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
  border-radius: 20rpx 20rpx 0 0;
  margin: 20rpx 20rpx 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;

  > image:first-child {
    width: 263rpx;
    height: 250rpx;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: rotateY(180deg);
  }

  .position-point {
    position: absolute;
    right: -2rpx;
    top: 0;

    .apply-point {
      margin-top: 30rpx;
      text-align: center;
      line-height: 40rpx;
      font-size: $font-sm;
      color: #ffffff;
      width: 142rpx;
      height: 40rpx;
      background: rgba(#ffffff, 0.2);
      border-radius: 20rpx 0px 0px 20rpx;
    }
  }
  .point-img {
    height: 108rpx;
    width: 108rpx;
    margin-bottom: 30rpx;
  }
  .point {
    font-size: 56rpx;
  }

}
.point-label {
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #666666;
}

.point-list .uni-load-more {
  background: #f9f9f9;
}
</style>
