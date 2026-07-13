<template>
  <view class="comment">
    <u-navbar
      title="商品评价"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>
    <view class="top-tab">
      <view class="tab-btn" v-if="commentDetail">
        <view @click="select(0)" :class="{ cur: selectIndex == 0 }">全部</view>
        <view @click="select(1)" :class="{ cur: selectIndex == 1 }">好评{{ commentDetail.good }}</view>
        <view @click="select(2)" :class="{ cur: selectIndex == 2 }">中评{{ commentDetail.moderate }}</view>
        <view @click="select(3)" :class="{ cur: selectIndex == 3 }">差评{{ commentDetail.worse }}</view>
        <view @click="select(4)" :class="{ cur: selectIndex == 4 }">有图{{ commentDetail.haveImage }}</view>
      </view>
    </view>
    <view class="goodsBoxOver">
      <view class="scoll-page">
        <view class="eva-section">
          <view class="empty" v-if="commDetail.length < 1">
            <u-empty mode="message" text="暂无评论"></u-empty>
          </view>
          <view class="eva-box" v-for="(item, index) in commDetail" :key="index">
            <view class="section-info">
              <image class="portrait" :src="item.memberProfile || userImage" mode="aspectFill"></image>
              <view class="star-content">
                <text class="name">{{ noPassByName(item.memberName) }}</text>
                <text class="time">{{ item.createTime }}</text>
              </view>
              <view class="stars">
                <text
                  v-for="starIndex in 5"
                  :key="starIndex"
                  class="star-item"
                  :class="{ active: commentScore(item) >= starIndex }"
                ></text>
              </view>
            </view>
            <view class="section-contant">
              <view class="content">{{ item.content }}</view>
              <view class="img-list" v-if="splitImg(item.images)">
                <u-image
                  v-for="(img, i) in splitImg(item.images)"
                  :key="i"
                  class="comment-img"
                  width="160rpx"
                  height="160rpx"
                  mode="aspectFill"
                  border-radius="12"
                  :src="img"
                  @click="preview(splitImg(item.images), i)"
                ></u-image>
              </view>
              <view class="bot">
                <text class="attr">{{ item.goodsName }} - {{ gradeList[item.grade] }}</text>
              </view>
            </view>
            <view class="commentStyle" v-if="item.reply">
              商家回复：
              <text class="addCommentSpan">{{ item.reply }}</text>
              <view class="img-list" v-if="splitImg(item.replyImage)">
                <u-image
                  v-for="(replyImg, replyIndex) in splitImg(item.replyImage)"
                  :key="replyIndex"
                  class="comment-img"
                  width="160rpx"
                  height="160rpx"
                  mode="aspectFill"
                  border-radius="12"
                  :src="replyImg"
                  @click="preview(splitImg(item.replyImage), replyIndex)"
                ></u-image>
              </view>
            </view>
          </view>
          <u-loadmore bg-color="transparent" style="margin:40rpx 0" :status="status" @loadmore="loadmore()" icon-type="iconType" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import * as membersApi from '@/api/members.js'
import configs from '@/config/config'
import { noPassByName } from '@/utils/filters.js'

const status = ref('loadmore')
const userImage = configs.defaultUserPhoto
const commentDetail = ref<any>('')
const selectIndex = ref(0)
const params = reactive<any>({
  pageNumber: 1,
  pageSize: 10,
  grade: '',
})
const gradeList: Record<string, string> = {
  GOOD: '好评',
  MODERATE: '中评',
  WORSE: '差评',
  HAVEIMAGE: '有图',
}
const commDetail = ref<any[]>([])
const opid = ref('')

function commentScore(item: any) {
  return item.descriptionScore || item.deliveryScore || 0
}

function splitImg(val: any) {
  if (val && val.split(',')) {
    return val.split(',')
  } else if (val) {
    return val
  } else {
    return false
  }
}

