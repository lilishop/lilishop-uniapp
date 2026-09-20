<template>
  <view class="live-room-page">
  <!-- 竖屏直播 -->
  <view v-if="isVerticalMode" class="live-detail-page-vertical">
    <view class="nav-back" @click="goBackOrHome">
      <u-icon name="arrow-left" color="#fff" size="20" />
    </view>

    <view
      v-if="visibleCouponList.length"
      class="coupon-float-btn"
      :class="{ 'shake-animation': hasClaimableCoupon }"
      @click.stop="openCouponModal"
    >
      <u-icon name="coupon-fill" color="#ff6b35" size="26" />
    </view>

    <view class="live-container-vertical">
      <view class="live-box-vertical" @click="toggleUI">
        <view v-if="showCover" class="live-cover-wrap cover-wrap">
          <image class="live-cover cover-img" :src="roomInfo.coverImg" mode="aspectFill" />
          <view class="cover-mask">
            <view class="status-tag" :class="statusClass">{{ statusText }}</view>
            <view v-if="roomInfo.storeName" class="tips-text">{{ roomInfo.storeName }}</view>
          </view>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <live-player
          v-if="isLiving && roomInfo.pullStreamUrl"
          class="stream-player"
          :src="roomInfo.pullStreamUrl"
          autoplay
          mode="live"
          object-fit="fillCrop"
          :min-cache="1"
          :max-cache="3"
          @error="onPlayerError"
        />
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <div
          v-if="isLiving && roomInfo.pullStreamUrl"
          ref="hlsContainer"
          class="stream-player"
          style="width: 100%; height: 100%; background: #000"
        />
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <video
          v-if="isLiving && roomInfo.pullStreamUrl"
          class="stream-player"
          :src="roomInfo.pullStreamUrl"
          :poster="roomInfo.coverImg"
          autoplay
          live
          :controls="false"
          object-fit="cover"
          @error="onPlayerError"
        />
        <!-- #endif -->

        <view class="capsule" @click.stop="showIntroPopup">
          <u-icon name="info-circle" color="#fff" size="14" />
          <text style="margin-left: 8rpx">直播介绍</text>
        </view>
      </view>
    </view>

    <view class="bottom-container-vertical" :class="{ hidden: !isUIVisible }" @click.stop>
      <view class="message-container">
        <scroll-view class="message-scroll" scroll-y :scroll-into-view="scrollToView" scroll-with-animation>
          <view
            v-for="(item, index) in messageList"
            :key="item.id || index"
            :id="'msg-' + index"
            class="message-item"
          >
            <image class="user-avatar" :src="item.userFace || defaultAvatar" mode="aspectFill" />
            <view class="message-content">
              <text class="username">{{ item.userName }}</text>
              <text class="message-text">{{ item.message }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="cart-btn" @click="openGoodsModal">
        <view class="cart-btn-inner">
          <u-icon name="shopping-cart-fill" color="#fff" size="28" />
        </view>
      </view>

      <view
        v-if="recommendGoods"
        class="product-showcase"
        :class="{ 'is-sold-out': isGoodsSoldOut(recommendGoods) }"
        @click="goGoods(recommendGoods)"
      >
        <image class="product-image" :src="recommendGoods.thumbnail" mode="aspectFill" />
        <view class="product-info">
          <view class="product-name">
            <text v-if="!isGoodsSoldOut(recommendGoods)" class="product-tag">抢购中</text>
            {{ recommendGoods.goodsName }}
          </view>
          <view v-if="recommendGoods.sellPoint" class="product-sell-point">{{ recommendGoods.sellPoint }}</view>
          <view class="product-price-row">
            <view class="product-price" :class="{ 'sold-out': isGoodsSoldOut(recommendGoods) }">
              ¥{{ unitPrice(recommendGoods.price) }}
            </view>
            <view class="buy-btn" :class="{ 'sold-out': isGoodsSoldOut(recommendGoods) }">
              {{ isGoodsSoldOut(recommendGoods) ? '已售罄' : '立即购买' }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showChatBar" class="bottom-actions bottom-actions-vertical" :class="{ hidden: !isUIVisible }">
      <view class="input-box" @tap="onChatInputTap">
        <input
          v-model="inputMessage"
          class="input-content"
          type="text"
          :placeholder="chatPlaceholder"
          :disabled="isLogin('auth') && liveUser?.muteFlag"
          confirm-type="send"
          @focus="onChatFocus"
          @confirm="sendMessage"
        />
      </view>
      <view class="send-btn-small" :class="{ disabled: isLogin('auth') && (!canSend || sending) }" @click="sendMessage">发送</view>
    </view>

    <!-- 竖屏底部弹窗 -->
    <view class="bottom-popup-overlay" :class="{ show: showBottomPopup }" @click="closeBottomPopup">
      <view class="bottom-popup-container" :class="{ show: showBottomPopup }" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ popupTitle }}</text>
          <text class="popup-close" @click="closeBottomPopup">✕</text>
        </view>
        <view class="popup-content">
          <view v-if="popupType === 'intro'" class="live-intro-wrapper">
            <view class="live-title">{{ roomInfo.title }}</view>
            <view class="live-time flex flex-a-c flex-j-sb">
              <text>{{ roomInfo.startTime || '' }}</text>
              <text>{{ formatCount(roomInfo.viewerCount) }} 观看</text>
            </view>
            <view class="live-intro-title">直播介绍</view>
            <view class="live-intro-content-text">{{ roomInfo.liveIntroduce || roomInfo.description || '暂无介绍' }}</view>
          </view>
          <scroll-view v-if="popupType === 'goods'" class="goods-list-scroll" scroll-y>
            <view class="goods-list">
              <view
                v-for="item in visibleGoodsList"
                :key="item.id || item.skuId"
                class="goods-item-row"
                :class="{ 'is-sold-out': isGoodsSoldOut(item) }"
                @click="goGoods(item)"
              >
                <view class="goods-item-content">
                  <view class="goods-image-container">
                    <image class="goods-image" :src="item.thumbnail" mode="aspectFill" />
                  </view>
                  <view class="goods-right">
                    <view class="goods-name">
                      <text v-if="item.recommend" class="hot-tag">热卖 {{ item.popularity || 0 }}</text>
                      {{ item.goodsName }}
                    </view>
                    <view class="goods-bottom">
                      <view>
                        <text class="current-price" :class="{ 'price-sold-out': isGoodsSoldOut(item) }">
                          <text class="price-symbol">￥</text>{{ unitPrice(item.price) }}
                        </text>
                        <view v-if="item.originPrice">
                          <text class="original-price-text">￥{{ unitPrice(item.originPrice) }}</text>
                        </view>
                      </view>
                      <view class="goods-btn" :class="isGoodsSoldOut(item) ? 'btn-sold-out' : 'btn-active'">
                        {{ isGoodsSoldOut(item) ? '已售罄' : '去购买' }}
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="!visibleGoodsList.length" class="goods-empty">暂无商品</view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>

  <!-- 横屏 / 三分屏直播 -->
  <view v-else class="live-detail-page">
    <view class="nav-back" @click="goBackOrHome">
      <u-icon name="arrow-left" color="#fff" size="20" />
    </view>

    <view
      v-if="visibleCouponList.length"
      class="coupon-float-btn coupon-float-btn-horizontal"
      :class="{ 'shake-animation': hasClaimableCoupon }"
      @click.stop="openCouponModal"
    >
      <u-icon name="coupon-fill" color="#ff6b35" size="26" />
    </view>

    <view class="live-container">
      <view class="live-box" :class="playerLayoutClass">
        <view v-if="showCover" class="live-cover-wrap cover-wrap">
          <image class="live-cover cover-img" :src="roomInfo.coverImg" mode="aspectFill" />
          <view class="cover-mask">
            <view class="status-tag" :class="statusClass">{{ statusText }}</view>
            <view v-if="roomInfo.startTime && roomInfo.liveStatus === 'NEW'" class="tips-text">开播：{{ roomInfo.startTime }}</view>
            <view v-if="roomInfo.liveStatus === 'PAUSED'" class="tips-text">主播暂时离开，请稍候</view>
          </view>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <live-player
          v-if="isLiving && roomInfo.pullStreamUrl"
          class="stream-player"
          :src="roomInfo.pullStreamUrl"
          autoplay
          mode="live"
          :object-fit="objectFit"
          :min-cache="1"
          :max-cache="3"
          @error="onPlayerError"
        />
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <div
          v-if="isLiving && roomInfo.pullStreamUrl"
          ref="hlsContainer"
          class="stream-player"
          style="width: 100%; height: 100%; background: #000"
        />
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <video
          v-if="isLiving && roomInfo.pullStreamUrl"
          class="stream-player"
          :src="roomInfo.pullStreamUrl"
          :poster="roomInfo.coverImg"
          autoplay
          live
          controls
          :object-fit="objectFit"
          @error="onPlayerError"
        />
        <!-- #endif -->
      </view>
    </view>

    <view class="bottom-container" :class="{ 'has-chat-bar': currentTab === 0 && showChatBar }">
      <view class="tab-container">
        <view class="tab-items">
          <view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
            <text>互动</text>
          </view>
          <view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
            <text>直播介绍</text>
          </view>
        </view>
      </view>

      <view class="message-container">
        <scroll-view
          v-if="currentTab === 0"
          class="message-scroll"
          scroll-y
          :scroll-into-view="scrollToView"
          scroll-with-animation
        >
          <view
            v-for="(item, index) in messageList"
            :key="item.id || index"
            :id="'msg-' + index"
            class="message-item"
          >
            <image class="user-avatar" :src="item.userFace || defaultAvatar" mode="aspectFill" />
            <view class="message-content">
              <text class="username">{{ item.userName }}</text>
              <text class="message-text">{{ item.message }}</text>
            </view>
          </view>
          <view v-if="!messageList.length" class="goods-empty">暂无消息，快来互动吧</view>
        </scroll-view>

        <scroll-view v-else class="live-intro-scroll" scroll-y>
          <view class="live-intro-wrapper">
            <view class="live-title">{{ roomInfo.title }}</view>
            <view class="live-time flex flex-a-c flex-j-sb">
              <text>{{ roomInfo.startTime || '' }}</text>
              <text>{{ formatCount(roomInfo.viewerCount) }} 观看 · {{ formatCount(roomInfo.totalLikes) }} 点赞</text>
            </view>
            <view class="live-intro-title">直播介绍</view>
            <view class="live-intro-content-text">{{ roomInfo.liveIntroduce || roomInfo.description || '暂无介绍' }}</view>
          </view>
        </scroll-view>
      </view>

      <view v-if="currentTab === 0" class="floating-right-container">
        <view
          v-if="recommendGoods"
          class="floating-recommend-card"
          :class="{ 'is-sold-out': isGoodsSoldOut(recommendGoods) }"
          @click="goGoods(recommendGoods)"
        >
          <view class="floating-recommend-img-wrap">
            <image class="floating-recommend-img" :src="recommendGoods.thumbnail" mode="aspectFill" />
            <view class="floating-recommend-tag">热卖 {{ recommendGoods.popularity || 0 }}</view>
          </view>
          <view class="floating-recommend-info">
            <view class="floating-recommend-name">{{ recommendGoods.goodsName }}</view>
            <view class="floating-recommend-price">¥{{ unitPrice(recommendGoods.price) }}</view>
          </view>
        </view>
        <view class="cart-btn" @click="openGoodsModal">
          <view class="cart-btn-inner">
            <u-icon name="shopping-cart-fill" color="#fff" size="28" />
          </view>
        </view>
      </view>

      <view v-if="currentTab === 0 && showChatBar" class="bottom-actions">
        <view class="input-box" @tap="onChatInputTap">
          <input
            v-model="inputMessage"
            class="input-content"
            type="text"
            :placeholder="chatPlaceholder"
            :disabled="isLogin('auth') && liveUser?.muteFlag"
            confirm-type="send"
            @focus="onChatFocus"
            @confirm="sendMessage"
          />
        </view>
        <view class="send-btn-small" :class="{ disabled: isLogin('auth') && (!canSend || sending) }" @click="sendMessage">发送</view>
      </view>
    </view>

    <!-- 横屏商品弹窗 -->
    <view v-if="showGoodsModal" class="dialog-overlay" @click="closeGoodsModal">
      <view class="goods-list-container" @click.stop>
        <view class="goods-list-header">
          <text class="goods-list-title">直播商品 ({{ visibleGoodsList.length }})</text>
          <text class="goods-list-close" @click="closeGoodsModal">✕</text>
        </view>
        <scroll-view class="goods-list-scroll" scroll-y>
          <view class="goods-list">
            <view
              v-for="item in visibleGoodsList"
              :key="item.id || item.skuId"
              class="goods-item-row"
              :class="{ 'is-sold-out': isGoodsSoldOut(item) }"
              @click="goGoods(item)"
            >
              <view class="goods-item-content">
                <view class="goods-image-container">
                  <image class="goods-image" :src="item.thumbnail" mode="aspectFill" />
                </view>
                <view class="goods-right">
                  <view class="goods-name">
                    <text v-if="item.recommend" class="hot-tag">热卖 {{ item.popularity || 0 }}</text>
                    {{ item.goodsName }}
                  </view>
                  <view class="goods-bottom">
                    <view>
                      <text class="current-price" :class="{ 'price-sold-out': isGoodsSoldOut(item) }">
                        <text class="price-symbol">￥</text>{{ unitPrice(item.price) }}
                      </text>
                      <view v-if="item.originPrice">
                        <text class="original-price-text">￥{{ unitPrice(item.originPrice) }}</text>
                      </view>
                    </view>
                    <view class="goods-btn" :class="isGoodsSoldOut(item) ? 'btn-sold-out' : 'btn-active'">
                      {{ isGoodsSoldOut(item) ? '已售罄' : '去购买' }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-if="!visibleGoodsList.length" class="goods-empty">暂无商品</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>

  <!-- 推荐优惠券弹窗 -->
  <view
    v-if="showRecommendCouponModal && recommendCouponItem"
    class="dialog-overlay recommend-coupon-overlay"
    @click="closeRecommendCouponModal"
  >
    <view class="recommend-coupon-container white-theme" @click.stop>
      <view class="rc-header">
        <text class="rc-title">恭喜获得专属优惠券</text>
        <view class="rc-close" @click="closeRecommendCouponModal">✕</view>
      </view>
      <view class="rc-body">
        <view class="rc-ticket-box">
          <view class="rc-ticket-left">
            <text class="rc-symbol">¥</text>
            <text class="rc-value">{{ unitPrice(recommendCouponItem.couponPrice) }}</text>
          </view>
          <view class="rc-ticket-right">
            <text class="rc-name">{{ recommendCouponItem.couponName }}</text>
          </view>
        </view>
      </view>
      <view class="rc-footer">
        <view
          class="rc-btn"
          :class="{ disabled: isCouponReceived(recommendCouponItem.couponId) || claimingCouponId === recommendCouponItem.couponId }"
          @click="onClaimRecommendCoupon"
        >
          {{
            claimingCouponId === recommendCouponItem.couponId
              ? '领取中'
              : isCouponReceived(recommendCouponItem.couponId)
                ? '已领取'
                : '立即领取'
          }}
        </view>
      </view>
    </view>
  </view>

  <!-- 优惠券列表弹窗（横竖屏共用） -->
  <view v-if="showCouponModal" class="dialog-overlay" @click="closeCouponModal">
    <view class="coupon-list-container" @click.stop>
      <view class="coupon-list-header">
        <text class="coupon-list-title">直播专属券</text>
        <text class="coupon-list-close" @click="closeCouponModal">✕</text>
      </view>
      <scroll-view class="coupon-list-scroll" scroll-y>
        <view class="coupon-list-inner">
          <view v-for="item in visibleCouponList" :key="item.id || item.couponId" class="coupon-card">
            <view class="coupon-card-left">
              <text class="coupon-price-value">
                <text class="coupon-price-symbol">¥</text>{{ unitPrice(item.couponPrice) }}
              </text>
            </view>
            <view class="coupon-divider" />
            <view class="coupon-card-right">
              <view class="coupon-info">
                <text class="coupon-card-name">{{ item.couponName }}</text>
                <text class="coupon-card-desc">限时专享优惠</text>
              </view>
              <view
                class="coupon-claim-btn"
                :class="{ disabled: isCouponReceived(item.couponId) || claimingCouponId === item.couponId }"
                @click="onClaimCoupon(item)"
              >
                {{ claimingCouponId === item.couponId ? '领取中' : isCouponReceived(item.couponId) ? '已领取' : '领取' }}
              </view>
            </view>
          </view>
          <view v-if="!visibleCouponList.length" class="coupon-empty">暂无可用优惠券</view>
        </view>
      </scroll-view>
    </view>
  </view>

  <view v-if="loading" class="loading-wrap">
    <u-loading-icon mode="circle" color="#fff" />
  </view>
  </view>
</template>

<script setup lang="ts">
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
// #ifdef MP-WEIXIN
import { onShareTimeline } from '@dcloudio/uni-app'
// #endif
import {
  getLivePollingData,
  getLiveRoomById,
  receiveLiveCoupon,
  registerLiveViewUser,
  sendLiveMessage,
} from '@/api/live.js'
import config from '@/config/config'
import { useStore } from '@/store'
import { isLogin, navigateToLogin, unitPrice } from '@/utils/filters.js'
// #ifndef APP-PLUS
import { LiveChatService } from './utils/liveChat.js'
import { LiveMqttService } from './utils/liveMqtt.js'
// #endif
// #ifdef APP-PLUS
class LiveChatService {
  userInfo: any = {}
  constructor(_options: any = {}) {}
  setGroupID(_id: string) {}
  async initTencentIm(_viewLiveResult?: any) {}
  cleanup() {}
}
class LiveMqttService {
  userId: any = null
  mqttClient: any = null
  constructor(_liveId: any, userId: any) {
    this.userId = userId
  }
  setMessageHandlers(_handlers: any) {}
  isConnected() {
    return false
  }
  initMqtt() {}
  cleanup() {
    this.mqttClient = null
  }
}
// #endif
import { findRecommendPayload, parseRecommendMessageArray } from './utils/liveRecommend.js'
import { seedLiveSetting } from './utils/liveSetting.js'
// #ifdef H5
import Hls from 'hls.js'
// #endif

const POLL_INTERVAL = 5000

const LIVE_STATUS = {
  NEW: 'NEW',
  LIVING: 'LIVING',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
} as const

const STATUS_LABEL: Record<string, string> = {
  [LIVE_STATUS.NEW]: '新直播',
  [LIVE_STATUS.LIVING]: '直播中',
  [LIVE_STATUS.PAUSED]: '已暂停',
  [LIVE_STATUS.ENDED]: '已结束',
}

const store = useStore()
const { proxy } = getCurrentInstance()!

const hlsContainer = ref<HTMLElement | null>(null)

const liveId = ref('')
const loading = ref(true)
const roomInfo = ref<Record<string, any>>({})
const liveUser = ref<Record<string, any> | null>(null)
const messageList = ref<any[]>([])
const inputMessage = ref('')
const sending = ref(false)
const scrollToView = ref('')
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)
const goodsList = ref<any[]>([])
const liveCoupon = ref<any[]>([])
const liveCouponReceives = ref<any[]>([])
const currentTab = ref(0)
const showGoodsModal = ref(false)
const showCouponModal = ref(false)
const isUIVisible = ref(true)
const showBottomPopup = ref(false)
const popupType = ref('')
const popupTitle = ref('')
const defaultAvatar = config.defaultUserPhoto
const claimingCouponId = ref('')
const showRecommendCouponModal = ref(false)
const recommendCouponItem = ref<any>(null)
const shownRecommendCouponIds = ref<any[]>([])
const hlsHttpFallbackUsed = ref(false)
const lastHlsPullUrl = ref('')

