<template>
  <view class="layout">
    <u-sticky>
      <view class="goods-cell-title">
        <view
          class="goods-item-title"
          :class="{ 'selected-title': selected.index == index }"
          @click="handleClickTitle(title, index)"
          v-for="(title, index) in res.list[0].titleWay"
          :key="index"
        >
          <h4 class="h4">{{ title.title }}</h4>
          <view class="title-desc">{{ title.desc }}</view>
        </view>
      </view>
    </u-sticky>
    <view class="goods-list">
      <template v-for="(item, item_index) in res.list[0].listWay" :key="item_index">
        <view
          v-if="
            item.___index != undefined
              ? selected.index == item.___index
              : selected.val == item.type
          "
          @click="handleClick(item)"
          class="goods-item"
        >
          <view class="goods-img">
            <u-image
              :src="item.img"
              height="350rpx"
              mode="aspectFit"
              width="100%"
            >
              <template #loading><u-loading-icon></u-loading-icon></template>
            </u-image>
          </view>
          <view class="goods-desc">
            <view class="goods-title">
              {{ item.title }}
            </view>
            <view class="goods-bottom">
              <view class="goods-price">
                ¥<span class="price-int"
                  >{{ goodsFormatPrice(item.price)[0] }} </span
                >.{{ goodsFormatPrice(item.price)[1] }}
              </view>
            </view>
          </view>
        </view>
      </template>

      <template
        v-if="currentTitleWay?.bindCategory && goodsData.length"
      >
        <view
          v-for="(item, index) in goodsData"
          :key="index"
          class="goods-item"
          @click="handleClick(item)"
        >
          <view class="goods-img">
            <u-image
              :src="item.thumbnail"
              height="350rpx"
              mode="aspectFit"
              width="100%"
            >
              <template #loading><u-loading-icon></u-loading-icon></template>
            </u-image>
          </view>
          <view class="goods-desc">
            <view class="goods-title">
              {{ item.goodsName }}
            </view>
            <view class="goods-bottom">
              <view class="goods-price">
                ¥<span class="price-int"
                  >{{ goodsFormatPrice(item.price)[0] }} </span
                >.{{ goodsFormatPrice(item.price)[1] }}
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from "vue";
import { getGoodsList } from "@/api/goods.js";
import { goodsFormatPrice } from "@/utils/filters.js";

const props = defineProps<{ res: any; enableBottomLoad?: boolean }>();

const selected = reactive({
  index: 0,
  val: "",
});

const currentTitleWay = computed(() => {
  return props.res?.list?.[0]?.titleWay?.[selected.index]
})
const params = reactive({
  pageNumber: 1,
  pageSize: 100,
  categoryId: "",
});
const goodsData = ref<any[]>([]);
const goodsResult = ref<any>("");

watch(
  () => props.res,
  (val) => {
    if (!val?.list?.[0]) return
    const firstListWay = val.list[0].listWay?.[0]
    selected.val = firstListWay?.type || ''
    const firstTitleWay = val.list[0].titleWay?.[0]
    if (firstTitleWay?.bindCategory) {
      initGoods(firstTitleWay)
    }
  },
  { immediate: true }
)

onMounted(() => {
  uni.$on("onReachBottom", () => {
    if (
      props.enableBottomLoad &&
      goodsResult.value.totalElements >=
        params.pageNumber * params.pageSize
    ) {
      params.pageNumber++;
      initGoods(props.res.list[0].titleWay[selected.index]);
    }
  });
});

onUnmounted(() => {
  uni.$off("onReachBottom");
});

function handleClick(item: any) {
  if (!item?.id || !item?.goodsId) return
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
  })
}

async function initGoods(val: any) {
  if (props.enableBottomLoad) params.pageSize = 20;
  val ? (params.categoryId = val.bindCategory.id) : "";
  const res = await getGoodsList(params);
  if (res.data.success) {
    goodsResult.value = res.data.result;
    const result = res.data.result.records;
    goodsData.value.push(...result);
    console.log(goodsData.value);
  }
}

function handleClickTitle(val: any, index: number) {
  selected.index = index;
  selected.val = val.title;
  if (val.bindCategory) {
    params.pageNumber = 1;
    goodsData.value = [];
    initGoods(val);
  }
}
</script>
<style lang="scss" scoped>
$w_94: 94%;

.layout {
  padding: 8px 0;
  background: #f9f9f9;
}

.selected-title {
  .h4 {
    font-size: 30rpx;
    color: #000 !important;
  }

  .title-desc {
    font-weight: bold;
    color: $main-color !important;
  }
}

.goods-cell-title {
  background: #f9f9f9;
  padding: 10px;
  transition: 0.35s;
  display: flex;

  > .goods-item-title {
    flex: 1;
    text-align: center;

    .h4 {
      font-size: 32rpx;
    }

    .title-desc {
      color: #999;
      font-size: 24rpx;
    }
  }
}

.goods-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}

.goods-img {
  position: relative;
  margin: 0 auto;
  // width: 158px;
  width: $w_94;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
}

.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;
  > .goods-title {
    font-size: 24rpx;
    height: 67rpx;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  > .goods-bottom {
    display: flex;
    font-weight: bold;
    > .goods-price {
      line-height: 2;
      color: $main-color;
      .price-int {
        font-size: 42rpx;
      }
    }
  }
}
</style>
