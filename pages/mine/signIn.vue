<template>
  <view class="sign-in">
    <view class="signin-btn-con">
      <div class="circle-box">
        <div class="cricle" @click="signIn()">
          <span v-if="!ifSign" :class="{ active: signFlag || ifSign }">签到</span>
          <span v-else :class="{ active: signFlag || ifSign }" :style="ifSign ? 'transform: rotateY(0deg);' : ''">已签</span>
        </div>
      </div>
      <text class="tips">坚持每天连续签到可以获多重奖励哦</text>
    </view>
    <div class="date-card">
      <view class="date-con">
        <view class="date-tit">
          <u-row style="width: 100%;  justify-content: center;">
            <div style="text-align: center; " class="text">{{ currentMonth }} {{ currentYear }}</div>
          </u-row>
        </view>
        <view class="week">
          <text v-for="item in weekArr" :key="item.id">{{ item }}</text>
        </view>
        <view class="date" v-for="obj in dataObj" :key="obj.id">
          <view class="item" v-for="item in obj" :key="item.id" :class="item == '' ? 'hide' : ''" :animation="item == currentDay ? animationData : ''">
            <view class="just" :class="signArr.indexOf(item) != -1 ? 'active' : ''">
              <view class="top">{{ item }} </view>
              <view class="bottom">
                <u-icon name="error" v-if="item <= currentDay" color="#999"></u-icon>
              </view>
            </view>
            <view class="back" :class="signArr.indexOf(item) != -1 ? 'active' : ''" :style="
                signArr.indexOf(item) != -1 && ifSign
                  ? 'transform: rotateY(0deg);'
                  : signArr.indexOf(item) != -1 && item != currentDay
                  ? 'transform: rotateY(0deg);'
                  : ''
              ">
              <view class="top">{{ item }}</view>
              <view class="bottom">
                <u-icon name="checkmark" color="#ff9f28"></u-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
    </div>
    <view class="mask" :class="{ show: maskFlag, trans: transFlag }" ref="mask">
      <view class="mask-header">
        <text class="close"></text>
        <text>签到成功</text>
        <text class="close" @click="close">×</text>
      </view>
      <view class="mask-con">
        <view class="keep-sign">
          本月已连续签到
          <text>{{ continuity }}</text>
          天
        </view>
        <u-icon size="120" style="margin: 50rpx 0" color="#ff9f28" name="checkmark"></u-icon>
        <view class="mark">
          <view>获得积分</view>
          <text>{{ continuity_point }}</text>
        </view>
        <text class="text">连续签到可获得额外奖励哦！</text>
      </view>
    </view>
  </view>
</template>