// hls.js 播放器实例与视频节点不经过 Vue 响应式代理，避免干扰其内部状态管理
// #ifdef H5
let hlsInstance: InstanceType<typeof Hls> | null = null
// #endif
// #ifndef H5
let hlsInstance: any = null
// #endif
let hlsVideoElement: HTMLVideoElement | null = null
let hlsVideoClickHandler: (() => void) | null = null
let liveMqttService: InstanceType<typeof LiveMqttService> | null = null
let liveChatService: InstanceType<typeof LiveChatService> | null = null

const isLiving = computed(() => roomInfo.value.liveStatus === LIVE_STATUS.LIVING)

const showCover = computed(() => !isLiving.value || !roomInfo.value.pullStreamUrl)

const statusText = computed(() => STATUS_LABEL[roomInfo.value.liveStatus] || '直播间')

const statusClass = computed(() => {
  const status = roomInfo.value.liveStatus
  return {
    living: status === LIVE_STATUS.LIVING,
    pending: status === LIVE_STATUS.NEW,
    paused: status === LIVE_STATUS.PAUSED,
    ended: status === LIVE_STATUS.ENDED,
  }
})

const playerLayoutClass = computed(() => {
  const mode = String(roomInfo.value.displayMode)
  if (mode === '2') return 'layout-triple'
  return 'layout-horizontal'
})

