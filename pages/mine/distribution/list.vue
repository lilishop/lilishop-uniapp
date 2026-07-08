<template>
  <view class="wrapper">
    <!-- 筛选弹出层 TODO后续版本更新 -->
    <!-- <u-popup width="90%" v-model:show="popup" mode="right">
      <view class="screen-title">商品筛选</view>

      <view class="screen-view">
        <view class="screen-item">
          <h4>价格区间</h4>
          <view class="flex">
            <u-input class="u-bg" placeholder-style="font-size:22rpx;" type="number" input-align="center" placeholder="最低价"></u-input>
            <view class="line"></view>
            <u-input class="u-bg" placeholder-style="font-size:22rpx;" type="number" input-align="center" placeholder="最高价"></u-input>
          </view>
        </view>
        <view class="screen-item">
          <h4>销量</h4>
          <view class="flex">
            <u-input class="u-bg w200 flex1" placeholder-style="font-size:22rpx;" type="number" input-align="center" placeholder="销量"></u-input>
            <view class="flex1">笔以上</view>
          </view>
        </view>
        <view class="screen-item">
          <h4>收入比率</h4>
          <view class="flex">
            <u-input class="u-bg" placeholder-style="font-size:22rpx;" type="number" input-align="center" placeholder="最低%"></u-input>
            <view class="line"></view>
            <u-input class="u-bg" placeholder-style="font-size:22rpx;" type="number" input-align="center" placeholder="最高%"></u-input>
          </view>
        </view>
        <view class="screen-item">
          <h4>包邮</h4>
          <view class="flex">
            <u-tag class="u-tag" shape="circle" text="包邮" mode="plain" type="info" />
          </view>
        </view>
        <view class="screen-item">
          <h4>促销活动</h4>
          <view class="flex">
            <u-tag class="u-tag" shape="circle" text="限时抢购" mode="plain" type="info" />
            <u-tag class="u-tag" shape="circle" text="拼团秒杀" mode="plain" type="info" />
          </view>
        </view>
        <view class="screen-item">
          <h4>经营类型</h4>
          <view class="flex">
            <u-tag class="u-tag" shape="circle" text="平台自营" mode="plain" type="info" />
            <u-tag class="u-tag" shape="circle" text="三方店铺" mode="plain" type="info" />
          </view>
        </view>
      </view>

      <view class="screen-btn">
        <view class="screen-clear"> 重置 </view>
        <view class="screen-submit"> 确定 </view>
      </view>
    </u-popup> -->

    <!-- 导航栏 -->
    <view class="nav">
      <view class="nav-item" @click="toggleGoodsTab(true)" :class="{ checked: queryParams.checked }">已选择</view>
      <view class="nav-item" @click="toggleGoodsTab(false)" :class="{ checked: !queryParams.checked }">未选择</view>

      <!-- <view class="nav-item" @click="popup = !popup">筛选</view> -->
    </view>
    <!-- 商品列表 -->

    <view class="goods-list">
      <scroll-view class="body-view" scroll-y @scrolltolower="loadMore">
        <block v-for="(item, index) in goodsList" :key="item.id">
          <u-swipe-action v-if="queryParams.checked" class="distribution-swipe">
            <u-swipe-action-item
              :show="item.___selected"
              @open="openSwipeAction(item)"
              :name="index"
              :options="swipeOptions"
              @click="confirmUnbindPrompt(item)"
            >
              <view class="goods-item">
                <view class="goods-item-img" @click="navigateToGoods(item)">
                  <u-image width="176rpx" height="176rpx" :src="item.thumbnail"></u-image>
                </view>
                <view class="goods-item-desc">
                  <view class="-item-title" @click="navigateToGoods(item)">
                    {{ item.goodsName }}
                  </view>
                  <view class="-item-price" @click="navigateToGoods(item)">
                    佣金:
                    <span> ￥{{ unitPrice(item.commission) }}</span>
                  </view>
                  <view class="-item-bottom">
                    <view class="-item-bootom-money" @click="navigateToGoods(item)">
                      <view class="-item-yj">
                        <span>￥{{ unitPrice(item.price) }}</span>
                      </view>
                    </view>
                    <view>
                      <view class="click" @click="shareDistributionGoods(item)">分销商品</view>
                    </view>
                  </view>
                </view>
              </view>
            </u-swipe-action-item>
          </u-swipe-action>

          <view v-else class="goods-item">
            <view class="goods-item-img" @click="navigateToGoods(item)">
              <u-image width="176rpx" height="176rpx" :src="item.thumbnail"></u-image>
            </view>
            <view class="goods-item-desc">
              <view class="-item-title" @click="navigateToGoods(item)">
                {{ item.goodsName }}
              </view>
              <view class="-item-price" @click="navigateToGoods(item)">
                佣金:
                <span> ￥{{ unitPrice(item.commission) }}</span>
              </view>
              <view class="-item-bottom">
                <view class="-item-bootom-money" @click="navigateToGoods(item)">
                  <view class="-item-yj">
                    <span>￥{{ unitPrice(item.price) }}</span>
                  </view>
                </view>
                <view>
                  <view class="click" @click="selectGoods(item)">立即选取</view>
                </view>
              </view>
            </view>
          </view>
        </block>
      </scroll-view>


      <view class="empty">
        <!-- <u-empty v-if="empty" text="没有分销商品了" mode="list"></u-empty> -->
      </view>
    </view>
    <canvas class="canvas-hide" canvas-id="qrcode" />
    <drawCanvas ref="drawCanvasRef" v-if="showPoster" :res="posterData" />
    <u-modal
      v-model:show="showUnbindModal"
      :confirm-style="{ color: lightColor }"
      @confirm="confirmUnbind"
      show-cancel-button
      :content="unbindModalContent"
      :async-close="true"
    ></u-modal>

  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import {
  distributionGoods,
  checkedDistributionGoods,
  getMpCode,
} from '@/api/goods'
import drawCanvas from '@/components/m-canvas'
import { unitPrice } from '@/utils/filters.js'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const swipeOptions = computed(() => [
  {
    text: '解绑',
    style: { backgroundColor: lightColor.value },
  },
])

