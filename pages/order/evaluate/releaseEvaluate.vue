<template>
  <view>
    <view v-for="(sku, index) in order.orderItems" :key="index">
      <view class="after-sales-goods-detail-view">
        <view>
          <view class="goods-item-view">
            <view class="goods-img">
              <u-image border-radius="6" width="131rpx" height="131rpx" :src="sku.image" />
            </view>
            <view class="goods-info">
              <view class="goods-title u-line-2">{{ sku.name }}</view>
              <view class="goods-price">
                <view>x{{ sku.num }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="goods-evaluate-view">
        <view class="goods-view">
          <view>商品评价</view>
          <view class="sub-title">满意请打好评哦</view>
        </view>
        <view class="rate-view">
          <view class="rate-btn" @click="onGrade('GOOD', index)">
            <view style="font-size: 42rpx" :style="{ color: form.grade === 'GOOD' ? 'red' : '#CCCCCC' }" class="alifont icon-haoping1"></view>
            <text>好评</text>
          </view>
          <view class="rate-btn" @click="onGrade('MODERATE', index)">
            <view style="font-size: 42rpx" :style="{ color: form.grade === 'MODERATE' ? 'red' : '#CCCCCC' }" class="alifont icon-zhongping1"></view>
            <text>中评</text>
          </view>
          <view class="rate-btn" @click="onGrade('WORSE', index)">
            <view style="font-size: 42rpx" :style="{ color: form.grade === 'WORSE' ? 'red' : '#CCCCCC' }" class="alifont icon-chaping"></view>
            <text>差评</text>
          </view>
        </view>
      </view>
      <view class="info-evaluate-view">
        <view class="input-view">
          <u-input v-model="form.content" height="200" placeholder-style="font-size:12px;color:#CCCCCC" :type="type" :border="border" :maxlength="maxlength" :placeholder="placeholder" />
        </view>
        <view class="input-num">
          <text>{{ form.content.length }}/{{ maxlength }}</text>
        </view>
      </view>
      <view class="info-evaluate-view">
        <view class="images-view" @click="beforeUpload(index)">
          <u-upload :header=" { accessToken: storage.getAccessToken() }" :action="action" width="150" @on-uploaded="onUploaded" :max-count="5" :show-progress="false"></u-upload>
        </view>
      </view>
    </view>
    <view class="info-evaluate-view" style="margin-bottom: 150rpx">
      <view class="info-header">店铺评分</view>
      <view>
        <view class="seller-rate-view">
          <view class="rate-title">描述相符</view>
          <view>
            <u-rate count="count" gutter="20" active-color="#FFC71C" v-model="form.descriptionScore" :size="40"></u-rate>
          </view>
        </view>
        <view class="seller-rate-view">
          <view class="rate-title">服务态度</view>
          <view>
            <u-rate count="count" gutter="20" active-color="#FFC71C" v-model="form.serviceScore" :size="40"></u-rate>
          </view>
        </view>
        <view class="seller-rate-view">
          <view class="rate-title">物流服务</view>
          <view>
            <u-rate count="count" gutter="20" active-color="#FFC71C" v-model="form.deliveryScore" :size="40"></u-rate>
          </view>
        </view>
      </view>
    </view>
    <view class="onSubmit" @click="onSubmit"> 提交申请</view>

    <u-toast ref="uToast" />
  </view>
</template>

<script>
import storage from "@/utils/storage.js";
import { commentsMemberOrder } from "@/api/members.js";
import { upload } from "@/api/common.js";

export default {
  data() {
    return {
      storage,
      value: "",
      type: "textarea",
      border: false,
      maxlength: 500,
      placeholder:
        "宝贝满足您的期待吗？说说它的优点和美中不足的地方吧。您的评价会帮助更多的人",
      order: {},
      form: {
        content: "",
        goodsId: "",
        grade: "GOOD",
        orderItemSn: "",
        skuId: "",
        descriptionScore: 5,
        serviceScore: 5,
        deliveryScore: 5,
        // // 是否为初评价 true 默认为初评
        // first_comment: true,
        //content,grade: 'GOOD',skuId,images:[]
      },
      currentIndex: 0,
      action: upload,
    };
  },
  onLoad(options) {
    this.form.orderItemSn = options.sn;
    this.order = JSON.parse(decodeURIComponent(options.order));
    //现在只能一个商品一个评价
  },
  mounted() {
    this.form.goodsId = this.order.orderItems[0].goodsId;
    this.form.orderItemSn = this.order.orderItems[0].sn;
    this.form.skuId = this.order.orderItems[0].skuId;
  },
  methods: {
    beforeUpload(index) {
      this.currentIndex = index;
    },
    onGrade(grade, index) {
      this.form.grade = grade;
    },
    onSubmit() {
      uni.showLoading({
        title: "加载中",
      });
      commentsMemberOrder(this.form).then((res) => {
        uni.hideLoading();

        uni.showToast({
          title: "发布评价成功",
          duration: 2000,
          icon: "none",
          success: () => {
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          },
        });
      });
    },
    onUploaded(lists) {
      let images = [];
      console.log(lists);
      lists.forEach((item) => {
        images.push(item.response.result);
      });
      this.form.images = images;
    },
  },
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: $page-color-base;
  height: 100%;
  margin-bottom: 100rpx;
}
.onSubmit {
  width: 80%;
  margin: 0 auto;
  text-align: center;
  color: #fff;
  background: $aider-light-color;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 100px;
}
.after-sales-goods-detail-view {
  background-color: #f4f4f5;
  padding: 10rpx 0rpx;
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding-bottom: 20rpx;
    .header-text {
      background-color: #f4f4f5;
      padding: 10rpx 30rpx;
      border-radius: 50rpx;
      .seller-name {
        color: $main-color;
        font-weight: 600;
      }
    }
  }
  .goods-item-view {
    display: flex;
    flex-direction: row;
    padding: 10rpx 30rpx;
    background-color: #eef1f2;
    .goods-img {
    }
    .goods-info {
      padding-left: 30rpx;
      flex: 1;
      .goods-title {
        margin-bottom: 10rpx;
        color: $font-color-dark;
      }
      .goods-specs {
        font-size: 24rpx;
        margin-bottom: 10rpx;
        color: #cccccc;
      }
      .goods-price {
        font-size: 28rpx;
        margin-bottom: 10rpx;
        color: $light-color;
      }
    }
    .goods-num {
      width: 60rpx;
      color: $main-color;
    }
  }
  .after-num {
    margin: 0rpx 30rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
  }
}
.goods-evaluate-view {
  margin-top: 8rpx;
  padding: 20rpx;
  margin-bottom: 5rpx;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  .goods-view {
    width: 250rpx;
    font-size: 28rpx;
    color: #333333;
    .sub-title {
      font-size: 22rpx;
      color: #cccccc;
    }
  }
  .rate-view {
    color: #333333;
    display: flex;
    flex-direction: row;
    align-items: center;
    .rate-btn {
      margin: 0rpx 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      text {
        margin-left: 10rpx;
      }
    }
  }
}
.info-evaluate-view {
  margin-top: 8rpx;
  padding: 20rpx;
  background-color: #fff;
  align-items: center;
  font-size: 24rpx;
  .input-view {
    width: 100%;
  }
  .input-num {
    color: #cccccc;
    text-align: right;
  }
  .images-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
  .info-header {
    font-size: 28rpx;
    color: #333333;
    margin-bottom: 30rpx;
  }
  .seller-rate-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    .rate-title {
      line-height: 70rpx;
      width: 150rpx;
      font-size: 26rpx;
      color: #333333;
    }
  }
}

.submit-view {
  position: fixed;
  z-index: 999;
  bottom: 0px;
  left: 0px;
  margin-top: 100rpx;
  border: solid 2rpx #f2f2f2;
  background-color: #ffffff;
  height: 100rpx;
  width: 750rpx;
  align-items: center;
  padding: 0rpx 20rpx;
}
</style>