const objectFit = computed(() => (String(roomInfo.value.displayMode) === '1' ? 'fillCrop' : 'contain'))

const isVerticalMode = computed(() => String(roomInfo.value.displayMode) === '1')

const showChatBar = computed(() => roomInfo.value.liveStatus !== LIVE_STATUS.ENDED)

const canSend = computed(() => {
  if (!showChatBar.value || sending.value) return false
  if (!isLogin('auth')) return false
  if (liveUser.value?.muteFlag) return false
  return true
})

const chatPlaceholder = computed(() => {
  if (roomInfo.value.liveStatus === LIVE_STATUS.ENDED) return '直播已结束'
  if (!isLogin('auth')) return '登录后发言'
  if (liveUser.value?.muteFlag) return '您已被禁言'
  return '说点什么...'
})

const visibleGoodsList = computed(() => (goodsList.value || []).filter((item) => !item.hideFlag))

const visibleCouponList = computed(() => (liveCoupon.value || []).filter((item) => !item.hideFlag))

const recommendGoods = computed(
  () => visibleGoodsList.value.find((item) => item.recommend === true) || null
)

const hasClaimableCoupon = computed(() =>
  visibleCouponList.value.some((item) => !isCouponReceived(item.couponId))
)

function parseLiveId(options: Record<string, any>) {
  let id = options.id || options.roomId || ''
  // #ifdef MP-WEIXIN
  if (!id && options.scene) {
    const scene = decodeURIComponent(options.scene)
    const matched = scene.match(/(?:^|&)id=([^&]+)/)
    id = matched ? matched[1] : scene
  }
  // #endif
  return id
}

