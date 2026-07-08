<template>
  <view>
    <view class="wrap">
      <view class="u-tabs-box">
        <u-tabs
          :list="list"
          :scrollable="false"
          :inactiveStyle="{ color: '#333' }"
          v-model:current="current"
          class="utabs"
          :lineColor="lightColor"
          :activeStyle="{ color: lightColor }"
          :bg-color="'#ffffff'"
        ></u-tabs>
      </view>
      <swiper class="swiper-box" :current="current" @change="changeSwiper" duration="500">
        <swiper-item v-for="(item, listIndex) in list" :key="listIndex">
          <scroll-view scroll-y :enable-flex="true" class="evaluate-scroll" @scrolltolower="renderData(listIndex)">
            <view class="evaluate-scroll-inner">
            <u-empty text="尚无需要评价的商品" mode="list" v-if="orderList.length == 0"></u-empty>
            <view class="seller-view" v-for="(order, index) in orderList" :key="index">
              <!-- 店铺名称 -->
              <view class="box-title">
                <view class="title_seller_name">
                  {{ order.storeName }}
                </view>
              </view>
              <view v-for="(sku, _index) in order.orderItems" :key="_index">
                <view class="goods-item-view">
                  <view>
                    <u-image border-radius="6rpx" width="132rpx" height="132rpx" class="goods_img" :src="sku.image"
                      alt />
                  </view>
                  <view class="goods-info">
                    <view class="goods-title u-line-2">{{ sku.name }}</view>
                    <view class="text title">{{ gradeList[order.grade] || '' }}</view>
                  </view>
                </view>
                <view class="btn-view u-row-between" v-if="current == 2">
                  <view class="description">
                    <view class="text title">
                      <u-read-more ref="uReadMore" :color="lightColor" text-indent="0">
                        <rich-text :nodes="'评论内容：' + order.content || ''"></rich-text>
                      </u-read-more>
                    </view>

                    <view class="goods-imgs-view" v-if="order.image">
                      <view class="img-view" v-if="order.image" v-for="(img, imgIndex) in order.image.split(',')"
                        :key="imgIndex">
                        <u-image v-if="order.image" @click="
                            preview(order.image.split(','), imgIndex)
                          " width="160rpx" height="160rpx" :src="img"></u-image>
                      </view>
                    </view>
                  </view>
                </view>
                <view class="again-btn" @click="onDetail(order)" v-if="current == 2">
                  <u-tag text="评价详情" shape="circle" mode="plain" type="error" />
                </view>
                <view v-if="current == 1 && sku.commentStatus == 'UNFINISHED'">
                  <view class="evaluate">
                    <view @click="talkCommont(sku)">
                      <u-tag text="发表评价" shape="circle" mode="plain" type="error" />
                    </view>
                  </view>
                </view>
                <view class="tips" v-if="sku.commentStatus">
                  {{groupCommentStatusWay[sku.commentStatus]}}
                </view>
              </view>

            </view>
            <uni-load-more :status="params.loadStatus"></uni-load-more>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getOrderList } from '@/api/order.js'
import { getComments } from '@/api/members.js'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)

const list = [
  { name: '全部订单' },
  { name: '待评价' },
  { name: '已评价' },
]

const gradeList: Record<string, string> = {
  GOOD: '好评',
  MODERATE: '中评',
  WORSE: '差评',
  haveImage: '有图',
}

const groupCommentStatusWay: Record<string, string> = {
  NEW: '新订单，不能进行评论',
  UNFINISHED: '未完成评论',
  WAIT_CHASE: '待追评的评论信息',
  FINISHED: '已经完成评论',
}

const current = ref(0)
const orderList = ref<any[]>([])
const params = reactive<Record<string, any>>({
  pageNumber: 1,
  pageSize: 10,
  loadStatus: 'more',
})

onShow(() => {
  orderList.value = []
  params.pageNumber = 1
  current.value = 0
  loadData()
})

watch(current, (val) => {
  params.pageNumber = 1
  params.loadStatus = 'more'
  orderList.value = []

  if (val == 0) {
    delete params.commentStatus
    loadData()
  } else if (val == 1) {
    params.commentStatus = 'UNFINISHED'
    orderList.value = []
    loadData()
  } else {
    params.commentStatus = 'FINISHED'
    orderList.value = []
    loadComments()
  }
})

