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
          @error="onPlayerError"
        />
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
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
      <view class="message-container" :style="{ height: scrollViewHeight + 'px' }">
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

      <view v-if="showChatBar" class="bottom-actions">
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
          @error="onPlayerError"
        />
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
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

    <view class="bottom-container">
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

      <view class="message-container" :style="{ height: scrollViewHeight + 'px' }">
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
              <text class="coupon-price-value"><text style="font-size:28rpx">¥</text>{{ unitPrice(item.couponPrice) }}</text>
            </view>
            <view class="coupon-card-right">
              <text class="coupon-card-name">{{ item.couponName }}</text>
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

<script>
import config from "@/config/config";
import { getLivePollingData, registerLiveViewUser, receiveLiveCoupon, sendLiveMessage } from "@/api/live.js";
import { LiveMqttService } from "./utils/liveMqtt.js";
import { LiveChatService } from "./utils/liveChat.js";
import { parseRecommendMessageArray, findRecommendPayload } from "./utils/liveRecommend.js";

const POLL_INTERVAL = 5000;

const LIVE_STATUS = {
  NEW: "NEW",
  LIVING: "LIVING",
  PAUSED: "PAUSED",
  ENDED: "ENDED",
};

const STATUS_LABEL = {
  [LIVE_STATUS.NEW]: "新直播",
  [LIVE_STATUS.LIVING]: "直播中",
  [LIVE_STATUS.PAUSED]: "已暂停",
  [LIVE_STATUS.ENDED]: "已结束",
};