function goBackOrHome() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/tabbar/home/index' })
  }
}

/** 跳转登录页，登录成功后 navigateBack 返回直播间 */
function goLogin() {
  navigateToLogin('navigateTo')
}

/** 校验登录，未登录则跳转登录页 */
function requireLogin() {
  if (isLogin('auth')) return true
  goLogin()
  return false
}

function onChatInputTap() {
  if (!isLogin('auth')) {
    goLogin()
  }
}

function onChatFocus() {
  if (!isLogin('auth')) {
    uni.hideKeyboard()
    goLogin()
  }
}

function switchTab(index: number) {
  currentTab.value = index
}

function toggleUI() {
  if (showBottomPopup.value) return
  isUIVisible.value = !isUIVisible.value
}

function showIntroPopup() {
  popupType.value = 'intro'
  popupTitle.value = '直播介绍'
  showBottomPopup.value = true
  isUIVisible.value = true
}

function closeBottomPopup() {
  showBottomPopup.value = false
  popupType.value = ''
  popupTitle.value = ''
}

function openGoodsModal() {
  if (isVerticalMode.value) {
    popupType.value = 'goods'
    popupTitle.value = '商品列表'
    showBottomPopup.value = true
  } else {
    showGoodsModal.value = true
  }
}

function closeGoodsModal() {
  showGoodsModal.value = false
}