function getGoodsCommentsFun(id: string) {
  status.value = 'loading'
  membersApi.getGoodsComments(id, params).then((res) => {
    if (
      res.data.result.records == [] ||
      res.data.result.records == '' ||
      res.data.result.records == null
    ) {
      status.value = 'noMore'
      return false
    }
    commDetail.value = commDetail.value.concat(res.data.result.records)
    status.value = 'loadmore'
  })
}

function getGoodsCommentsNum(id: string) {
  membersApi.getGoodsCommentsCount(id).then((res) => {
    if (res.statusCode === 200) {
      commentDetail.value = res.data.result
    }
  })
}

function select(index: number) {
  Object.assign(params, {
    pageNumber: 1,
    pageSize: 10,
  })
  selectIndex.value = index
  params.grade = ['', 'GOOD', 'MODERATE', 'WORSE', ''][selectIndex.value]
  if (selectIndex.value === 4) {
    params.haveImage = 1
  }
  commDetail.value = []
  if (selectIndex.value === 0) {
    Object.assign(params, {
      pageNumber: 1,
      pageSize: 10,
      grade: '',
    })
  }
  getGoodsCommentsFun(opid.value)
}

function preview(urls: string[], index: number) {
  uni.previewImage({
    current: index,
    urls: urls,
    longPressActions: {
      itemList: ['保存图片'],
      success: function () {
        uni.showToast({
          title: '保存成功',
          duration: 2000,
          icon: 'none',
        })
      },
      fail: function () {
        uni.showToast({
          title: '保存失败',
          duration: 2000,
          icon: 'none',
        })
      },
    },
  })
}

function loadmore() {
  params.pageNumber++
  getGoodsCommentsFun(opid.value)
}

onLoad((options: any) => {
  getGoodsCommentsFun(options.id)
  getGoodsCommentsNum(options.id)
  opid.value = options.id
})

onReachBottom(() => {
  params.pageNumber++
  getGoodsCommentsFun(opid.value)
})
</script>

<style lang="scss" scoped>
page {
  background: #f7f7f7;
}

.comment {
  min-height: 100vh;
  color: #333;
  background: #f7f7f7;

  .top-tab {
    margin: 0 20rpx 20rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx 24rpx 4rpx;
    font-size: 24rpx;

    .tab-btn {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      view {
        min-width: 118rpx;
        text-align: center;
        height: 50rpx;
        line-height: 50rpx;
        padding: 0 20rpx;
        background: #f8f8fe;
        border-radius: 25rpx;

        &.cur {
          background: $aider-light-color;
          color: #fff;
        }
      }
    }
  }

  .eva-section {
    padding: 0 20rpx 20rpx;

    .eva-box {
      padding: 32rpx 30rpx;
      margin-bottom: 20rpx;
      background: #fff;
      border-radius: 20rpx;

      .section-info {
        display: flex;
        align-items: flex-start;

        .portrait {
          flex-shrink: 0;
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          margin-right: 20rpx;
        }

        .star-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 4rpx;

          .name {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
          }

          .time {
            margin-top: 8rpx;
            font-size: 24rpx;
            color: #999;
            line-height: 1.4;
          }
        }

        .stars {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6rpx;
          padding-top: 8rpx;

          .star-item {
            width: 28rpx;
            height: 28rpx;
            background: url("/static/star.png");
            background-size: 100%;
            opacity: 0.25;

            &.active {
              opacity: 1;
            }
          }
        }
      }

      .section-contant {
        .content {
          font-size: 26rpx;
          line-height: 1.6;
          color: #333;
          padding: 20rpx 0 12rpx;
        }

        .img-list {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;
          margin-bottom: 8rpx;
        }

        .bot {
          margin-top: 8rpx;
          padding-top: 8rpx;

          .attr {
            font-size: 22rpx;
            color: #999;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

.commentStyle {
  margin-top: 20rpx;
  padding: 20rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.6;
}

.addCommentSpan {
  color: $u-tips-color !important;
  font-weight: 400;
}

.empty {
  padding: 200rpx 0;
  color: #999;
  text-align: center;
}
</style>