<script>
import { sign, signTime } from "@/api/point.js";
export default {
  data() {
    return {
      continuity: 1,
      continuity_point: 2,
      header: {
        top: 0,
        height: 50,
      },
      signFlag: false,
      animationData: {},
      maskFlag: false,
      transFlag: false,
      weekArr: ["日", "一", "二", "三", "四", "五", "六"],
      dateArr: [], //每个月的天数
      monthArr: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
      ], //今天一个月英文
      currentMonth: "", //当月
      currentMonthIndex: "", //当月
      currentYear: "", //今年
      currentDay: "", //今天
      currentWeek: "", //获取当月一号是周几
      dataObj: [], //一个月有多少天这个获取
      signArr: [], //本月签到过的天数 该参数用于请求接口后获取当月都哪天签到了
      signAll: [], //所有签到数据
      ifSign: false, //今天是否签到
    };
  },
  async onLoad() {
    //获取签到数据
    var response = await signTime(
      new Date().getFullYear() + "" + this.makeUp(new Date().getMonth() + 1)
    );
    this.signAll = response.data.result;
    //获取展示数据
    this.getDate();
  },
  methods: {
    makeUp(val) {
      if (val >= 10) {
        return val;
      } else {
        return "0" + val;
      }
    },
    // 返回
    back() {
      uni.navigateBack();
    },
    // 签到
    async signIn() {
      await sign().then((response) => {
        if (this.ifSign) return;
        if (this.signFlag) return;
        if (response.data.code != 200) {
          uni.$showToast({
            title: response.message,
            icon: "none",
          });

          return false;
        }
        var that = this;
        var animation = uni.createAnimation({
          duration: 200,
          timingFunction: "linear",
        });
        this.signArr.push(this.currentDay);
        this.animation = animation;
        animation.rotateY(0).step();
        this.animationData = animation.export();

        setTimeout(
          function () {
            that.signFlag = true;
            this.maskFlag = true;
            this.ifSign = !this.ifSign;
            animation.rotateY(0).step();
            this.animationData = animation.export();
          }.bind(this),
          200
        );
      });
    },
    // 关闭弹窗
    close() {
      var that = this;
      this.maskFlag = false;
      this.transFlag = true;
      setTimeout(function () {
        that.transFlag = false;
      }, 500);
    },
    change(id) {
      var i = this.monthArr.indexOf(this.currentMonth),
        curDay = null;
      if (id === "1") {
        i++;
        if (i > 11) {
          this.currentYear++;
          i = 0;
        }
        this.currentMonth = this.monthArr[i];
        this.currentMonthIndex = i + 1;
      } else {
        i--;
        if (i < 0) {
          this.currentYear--;
          i = 11;
        }
        this.currentMonth = this.monthArr[i];
        this.currentMonthIndex = i + 1;
      }
      curDay = this.getWeekByDay(this.currentYear + "-" + (i + 1) + "-1");
      this.getMonthDays(i, curDay);
      this.curentSignData();
    },
    getDate() {
      //获取日子
      var date = new Date(),
        index = date.getMonth(),
        curDay = null;
      this.currentYear = date.getFullYear();
      this.currentMonth = this.monthArr[index];
      this.currentMonthIndex = index + 1;
      this.currentDay = date.getDate();
      console.log(this.currentDay);
      console.log(this.signArr[this.signArr.length - 1]);
      if (this.currentDay == this.signArr[this.signArr.length - 1]) {
        console.log("12");
        this.ifSign = true;
      }
      curDay = this.getWeekByDay(this.currentYear + "-" + (index + 1) + "-1");
      this.getMonthDays(index, curDay);
      this.curentSignData();
    },
    curentSignData() {
      var date = new Date(),
        index = date.getMonth(),
        curDay = null;
      this.signArr = [];
      for (var i = 0; i < this.signAll.length; i++) {
        var item = this.signAll[i];
        item.createTime = item.createTime.split(" ")[0];

        var itemVal = item.createTime.split("-");
        console.log(itemVal);
        if (
          Number(itemVal[0]) === Number(this.currentYear) &&
          Number(itemVal[1]) === Number(this.currentMonthIndex)
        ) {
          this.signArr.push(Number(itemVal[2]));
          console.log(JSON.stringify(this.signArr));
        }
        if (
          Number(itemVal[0]) === Number(date.getFullYear()) &&
          Number(itemVal[1]) === Number(index + 1) &&
          Number(itemVal[2]) === Number(date.getDate())
        ) {
          this.ifSign = true;
        }
      }
    },
    getMonthDays(index, day) {
      //day 当月1号是周几
      this.dateArr = [];
      this.dataObj = [];
      for (var i = 0; i < day; i++) {
        this.dateArr.push("");
      }
      if (
        index == 0 ||
        index == 2 ||
        index == 4 ||
        index == 6 ||
        index == 7 ||
        index == 9 ||
        index == 11
      ) {
        for (let i = 1; i < 32; i++) {
          this.dateArr.push(i);
        }
      }
      if (index == 3 || index == 5 || index == 8 || index == 10) {
        for (let i = 1; i < 31; i++) {
          this.dateArr.push(i);
        }
      }
      if (index == 1) {
        if (
          (this.currentYear % 4 == 0 && this.currentYear % 100 != 0) ||
          this.currentYear % 400 == 0
        ) {
          for (let i = 1; i < 30; i++) {
            this.dateArr.push(i);
          }
        } else {
          for (let i = 1; i < 29; i++) {
            this.dateArr.push(i);
          }
        }
      }
      for (var y = 0; y < 10; y++) {
        if (this.dateArr.length > 7) {
          this.dataObj.push(this.dateArr.splice(0, 7));
        } else {
          for (let i = 0; i < 7 - this.dateArr.length; i++) {
            this.dateArr.push("");
          }
        }
      }
      this.dataObj.push(this.dateArr);
    },
    getWeekByDay(dayValue) {
      //dayValue=“2014-01-01”
      var day = new Date(Date.parse(dayValue.replace(/-/g, "/"))).getDay(); //将日期值格式化
      return day;
    },
  },
};
</script>