function isGoodsSoldOut(item: any) {
  return item?.sellOutFlag === true || item?.soldOutFlag === true
}

function openCouponModal() {
  showCouponModal.value = true
}

function closeCouponModal() {
  showCouponModal.value = false
}

function closeRecommendCouponModal() {
  showRecommendCouponModal.value = false
}

function isCouponReceived(couponId: string) {
  return (liveCouponReceives.value || []).some((item) => item.couponId === couponId)
}

function showRecommendCouponFromPayload(coupon: any) {
  if (!coupon || isCouponReceived(coupon.couponId)) return
  const key = coupon.id || coupon.couponId
  if (shownRecommendCouponIds.value.includes(key)) return
  shownRecommendCouponIds.value.push(key)
  recommendCouponItem.value = coupon
  showRecommendCouponModal.value = true
}

function updateRecommendCouponPopup() {
  const found = visibleCouponList.value.find(
    (item) =>
      item.recommend === true &&
      !isCouponReceived(item.couponId) &&
      !shownRecommendCouponIds.value.includes(item.id || item.couponId)
  )
  if (!found) return
  showRecommendCouponFromPayload(found)
}

function onClaimRecommendCoupon() {
  if (!recommendCouponItem.value) return
  onClaimCoupon(recommendCouponItem.value)
}

function onClaimCoupon(item: any) {
  if (!requireLogin()) return
  if (isCouponReceived(item.couponId)) return
  if (claimingCouponId.value) return

  claimingCouponId.value = item.couponId
  receiveLiveCoupon(liveId.value, item.couponId)
    .then(async (res) => {
      if (res.data.success) {
        uni.showToast({ title: '领取成功', icon: 'none' })
        await fetchPollingData(false)
        closeRecommendCouponModal()
      } else {
        uni.showToast({ title: res.data.message || '领取失败', icon: 'none' })
      }
    })
    .catch(() => {
      uni.showToast({ title: '领取失败', icon: 'none' })
    })
    .finally(() => {
      claimingCouponId.value = ''
    })
}

function setupShare() {
  const shareConfig = {
    title: roomInfo.value.title || '直播间',
    path: `/pages/promotion/live/room?id=${liveId.value}`,
    imageUrl: roomInfo.value.coverImg || '',
  }
  // #ifdef MP-WEIXIN
  if (proxy?.$u) {
    proxy.$u.mpShare = shareConfig
  }
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
  // #endif
}