const unbindModalContent = '解绑该商品？'
const showPoster = ref(false)
const showUnbindModal = ref(false)
const routeQuery = ref<Record<string, string>>({})
const selectedGoods = ref<any>(null)
const drawCanvasRef = ref<any>(null)

const queryParams = ref({
  pageNumber: 1,
  pageSize: 10,
  checked: true,
})
const goodsList = ref<any[]>([])

const posterData = ref({
  container: {
    width: 600,
    height: 960,
    background: '#fff',
    title: '分享背景',
  },
  bottom: {
    img: '',
    code: '',
    price: 0,
    desc: '',
  },
})

onLoad((options) => {
  routeQuery.value = options || {}
})

onShow(() => {
  goodsList.value = []
  queryParams.value.pageNumber = 1
  fetchGoodsList()
})

function confirmUnbindPrompt(item: any) {
  showUnbindModal.value = true
  selectedGoods.value = item
}

function confirmUnbind() {
  checkedDistributionGoods({ id: selectedGoods.value.id, checked: false }).then((res) => {
    if (res.data.success) {
      uni.showToast({ title: '此商品解绑成功', duration: 2000 })
      showUnbindModal.value = false
      goodsList.value = []
      queryParams.value.pageNumber = 1
      fetchGoodsList()
    }
  })
}

function openSwipeAction(item: any) {
  goodsList.value.forEach((row) => {
    row.___selected = false
  })
  item.___selected = true
}

function navigateToGoods(item: any) {
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
  })
}

async function shareDistributionGoods(goods: any) {
  uni.showToast({ title: '请请按住保存图片', duration: 2000, icon: 'none' })
  const page = 'pages/product/goods'
  const scene = `${goods.skuId},${goods.goodsId},${routeQuery.value.id}`
  const result = await getMpCode({ page, scene })
  if (result.data.success) {
    const callback = result.data.result
    posterData.value.container.title = `${goods.goodsName}`
    posterData.value.bottom.code = `data:image/png;base64,${callback}`
    posterData.value.bottom.price = unitPrice(goods.price, '￥')
    posterData.value.bottom.desc = `${goods.goodsName}`
    posterData.value.bottom.img = `${goods.thumbnail}`
    if (showPoster.value) {
      drawCanvasRef.value?.init()
    }
    showPoster.value = true
  } else {
    uni.showToast({ title: '制作二维码失败！请稍后重试', duration: 2000, icon: 'none' })
  }
}

function toggleGoodsTab(isSelected: boolean) {
  goodsList.value = []
  queryParams.value.checked = isSelected
  queryParams.value.pageNumber = 1
  fetchGoodsList()
}

