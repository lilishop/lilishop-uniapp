<template>
  <view class="evaluate-box">
    <view class="eva-section" @click="toComment(goodsDetail.goodsId, goodsDetail.grade)">
      <view class="e-header">
        <view class="evaluate-title">评价</view>
        <text class="evaluate-num">{{ commDetail.total || '0' }}+</text>
        <text class="tip">好评率 {{ grade || '100' }}%</text>
      </view>
      <view v-if="commDetail && commDetail.records && commDetail.records.length">
        <view class="eva-box" v-for="(commItem, commIndex) in commDetail.records.slice(0, 2)" :key="commIndex">
          <view class="section-info">
            <u-avatar
              mode="circle"
              size="40"
              class="portrait"
              :src="commItem.memberProfile"
            ></u-avatar>
            <view class="star-con">
              <text class="name">{{ noPassByName(commItem.memberName) }}</text>
            </view>
          </view>
          <view class="section-contant">
            <u-read-more
              ref="uReadMore"
              :color="lightColor"
              text-indent="0"
              :show-height="120"
            >
              <rich-text @load="parseLoaded(commIndex)" :nodes="commItem.content" class="con"></rich-text>
            </u-read-more>
            <scroll-view scroll-x class="scroll-x" v-if="commentImages(commItem).length">
              <view class="img-list">
                <u-image
                  border-radius="12"
                  class="commImg"
                  width="160rpx"
                  height="160rpx"
                  mode="aspectFill"
                  v-for="(item, index) in commentImages(commItem)"
                  :src="item"
                  :key="index"
                  @click.stop="previewImg(commentImages(commItem), index)"
                ></u-image>
              </view>
            </scroll-view>
            <view class="bot">
              <text class="attr">{{ commItem.goodsName }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="goodsNoMore">
        <u-empty text="该商品暂无评论" mode="message"></u-empty>
      </view>
    </view>
    <view
      v-if="commDetail && commDetail.records && commDetail.records.length"
      class="eva-section-btn"
      @click="toComment(goodsDetail.goodsId, goodsDetail.grade)"
    >
      <text class="btn-text">查看全部评价</text>
    </view>
  </view>
</template>

<script>
import * as API_Members from "@/api/members.js";
export default {
  data() {
    return {
      lightColor: this.$lightColor,
      commDetail: [],
      grade: "",
      params: {
        pageNumber: 1,
        pageSize: 10,
        grade: "",
      },
    };
  },
  props: {
    goodsDetail: {
      default: () => ({}),
      type: Object,
    },
  },

  watch: {
    goodsDetail: {
      handler(val) {
        if (val && val.goodsId) {
          this.grade = val.grade;
          this.getGoodsCommentsMethods();
        }
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    commentImages(item) {
      const images = item.images || item.image;
      if (!images) return [];
      return typeof images === "string" ? images.split(",").filter(Boolean) : images;
    },

    parseLoaded(index) {
      this.$nextTick(() => {
        const refs = this.$refs.uReadMore;
        const target = Array.isArray(refs) ? refs[index] : refs;
        target && target.init && target.init();
      });
    },

    getGoodsCommentsMethods() {
      if (!this.goodsDetail.goodsId) return;
      API_Members.getGoodsComments(this.goodsDetail.goodsId, this.params).then((res) => {
        this.commDetail = res.data.result;
      });
    },

    toComment(id, grade) {
      uni.navigateTo({
        url: `/pages/product/comment?id=${id}&grade=${grade}`,
      });
    },

    previewImg(urls, index) {
      uni.previewImage({
        urls,
        indicator: "number",
        current: index,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../product.scss";

.name {
  color: #262626;
  font-size: 26rpx;
  line-height: 1.4;
}

.eva-section-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 0 40rpx;
  background: #fff;

  .btn-text {
    min-width: 200rpx;
    height: 56rpx;
    padding: 0 24rpx;
    font-size: 24rpx;
    line-height: 52rpx;
    text-align: center;
    color: #262626;
    border: 2rpx solid #ededed;
    box-sizing: border-box;
    border-radius: 28rpx;
  }
}

.goodsNoMore {
  padding: 20rpx 0;
  text-align: center;
  color: $u-tips-color;
}

.eva-section {
  display: flex;
  flex-direction: column;
  background: #fff;

  .e-header {
    display: flex;
    align-items: center;

    .evaluate-num {
      margin-left: 10rpx;
      font-size: 24rpx;
      color: #333;
    }

    .tip {
      flex: 1;
      text-align: right;
      color: #8c8c8c;
      font-size: 24rpx;
    }
  }
}

.scroll-x {
  width: 100%;
  white-space: nowrap;
}

.eva-box {
  padding: 28rpx 0;
  border-bottom: 2rpx solid #f2f2f2;

  &:last-child {
    border-bottom: none;
  }

  .section-info {
    display: flex;
    align-items: center;

    .portrait {
      flex-shrink: 0;
      margin-right: 16rpx;
    }

    .star-con {
      flex: 1;
      min-width: 0;
    }
  }

  .section-contant {
    width: 100%;
    margin-top: 16rpx;

    :deep(.u-read-more__content) {
      text-indent: 0 !important;
    }

    .con {
      font-size: 26rpx;
      line-height: 1.6;
      color: #333;
    }

    .img-list {
      display: inline-flex;
      gap: 12rpx;
      padding: 16rpx 0 4rpx;
    }

    .commImg {
      flex-shrink: 0;
    }

    .bot {
      margin-top: 12rpx;

      .attr {
        font-size: 22rpx;
        color: #999;
        line-height: 1.5;
      }
    }
  }
}
</style>