async function initLiveRoom() {
  const ok = await fetchRoomDetail(true)
  if (!ok) return
  await fetchPollingData(false)
  setupShare()
  if (roomInfo.value.title) {
    uni.setNavigationBarTitle({ title: roomInfo.value.title })
  }
  if (isLogin('auth')) {
    await registerLiveUser()
  }
  startPolling()
  initLiveMqtt()
  syncH5Player()
}

async function initLiveChat() {
  if (!isLogin('auth')) return

  const groupId = roomInfo.value.imGroupId || roomInfo.value.groupId
  if (!groupId) {
    console.warn('imGroupId 不存在，跳过 IM 初始化')
    return
  }

  if (!liveUser.value?.userSig) {
    await registerLiveUser()
  }
  if (!liveUser.value?.userSig) {
    console.warn('userSig 不存在，跳过 IM 初始化')
    return
  }

  if (!liveChatService) {
    const userInfo = isLogin() || {}
    liveChatService = new LiveChatService({
      liveId: liveId.value,
      userInfo,
      defaultAvatar,
      onMessagesChange: (messages) => {
        messageList.value = messages
      },
      onScrollToBottom: () => {
        nextTick(() => {
          if (messageList.value.length) {
            scrollToView.value = 'msg-' + (messageList.value.length - 1)
          }
        })
      },
    })
  }

  liveChatService.userInfo = isLogin() || {}
  liveChatService.setGroupID(groupId)
  await liveChatService.initTencentIm(liveUser.value)
}

function cleanupLiveChat() {
  if (liveChatService) {
    liveChatService.cleanup()
    liveChatService = null
  }
}

function getMqttUserId() {
  const userInfo = isLogin() || {}
  return userInfo.id || userInfo.userId || liveUser.value?.userId || `guest-${liveId.value}`
}

function initLiveMqttHandlers() {
  if (!liveMqttService) return
  liveMqttService.setMessageHandlers({
    onLiveMessage: (message) => handleMqttLiveMessage(message),
    onGoodsMessage: (message) => handleMqttGoodsMessage(message),
    onCouponMessage: (message) => handleMqttCouponMessage(message),
    onBlacklistMessage: () => handleMqttBlacklistMessage(),
    onPushStream: () => handleMqttPushStreamMessage(),
  })
}

function initLiveMqtt() {
  if (!liveId.value) return
  if (!liveMqttService) {
    liveMqttService = new LiveMqttService(liveId.value, getMqttUserId())
  } else {
    liveMqttService.userId = getMqttUserId()
  }
  initLiveMqttHandlers()
  if (!liveMqttService.isConnected() && !liveMqttService.mqttClient) {
    liveMqttService.initMqtt()
  }
}

function cleanupLiveMqtt() {
  if (liveMqttService) {
    liveMqttService.cleanup()
    liveMqttService = null
  }
}

function normalizeMqttLiveStatus(status: string | number) {
  if (typeof status === 'string') {
    const upper = status.toUpperCase()
    const map: Record<string, string> = {
      NEW: LIVE_STATUS.NEW,
      NOT_STARTED: LIVE_STATUS.NEW,
      START: LIVE_STATUS.LIVING,
      LIVING: LIVE_STATUS.LIVING,
      END: LIVE_STATUS.ENDED,
      ENDED: LIVE_STATUS.ENDED,
      PAUSE: LIVE_STATUS.PAUSED,
      PAUSED: LIVE_STATUS.PAUSED,
    }
    return map[upper] || status
  }
  const numMap: Record<number, string> = {
    0: LIVE_STATUS.NEW,
    1: LIVE_STATUS.LIVING,
    2: LIVE_STATUS.ENDED,
    3: LIVE_STATUS.PAUSED,
  }
  return numMap[status as number] != null
    ? numMap[status as number]
    : roomInfo.value.liveStatus
}

function handleMqttLiveMessage(message: string) {
  try {
    const data = JSON.parse(message)
    const updates: Record<string, any> = {}
    if (data.liveStatus !== undefined) {
      updates.liveStatus = normalizeMqttLiveStatus(data.liveStatus)
    }
    if (data.pullStreamUrl) {
      updates.pullStreamUrl = data.pullStreamUrl
    }
    if (Object.keys(updates).length) {
      roomInfo.value = { ...roomInfo.value, ...updates }
    }
    if (updates.liveStatus === LIVE_STATUS.ENDED) {
      stopPolling()
    }
    syncH5Player()
  } catch (error) {
    console.error('处理直播 MQTT 消息失败:', error)
  }
}

function handleMqttGoodsMessage(message: string) {
  console.log('收到商品 MQTT 消息:', message)
  const goodsMessageList = parseRecommendMessageArray(message)
  if (goodsMessageList.length) {
    goodsList.value = goodsMessageList
  }
  fetchPollingData(false)
}

function handleMqttCouponMessage(message: string) {
  console.log('收到优惠券 MQTT 消息:', message)
  const couponMessageList = parseRecommendMessageArray(message)
  const recommendCoupon = findRecommendPayload(couponMessageList)
  if (recommendCoupon) {
    showRecommendCouponFromPayload(recommendCoupon)
  } else {
    closeRecommendCouponModal()
  }
  fetchPollingData(false)
}