function preview(urls: string[], index: number) {
  uni.previewImage({
    current: index,
    urls,
    longPressActions: {
      itemList: ['保存图片'],
      success: () => {},
      fail: () => {},
    },
  })
}

function changeSwiper(e: any) {
  current.value = e.target.current
}

function loadData() {
  uni.showLoading({ title: '加载中' })
  getOrderList(params).then((res) => {
    if (store.state.isShowToast) uni.hideLoading()
    const records = res.data.result.records
    if (records.length < 10) {
      params.loadStatus = 'noMore'
    }
    if (records.length > 0) {
      orderList.value = orderList.value.concat(records)
      params.pageNumber += 1
    }
  })
}

function talkCommont(sku: any) {
  uni.navigateTo({
    url: `./releaseEvaluate?sn=${sku.sn}&sku=${encodeURIComponent(JSON.stringify(sku))}`,
  })
}

function loadComments() {
  uni.showLoading({ title: '加载中' })
  getComments(params).then((res) => {
    if (store.state.isShowToast) uni.hideLoading()
    const records = res.data.result.records
    if (records.length < 10) {
      params.loadStatus = 'noMore'
    }
    records.forEach((item: any) => {
      item.orderItems = [
        {
          image: item.goodsImage,
          name: item.goodsName,
          goodsId: item.goodsId,
          skuId: item.skuId,
        },
      ]
    })
    orderList.value = orderList.value.concat(records)
    params.pageNumber += 1
  })
}

function renderData(index: number) {
  if (params.loadStatus == 'noMore') return
  if (index == 0) {
    loadData()
  } else {
    loadComments()
  }
}

function onDetail(comment: any) {
  uni.navigateTo({
    url: './evaluateDetail?comment=' + encodeURIComponent(JSON.stringify(comment)),
  })
}
</script>
<style lang="scss" scoped>
page {
  height: 100%;
}
.tips {
  text-align: right;
  font-size: 24rpx;
  color: #999;
}
.wrap {
  background: #f6f6f6;
  height: calc(100vh - var(--window-top));
  width: 100%;
}

.goods-imgs-view {
  margin: 20rpx 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  .img-view {
    margin-right: 15rpx;
  }
}
.u-tabs-box {
  position: relative;
  z-index: 10;
  background: #ffffff;
}
.box-content {
  margin: 20rpx 0;
}
.title_seller_name {
  font-weight: 700;
  font-size: 28rpx;
  color: #333;
  padding-left: 0 !important;
}
.box-title {
  height: 90rpx;
  line-height: 90rpx;
}

.swiper-box {
  height: calc(100% - 88rpx);
}

.evaluate-scroll {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.evaluate-scroll-inner {
  width: 100%;
}

.goods-specs {
  margin-bottom: 10rpx;
  color: #cccccc;
  font-size: 24rpx;
}
.goods-price {
  margin-bottom: 10rpx;
  color: #999999;
  font-size: 24rpx;
}
.goods-item-view {
  display: flex;
  margin-bottom: 20rpx;
  .goods-info {
    padding-left: 30rpx;

    .goods-title {
      color: $u-main-color;
      margin-bottom: 10rpx;
    }
  }
  .goods-num {
    margin: 0rpx 10rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 10rpx;
    .u-num {
      color: $aider-light-color;
      font-size: 33rpx;
    }
  }
}
.again-btn {
  margin: 0rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 10rpx;
}
.seller-view {
  background-color: #fff;
  margin: 20rpx 0px;
  padding: 0px 20rpx 20rpx 20rpx;
  border-radius: 20rpx;
  .seller-info {
    height: 70rpx;
    .seller-name {
      font-size: 33rpx;
      font-weight: 600;
    }
    .order-sn {
      color: #909399;
    }
  }

  .btn-view {
    min-height: 70rpx;
    margin: 5rpx 5rpx;
    display: flex;
    flex-direction: row;
    .description {
      size: 25rpx;
      color: #999999;
      .text {
        margin: 20rpx 0rpx;
      }
      .title {
        color: #5f5d5f;
      }
    }
  }
  .evaluate {
    padding: 20rpx 0;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
