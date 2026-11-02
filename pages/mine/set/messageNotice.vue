<template>
  <view :style="themeStyle" class="notice-page">
    <u-navbar title="消息通知" :auto-back="true" :placeholder="true" :border="false"></u-navbar>

    <view class="content">
      <view class="tip-card">
        <u-icon name="volume" color="#ff7a00" size="18"></u-icon>
        <text class="tip-text">开启通知后，可第一时间接收订单发货、售后审核及资金变动提醒。</text>
      </view>

      <!-- 微信公众号通知设置 -->
      <view v-if="oaSetting.enabled" class="card">
        <view class="card-head">
          <view class="card-title-wrap">
            <view class="icon-badge oa-badge">
              <u-icon name="weixin-fill" color="#fff" size="20"></u-icon>
            </view>
            <view class="title-box">
              <view class="title-row">
                <text class="card-title">{{ oaSetting.accountName || '微信公众号通知' }}</text>
                <text class="status-tag" :class="oaSetting.bound ? 'status-open' : 'status-close'">
                  {{ oaSetting.bound ? '已开启' : '未开启' }}
                </text>
              </view>
              <text class="card-desc">关注官方公众号，长期接收服务与订单通知</text>
            </view>
          </view>
        </view>

        <view class="card-body">
          <view class="notice-points">
            <view class="point-item">
              <text class="dot">•</text>
              <text class="point-text">订单发货、完成及拼团进度实时推送</text>
            </view>
            <view class="point-item">
              <text class="dot">•</text>
              <text class="point-text">售后申请审核结果、商家退款提醒</text>
            </view>
            <view class="point-item">
              <text class="dot">•</text>
              <text class="point-text">余额变动、提现审核与到账结果通知</text>
            </view>
          </view>
        </view>

        <view class="card-foot">
          <view
            class="action-btn"
            :class="oaSetting.bound ? 'btn-bound' : 'btn-primary'"
            @click="handleOaAction"
          >
            {{ oaSetting.bound ? '查看公众号文章' : '关注公众号开启通知' }}
          </view>
        </view>
      </view>

      <!-- 微信小程序订阅消息说明 -->
      <view class="card">
        <view class="card-head">
          <view class="card-title-wrap">
            <view class="icon-badge mp-badge">
              <u-icon name="chat-fill" color="#fff" size="20"></u-icon>
            </view>
            <view class="title-box">
              <view class="title-row">
                <text class="card-title">小程序订阅消息</text>
                <text class="status-tag status-open">已支持</text>
              </view>
              <text class="card-desc">在支付成功、售后提交、积分与提现等页面主动提示</text>
            </view>
          </view>
        </view>

        <view class="card-body">
          <text class="mp-intro">
            小程序订阅消息支持：订单发货提醒、订单已完成提醒、拼团成功通知、售后申请审核通知、积分变更提醒、账户余额变动通知、提现结果通知。您在相关操作时点击授权即可生效。
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWechatOfficialAccountSetting } from '@/api/message.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const oaSetting = ref({
  enabled: false,
  accountName: '',
  articleUrl: '',
  bound: false,
})

onShow(() => {
  fetchSetting()
})

function fetchSetting() {
  getWechatOfficialAccountSetting()
    .then((res: any) => {
      if (res && res.data && res.data.success && res.data.result) {
        oaSetting.value = res.data.result
      }
    })
    .catch(() => {})
}

function handleOaAction() {
  const url = (oaSetting.value.articleUrl || '').trim()
  if (!url) {
    uni.showToast({ title: '暂未配置公众号文章', icon: 'none' })
    return
  }

  // #ifdef MP-WEIXIN
  if (wx.openOfficialAccountArticle) {
    wx.openOfficialAccountArticle({
      url,
      fail: () => {
        fallbackOpen(url)
      },
    })
    return
  }
  // #endif

  fallbackOpen(url)
}

function fallbackOpen(url: string) {
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showModal({
        title: '提示',
        content: '公众号引导文章链接已复制到剪贴板，请在微信中粘贴发送并打开关注公众号',
        showCancel: false,
      })
    },
  })
}
</script>

<style lang="scss" scoped>
.notice-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 40rpx;
}

.content {
  padding: 24rpx;
}

.tip-card {
  display: flex;
  align-items: center;
  background: #fff7eb;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  color: #ff7a00;
  line-height: 1.5;
  margin-left: 12rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #f2f3f5;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  flex: 1;
}

.icon-badge {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.oa-badge {
  background: linear-gradient(135deg, #07c160, #0ab155);
}

.mp-badge {
  background: linear-gradient(135deg, #2b85e4, #007aff);
}

.title-box {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
}

.status-tag {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  margin-left: 14rpx;
  font-weight: 500;
}

.status-open {
  background: #e8f8f0;
  color: #07c160;
}

.status-close {
  background: #f2f3f5;
  color: #86909c;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #86909c;
  margin-top: 6rpx;
}

.card-body {
  padding: 24rpx 0 12rpx;
}

.notice-points {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.point-item {
  display: flex;
  align-items: flex-start;
  font-size: 26rpx;
  color: #4e5969;
  line-height: 1.6;
}

.dot {
  color: #07c160;
  font-size: 32rpx;
  line-height: 1;
  margin-right: 12rpx;
}

.point-text {
  flex: 1;
}

.card-foot {
  margin-top: 24rpx;
}

.action-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #07c160, #05a04e);
  color: #fff;
  box-shadow: 0 6rpx 18rpx rgba(7, 193, 96, 0.25);
}

.btn-bound {
  background: #f2f3f5;
  color: #4e5969;
}

.mp-intro {
  font-size: 26rpx;
  color: #4e5969;
  line-height: 1.8;
}
</style>
