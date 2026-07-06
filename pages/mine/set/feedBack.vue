<template>
  <view class="feedBack">
    <view class="feedBack-box">
      <view class="box-title">猜你想问</view>
      <view
        class="feedBack-item"
        :class="{ active: feedBack.type == item.value }"
        @click="handleClick(index)"
        v-for="(item, index) in list"
        :key="index"
      >
        {{ item.text }}
      </view>
    </view>

    <view class="feedBack-box">
      <view class="box-title">问题反馈
        <text class="box-tag" v-if="feedBack.type">@{{ list.find(item => item.value == feedBack.type).text }}</text>
      </view>
      <u-textarea
        class="field-textarea"
        v-model="feedBack.context"
        placeholder="请输入反馈信息"
        border="none"
        height="240"
        maxlength="500"
      ></u-textarea>
    </view>

    <!-- 上传凭证 -->
    <view class="feedBack-box">
      <view class="box-title">上传凭证（最多2张）</view>
      <view class="images-view">
        <u-upload :file-list="uploadFileList" :auto-upload="false" width="150" @afterRead="onUploadAfterRead" :max-count="2"></u-upload>
      </view>
    </view>

    <view class="feedBack-box">
      <view class="box-title">手机号</view>
      <u-input
        class="field-input"
        v-model="feedBack.mobile"
        type="number"
        maxlength="11"
        border="none"
        placeholder="请输入您的手机号"
        :custom-style="inputStyle"
      ></u-input>
    </view>

    <view class="submit" @click="submit()">提交</view>
  </view>

</template>

<script>
import storage from "@/utils/storage.js";
import config from "@/config/config";
import { feedBack } from "@/api/members.js";
import { handleUploadAfterRead } from "@/utils/uploadHelper.js";
export default {
  data() {
    return {
      storage,
      config,
      feedBack: {
        type: "FUNCTION",
        context: "",
        mobile: "",
      },
      inputStyle: {
        background: "#fafafa",
        borderRadius: "12rpx",
        padding: "0 24rpx",
        height: "80rpx",
      },
      uploadFileList: [],
      list: [
        { text: "功能相关", value: "FUNCTION" },
        { text: "优化反馈", value: "OPTIMIZE" },
        { text: "其他", value: "OTHER" },
      ],
    };
  },
  methods: {
    // 点击反馈内容
    handleClick(index) {
      this.feedBack["type"] = this.list[index].value;
    },

    onUploadAfterRead(event) {
      handleUploadAfterRead(event, this.uploadFileList, (urls) => {
        this.feedBack.images = urls.join(",");
      });
    },

    /**
     * 提交意见反馈
     */
    submit() {
      if (!this.feedBack.type) {
        uni.showToast({
          title: "请填写反馈类型",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (!this.feedBack.context) {
        uni.showToast({
          title: "请填写反馈信息",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (this.feedBack.mobile && !this.$u.test.mobile(this.feedBack.mobile)) {
        uni.showToast({
          title: "请填写您的正确手机号",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      /** 提交 */
      feedBack(this.feedBack).then((res) => {
        if (res.data.success) {
          uni.showToast({
            title: "提交成功!",
            duration: 2000,
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
            });
          }, 500);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.submit {
  text-align: center;
  background: $light-color;
  height: 88rpx;
  line-height: 88rpx;
  color: #fff;
  width: 92%;
  margin: 40rpx auto 60rpx;
  border-radius: 100px;
  font-size: 30rpx;
}

.active {
  color: $light-color !important;
  font-weight: bold;
}

.feedBack {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx 24rpx 40rpx;
  min-height: 100vh;
  background: #f8f8f8;
}

.feedBack-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.box-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.box-tag {
  margin-left: 10rpx;
  font-size: 26rpx;
  font-weight: normal;
  color: $light-color;
}

.feedBack-item {
  margin: 20rpx 0;
  font-size: 28rpx;
  color: #666;
}

.field-textarea {
  margin-top: 20rpx;

  :deep(.u-textarea) {
    background: #fafafa !important;
    border-radius: 12rpx;
    padding: 20rpx;
    box-sizing: border-box;
  }

  :deep(.u-textarea__field) {
    width: 100%;
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
  }
}

.field-input {
  margin-top: 20rpx;
  width: 100%;
}

.images-view {
  margin-top: 20rpx;
}
</style>