function handleMqttBlacklistMessage() {
  uni.showModal({
    title: '提示',
    content: '您已被限制进入直播间',
    showCancel: false,
    success: () => goBackOrHome(),
  })
}

function handleMqttPushStreamMessage() {
  if (roomInfo.value.liveStatus !== LIVE_STATUS.LIVING) {
    roomInfo.value = { ...roomInfo.value, liveStatus: LIVE_STATUS.LIVING }
  }
  syncH5Player()
}

function startPolling() {
  stopPolling()
  pollTimer.value = setInterval(() => {
    fetchPollingData(false)
  }, POLL_INTERVAL)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

function applyPollingData(data: any) {
  if (!data) return
  if (data.liveDetail) {
    roomInfo.value = data.liveDetail
  }
  if (data.goodsList) {
    goodsList.value = data.goodsList
  }
  if (data.liveCoupon) {
    liveCoupon.value = data.liveCoupon
    updateRecommendCouponPopup()
  }
  if (data.liveCouponReceives) {
    liveCouponReceives.value = data.liveCouponReceives
    if (
      recommendCouponItem.value &&
      isCouponReceived(recommendCouponItem.value.couponId)
    ) {
      closeRecommendCouponModal()
    }
  }
  if (roomInfo.value.liveStatus === LIVE_STATUS.ENDED) {
    stopPolling()
  }
  syncH5Player()
}

async function fetchRoomDetail(isInit = false) {
  if (isInit) loading.value = true
  try {
    const res = await getLiveRoomById(liveId.value)
    if (res.data?.success && res.data?.result) {
      roomInfo.value = res.data.result
      seedLiveSetting(liveId.value, res.data.result)
      syncH5Player()
      return true
    }
    if (isInit) {
      uni.showToast({ title: res.data?.message || '直播间不存在', icon: 'none' })
      setTimeout(() => goBackOrHome(), 1500)
    }
    return false
  } catch (e) {
    if (isInit) {
      uni.showToast({ title: '加载失败', icon: 'none' })
    }
    return false
  } finally {
    if (isInit) loading.value = false
  }
}

async function fetchPollingData(isInit = false) {
  if (isInit) loading.value = true
  try {
    const res = await getLivePollingData(liveId.value)
    if (res.data.success && res.data.result) {
      applyPollingData(res.data.result)
      return true
    }
    return false
  } catch (e) {
    return false
  } finally {
    if (isInit) loading.value = false
  }
}

function goGoods(item: any) {
  if (isGoodsSoldOut(item)) return
  if (!item.canBuyFlag) {
    uni.showToast({ title: '暂不可购买', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
  })
}

async function registerLiveUser() {
  if (!isLogin('auth')) return
  try {
    const res = await registerLiveViewUser(liveId.value)
    if (res.data.success && res.data.result) {
      liveUser.value = res.data.result
      await initLiveChat()
    }
  } catch (e) {
    console.error('register live user failed:', e)
  }
}

function formatCount(val: number | string) {
  const num = Number(val) || 0
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  return num
}

function onPlayerError(e: any) {
  console.error('live player error:', e.detail)
  uni.showToast({ title: '直播加载失败', icon: 'none' })
}

/** 根据当前直播状态与拉流地址，按需（重新）挂载或销毁 H5 播放器 */
function syncH5Player(retry = 0) {
  // #ifdef H5
  const shouldPlay = isLiving.value && !!roomInfo.value.pullStreamUrl
  if (!shouldPlay) {
    destroyH5HlsPlayer()
    lastHlsPullUrl.value = ''
    return
  }
  if (
    roomInfo.value.pullStreamUrl === lastHlsPullUrl.value &&
    hlsInstance &&
    hlsVideoElement &&
    !hlsVideoElement.paused
  ) {
    return
  }
  if (roomInfo.value.pullStreamUrl === lastHlsPullUrl.value && hlsInstance) {
    ensureH5VideoPlaying(hlsVideoElement)
    return
  }
  lastHlsPullUrl.value = roomInfo.value.pullStreamUrl
  hlsHttpFallbackUsed.value = false
  nextTick(() => {
    const container = hlsContainer.value
    if (!container) {
      if (retry < 8) {
        setTimeout(() => syncH5Player(retry + 1), 80)
      }
      return
    }
    initH5HlsPlayer()
  })
  // #endif
}

/** 尝试自动播放；浏览器策略拦截时先静音播放，点击后再恢复声音 */
function ensureH5VideoPlaying(video: HTMLVideoElement | null) {
  // #ifdef H5
  if (!video) return Promise.resolve()
  const tryPlay = (muted: boolean) => {
    video.muted = muted
    return video.play().catch(() => Promise.reject())
  }
  return tryPlay(false)
    .catch(() => tryPlay(true))
    .catch(() => {
      console.warn('[HLS] 自动播放被阻止，请点击画面播放')
    })
  // #endif
}

/** 初始化 H5 HLS 播放器，支持 HTTPS 证书异常时自动降级为 HTTP 重试 */
function initH5HlsPlayer(useHttpFallback = false) {
  // #ifdef H5
  const originalUrl = roomInfo.value.pullStreamUrl
  const container = hlsContainer.value
  if (!originalUrl || !container) return

  const httpUrl =
    useHttpFallback && originalUrl.startsWith('https://')
      ? originalUrl.replace('https://', 'http://')
      : originalUrl
  const url = httpUrl.replace('.flv', '.m3u8')

  destroyH5HlsPlayer()

  const video = document.createElement('video')
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000;'
  video.autoplay = true
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('autoplay', '')
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('x5-playsinline', '')
  video.setAttribute('x5-video-player-type', 'h5')
  video.setAttribute('x5-video-player-fullscreen', 'true')
  video.controls = false
  const onVideoClick = () => {
    if (video.muted) {
      video.muted = false
    }
    video.play().catch(() => {})
  }
  video.addEventListener('click', onVideoClick)
  container.appendChild(video)
  hlsVideoElement = video
  hlsVideoClickHandler = onVideoClick

  const onReadyPlay = () => {
    ensureH5VideoPlaying(video)
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 6,
      maxBufferLength: 10,
      maxMaxBufferLength: 30,
    })
    hlsInstance = hls
    hls.on(Hls.Events.MEDIA_ATTACHED, onReadyPlay)
    hls.on(Hls.Events.MANIFEST_PARSED, onReadyPlay)
    hls.attachMedia(video)
    hls.loadSource(url)
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          if (!hlsHttpFallbackUsed.value && originalUrl.startsWith('https://')) {
            console.warn('[HLS] HTTPS 加载失败，尝试 HTTP 降级...')
            hlsHttpFallbackUsed.value = true
            destroyH5HlsPlayer()
            nextTick(() => initH5HlsPlayer(true))
          } else {
            console.error('[HLS] 网络错误，尝试重连...')
            hls.startLoad()
          }
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('[HLS] 媒体错误，尝试恢复...')
          hls.recoverMediaError()
          break
        default:
          console.error('[HLS] 致命错误:', data)
          destroyH5HlsPlayer()
          break
      }
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.addEventListener('loadedmetadata', onReadyPlay)
    video.addEventListener('canplay', onReadyPlay)
  } else {
    console.error('[HLS] 当前浏览器不支持 HLS')
  }
  // #endif
}

