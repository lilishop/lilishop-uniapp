<template>
  <div class="layout">
    <div class="join-list">
      <div
        v-for="(item, index) in displayList"
        :key="index"
        class="join-list-item"
        @click="goToDetail(item.type)"
      >
        <div>
          <div class="join-title">
            <div class="join-title-name">{{ item.title }}</div>
            <div
              class="sub"
              v-if="item.type !== 'SECKILL'"
              :style="{
                backgroundColor: item.bk_color,
                color: item.color1,
                borderColor: item.bk_color,
              }"
            >
              {{ item.title1 }}
            </div>
            <div class="sub-seckill" v-else>
              <div class="sub-seckill-block flex">
                <div class="sub-seckill-block-text">
                  {{ timeLine[0] ? timeLine[0].timeLine : "x" }}点场
                </div>
                {{ times.hours == "00" ? "0" : times.hours }}:{{
                  times.minutes
                }}:{{ times.seconds }}
              </div>
            </div>
          </div>
          <div class="join-box">
            <div
              class="join-item"
              v-for="(i, _index) in item.data"
              :key="_index"
            >
              <div class="item-img-box">
                <u-image
                  class="item-img"
                  width="156rpx"
                  height="156rpx"
                  :src="i.thumbnail ? i.thumbnail : i.goodsImage"
                  alt
                />
              </div>
              <div
                class="ellipsis"
                :class="{ 'max-width': res.list.length <= 1 }"
              >
                {{ i.goodsName ? i.goodsName : i.name }}
              </div>
              <div class="item-price">
                <span class="price-text">￥{{ i.price ? i.price : i.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import * as API_Promotions from "@/api/promotions";
import Foundation from "@/utils/Foundation.js";

const props = defineProps<{ res: any }>();

const displayList = computed(() => {
  const list = props.res?.list || [];
  // #ifdef MP-WEIXIN
  return list.filter((item: any) => item.type !== "LIVE");
  // #endif
  // #ifndef MP-WEIXIN
  return list;
  // #endif
});
const timeLine = ref<any>("");
const resTime = ref(0);
const time = ref(0);
const times = ref<any>({});
const onlyOne = ref("");
let setTimeInterval: ReturnType<typeof setInterval> | null = null;
let diffTime = 0;

onMounted(() => {
  const params = {
    pageNumber: 1,
    pageSize: 2,
    status: "START",
    promotionStatus: "START",
  };
  setTimeInterval = setInterval(() => {
    if (time.value <= 0) {
      if (setTimeInterval) clearInterval(setTimeInterval);
    } else {
      times.value = Foundation.countTimeDown(time.value);
      time.value--;
    }
  }, 1000);
  props.res.list.forEach((ele: any) => {
    // #ifdef MP-WEIXIN
    if (ele.type === "LIVE") return;
    // #endif
    switch (ele.type) {
      case "PINTUAN":
        API_Promotions.getAssembleList(params).then((response) => {
          const data = response.data.result.records;
          if (data) {
            ele.data = data;
          }
        });
        break;
      case "SECKILL":
        API_Promotions.getSeckillTimeLine().then((response) => {
          if (response.data.success && response.data.result) {
            ele.data = response.data.result[0].seckillGoodsList.slice(0, 2);
            const timeline = response.data.result.sort(
              (x: any, y: any) => Number(x.timeLine) - Number(y.timeLine)
            );
            timeLine.value = timeline.slice(0, 5);
            resTime.value = parseInt(String(new Date().getTime() / 1000));
            onlyOne.value = response.data.result.length === 1;
            diffTime =
              parseInt(String(new Date().getTime() / 1000)) - resTime.value;

            time.value =
              timeLine.value[0].distanceStartTime ||
              (timeLine.value[1] && timeLine.value[1].distanceStartTime) ||
              Foundation.theNextDayTime() - diffTime;
            times.value = Foundation.countTimeDown(time.value);
            console.log(timeLine.value);
          }
        });
        break;
      // #ifndef MP-WEIXIN
      case "LIVE":
        API_Promotions.getLiveList(params).then((response) => {
          if (response.success && response.result.records) {
            ele.data = response.result.records[0].commodityList.slice(0, 2);
          }
        });
        break;
      // #endif
      case "KANJIA":
        API_Promotions.getBargainList(params).then((response) => {
          if (response.success && response.result) {
            ele.data = response.result.records(0, 2);
          }
        });
        break;
      default:
        break;
    }
  });
});

onUnmounted(() => {
  if (setTimeInterval) clearInterval(setTimeInterval);
});

function goToDetail(type: string) {
  switch (type) {
    case "SECKILL":
      uni.navigateTo({
        url: `/pages/promotion/seckill`,
      });
      break;
    case "PINTUAN":
      uni.navigateTo({
        url: `/pages/promotion/joinGroup`,
      });
      break;
    // #ifndef MP-WEIXIN
    case "LIVE":
      uni.navigateTo({
        url: `/pages/promotion/lives`,
      });
      break;
    // #endif
    case "KANJIA":
      uni.navigateTo({
        url: `/pages/promotion/bargain/list`,
      });
      break;
  }
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.join-box {
  display: flex;
}
.join-list {
  width: 100%;
  display: flex;
  overflow: hidden;
}
.join-list-item {
  flex: 1;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 108rpx; // 大于1个活动
  font-size: 22rpx;
}
.max-width {
  width: 316rpx !important;
}
.item-price {
  .price-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $main-color;
  }
}
.join-item {
  flex: 1;
}
.item-img {
  width: 150rpx;
  height: 150rpx;
  margin: 0 auto;
  display: block;
}
.item-img-box {
  position: relative;
}
.item-line-through {
  .price-text {
    font-size: 20rpx;
    font-weight: 400;
    text-decoration: line-through;
    color: #999;
  }
}
.item-position-tips {
  position: absolute;
  right: 0;
  color: #fff;
  font-size: 24rpx;
  bottom: 0;
}
.join-title {
  display: flex;

  align-items: center;
  background: #fff;
  height: 100rpx;
  .join-title-name {
    font-size: 30rpx;
    font-weight: bold;
  }
  .sub,
  .sub-seckill {
    font-size: 20rpx;
    line-height: 1.75;
    border-radius: 16rpx;
    text-align: center;
    padding: 0 16rpx;
    margin-left: 20rpx;
  }
  .sub {
    background-color: $main-color;
    margin-right: 80rpx;
  }
  .sub-seckill {
    white-space: nowrap;
    padding: 0 !important;
  }
  .sub-seckill-block {
    background: var(--theme-primary-30, rgba(255, 60, 42, 0.3));
    border-radius: 100px !important;
    color: var(--theme-primary-70, rgba(255, 60, 42, 0.7));
    overflow: hidden;
    padding-right: 8rpx;
  }
  .sub-seckill-block-text {
    background-color: $main-color;
    color: #fff;
    border-top-right-radius: 100px;
    border-bottom-right-radius: 100px;
    padding: 0 12rpx !important;
    margin-right: 12rpx;
  }
}
</style>