function selectGoods(item: any) {
  checkedDistributionGoods({ id: item.id, checked: true }).then((res) => {
    if (res.data.success) {
      uni.showToast({ title: '已添加到我的选品库', duration: 2000, icon: 'none' })
      setTimeout(() => {
        goodsList.value = []
        queryParams.value.pageNumber = 1
        fetchGoodsList()
      }, 500)
    }
  })
}

function fetchGoodsList() {
  distributionGoods(queryParams.value).then((res) => {
    if (res.data.success && res.data.result.records.length >= 1) {
      res.data.result.records.forEach((item: any) => {
        item.___selected = false
      })
      goodsList.value.push(...res.data.result.records)
    }
  })
}

function loadMore() {
  queryParams.value.pageNumber += 1
  fetchGoodsList()
}
</script>
<style lang="scss" scoped>

.body-view {
  overflow-y: auto;
  height: calc(100vh - 44px - 80rpx - 104rpx);
}
.canvas-hide {
  /* 1 */
  position: fixed;
  right: 100vw;
  bottom: 100vh;
  /* 2 */
  z-index: -9999;
  /* 3 */
  opacity: 0;
}
.empty {
  margin: 40rpx 0;
}
.checked {
  color: $main-color;
  font-weight: bold;
}
.screen-btn {
  display: flex;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  position: fixed;
  bottom: 0;
  > .screen-clear,
  .screen-submit {
    width: 50%;
    text-align: center;
  }
  .screen-submit {
    background: $main-color;
    color: #fff;
  }
}
.screen-item {
  margin-bottom: 40rpx;
}
.flex1 {
  padding-left: 10rpx;
}
.u-tag {
  margin-right: 20rpx;
}
.line {
  width: 40rpx;
  height: 2rpx;
  background: #999;
  margin: 0 10rpx;
}
.u-bg {
  background: #eff1f4;
  border-radius: 0.4em;
  font-size: 22rpx;
}
.screen-title {
  height: 88rpx;
  text-align: center;
  font-size: 28upz;
  line-height: 88rpx;
  border-bottom: 1px solid #ededed;
}
.flex {
  display: flex;
  margin: 20rpx 0;
  align-items: center;
}
.screen-view {
  padding: 32rpx;
}
.bar {
  padding: 0 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  width: 100%;
  background: #fff;
  z-index: 8;
  > .bar-btn {
    display: flex;
  }
}
.nav {
  background: #fff;
  width: 100%;
  display: flex;
  height: 88rpx;
  box-sizing: border-box;
  border-top: 1px solid #ededed;
  border-bottom: 1px solid #ededed;
  > .nav-item {
    line-height: 88rpx;
    height: 88rpx;
    flex: 1;
    text-align: center;
    position: relative;
    color: #666;
  }
  > .nav-item.checked {
    color: $main-color;
    font-weight: bold;
    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 80rpx;
      height: 4rpx;
      background: $main-color;
      border-radius: 2rpx;
    }
  }
}

.distribution-swipe,
:deep(.u-swipe-action),
:deep(.u-swipe-action-item),
:deep(.u-swipe-action-item__content) {
  width: 100%;
}

:deep(.u-swipe-action-item) {
  overflow: hidden;
}

:deep(.u-swipe-action-item__content) {
  overflow: hidden;
}
.click {
  background: $main-color;
  color: #fff;
  margin: 0 4rpx;
  font-size: 22rpx;
  padding: 10rpx 20rpx;
  border-radius: 100px;
}
.goods-list {
  // #ifdef H5
  height: calc(100vh - 176rpx);
  // #endif
  // #ifndef H5
  height: calc(100vh - 88rpx);
  // #endif
  overflow: auto;
}
.goods-item {
  border-radius: 20rpx;
  background: #fff;
  display: flex;
  padding: 22rpx;
  margin: 20rpx;
  justify-content: space-between;
  > .goods-item-desc {
    flex: 2;
    padding: 0 16rpx;
    line-height: 1.7;
    > .-item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      padding-bottom: 20rpx;
      > .-item-bootom-money {
        > .-item-bl,
        .-item-yj {
          margin-right: 10rpx;
          font-size: 24rpx;
          color: $font-color-base;
        }
      }
    }
    > .-item-title {
      display: -webkit-box;

      -webkit-box-orient: vertical;

      -webkit-line-clamp: 1;

      overflow: hidden;
    }
    > .-item-price {
      color: $price-color;
      > span {
        font-size: 36rpx;
      }
    }
  }
}
.wrapper {
  width: 100%;
}
</style>