/** 销毁 H5 HLS 播放器 */
function destroyH5HlsPlayer() {
  // #ifdef H5
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
  if (hlsVideoElement) {
    if (hlsVideoClickHandler) {
      hlsVideoElement.removeEventListener('click', hlsVideoClickHandler)
      hlsVideoClickHandler = null
    }
    hlsVideoElement.remove()
    hlsVideoElement = null
  }
  // #endif
}

function buildMessagePayload(content: string) {
  const userInfo = isLogin() || {}
  return {
    liveRoomId: liveId.value,
    liveName: roomInfo.value.title,
    liveUserId: liveUser.value?.id || liveUser.value?.userId || userInfo.id,
    userId: liveUser.value?.userId || userInfo.id,
    userName: liveUser.value?.userName || userInfo.nickName || userInfo.username,
    userFace: liveUser.value?.userFace || userInfo.face,
    message: content,
    imGroupId: roomInfo.value.imGroupId,
  }
}

function appendMessage(msg: any) {
  messageList.value.push(msg)
  nextTick(() => {
    scrollToView.value = 'msg-' + (messageList.value.length - 1)
  })
}

async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content) {
    if (!isLogin('auth')) {
      goLogin()
    }
    return
  }

  if (!requireLogin()) return

  if (!liveUser.value) {
    await registerLiveUser()
    if (!liveUser.value) {
      uni.showToast({ title: '进入直播间失败，请重试', icon: 'none' })
      return
    }
  }
  if (liveUser.value.muteFlag) {
    uni.showToast({ title: '您已被禁言', icon: 'none' })
    return
  }
  if (sending.value) return

  sending.value = true
  try {
    const res = await sendLiveMessage(buildMessagePayload(content))
    if (res.data.success) {
      inputMessage.value = ''
    } else {
      uni.showToast({ title: res.data.message || '发送失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    sending.value = false
  }
}

watch(
  () => roomInfo.value.pullStreamUrl,
  () => syncH5Player()
)

watch(isLiving, () => syncH5Player())

watch(isVerticalMode, () => {
  // 横竖屏模板切换会销毁重建播放器容器 DOM，需重新挂载播放器
  lastHlsPullUrl.value = ''
  nextTick(() => syncH5Player())
})

onLoad((options) => {
  liveId.value = parseLiveId(options || {})

  if (!liveId.value) {
    uni.showToast({ title: '无效的直播链接', icon: 'none' })
    setTimeout(() => goBackOrHome(), 1500)
    return
  }
  initLiveRoom()
})

onShow(() => {
  if (liveId.value && isLogin('auth')) {
    if (!liveUser.value) {
      registerLiveUser()
    } else {
      initLiveChat()
    }
    fetchPollingData(false)
  }
  if (liveId.value && !pollTimer.value) {
    startPolling()
  }
  if (liveId.value && liveMqttService && !liveMqttService.isConnected()) {
    initLiveMqtt()
  }
  syncH5Player()
})

onHide(() => {
  stopPolling()
})

onUnload(() => {
  stopPolling()
  cleanupLiveMqtt()
  cleanupLiveChat()
  destroyH5HlsPlayer()
})

// #ifdef MP-WEIXIN
onShareTimeline(() => ({
  title: roomInfo.value.title || '直播间',
  query: `id=${liveId.value}`,
  imageUrl: roomInfo.value.coverImg || '',
}))
// #endif
</script>

<style lang="scss" scoped>
@import "./live.scss";
@import "./live-vertical.scss";
</style>
