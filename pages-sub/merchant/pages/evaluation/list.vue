<template>
  <view class="merchant-evaluation-page">
    <!-- 顶部 Tab 过滤 -->
    <view class="sticky-header">
      <view class="tab-scroll-wrap">
        <view
          class="tab-item"
          v-for="item in tabList"
          :key="item.key"
          :class="{ active: currentTab === item.key }"
          @click="switchTab(item.key)"
        >
          <text class="tab-label">{{ item.label }}</text>
          <view class="indicator" v-if="currentTab === item.key"></view>
        </view>
      </view>
    </view>

    <!-- 评价列表主体 -->
    <view class="eval-list-body">
      <view
        class="eval-card"
        v-for="item in evalList"
        :key="item.id"
      >
        <!-- 头部：买家信息与星级 -->
        <view class="eval-header">
          <view class="user-box">
            <image
              class="user-avatar"
              :src="item.memberProfile || '/static/tabbar/home.png'"
              mode="aspectFill"
            ></image>
            <view class="user-meta">
              <text class="user-name">{{ maskName(item.memberName) }}</text>
              <text class="eval-time">{{ item.createTime || '--' }}</text>
            </view>
          </view>
          <!-- 评分 -->
          <view class="rating-stars">
            <u-icon
              v-for="star in 5"
              :key="star"
              name="star-fill"
              size="14"
              :color="star <= (item.descriptionScore || 5) ? '#f59e0b' : '#e5e7eb'"
            ></u-icon>
          </view>
        </view>

        <!-- 评价文字内容 -->
        <view class="eval-content">
          <text class="content-text">{{ item.content || '用户未填写文字评价' }}</text>
        </view>

        <!-- 买家晒图 -->
        <view class="eval-images" v-if="getImages(item.images).length > 0">
          <image
            class="eval-pic"
            v-for="(img, idx) in getImages(item.images)"
            :key="idx"
            :src="img"
            mode="aspectFill"
            @click="previewImages(getImages(item.images), idx)"
          ></image>
        </view>

        <!-- 关联商品简要信息 -->
        <view class="goods-snippet" v-if="item.goodsName">
          <image
            class="goods-snippet-img"
            :src="item.goodsImage || '/static/tabbar/home.png'"
            mode="aspectFill"
          ></image>
          <text class="goods-snippet-title">{{ item.goodsName }}</text>
        </view>

        <!-- 商家已回复内容 -->
        <view class="seller-reply-box" v-if="item.reply">
          <view class="reply-title-row">
            <text class="reply-tag">掌柜回复：</text>
            <text class="reply-time" v-if="item.replyTime">{{ item.replyTime }}</text>
          </view>
          <text class="reply-text">{{ item.reply }}</text>
        </view>

        <!-- 回复动作条 -->
        <view class="eval-footer">
          <view
            class="reply-trigger-btn"
            @click="openReplyModal(item)"
          >
            <u-icon name="chat" size="14" :color="item.reply ? '#6b7280' : '#ffffff'"></u-icon>
            <text :class="{ 'is-replied': item.reply }">
              {{ item.reply ? '修改回复' : '立即回复' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && evalList.length === 0">
        <u-icon name="chat" size="56" color="#d1d5db"></u-icon>
        <text class="empty-text">暂无相关评价数据</text>
      </view>

      <!-- 加载提示 -->
      <view class="loading-more" v-if="loading">
        <text>正在加载评价数据...</text>
      </view>
      <view class="no-more" v-else-if="finished && evalList.length > 0">
        <text>没有更多了</text>
      </view>
    </view>

    <!-- 回复弹窗 -->
    <view class="reply-modal-mask" v-if="showReplyModal" @click.self="closeReplyModal">
      <view class="reply-modal-card">
        <view class="modal-header">
          <text class="modal-title">回复买家评价</text>
          <view class="close-btn" @click="closeReplyModal">
            <u-icon name="close" size="18" color="#9ca3af"></u-icon>
          </view>
        </view>

        <view class="modal-body">
          <textarea
            class="reply-textarea"
            v-model="replyText"
            placeholder="请输入真诚的掌柜回复内容，让买家感受到热情与专业..."
            placeholder-class="placeholder"
            maxlength="300"
          ></textarea>
          <view class="char-count">
            <text>{{ replyText.length }}/300</text>
          </view>
        </view>

        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeReplyModal">取消</view>
          <view
            class="modal-btn confirm"
            :class="{ loading: submittingReply }"
            @click="submitReply"
          >
            {{ submittingReply ? '提交中...' : '提交回复' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getStoreEvaluationList, replyStoreEvaluation } from '../../api/evaluation.js'

const currentTab = ref('ALL')
const loading = ref(false)
const finished = ref(false)
const pageNumber = ref(1)
const pageSize = ref(10)
const evalList = ref([])

const showReplyModal = ref(false)
const currentEval = ref(null)
const replyText = ref('')
const submittingReply = ref(false)

const tabList = [
  { key: 'ALL', label: '全部' },
  { key: 'GOOD', label: '好评' },
  { key: 'POOR', label: '中差评' },
  { key: 'UNREPLIED', label: '待回复' },
]

onLoad(() => {
  fetchEvaluations(true)
})

onPullDownRefresh(async () => {
  await fetchEvaluations(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value && !loading.value) {
    pageNumber.value++
    fetchEvaluations(false)
  }
})

const fetchEvaluations = async (reset = false) => {
  if (reset) {
    pageNumber.value = 1
    evalList.value = []
    finished.value = false
  }

  loading.value = true
  const params = {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
  }

  if (currentTab.value === 'GOOD') {
    params.grade = 'GOOD'
  } else if (currentTab.value === 'POOR') {
    params.grade = 'POOR'
  } else if (currentTab.value === 'UNREPLIED') {
    params.replyStatus = false
  }

  try {
    const res = await getStoreEvaluationList(params)
    loading.value = false
    if (res.data && res.data.success && res.data.result) {
      const records = res.data.result.records || []
      if (reset) {
        evalList.value = records
      } else {
        evalList.value = [...evalList.value, ...records]
      }
      if (records.length < pageSize.value) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (e) {
    loading.value = false
    finished.value = true
  }
}

const switchTab = (tabKey) => {
  if (currentTab.value === tabKey) return
  currentTab.value = tabKey
  fetchEvaluations(true)
}

const maskName = (name) => {
  if (!name) return '匿名买家'
  if (name.length <= 2) return name[0] + '*'
  return name[0] + '***' + name[name.length - 1]
}

const getImages = (imgs) => {
  if (!imgs) return []
  if (Array.isArray(imgs)) return imgs
  if (typeof imgs === 'string') {
    try {
      const parsed = JSON.parse(imgs)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      return imgs.split(',').filter(Boolean)
    }
  }
  return []
}

const previewImages = (urls, current) => {
  uni.previewImage({
    urls,
    current,
  })
}

// 打开回复弹窗
const openReplyModal = (item) => {
  currentEval.value = item
  replyText.value = item.reply || ''
  showReplyModal.value = true
}

const closeReplyModal = () => {
  showReplyModal.value = false
  currentEval.value = null
  replyText.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyText.value.trim()) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' })
    return
  }
  if (submittingReply.value) return

  submittingReply.value = true
  uni.showLoading({ title: '提交中...' })

  try {
    const res = await replyStoreEvaluation(currentEval.value.id, replyText.value.trim())
    uni.hideLoading()
    submittingReply.value = false

    if (res.data && res.data.success) {
      uni.showToast({ title: '回复成功', icon: 'success' })
      closeReplyModal()
      fetchEvaluations(true)
    } else {
      uni.showToast({
        title: res.data?.message || '回复失败',
        icon: 'none',
      })
    }
  } catch (e) {
    uni.hideLoading()
    submittingReply.value = false
    uni.showToast({ title: '网络异常，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.merchant-evaluation-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding-bottom: 40rpx;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .tab-scroll-wrap {
    display: flex;
    border-bottom: 1rpx solid #f0f0f0;
    padding: 0 16rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 24rpx 0;
      position: relative;

      .tab-label {
        font-size: 28rpx;
        color: #6b7280;
        font-weight: 500;
      }

      &.active {
        .tab-label {
          color: #111827;
          font-weight: 700;
        }

        .indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 6rpx;
          background: #111827;
          border-radius: 3rpx;
        }
      }
    }
  }
}

.eval-list-body {
  padding: 24rpx 28rpx;

  .eval-card {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    .eval-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-box {
        display: flex;
        align-items: center;

        .user-avatar {
          width: 72rpx;
          height: 72rpx;
          border-radius: 36rpx;
          background: #f3f4f6;
        }

        .user-meta {
          margin-left: 16rpx;

          .user-name {
            font-size: 26rpx;
            font-weight: 600;
            color: #111827;
            display: block;
          }

          .eval-time {
            font-size: 20rpx;
            color: #9ca3af;
            margin-top: 4rpx;
            display: block;
          }
        }
      }

      .rating-stars {
        display: flex;
        gap: 4rpx;
      }
    }

    .eval-content {
      margin-top: 20rpx;

      .content-text {
        font-size: 28rpx;
        color: #1f2937;
        line-height: 1.5;
        word-break: break-all;
      }
    }

    .eval-images {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-top: 16rpx;

      .eval-pic {
        width: 150rpx;
        height: 150rpx;
        border-radius: 12rpx;
        background: #f3f4f6;
      }
    }

    .goods-snippet {
      display: flex;
      align-items: center;
      background: #f9fafb;
      border-radius: 12rpx;
      padding: 14rpx;
      margin-top: 20rpx;

      .goods-snippet-img {
        width: 64rpx;
        height: 64rpx;
        border-radius: 8rpx;
        background: #e5e7eb;
        flex-shrink: 0;
      }

      .goods-snippet-title {
        font-size: 22rpx;
        color: #4b5563;
        margin-left: 14rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .seller-reply-box {
      margin-top: 20rpx;
      background: #f3f4f6;
      border-left: 6rpx solid #111827;
      border-radius: 8rpx;
      padding: 16rpx 20rpx;

      .reply-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .reply-tag {
          font-size: 24rpx;
          font-weight: 700;
          color: #111827;
        }

        .reply-time {
          font-size: 20rpx;
          color: #9ca3af;
        }
      }

      .reply-text {
        font-size: 26rpx;
        color: #4b5563;
        line-height: 1.4;
      }
    }

    .eval-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f9fafb;

      .reply-trigger-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 10rpx 28rpx;
        border-radius: 12rpx;
        background: #111827;
        color: #ffffff;
        font-size: 24rpx;
        font-weight: 600;

        .is-replied {
          color: #4b5563;
        }

        &:has(.is-replied) {
          background: #f3f4f6;
          border: 1rpx solid #e5e7eb;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;

    .empty-text {
      font-size: 26rpx;
      color: #9ca3af;
      margin-top: 20rpx;
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 24rpx 0;
    font-size: 22rpx;
    color: #9ca3af;
  }
}

/* 回复弹窗 */
.reply-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .reply-modal-card {
    background: #ffffff;
    width: 100%;
    max-width: 640rpx;
    border-radius: 28rpx;
    padding: 36rpx;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      .modal-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #111827;
      }
    }

    .modal-body {
      position: relative;

      .reply-textarea {
        width: 100%;
        height: 240rpx;
        background: #f9fafb;
        border: 1rpx solid #e5e7eb;
        border-radius: 16rpx;
        padding: 20rpx;
        font-size: 28rpx;
        color: #111827;
        box-sizing: border-box;
      }

      .placeholder {
        color: #9ca3af;
        font-size: 26rpx;
      }

      .char-count {
        position: absolute;
        right: 16rpx;
        bottom: 16rpx;
        font-size: 20rpx;
        color: #9ca3af;
      }
    }

    .modal-footer {
      display: flex;
      gap: 20rpx;
      margin-top: 28rpx;

      .modal-btn {
        flex: 1;
        height: 84rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        font-weight: 600;

        &.cancel {
          background: #f3f4f6;
          color: #4b5563;
        }

        &.confirm {
          background: #111827;
          color: #ffffff;

          &.loading {
            opacity: 0.7;
          }
        }
      }
    }
  }
}
</style>
