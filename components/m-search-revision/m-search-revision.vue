<template>
  <view class="serach">
    <view class="left-box" @tap="onClickLeft">
      <uni-icons style="line-height:70rpx" :color="color" type="back" size="24" />
    </view>
    <view class="content" :style="{ 'border-radius': radius + 'px' }">
      <!-- HM修改 增加进入输入状态的点击范围 -->
      <view class="content-box" :class="{ center: mode === 2 }">
        <u-icon name="search" size="32" style="padding:0 15rpx;"></u-icon>
        <!-- HM修改 增加placeholder input confirm-type confirm-->
        <input style="width:100%; " :placeholder="placeholder" placeholder-class="placeholder-color" @input="inputChange" confirm-type="search" @confirm="triggerConfirm" class="input"
          :class="{ center: !active && mode === 2 }" :focus="isFocus" v-model="inputVal" @focus="focus" @blur="blur" />
        <!-- <view v-if="!active && mode === 2" class="input sub" @click="getFocus">请输入搜索内容</view> -->
        <!-- HM修改 @click换成@click.stop阻止冒泡 -->
        <text v-if="isDelShow" class="icon icon-del" @click.stop="clear"></text>
      </view>
      <view v-show="(active && show && button === 'inside') || (isDelShow && button === 'inside')" class="serachBtn" @click="search">搜索</view>
    </view>
    <view v-if="button === 'outside'" class="button" :class="{ active: show || active }">
      <!-- @click="search" -->
      <view v-if="isShowSeachGoods !=true" class="button-item">
        <div @click="out()">取消</div>
      </view>

      <view v-else class="button-item">
        <!-- {{ !show ? searchName : '搜索' }} -->
        <u-icon name="grid-fill" size="50" @click="handelListClass()" v-if="!isListClass"></u-icon>
        <u-icon v-else @click="handelListClass()" name="list-dot" size="50"></u-icon>
      </view>
    </view>
  </view>
</template>

<script>
import uniStatusBar from "../uni-status-bar/uni-status-bar.vue";
import uniIcons from "../uni-icons/uni-icons.vue";

export default {
  watch: {},
  mounted() {},

  components: {
    uniStatusBar,
    uniIcons,
  },
  props: {
    mode: {
      value: Number,
      default: 1,
    },
    //HM修改 定义默认搜索关键词(水印文字)
    placeholder: {
      value: String,
      default: "请输入搜索内容",
    },
    value: {
      type: String,
      default: "",
    },
    button: {
      value: String,
      default: "outside",
    },
    show: {
      value: Boolean,
      default: true,
    },
    leftText: {
      type: String,
      default: "",
    },
    color: {
      type: String,
    },
    statusBar: {
      type: [Boolean, String],
      default: false,
    },
    rightText: {
      type: String,
      default: "",
    },
    leftIcon: {
      type: String,
      default: "",
    },
    rightIcon: {
      type: String,
      default: "",
    },
    radius: {
      value: String,
      default: 60,
    },
    isFocusVal: {
      value: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isShowSeachGoods: false,
      // 点击左侧按钮
      nums: 0,
      iconParams: false,
      active: false,
      inputVal: "",
      searchName: "取消",
      isDelShow: false,
      isFocus: false,
      isListClass: true,
    };
  },
  mounted() {
    this.isFocus = this.isFocusVal;
  },
  methods: {
    ddType() {
      this.isShowSeachGoods = true;
    },

    out() {
      uni.reLaunch({
        url: "/pages/tabbar/home/index"
      });
    },
    // 切换排列顺序
    handelListClass() {
      this.isListClass = !this.isListClass;
      this.$emit("SwitchType");
    },
    //HM修改 触发组件confirm事件
    triggerConfirm() {
      this.nums++;
      this.$emit("confirm", false);
      uni.hideKeyboard();
      this.isShowSeachGoods = true;
    },
    //HM修改 触发组件input事件
    inputChange(event) {
      this.nums++;
      var keyword = event.detail.value;
      this.$emit("input", keyword);
      if (this.inputVal) {
        this.isDelShow = true;
      }
    },
    focus() {
      this.active = true;
      //HM修改 增加获取焦点判断
      if (this.inputVal) {
        this.isDelShow = true;
      }
    },
    blur() {
      this.isFocus = false;
      if (!this.inputVal) {
        this.active = false;
      }
    },
    clear() {
      //HM修改 收起键盘
      uni.hideKeyboard();
      this.isFocus = false;
      this.inputVal = "";
      this.active = false;
      //HM修改 清空内容时候触发组件input
      this.$emit("input", "");
      //this.$emit('search', '');//HM修改 清空内容时候不进行搜索
    },
    getFocus() {
      if (!this.isFocus) {
        this.isFocus = true;
      }
    },
    onClickLeft() {
      uni.navigateBack();
    },
    search() {
      this.nums++;
      //HM修改 增加点击取消时候退出输入状态，内容为空时，输入默认关键字
      if (!this.inputVal) {
        if (!this.show && this.searchName == "取消") {
          uni.hideKeyboard();
          this.isFocus = false;
          this.active = false;
          return;
        }
      }
      this.$emit("search", this.inputVal ? this.inputVal : this.placeholder);
    },
  },
  watch: {
    inputVal(newVal) {
      if (newVal) {
        this.searchName = "搜索";
        //this.isDelShow = true; //HM修改 直接点击页面预设关键字样式异常，注销
      } else {
        this.searchName = "取消";
        this.isDelShow = false;
      }
    },
    //HM修改 双向绑定
    value(val) {
      this.inputVal = val;
    },
  },
};
</script>

<style lang="scss">
.serach {
  display: flex;
  width: 100%;
  //border-bottom: 1px #f5f5f5 solid; //HM修改 去掉边框
  box-sizing: border-box;
  font-size: $uni-font-size-base;

  .left-box {
    width: 15%;
    /* #ifndef APP-NVUE */
    text-align: center;
    // display: flex;
    // /* #endif */
  }

  .content {
    display: flex;
    align-items: center;
    width: 100%;
    height: 70rpx;
    color: #999;
    background: #eee;
    overflow: hidden;
    transition: all 0.2s linear;

    // border-radius: 30px;

    .content-box {
      width: 100%;
      display: flex;
      align-items: center;

      &.center {
        justify-content: center;
      }

      .icon {
        padding: 0 15rpx;

        &.icon-del {
          font-size: 38rpx;

          &:before {
            content: "\e644";
          }
        }

        &.icon-serach:before {
          content: "\e61c";
        }
      }

      .input {
        width: 100%;
        max-width: 100%;
        line-height: 60rpx;
        height: 60rpx;
        transition: all 0.2s linear;

        &.center {
          width: 200rpx;
        }

        &.sub {
          // position: absolute;
          width: auto;
          color: grey;
        }
      }
    }

    .serachBtn {
      height: 100%;
      flex-shrink: 0;
      padding: 0 30rpx;
      //HM修改 按钮背景色
      background: linear-gradient(to right, grey, grey);
      //background: $uni-color-success;
      line-height: 60rpx;
      color: #eee;
      //border-left: 1px #ccc solid; //HM修改 去掉边框
      transition: all 0.3s;
    }
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    width: 0;
    transition: all 0.2s linear;
    white-space: nowrap;
    overflow: hidden;

    &.active {
      padding-left: 15rpx;
      width: 100rpx;
    }
  }
}

.icon {
  font-family: iconfont;
  font-size: 32rpx;
  font-style: normal;
  color: #999;
}

.placeholder-color {
  color: #999;
  opacity: 0.4;
}
</style>
