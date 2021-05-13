<template>
  <view>
    <view class="exaluate-member-view">
      <view class="member-view">
        <view class="member-img">
          <u-image
            width="82rpx"
            style="border: 1px solid #ededed"
            height="82rpx"
            shape="circle"
            :src="comment.memberProfile || '/static/missing-face.png'"
          ></u-image>
        </view>
        <view class="member-info">
          <view class="memName">{{ comment.memberName }}</view>
          <view class="creName">{{ comment.createTime }}</view>
        </view>
      </view>
      <view class="goods-view">
        <view class="goods-title"
          >商品评价: {{ gradeList[comment.grade] }}</view
        >
        <view class="goods-subtitle">
          {{ comment.content }}
          
        </view>
        <view class="goods-imgs-view"  v-if="comment.image != null && comment.image.length != 0">
          
          <view
            class="img-view"
            v-for="(img, imgIndex) in comment.image.split(',')"
            :key="imgIndex"
			
          >
            <u-image @click.native="preview(comment.image.split(','),imgIndex)" width="160rpx" height="160rpx" :src="img"></u-image>
          </view>
        </view>
        <view class="goods-name">
          {{ comment.goodsName }}
        </view>
        <view class="goods-subtitle"></view>
        <view v-if="comment.additional_comment != null">
          <view class="goods-comm">
            <span style="margin-left: 10rpx">
              购买{{ calcDay(comment) }}天后追加评论
            </span>
            <text>{{
              comment.additional_comment.create_time | unixToDate
            }}</text>
          </view>
          <view class="goods-subtitle additional">{{
            comment.additional_comment.content
          }}</view>
          <view class="goods-imgs-view">
            <view
              class="img-view"
              v-for="(img, imgIndex) in comment.additional_comment.images"
              :key="imgIndex"
            >
              <!-- <image :src="img"></image> -->
              <u-image width="160rpx" height="160rpx" :src="img"></u-image>
            </view>
          </view>
          <view v-if="comment.additional_comment.reply_status == 1">
            <view style="border-bottom: 1px solid #ededed; width: 100%"></view>
            <view class="goods-comm store-reply">
              <span style="margin-left: 10rpx">掌柜回复：</span>
            </view>
            <view class="goods-subtitle additional">{{
              comment.additional_comment.reply.content
            }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      src: "",
	  comment: {},
	    gradeList: {
        GOOD: "好评",
        MODERATE: "中评",
        WORSE: "差评",
        haveImage: "有图",
      },
    };
  },
  onLoad(options) {
    this.comment = JSON.parse(decodeURIComponent(options.comment));
  
  },
  methods: {
	preview(urls, index) {
	
      uni.previewImage({
        current: index,
        urls: urls,
        longPressActions: {
          itemList: ["保存图片"],
          success: function (data) {},
          fail: function (err) {},
        },
      });
    },
    calcDay(order) {
      let date = "";
      console.log();
      if (order.additional_comment) {
        date =
          (order.additional_comment.create_time - order.create_time) /
          60 /
          60 /
          24;
      }
      return Math.ceil(date);
    },
  },
};
</script>

<style lang="scss">
.goods-comm {
  color: #ff6262;
  border-left: 3px solid #1abc9c;
  text {
    float: right;
    font-size: 24rpx;
    color: #999999;
  }
  &::after {
    content: "";
    display: block;
    clear: both;
  }
}
.store-reply {
  color: #333;
  margin-top: 20rpx;
}
.memName {
  font-size: 28rpx;
}
.additional {
  margin: 20rpx 0;
}
.goods-name {
  border-bottom: 1px solid #ededed;
  padding-bottom: 30rpx;
}
.creName,
.goods-name {
  font-size: 24rpx;
  color: $u-tips-color;
}
page,
.content {
  background: $page-color-base;
  height: 100%;
}
.seller-view {
  background-color: #fff;
  margin: 5rpx 0rpx;
  padding: 0rpx 30rpx;
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
  .goods-item-view {
    display: flex;
    flex-direction: row;
    padding: 10rpx 0rpx;
    .goods-img {
    }
    .goods-info {
      padding-left: 30rpx;
      width: 380rpx;
      .goods-title {
        margin-bottom: 10rpx;
      }
      .goods-specs {
        margin-bottom: 10rpx;
        color: #909399;
      }
      .goods-price {
        margin-bottom: 10rpx;
        color: #909399;
      }
    }
    .goods-num {
      margin: 0rpx 10rpx;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      margin-bottom: 10rpx;
    }
  }
  .btn-view {
    min-height: 70rpx;
    margin: 5rpx 0rpx;
    display: flex;
    flex-direction: row;
    .description {
      color: #909399;
      size: 25rpx;
      .text {
        margin: 10rpx 0rpx;
      }
      .title {
        color: #000000;
      }
    }
    .again-btn {
      margin: 0rpx 10rpx;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      margin-bottom: 10rpx;
    }
  }
}
.exaluate-member-view {
  background-color: #fff;
  margin-top: 12rpx;
  padding: 20rpx;
  .member-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    .member-img {
      width: 100rpx;
      margin: 20rpx;
    }
    .member-info {
      margin-left: 15rpx;
    }
  }
  .goods-view {
    margin-left: 15rpx;
    .border-bottom {
      padding-bottom: 20rpx;
      border-bottom: 1px solid #ededed;
    }
    .goods-title {
      margin-bottom: 10rpx;
    }
    .goods-subtitle {
      margin-bottom: 20rpx;
      color: #909399;
    }
    .goods-imgs-view {
      margin: 20rpx 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      .img-view {
        margin-right: 15rpx;
      }
    }
  }
}
</style>
