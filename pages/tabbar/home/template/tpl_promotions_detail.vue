<template>
  <view v-if="hasData" class="layout" :style="wrapperStyle">
    <!-- 拼团：红橙渐变头部 + 左图右文商品行（参考 CRMEB） -->
    <view v-if="isPintuan" class="pt-card">
      <view class="pt-head" :style="ptHeadStyle">
        <image
          v-if="headTitleImage"
          class="pt-title-img"
          :src="headTitleImage"
          mode="aspectFit"
        />
        <text v-else class="pt-title">{{ firstItem.title || "超值拼团" }}</text>
        <template v-if="firstItem.groupSuccess">
          <text class="pt-divider"></text>
          <view class="pt-avatars">
            <view v-for="n in 3" :key="n" class="pt-avatar">
              <u-icon name="account-fill" color="#fff" size="12"></u-icon>
            </view>
          </view>
          <text class="pt-success">{{ firstItem.groupSuccess }}</text>
        </template>
        <view class="pt-space"></view>
        <view class="pt-more" @click="goToDetail('PINTUAN')">{{ "更多 >" }}</view>
      </view>
      <view class="pt-body">
        <!-- 样式一：纵向商品行 -->
        <template v-if="layoutStyle === '1'">
          <view
            class="pt-row"
            v-for="(g, i) in displayData"
            :key="i"
            @click="goGoods(g)"
          >
            <view class="pt-img-box" :style="imgRadiusStyle">
              <u-image
                class="pt-img"
                width="192rpx"
                height="192rpx"
                :src="g.thumbnail ? g.thumbnail : g.goodsImage"
                mode="aspectFill"
              />
            </view>
            <view class="pt-info">
              <view
                v-if="options.showGoodsName !== false"
                class="pt-name"
                :style="nameStyle"
              >
                {{ g.goodsName ? g.goodsName : g.name }}
              </view>
              <view
                v-if="options.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-tags"
              >
                <text class="pt-tag-group">{{ g.groupNum || 2 }}人团</text>
                <text class="pt-tag-joined">已拼{{ g.joined != null ? g.joined : 0 }}份</text>
              </view>
              <view class="pt-bottom">
                <view class="pt-prices" v-if="options.showGoodsPrice !== false">
                  <view class="pt-price-line">
                    <text class="pt-price-label">拼团价</text>
                    <text class="pt-price"
                      ><text class="pt-price-symbol">¥</text
                      >{{ g.price ? g.price : g.originalPrice }}</text
                    >
                  </view>
                  <view
                    class="pt-original"
                    v-if="options.showOriginalPrice !== false && g.originalPrice"
                  >
                    单买价 <text class="pt-original-price">¥{{ g.originalPrice }}</text>
                  </view>
                </view>
                <view
                  class="pt-btn"
                  v-if="options.showGroupBtn !== false"
                  @click.stop="goGoods(g)"
                  >去拼团</view
                >
              </view>
            </view>
          </view>
        </template>
        <!-- 样式二：两列网格卡片 -->
        <view v-else-if="layoutStyle === '2'" class="pt-grid2">
          <view
            class="pt-g2-item"
            v-for="(g, i) in displayData"
            :key="i"
            @click="goGoods(g)"
          >
            <view class="pt-g2-img-box" :style="imgRadiusStyle">
              <image
                class="pt-g-img"
                :src="g.thumbnail ? g.thumbnail : g.goodsImage"
                mode="aspectFill"
              />
            </view>
            <view class="pt-g2-name-row">
              <text
                v-if="options.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-tag-soft"
                >{{ g.groupNum || 2 }}人团</text
              >
              <text
                v-if="options.showGoodsName !== false"
                class="pt-g2-name"
                :style="nameStyle"
                >{{ g.goodsName ? g.goodsName : g.name }}</text
              >
            </view>
            <view class="pt-g2-bottom">
              <view class="pt-g2-prices" v-if="options.showGoodsPrice !== false">
                <text class="pt-price-sm"
                  ><text class="pt-price-sm-symbol">¥</text
                  >{{ g.price ? g.price : g.originalPrice }}</text
                >
                <text
                  class="pt-original-sm"
                  v-if="options.showOriginalPrice !== false && g.originalPrice"
                  >¥{{ g.originalPrice }}</text
                >
              </view>
              <view
                class="pt-btn-sm"
                v-if="options.showGroupBtn !== false"
                @click.stop="goGoods(g)"
                >去拼团</view
              >
            </view>
          </view>
        </view>
        <!-- 样式三：三列网格 -->
        <view v-else-if="layoutStyle === '3'" class="pt-grid3">
          <view
            class="pt-g3-item"
            v-for="(g, i) in displayData"
            :key="i"
            @click="goGoods(g)"
          >
            <view class="pt-g3-img-box" :style="imgRadiusStyle">
              <image
                class="pt-g-img"
                :src="g.thumbnail ? g.thumbnail : g.goodsImage"
                mode="aspectFill"
              />
              <text
                v-if="options.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-corner-tag"
                >{{ g.groupNum || 2 }}人团</text
              >
            </view>
            <view
              v-if="options.showGoodsName !== false"
              class="pt-g3-name"
              :style="nameStyle"
              >{{ g.goodsName ? g.goodsName : g.name }}</view
            >
            <view class="pt-g3-prices" v-if="options.showGoodsPrice !== false">
              <text class="pt-price-sm"
                ><text class="pt-price-sm-symbol">¥</text
                >{{ g.price ? g.price : g.originalPrice }}</text
              >
              <text
                class="pt-original-sm"
                v-if="options.showOriginalPrice !== false && g.originalPrice"
                >¥{{ g.originalPrice }}</text
              >
            </view>
          </view>
        </view>
        <!-- 样式四：横向滑动 -->
        <scroll-view v-else scroll-x class="pt-scroll" :show-scrollbar="false">
          <view
            class="pt-s-item"
            v-for="(g, i) in displayData"
            :key="i"
            @click="goGoods(g)"
          >
            <view class="pt-g3-img-box" :style="imgRadiusStyle">
              <image
                class="pt-g-img"
                :src="g.thumbnail ? g.thumbnail : g.goodsImage"
                mode="aspectFill"
              />
              <text
                v-if="options.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-corner-tag"
                >{{ g.groupNum || 2 }}人团</text
              >
            </view>
            <view
              v-if="options.showGoodsName !== false"
              class="pt-g3-name"
              :style="nameStyle"
              >{{ g.goodsName ? g.goodsName : g.name }}</view
            >
            <view class="pt-g3-prices" v-if="options.showGoodsPrice !== false">
              <text class="pt-price-sm"
                ><text class="pt-price-sm-symbol">¥</text
                >{{ g.price ? g.price : g.originalPrice }}</text
              >
              <text
                class="pt-original-sm"
                v-if="options.showOriginalPrice !== false && g.originalPrice"
                >¥{{ g.originalPrice }}</text
              >
            </view>
          </view>
        </scroll-view>
        <view v-if="!displayData.length" class="pt-empty">
          暂无拼团商品
        </view>
      </view>
    </view>
    <!-- #ifndef MP-WEIXIN -->
    <!-- 直播：参考 CRMEB 小程序直播（单行/多行/双排） -->
    <view v-else-if="isLive" class="lv-card">
      <view class="lv-head">
        <image
          v-if="options.icon"
          class="lv-head-icon"
          :src="options.icon"
          mode="aspectFit"
        />
        <text v-else class="lv-head-title">{{ firstItem.title || "精彩直播" }}</text>
        <text class="lv-head-sub" :style="titleStyle">{{ firstItem.title1 || "精彩抢先看" }}</text>
        <view class="lv-space"></view>
        <text class="lv-more" :style="moreStyle" @click="goToDetail('LIVE')">{{ "更多 >" }}</text>
      </view>
      <view class="lv-head-en">Exciting live streaming</view>
      <!-- 单行：横向滑动卡片 -->
      <scroll-view
        v-if="layoutStyle === '1'"
        scroll-x
        class="lv-scroll"
        :show-scrollbar="false"
      >
        <view
          class="lv-s-item"
          v-for="(item, i) in liveData"
          :key="i"
          @click="goToDetail('LIVE')"
        >
          <view class="lv-s-img-box" :style="imgRadiusStyle">
            <image class="lv-img" :src="item.cover" mode="aspectFill" />
            <text class="lv-tag" :class="item.tagClass">{{ item.tagText }}</text>
          </view>
        </view>
      </scroll-view>
      <!-- 多行：纵向列表 -->
      <view v-else-if="layoutStyle === '2'" class="lv-rows">
        <view
          class="lv-row"
          v-for="(item, i) in liveData"
          :key="i"
          @click="goToDetail('LIVE')"
        >
          <view class="lv-r-img-box" :style="imgRadiusStyle">
            <image class="lv-img" :src="item.cover" mode="aspectFill" />
            <text class="lv-tag" :class="item.tagClass">{{ item.tagText }}</text>
          </view>
          <view class="lv-r-info">
            <view class="lv-title" :style="nameStyle">{{ item.title }}</view>
            <view class="lv-anchor">{{ item.anchorName }}</view>
            <view class="lv-nogoods">暂无商品</view>
          </view>
        </view>
      </view>
      <!-- 双排：两列网格 -->
      <view v-else class="lv-grid2">
        <view
          class="lv-g-item"
          v-for="(item, i) in liveData"
          :key="i"
          @click="goToDetail('LIVE')"
        >
          <view class="lv-g-img-box" :style="imgRadiusStyle">
            <image class="lv-img" :src="item.cover" mode="aspectFill" />
            <text class="lv-tag" :class="item.tagClass">{{ item.tagText }}</text>
            <text v-if="item.startTime" class="lv-time">{{ item.startTime }}</text>
          </view>
          <view class="lv-title" :style="nameStyle">{{ item.title }}</view>
          <view class="lv-anchor">{{ item.anchorName }}</view>
        </view>
      </view>
    </view>
    <!-- #endif -->
    <!-- 秒杀：参考 CRMEB 秒杀（红渐变头部 + 横滑/列表） -->
    <view v-else-if="isSeckill" class="sk-card" :style="seckillCardStyle">
      <view class="sk-head">
        <image
          v-if="options.icon"
          class="sk-head-icon"
          :src="options.icon"
          mode="aspectFit"
        />
        <text v-else class="sk-head-title" :style="titleStyle">{{ firstItem.title || "限时秒杀" }}</text>
        <text class="sk-divider"></text>
        <text class="sk-head-sub" :style="titleStyle">{{ firstItem.title1 || "邀请你的好友来参与" }}</text>
        <view class="sk-space"></view>
        <text class="sk-go" @click="goToDetail('SECKILL')">{{ "GO >" }}</text>
      </view>
      <!-- 样式一：横向滑动 -->
      <scroll-view
        v-if="layoutStyle === '1'"
        scroll-x
        class="sk-scroll"
        :show-scrollbar="false"
      >
        <view
          class="sk-s-item"
          v-for="(g, i) in seckillData"
          :key="i"
          :style="imgRadiusStyle"
          @click="goGoods(g)"
        >
          <view class="sk-s-img-box" :style="imgRadiusStyle">
            <image
              class="lv-img"
              :src="g.thumbnail ? g.thumbnail : g.goodsImage"
              mode="aspectFill"
            />
          </view>
          <view
            v-if="options.showGoodsName !== false"
            class="sk-name"
            :style="nameStyle"
          >{{ g.goodsName ? g.goodsName : g.name }}</view>
          <view v-if="options.showGoodsPrice !== false" class="sk-price">
            <text class="sk-price-symbol">¥</text>{{ g.price ? g.price : g.originalPrice }}
          </view>
        </view>
      </scroll-view>
      <!-- 样式二：纵向列表 -->
      <view v-else class="sk-rows">
        <view
          class="sk-row"
          v-for="(g, i) in seckillData"
          :key="i"
          :style="imgRadiusStyle"
          @click="goGoods(g)"
        >
          <view class="sk-r-img-box" :style="imgRadiusStyle">
            <image
              class="lv-img"
              :src="g.thumbnail ? g.thumbnail : g.goodsImage"
              mode="aspectFill"
            />
          </view>
          <view class="sk-r-info">
            <view
              v-if="options.showGoodsName !== false"
              class="sk-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</view>
            <view v-if="options.showGoodsPrice !== false" class="sk-price sk-price-lg">
              <text class="sk-price-symbol">¥</text>{{ g.price ? g.price : g.originalPrice }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 砍价：沿用秒杀风格（红渐变头部 + 横滑/列表），价格显示最低砍价 -->
    <view v-else-if="isKanjia" class="sk-card" :style="seckillCardStyle">
      <view class="sk-head">
        <image
          v-if="options.icon"
          class="sk-head-icon"
          :src="options.icon"
          mode="aspectFit"
        />
        <text v-else class="sk-head-title" :style="titleStyle">{{ firstItem.title || "砍价免费拿" }}</text>
        <text class="sk-divider"></text>
        <text class="sk-head-sub" :style="titleStyle">{{ firstItem.title1 || "邀请好友来砍价" }}</text>
        <view class="sk-space"></view>
        <text class="sk-go" @click="goToDetail('KANJIA')">{{ "GO >" }}</text>
      </view>
      <!-- 样式一：横向滑动 -->
      <scroll-view
        v-if="layoutStyle === '1'"
        scroll-x
        class="sk-scroll"
        :show-scrollbar="false"
      >
        <view
          class="sk-s-item"
          v-for="(g, i) in seckillData"
          :key="i"
          :style="imgRadiusStyle"
          @click="goBargain(g)"
        >
          <view class="sk-s-img-box" :style="imgRadiusStyle">
            <image
              class="lv-img"
              :src="g.thumbnail ? g.thumbnail : g.goodsImage"
              mode="aspectFill"
            />
          </view>
          <view
            v-if="options.showGoodsName !== false"
            class="sk-name"
            :style="nameStyle"
          >{{ g.goodsName ? g.goodsName : g.name }}</view>
          <view v-if="options.showGoodsPrice !== false" class="sk-price">
            <text class="sk-price-min">最低</text><text class="sk-price-symbol">¥</text>{{ g.purchasePrice != null ? g.purchasePrice : (g.price ? g.price : g.originalPrice) }}
          </view>
        </view>
      </scroll-view>
      <!-- 样式二：纵向列表 -->
      <view v-else class="sk-rows">
        <view
          class="sk-row"
          v-for="(g, i) in seckillData"
          :key="i"
          :style="imgRadiusStyle"
          @click="goBargain(g)"
        >
          <view class="sk-r-img-box" :style="imgRadiusStyle">
            <image
              class="lv-img"
              :src="g.thumbnail ? g.thumbnail : g.goodsImage"
              mode="aspectFill"
            />
          </view>
          <view class="sk-r-info">
            <view
              v-if="options.showGoodsName !== false"
              class="sk-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</view>
            <view v-if="options.showGoodsPrice !== false" class="sk-price sk-price-lg">
              <text class="sk-price-min">最低</text><text class="sk-price-symbol">¥</text>{{ g.purchasePrice != null ? g.purchasePrice : (g.price ? g.price : g.originalPrice) }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <template v-else>
      <view v-if="styled && (options.icon || options.moreUrl)" class="promo-head">
        <image v-if="options.icon" class="promo-head-icon" :src="options.icon" mode="aspectFit" />
        <view class="promo-head-space"></view>
        <view v-if="options.moreUrl" class="promo-more" :style="moreStyle" @click="goMore">{{ "更多 >" }}</view>
      </view>
      <div class="join-list" :style="gapStyle">
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
                <div class="item-img-box" :style="imgRadiusStyle">
                  <u-image
                    class="item-img"
                    width="156rpx"
                    height="156rpx"
                    :src="i.thumbnail ? i.thumbnail : i.goodsImage"
                    alt
                  />
                </div>
                <div
                  v-if="options.showGoodsName !== false"
                  class="ellipsis"
                  :class="{ 'max-width': res.list.length <= 1 }"
                  :style="nameStyle"
                >
                  {{ i.goodsName ? i.goodsName : i.name }}
                </div>
                <div class="item-price" v-if="options.showGoodsPrice !== false">
                  <span class="price-text">￥{{ i.price ? i.price : i.originalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import * as API_Promotions from "@/api/promotions";
import Foundation from "@/utils/Foundation.js";
import { modelNavigateTo } from "./tpl";

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
// 面板保存过样式字段才启用新样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const options = computed(() => props.res || {});
const firstItem = computed(() => (props.res?.list && props.res.list[0]) || {});
const isPintuan = computed(() => firstItem.value.type === "PINTUAN");
const isLive = computed(() => firstItem.value.type === "LIVE");
const isSeckill = computed(() => firstItem.value.type === "SECKILL");
const isKanjia = computed(() => firstItem.value.type === "KANJIA");
function isRealGoods(item: any) {
  if (!item) return false;
  const img = item.thumbnail || item.goodsImage || "";
  if (!img || img.startsWith("/demo/") || img.startsWith("demo/")) return false;
  return true;
}

const seckillData = computed(() => {
  const data = ((firstItem.value && firstItem.value.data) || []).filter(isRealGoods);
  return layoutStyle.value === "2" ? data.slice(0, 4) : data.slice(0, 6);
});
// 老数据未保存过样式时，给个红→白渐变兜底背景
const seckillCardStyle = computed(() =>
  styled.value
    ? {}
    : { background: "linear-gradient(180deg, #FF2200 0%, #FFFFFF 45%)" }
);
const layoutStyle = computed(() => (props.res && props.res.layoutStyle) || "1");
const liveTagOf = (status: any) => {
  const s = String(status == null ? "" : status).toUpperCase();
  if (["LIVE", "LIVING", "1", "101"].includes(s)) {
    return { text: "直播中", cls: "lv-tag-live" };
  }
  if (["REPLAY", "PLAYBACK", "OVER", "3", "103"].includes(s)) {
    return { text: "回放", cls: "lv-tag-replay" };
  }
  return { text: "预告", cls: "lv-tag-preview" };
};
const fmtLiveTime = (t: any) => {
  if (!t) return "";
  const s = String(t);
  const m = s.match(/^\d{4}-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) return `${Number(m[1])}/${Number(m[2])} ${m[3]}:${m[4]}`;
  return s;
};
const liveData = computed(() => {
  const data = (firstItem.value && firstItem.value.data) || [];
  const limit = layoutStyle.value === "2" ? 3 : 6;
  return data.slice(0, limit).map((item: any) => {
    const tag = liveTagOf(item.status != null ? item.status : item.liveStatus);
    return {
      cover: item.cover || item.roomImg || item.shareImg || item.thumbnail || "",
      title: item.title || item.roomName || item.goodsName || item.name || "",
      anchorName:
        item.anchorName || item.anchorNickname || item.nickName || "",
      startTime: fmtLiveTime(item.startTime || item.liveTime),
      tagText: tag.text,
      tagClass: tag.cls,
    };
  });
});
const displayData = computed(() => {
  const data = ((firstItem.value && firstItem.value.data) || []).filter(isRealGoods);
  if (layoutStyle.value === "3" || layoutStyle.value === "4") {
    return data.slice(0, 6);
  }
  return data.slice(0, 2);
});

// 无活动数据时整块不渲染，避免展示空标题/空卡片
const hasData = computed(() => {
  if (isPintuan.value) {
    return displayData.value.length > 0;
  }
  if (isSeckill.value) {
    return seckillData.value.length > 0;
  }
  if (isKanjia.value) {
    return seckillData.value.length > 0;
  }
  if (isLive.value) {
    return liveData.value.length > 0;
  }
  return displayList.value.some(
    (item: any) => item.data && item.data.filter(isRealGoods).length > 0
  );
});
const headTitleImage = computed(() =>
  props.res?.headTitleType === "image" ? props.res.headTitleImage : ""
);
const ptHeadStyle = computed(() => {
  const res = props.res || {};
  if (res.headBgType === "image" && res.headBgImage) {
    return `background-image:url(${res.headBgImage});background-size:cover;background-position:center;`;
  }
  if (res.headBgColor1) {
    const bg =
      !res.headBgColor2 || res.headBgColor1 === res.headBgColor2
        ? res.headBgColor1
        : `linear-gradient(90deg, ${res.headBgColor1}, ${res.headBgColor2})`;
    return `background:${bg};`;
  }
  return "";
});
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  const radius = Number(res.borderRadius) || 0;
  return {
    background: bg,
    padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
    marginBottom: `${Number(res.pageGap) || 0}rpx`,
    borderRadius: `${radius}rpx`,
    overflow: radius > 0 ? "hidden" : "visible",
  };
});
const gapStyle = computed(() =>
  styled.value ? { gap: `${Number(props.res.contentGap) || 0}rpx` } : {}
);
const moreStyle = computed(() =>
  styled.value && props.res.moreColor ? { color: props.res.moreColor } : {}
);
const titleStyle = computed(() =>
  styled.value && props.res.titleColor ? { color: props.res.titleColor } : {}
);
const nameStyle = computed(() =>
  styled.value && props.res.nameColor ? { color: props.res.nameColor } : {}
);
const imgRadiusStyle = computed(() =>
  styled.value ? { borderRadius: `${Number(props.res.imgRadius) || 0}rpx`, overflow: "hidden" } : {}
);
function goMore() {
  if (props.res.moreUrl) {
    modelNavigateTo({ url: props.res.moreUrl });
  }
}

function goGoods(g: any) {
  const skuId = g.skuId || g.id;
  if (!skuId) return;
  uni.navigateTo({
    url: `/pages/product/goods?id=${skuId}&goodsId=${g.goodsId}`,
  });
}

function goBargain(g: any) {
  if (!g.id) return;
  uni.navigateTo({
    url: `/pages/promotion/bargain/detail?id=${g.id}`,
  });
}

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
        // 不依赖装修保存的静态数据，始终展示当前进行中的拼团商品
        ele.data = [];
        API_Promotions.getAssembleList({ ...params, pageSize: 6 })
          .then((response) => {
            const data = response?.data?.result?.records || [];
            ele.data = data.slice(0, 6);
          })
          .catch(() => {});
        break;
      case "SECKILL":
        // 不依赖装修保存的静态数据，始终展示当前秒杀场次的商品
        ele.data = [];
        API_Promotions.getSeckillTimeLine()
          .then((response) => {
            if (response.data.success && response.data.result) {
              ele.data =
                response.data.result[0]?.seckillGoodsList?.slice(0, 6) || [];
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
            }
          })
          .catch(() => {});
        break;
      // #ifndef MP-WEIXIN
      case "LIVE":
        // 不依赖装修保存的静态数据，始终展示当前直播间
        ele.data = [];
        API_Promotions.getLiveList({ ...params, pageSize: 6 })
          .then((response) => {
            const records = response?.data?.result?.records || [];
            ele.data = records.slice(0, 6);
          })
          .catch(() => {});
        break;
      // #endif
      case "KANJIA":
        // 不依赖装修保存的静态数据，始终展示当前进行中的砍价商品
        ele.data = [];
        API_Promotions.getBargainList(params)
          .then((response) => {
            const records = response?.data?.result?.records || [];
            ele.data = records.slice(0, 6);
          })
          .catch(() => {});
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
.promo-head {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16rpx;
}
.promo-head-icon {
  width: 124rpx;
  height: 32rpx;
  flex-shrink: 0;
}
.promo-head-space {
  flex: 1;
}
.promo-more {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #999;
}
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

/* 拼团卡片（参考 CRMEB 样式一） */
.pt-card {
  width: 100%;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.pt-head {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  background: linear-gradient(90deg, #f5483a, #ff7e3d);
  color: #fff;
}
.pt-title {
  font-size: 32rpx;
  font-weight: bold;
}
.pt-title-img {
  height: 40rpx;
  width: 200rpx;
}
.pt-divider {
  width: 2rpx;
  height: 28rpx;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 16rpx;
}
.pt-avatars {
  display: flex;
  margin-right: 12rpx;
}
.pt-avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  background: #f0b429;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  & + .pt-avatar {
    margin-left: -12rpx;
  }
  &:nth-of-type(2) {
    background: #7bc47f;
  }
  &:nth-of-type(3) {
    background: #64a8f5;
  }
}
.pt-success {
  font-size: 22rpx;
}
.pt-space {
  flex: 1;
}
.pt-more {
  font-size: 24rpx;
  color: #fff;
}
.pt-body {
  padding: 8rpx 24rpx 24rpx;
}
.pt-row {
  display: flex;
  padding-top: 24rpx;
  & + .pt-row {
    margin-top: 24rpx;
    border-top: 2rpx solid #f5f5f5;
  }
}
.pt-img-box {
  width: 192rpx;
  height: 192rpx;
  flex-shrink: 0;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 20rpx;
}
.pt-img {
  width: 192rpx;
  height: 192rpx;
  display: block;
}
.pt-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.pt-name {
  font-size: 26rpx;
  color: #333;
  line-height: 36rpx;
  height: 72rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.pt-tags {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.pt-tag-group {
  background: linear-gradient(90deg, #f5483a, #ff6a3d);
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}
.pt-tag-joined {
  background: #fdeae7;
  color: #f5483a;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}
.pt-bottom {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.pt-price-line {
  display: flex;
  align-items: baseline;
}
.pt-price-label {
  font-size: 22rpx;
  color: #f5483a;
  margin-right: 4rpx;
}
.pt-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #f5483a;
}
.pt-price-symbol {
  font-size: 24rpx;
}
.pt-original {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
.pt-original-price {
  text-decoration: line-through;
}
.pt-btn {
  background: linear-gradient(90deg, #f5483a, #ff6a3d);
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  flex-shrink: 0;
}
.pt-empty {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 48rpx 0;
}

/* 样式二：两列网格卡片 */
.pt-grid2 {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding-top: 24rpx;
}
.pt-g2-item {
  width: calc(50% - 10rpx);
  background: #fff;
}
.pt-g2-img-box {
  width: 100%;
  height: 300rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.pt-g-img {
  width: 100%;
  height: 100%;
  display: block;
}
.pt-g2-name-row {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  min-width: 0;
}
.pt-tag-soft {
  background: #fdeae7;
  color: #f5483a;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}
.pt-g2-name {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pt-g2-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}
.pt-g2-prices {
  display: flex;
  align-items: baseline;
  min-width: 0;
  overflow: hidden;
}
.pt-price-sm {
  font-size: 30rpx;
  font-weight: bold;
  color: #f5483a;
  flex-shrink: 0;
}
.pt-price-sm-symbol {
  font-size: 22rpx;
}
.pt-original-sm {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
  white-space: nowrap;
  text-decoration: line-through;
}
.pt-btn-sm {
  background: linear-gradient(90deg, #f5483a, #ff6a3d);
  color: #fff;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

/* 样式三：三列网格 */
.pt-grid3 {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-top: 24rpx;
}
.pt-g3-item {
  width: calc(33.33% - 11rpx);
  min-width: 0;
}
.pt-g3-img-box {
  position: relative;
  width: 100%;
  height: 184rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.pt-corner-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: #fdeae7;
  color: #f5483a;
  font-size: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 16rpx 0 16rpx 0;
}
.pt-g3-name {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pt-g3-prices {
  display: flex;
  align-items: baseline;
  margin-top: 8rpx;
  min-width: 0;
  overflow: hidden;
}

/* 样式四：横向滑动 */
.pt-scroll {
  padding-top: 24rpx;
  white-space: nowrap;
}
.pt-s-item {
  display: inline-block;
  width: 32%;
  margin-right: 16rpx;
  vertical-align: top;
  white-space: normal;
}

/* 直播（参考 CRMEB 小程序直播） */
.lv-card {
  width: 100%;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  padding: 0 20rpx 20rpx;
  box-sizing: border-box;
}
.lv-head {
  display: flex;
  align-items: baseline;
  padding-top: 20rpx;
}
.lv-head-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #282828;
  line-height: 40rpx;
}
.lv-head-icon {
  width: 124rpx;
  height: 32rpx;
  flex-shrink: 0;
  align-self: center;
}
.lv-head-sub {
  font-size: 22rpx;
  color: #999;
  margin-left: 12rpx;
}
.lv-space {
  flex: 1;
}
.lv-more {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #282828;
}
.lv-head-en {
  font-size: 18rpx;
  color: #c0c4cc;
  letter-spacing: 1rpx;
  margin-top: 2rpx;
}
.lv-img {
  width: 100%;
  height: 100%;
  display: block;
}
.lv-tag {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 18rpx;
  line-height: 1;
  padding: 6rpx 10rpx;
  border-radius: 0 0 12rpx 0;
}
.lv-tag-live {
  background: #f5483a;
}
.lv-tag-replay {
  background: #909399;
}
.lv-tag-preview {
  background: #409eff;
}
.lv-time {
  position: absolute;
  top: 0;
  left: 80rpx;
  color: #fff;
  font-size: 18rpx;
  line-height: 1;
  padding: 6rpx 10rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0 0 12rpx 0;
}
.lv-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}
.lv-s-item {
  display: inline-block;
  width: 42%;
  margin-right: 16rpx;
  vertical-align: top;
  white-space: normal;
}
.lv-s-img-box {
  position: relative;
  width: 100%;
  height: 192rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.lv-rows {
  margin-top: 16rpx;
}
.lv-row {
  display: flex;
  & + .lv-row {
    margin-top: 20rpx;
  }
}
.lv-r-img-box {
  position: relative;
  width: 176rpx;
  height: 176rpx;
  flex-shrink: 0;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 16rpx;
}
.lv-r-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.lv-title {
  font-size: 24rpx;
  color: #333;
  line-height: 32rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.lv-anchor {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lv-nogoods {
  margin-top: auto;
  background: #f5f5f5;
  color: #999;
  font-size: 20rpx;
  padding: 10rpx 16rpx;
  border-radius: 8rpx;
}
.lv-grid2 {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}
.lv-g-item {
  width: calc(50% - 8rpx);
  min-width: 0;
}
.lv-g-img-box {
  position: relative;
  width: 100%;
  height: 164rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.lv-g-item .lv-title {
  margin-top: 12rpx;
}

/* 秒杀（参考 CRMEB 秒杀） */
.sk-card {
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  padding: 0 20rpx 20rpx;
  box-sizing: border-box;
}
.sk-head {
  display: flex;
  align-items: center;
  padding: 20rpx 0 4rpx;
}
.sk-head-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  line-height: 40rpx;
}
.sk-head-icon {
  width: 124rpx;
  height: 32rpx;
  flex-shrink: 0;
}
.sk-divider {
  width: 2rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 12rpx;
  flex-shrink: 0;
}
.sk-head-sub {
  font-size: 22rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sk-space {
  flex: 1;
}
.sk-go {
  flex-shrink: 0;
  font-size: 20rpx;
  font-weight: bold;
  color: #a65f00;
  background: linear-gradient(90deg, #fff3d6, #ffd665);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
.sk-scroll {
  margin-top: 16rpx;
  white-space: nowrap;
}
.sk-s-item {
  display: inline-block;
  width: 30%;
  margin-right: 16rpx;
  vertical-align: top;
  white-space: normal;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 10rpx 10rpx 16rpx;
  box-sizing: border-box;
}
.sk-s-img-box {
  width: 100%;
  height: 190rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.sk-name {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sk-price {
  margin-top: 6rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #f5483a;
}
.sk-price-symbol {
  font-size: 20rpx;
}
.sk-price-min {
  font-size: 20rpx;
  font-weight: normal;
  margin-right: 4rpx;
}
.sk-rows {
  margin-top: 16rpx;
}
.sk-row {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 16rpx;
  box-sizing: border-box;
  & + .sk-row {
    margin-top: 16rpx;
  }
}
.sk-r-img-box {
  width: 152rpx;
  height: 152rpx;
  flex-shrink: 0;
  border-radius: 10rpx;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 16rpx;
}
.sk-r-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: stretch;
  padding: 4rpx 0;
}
.sk-r-info .sk-name {
  margin-top: 0;
  font-size: 24rpx;
}
.sk-price-lg {
  font-size: 32rpx;
  .sk-price-symbol {
    font-size: 22rpx;
  }
}
</style>