<style lang="scss" scoped>
.date-card {
  padding: 0 40rpx;
}
.tips {
  margin-top: 34rpx;
}
.circle-box {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  margin-top: 60rpx;
  background: #ff9f28;
  display: flex;
  justify-content: center; //这个是X轴居中
  align-items: center; //这个是 Y轴居中
}

.cricle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #ff9f28;
  text-align: center;
  line-height: 160rpx;
  color: #fff;
  font-size: 40rpx;
}

page {
  background: #fff;
}

.sign-in {
  color: #333;
  .signin-btn-con {
    width: 100%;
    height: 670rpx;
    background-image: linear-gradient(180deg, #ff6b35, #ff9f28, #ffcc03);
    display: flex;
    flex-direction: column;
    align-items: center;
    text {
      color: #fff;
      font-size: 28rpx;
      font-weight: 400;
    }
  }

  .date-con {
    background: #fff;
    min-height: 730rpx;
    border-radius: 0.8em;
    border: 1px solid #ededed;
    padding: 0 28rpx;
    transform: translateY(-320rpx);
    box-shadow: (1px 3px 5px rgba(0, 0, 0, 0.2));
  }

  .date-tit {
    display: flex;
    justify-content: space-between;
    margin: 30rpx 0;
  }

  .week {
    display: flex;
    justify-content: space-between;
    color: #a6a6a6;
    font-size: 26rpx;

    text {
      width: 66rpx;
      text-align: center;
    }
  }

  .date {
    margin: 10rpx 0 36rpx;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .item {
      width: 66rpx;
      height: 80rpx;
      border-radius: 5px;
      overflow: hidden;

      position: relative;

      &.hide {
        opacity: 0;
      }

      .just,
      .back {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        position: absolute;

        .top {
          position: relative;
          flex: 1;
          text-align: center;
          line-height: 40rpx;

          &:before {
            content: "";
            width: 40rpx;
            height: 40rpx;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 15rpx;
          }
        }
      }

      .just {
        &.active {
          display: none;
        }
      }
      .back {
        display: none;
        &.active {
          display: flex;
        }

        .top {
          color: #ff9f28;
        }
      }

      .bottom {
        color: #999;
        font-size: 20rpx;
        height: 20rpx;
        line-height: 20rpx;
        text-align: center;
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100%;
    right: 100%;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.5s;

    &.show {
      opacity: 1;
      left: 0;
      right: 0;
    }

    &.trans {
      left: 0;
      right: 0;
    }

    .mask-header {
      width: 540rpx;
      height: 130rpx;
      line-height: 130rpx;
      background: #ff9f28;
      color: #fff;
      font-size: 40rpx;
      font-weight: 500;
      display: flex;
      justify-content: space-between;

      .close {
        width: 60rpx;
        font-size: 66rpx;
        font-weight: 400;
        line-height: 60rpx;
      }
    }

    .mask-con {
      width: 540rpx;
      height: 460rpx;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #999;
      font-size: 24rpx;
      border-radius: 0 0 9px 9px;

      .keep-sign {
        font-size: 30rpx;
        margin-top: 30rpx;

        text {
          font-size: 46rpx;
          font-weight: 500;
          color: #999;
          padding: 0 6rpx 0 8rpx;
        }
      }

      .mark {
        // flex: 1;
        display: flex;
        align-items: flex-end;
        position: relative;
        margin-bottom: 16rpx;

        text {
          margin-left: 4rpx;
          color: #999;
        }
      }

      .text {
        color: #6f6f6f;
        height: 90rpx;
      }
    }
  }
}
</style>