export default {
  data() {
    return {
      liveId: "",
      loading: true,
      roomInfo: {},
      liveUser: null,
      messageList: [],
      inputMessage: "",
      sending: false,
      scrollToView: "",
      pollTimer: null,
      goodsList: [],
      liveCoupon: [],
      liveCouponReceives: [],
      currentTab: 0,
      scrollViewHeight: 400,
      showGoodsModal: false,
      showCouponModal: false,
      isUIVisible: true,
      showBottomPopup: false,
      popupType: "",
      popupTitle: "",
      defaultAvatar: config.defaultUserPhoto,
      claimingCouponId: "",
      showRecommendCouponModal: false,
      recommendCouponItem: null,
      shownRecommendCouponIds: [],
      liveMqttService: null,
      liveChatService: null,
    };
  },
  computed: {
    isLiving() {
      return this.roomInfo.liveStatus === LIVE_STATUS.LIVING;
    },
    showCover() {
      return !this.isLiving || !this.roomInfo.pullStreamUrl;
    },
    statusText() {
      return STATUS_LABEL[this.roomInfo.liveStatus] || "直播间";
    },
    statusClass() {
      const status = this.roomInfo.liveStatus;
      return {
        living: status === LIVE_STATUS.LIVING,
        pending: status === LIVE_STATUS.NEW,
        paused: status === LIVE_STATUS.PAUSED,
        ended: status === LIVE_STATUS.ENDED,
      };
    },
    playerLayoutClass() {
      const mode = String(this.roomInfo.displayMode);
      if (mode === "2") return "layout-triple";
      return "layout-horizontal";
    },
    objectFit() {
      return String(this.roomInfo.displayMode) === "1" ? "fillCrop" : "contain";
    },
    isVerticalMode() {
      return String(this.roomInfo.displayMode) === "1";
    },
    showChatBar() {
      return this.roomInfo.liveStatus !== LIVE_STATUS.ENDED;
    },
    canSend() {
      if (!this.showChatBar || this.sending) return false;
      if (!this.isLogin("auth")) return false;
      if (this.liveUser?.muteFlag) return false;
      return true;
    },
    chatPlaceholder() {
      if (this.roomInfo.liveStatus === LIVE_STATUS.ENDED) return "直播已结束";
      if (!this.isLogin("auth")) return "登录后发言";
      if (this.liveUser?.muteFlag) return "您已被禁言";
      return "说点什么...";
    },
    visibleGoodsList() {
      return (this.goodsList || []).filter((item) => !item.hideFlag);
    },
    visibleCouponList() {
      return (this.liveCoupon || []).filter((item) => !item.hideFlag);
    },
    recommendGoods() {
      return this.visibleGoodsList.find((item) => item.recommend === true) || null;
    },
    hasClaimableCoupon() {
      return this.visibleCouponList.some((item) => !this.isCouponReceived(item.couponId));
    },
  },
  onLoad(options) {
    this.liveId = this.parseLiveId(options);
    const systemInfo = uni.getSystemInfoSync();
    this.scrollViewHeight = Math.max(systemInfo.windowHeight - (this.isVerticalMode ? 320 : 480), 240);

    if (!this.liveId) {
      uni.showToast({ title: "无效的直播链接", icon: "none" });
      setTimeout(() => this.goBackOrHome(), 1500);
      return;
    }
    this.initLiveRoom();
  },
  onShow() {
    if (this.liveId && this.isLogin("auth")) {
      if (!this.liveUser) {
        this.registerLiveUser();
      } else {
        this.initLiveChat();
      }
      this.fetchPollingData(false);
    }
    if (this.liveId && !this.pollTimer) {
      this.startPolling();
    }
    if (this.liveId && this.liveMqttService && !this.liveMqttService.isConnected()) {
      this.initLiveMqtt();
    }
  },
  onHide() {
    this.stopPolling();
  },
  onUnload() {
    this.stopPolling();
    this.cleanupLiveMqtt();
    this.cleanupLiveChat();
  },
  // #ifdef MP-WEIXIN
  onShareTimeline() {
    return {
      title: this.roomInfo.title || "直播间",
      query: `id=${this.liveId}`,
      imageUrl: this.roomInfo.coverImg || "",
    };
  },
  // #endif
  methods: {
    parseLiveId(options) {
      let id = options.id || options.roomId || "";
      // #ifdef MP-WEIXIN
      if (!id && options.scene) {
        const scene = decodeURIComponent(options.scene);
        const matched = scene.match(/(?:^|&)id=([^&]+)/);
        id = matched ? matched[1] : scene;
      }
      // #endif
      return id;
    },
    goBackOrHome() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({ url: "/pages/tabbar/home/index" });
      }
    },
    /** 跳转登录页，登录成功后 navigateBack 返回直播间 */
    goLogin() {
      this.navigateToLogin("navigateTo");
    },
    /** 校验登录，未登录则跳转登录页 */
    requireLogin() {
      if (this.isLogin("auth")) return true;
      this.goLogin();
      return false;
    },
    onChatInputTap() {
      if (!this.isLogin("auth")) {
        this.goLogin();
      }
    },
    onChatFocus() {
      if (!this.isLogin("auth")) {
        uni.hideKeyboard();
        this.goLogin();
      }
    },
    switchTab(index) {
      this.currentTab = index;
    },
    toggleUI() {
      if (this.showBottomPopup) return;
      this.isUIVisible = !this.isUIVisible;
    },
    showIntroPopup() {
      this.popupType = "intro";
      this.popupTitle = "直播介绍";
      this.showBottomPopup = true;
      this.isUIVisible = true;
    },
    closeBottomPopup() {
      this.showBottomPopup = false;
      this.popupType = "";
      this.popupTitle = "";
    },
    openGoodsModal() {
      if (this.isVerticalMode) {
        this.popupType = "goods";
        this.popupTitle = "商品列表";
        this.showBottomPopup = true;
      } else {
        this.showGoodsModal = true;
      }
    },
    closeGoodsModal() {
      this.showGoodsModal = false;
    },
    isGoodsSoldOut(item) {
      return item?.sellOutFlag === true || item?.soldOutFlag === true;
    },
    openCouponModal() {
      this.showCouponModal = true;
    },
    closeCouponModal() {
      this.showCouponModal = false;
    },
    closeRecommendCouponModal() {
      this.showRecommendCouponModal = false;
    },
    showRecommendCouponFromPayload(coupon) {
      if (!coupon || this.isCouponReceived(coupon.couponId)) return;
      const key = coupon.id || coupon.couponId;
      if (this.shownRecommendCouponIds.includes(key)) return;
      this.shownRecommendCouponIds.push(key);
      this.recommendCouponItem = coupon;
      this.showRecommendCouponModal = true;
    },
    updateRecommendCouponPopup() {
      const found = this.visibleCouponList.find(
        (item) =>
          item.recommend === true &&
          !this.isCouponReceived(item.couponId) &&
          !this.shownRecommendCouponIds.includes(item.id || item.couponId)
      );
      if (!found) return;
      this.showRecommendCouponFromPayload(found);
    },
    onClaimRecommendCoupon() {
      if (!this.recommendCouponItem) return;
      this.onClaimCoupon(this.recommendCouponItem);
    },
    onClaimCoupon(item) {
      if (!this.requireLogin()) return;
      if (this.isCouponReceived(item.couponId)) return;
      if (this.claimingCouponId) return;

      this.claimingCouponId = item.couponId;
      receiveLiveCoupon(this.liveId, item.couponId)
        .then(async (res) => {
          if (res.data.success) {
            uni.showToast({ title: "领取成功", icon: "none" });
            await this.fetchPollingData(false);
            this.closeRecommendCouponModal();
          } else {
            uni.showToast({ title: res.data.message || "领取失败", icon: "none" });
          }
        })
        .catch(() => {
          uni.showToast({ title: "领取失败", icon: "none" });
        })
        .finally(() => {
          this.claimingCouponId = "";
        });
    },
    isCouponReceived(couponId) {
      return (this.liveCouponReceives || []).some((item) => item.couponId === couponId);
    },
    setupShare() {
      const shareConfig = {
        title: this.roomInfo.title || "直播间",
        path: `/pages/live/room?id=${this.liveId}`,
        imageUrl: this.roomInfo.coverImg || "",
      };
      // #ifdef MP-WEIXIN
      if (this.$u) {
        this.$u.mpShare = shareConfig;
      }
      uni.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
      });
      // #endif
    },
    async initLiveRoom() {
      const ok = await this.fetchPollingData(true);
      if (!ok) return;
      this.setupShare();
      if (this.roomInfo.title) {
        uni.setNavigationBarTitle({ title: this.roomInfo.title });
      }
      const systemInfo = uni.getSystemInfoSync();
      this.scrollViewHeight = Math.max(
        systemInfo.windowHeight - (this.isVerticalMode ? 320 : 480),
        240
      );
      if (this.isLogin("auth")) {
        await this.registerLiveUser();
      }
      this.startPolling();
      this.initLiveMqtt();
    },
    async initLiveChat() {
      if (!this.isLogin("auth")) return;

      const groupId = this.roomInfo.imGroupId || this.roomInfo.groupId;
      if (!groupId) {
        console.warn("imGroupId 不存在，跳过 IM 初始化");
        return;
      }

      if (!this.liveUser?.userSig) {
        await this.registerLiveUser();
      }
      if (!this.liveUser?.userSig) {
        console.warn("userSig 不存在，跳过 IM 初始化");
        return;
      }

      if (!this.liveChatService) {
        const userInfo = this.isLogin() || {};
        this.liveChatService = new LiveChatService({
          liveId: this.liveId,
          userInfo,
          defaultAvatar: this.defaultAvatar,
          onMessagesChange: (messages) => {
            this.messageList = messages;
          },
          onScrollToBottom: () => {
            this.$nextTick(() => {
              if (this.messageList.length) {
                this.scrollToView = "msg-" + (this.messageList.length - 1);
              }
            });
          },
        });
      }

      this.liveChatService.userInfo = this.isLogin() || {};
      this.liveChatService.setGroupID(groupId);
      await this.liveChatService.initTencentIm(this.liveUser);
    },
    cleanupLiveChat() {
      if (this.liveChatService) {
        this.liveChatService.cleanup();
        this.liveChatService = null;
      }
    },
    getMqttUserId() {
      const userInfo = this.isLogin() || {};
      return userInfo.id || userInfo.userId || this.liveUser?.userId || `guest-${this.liveId}`;
    },
    initLiveMqttHandlers() {
      if (!this.liveMqttService) return;
      this.liveMqttService.setMessageHandlers({
        onLiveMessage: (message) => this.handleMqttLiveMessage(message),
        onGoodsMessage: (message) => this.handleMqttGoodsMessage(message),
        onCouponMessage: (message) => this.handleMqttCouponMessage(message),
        onBlacklistMessage: () => this.handleMqttBlacklistMessage(),
        onPushStream: () => this.handleMqttPushStreamMessage(),
      });
    },
    initLiveMqtt() {
      if (!this.liveId) return;
      if (!this.liveMqttService) {
        this.liveMqttService = new LiveMqttService(this.liveId, this.getMqttUserId());
      } else {
        this.liveMqttService.userId = this.getMqttUserId();
      }
      this.initLiveMqttHandlers();
      if (!this.liveMqttService.isConnected() && !this.liveMqttService.mqttClient) {
        this.liveMqttService.initMqtt();
      }
    },
    cleanupLiveMqtt() {
      if (this.liveMqttService) {
        this.liveMqttService.cleanup();
        this.liveMqttService = null;
      }
    },
    normalizeMqttLiveStatus(status) {
      if (typeof status === "string") {
        const upper = status.toUpperCase();
        const map = {
          NEW: LIVE_STATUS.NEW,
          NOT_STARTED: LIVE_STATUS.NEW,
          START: LIVE_STATUS.LIVING,
          LIVING: LIVE_STATUS.LIVING,
          END: LIVE_STATUS.ENDED,
          ENDED: LIVE_STATUS.ENDED,
          PAUSE: LIVE_STATUS.PAUSED,
          PAUSED: LIVE_STATUS.PAUSED,
        };
        return map[upper] || status;
      }
      const numMap = {
        0: LIVE_STATUS.NEW,
        1: LIVE_STATUS.LIVING,
        2: LIVE_STATUS.ENDED,
        3: LIVE_STATUS.PAUSED,
      };
      return numMap[status] ?? this.roomInfo.liveStatus;
    },
    handleMqttLiveMessage(message) {
      try {
        const data = JSON.parse(message);
        const updates = {};
        if (data.liveStatus !== undefined) {
          updates.liveStatus = this.normalizeMqttLiveStatus(data.liveStatus);
        }
        if (data.pullStreamUrl) {
          updates.pullStreamUrl = data.pullStreamUrl;
        }
        if (Object.keys(updates).length) {
          this.roomInfo = { ...this.roomInfo, ...updates };
        }
        if (updates.liveStatus === LIVE_STATUS.ENDED) {
          this.stopPolling();
        }
      } catch (error) {
        console.error("处理直播 MQTT 消息失败:", error);
      }
    },
    handleMqttGoodsMessage(message) {
      console.log("收到商品 MQTT 消息:", message);
      const goodsMessageList = parseRecommendMessageArray(message);
      if (goodsMessageList.length) {
        this.goodsList = goodsMessageList;
      }
      this.fetchPollingData(false);
    },
    handleMqttCouponMessage(message) {
      console.log("收到优惠券 MQTT 消息:", message);
      const couponMessageList = parseRecommendMessageArray(message);
      const recommendCoupon = findRecommendPayload(couponMessageList);
      if (recommendCoupon) {
        this.showRecommendCouponFromPayload(recommendCoupon);
      } else {
        this.closeRecommendCouponModal();
      }
      this.fetchPollingData(false);
    },
    handleMqttBlacklistMessage() {
      uni.showModal({
        title: "提示",
        content: "您已被限制进入直播间",
        showCancel: false,
        success: () => this.goBackOrHome(),
      });
    },
    handleMqttPushStreamMessage() {
      if (this.roomInfo.liveStatus !== LIVE_STATUS.LIVING) {
        this.roomInfo = { ...this.roomInfo, liveStatus: LIVE_STATUS.LIVING };
      }
    },
    startPolling() {
      this.stopPolling();
      this.pollTimer = setInterval(() => {
        this.fetchPollingData(false);
      }, POLL_INTERVAL);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    applyPollingData(data) {
      if (!data) return;
      if (data.liveDetail) {
        this.roomInfo = data.liveDetail;
      }
      if (data.goodsList) {
        this.goodsList = data.goodsList;
      }
      if (data.liveCoupon) {
        this.liveCoupon = data.liveCoupon;
        this.updateRecommendCouponPopup();
      }
      if (data.liveCouponReceives) {
        this.liveCouponReceives = data.liveCouponReceives;
        if (
          this.recommendCouponItem &&
          this.isCouponReceived(this.recommendCouponItem.couponId)
        ) {
          this.closeRecommendCouponModal();
        }
      }
      if (this.roomInfo.liveStatus === LIVE_STATUS.ENDED) {
        this.stopPolling();
      }
    },
    async fetchPollingData(isInit = false) {
      if (isInit) this.loading = true;
      try {
        const res = await getLivePollingData(this.liveId);
        if (res.data.success && res.data.result) {
          this.applyPollingData(res.data.result);
          if (isInit && !res.data.result.liveDetail) {
            uni.showToast({ title: "直播间不存在", icon: "none" });
            setTimeout(() => this.goBackOrHome(), 1500);
            return false;
          }
          return true;
        }
        if (isInit) {
          uni.showToast({ title: res.data.message || "直播间不存在", icon: "none" });
          setTimeout(() => this.goBackOrHome(), 1500);
        }
        return false;
      } catch (e) {
        if (isInit) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
        return false;
      } finally {
        if (isInit) this.loading = false;
      }
    },
    goGoods(item) {
      if (this.isGoodsSoldOut(item)) return;
      if (!item.canBuyFlag) {
        uni.showToast({ title: "暂不可购买", icon: "none" });
        return;
      }
      uni.navigateTo({
        url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
      });
    },
    async registerLiveUser() {
      if (!this.isLogin("auth")) return;
      try {
        const res = await registerLiveViewUser(this.liveId);
        if (res.data.success && res.data.result) {
          this.liveUser = res.data.result;
          await this.initLiveChat();
        }
      } catch (e) {
        console.error("register live user failed:", e);
      }
    },
    formatCount(val) {
      const num = Number(val) || 0;
      if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
      return num;
    },
    onPlayerError(e) {
      console.error("live player error:", e.detail);
      uni.showToast({ title: "直播加载失败", icon: "none" });
    },
    buildMessagePayload(content) {
      const userInfo = this.isLogin() || {};
      return {
        liveRoomId: this.liveId,
        liveName: this.roomInfo.title,
        liveUserId: this.liveUser?.id || this.liveUser?.userId || userInfo.id,
        userId: this.liveUser?.userId || userInfo.id,
        userName: this.liveUser?.userName || userInfo.nickName || userInfo.username,
        userFace: this.liveUser?.userFace || userInfo.face,
        message: content,
        imGroupId: this.roomInfo.imGroupId,
      };
    },
    appendMessage(msg) {
      this.messageList.push(msg);
      this.$nextTick(() => {
        this.scrollToView = "msg-" + (this.messageList.length - 1);
      });
    },
    async sendMessage() {
      const content = this.inputMessage.trim();
      if (!content) {
        if (!this.isLogin("auth")) {
          this.goLogin();
        }
        return;
      }

      if (!this.requireLogin()) return;

      if (!this.liveUser) {
        await this.registerLiveUser();
        if (!this.liveUser) {
          uni.showToast({ title: "进入直播间失败，请重试", icon: "none" });
          return;
        }
      }
      if (this.liveUser.muteFlag) {
        uni.showToast({ title: "您已被禁言", icon: "none" });
        return;
      }
      if (this.sending) return;

      this.sending = true;
      try {
        const res = await sendLiveMessage(this.buildMessagePayload(content));
        if (res.data.success) {
          this.inputMessage = "";
        } else {
          uni.showToast({ title: res.data.message || "发送失败", icon: "none" });
        }
      } catch (e) {
        uni.showToast({ title: "发送失败", icon: "none" });
      } finally {
        this.sending = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./live.scss";
@import "./live-vertical.scss";
</style>
