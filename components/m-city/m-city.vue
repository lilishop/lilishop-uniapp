<template>
  <view>
    <view
      class="mask"
      :class="{ maskShow: showPicker }"
      @click="hide"
      @click.stop.prevent
      @touchmove.stop.prevent
      catchtouchmove="true"
    ></view>
    <view class="cpicker-content" :class="{ cpickerShow: showPicker }">
      <view
        class="city-head"
        @click.stop.prevent
        @touchmove.stop.prevent
        catchtouchmove="true"
      >
        <view class="city-head-title">{{ headTitle }}</view>
        <icon
          type="clear"
          v-if="rightIcon"
          class="rightIcon"
          size="20"
          color="#cccccc"
          @click="hide"
        ></icon>
      </view>
      <scroll-view
        id="nav-bar"
        class="nav-bar"
        scroll-x="true"
        scroll-with-animation="true"
        :scroll-left="scrollLeft"
      >
        <view
          v-for="(item, index) in tabbars"
          class="nav-item"
          :key="index"
          :id="'tab' + index"
          @click="changeTab(index)"
          :class="{ current: index === tabCurrentIndex }"
          ><text class="nav-bar-title">{{ item.localName }}</text></view
        >
      </scroll-view>
      <view class="city_content">
        <scroll-view
          class="panel-scroll-box"
          :scroll-y="enableScroll"
          :cscrollTop="scrollTop"
          :current="tabCurrentIndex"
          :scroll-top="scrollTop"
        >
          <block
            v-for="(item, index) in tabbars[tabCurrentIndex].children"
            :key="index"
          >
            <view
              class="flex-row-c-c"
              @click="changCity(tabCurrentIndex, item)"
            >
              <text
                class="city-text"
                :class="{ color: tabbars[tabCurrentIndex].id == item.id }"
                >{{ item.name }}</text
              >
              <icon
                type="success_no_circle"
                v-if="tabbars[tabCurrentIndex].id == item.id"
                :id="'show' + tabCurrentIndex"
                class="ischeck"
                size="14"
                :color="$lightColor"
              ></icon>
            </view>
          </block>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
let windowWidth = 0
import { getRegionsById } from "@/api/common.js";
export default {
  name: "UniCityNvue",
  props: {
    headTitle: {
      //标题
      type: String,
      default: "区域选择",
    },
    pickerSize: {
      // 使用多少个tab
      type: [String, String],
      default: "1",
    },
    provinceData: {
      // 默认的省市区id，如果不使用id的情况下则为[]；
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      rightIcon: true,
      scrollLeft: 500, //顶部选项卡左滑距离
      scrollTop: 0,
      enableScroll: true,
      tabCurrentIndex: 0, //当前选项卡索引
      tabbars: this.provinceData,
      pickersize: this.pickerSize,
      showPicker: false,
    };
  },
  methods: {
    show() {
      this.showPicker = true;
      if (this.tabbars[0].children.length == 0) {
        getRegionsById(0).then((res) => {
          this.tabbars[0].children = res.data.result;
        });
      }

      windowWidth = uni.getSystemInfoSync().windowWidth;
    },
    hide() {
      this.showPicker = false;
    },
    //tab切换
    changeTab(e) {
      let index = e;
      this.setScroll(index);
      //延迟300ms,等待swiper动画结束再修改tabbar
      this.tabCurrentIndex = index;
      setTimeout(() => {
        this.getScroll("show" + index);
      }, 10);
    },
    //获得元素的size
    getElSize(id) {
      return new Promise((res, rej) => {
        let el = uni
          .createSelectorQuery()
          .in(this)
          .select("#" + id);
        el.fields(
          {
            size: true,
            scrollOffset: true,
            rect: true,
          },
          (data) => {
            res(data);
          }
        ).exec();
      });
    },
    async changCity(index, item) {
      if (this.tabbars[index].id != item.id) {
        this.tabbars[index].localName = item.name;
        this.tabbars[index].id = item.id;
        if (index < this.tabbars.length - 1) {
          this.tabbars.splice(index + 1, this.tabbars.length - index - 1);
        }

        if (this.tabbars.length < this.pickersize) {
          console.log(item.id);

          let data = await getRegionsById(item.id);

          if (data.data.result.length == 0) {
            this.$emit("funcValue", this.tabbars);
            this.hide();
          } else {
            var current = {
              localName: "请选择",
              id: "",
              children: data.data.result,
            };
            this.tabbars.push(current);
            this.tabCurrentIndex++;

            this.scrollTop = 0;
          }
        } else {
          this.$emit("funcValue", this.tabbars);
          this.hide();
        }
      }
    },
    async setScroll(index) {
      let width = 0;
      let nowWidth = 0;
      for (let i = 0; i <= index; i++) {
        let result = await this.getElSize("tab" + i);
        width += result.width;
        if (i === index) {
          nowWidth = result.width;
        }
      }
      if (width + nowWidth > windowWidth) {
        this.scrollLeft = width + nowWidth;
      } else {
        this.scrollLeft = 0;
      }
    },
    getScroll(id) {
      uni
        .createSelectorQuery()
        .in(this)
        .select(".panel-scroll-box")
        .boundingClientRect((data) => {
          uni
            .createSelectorQuery()
            .in(this)
            .select("#" + id)
            .boundingClientRect((res) => {
              if (res != undefined && res != null && res != "") {
                this.scrollTop = res.top - data.top;
              }
            })
            .exec();
        })
        .exec();
    },
  },
};
</script>

<style lang="scss" scoped>
/* 优惠券面板 */
.mask {
  visibility: hidden;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: all 0.3s ease;
}
.maskShow {
  visibility: visible;
  opacity: 1;
}
.cpicker-content {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  transition: all 0.3s ease;
  transform: translateY(100%);
  z-index: 3000;
}
.cpickerShow {
  transform: translateY(0);
}
.city-head {
  width: 750rpx;
  height: 88rpx;
  flex-direction: column;
  border-bottom-width: 1px;
  border-bottom-color: #f4f4f4;
  border-bottom-style: solid;
}
.city-head-title {
  font-size: 15px;
  line-height: 88rpx;
  align-items: center;
  /* #ifndef APP-NVUE */
  text-align: center;
  /* #endif */
}
.rightIcon {
  position: absolute;
  right: 15px;
  top: 12px;
  font-size: 10px;
  color: #bebebe;
}
.nav-bar {
  position: relative;
  z-index: 10;
  height: 90rpx;
  white-space: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

.nav-item {
  /* #ifndef APP-NVUE */
  display: inline-flex !important;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex-direction: row !important;
  /* #endif */
  width: 170rpx;
  padding: 7px 0px;
  line-height: 26px;
  align-items: center;
  justify-content: center;
  color: #303133;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-bar-title {
  font-size: 12px;
}
.current {
  color: $aider-light-color;
  border-color: $aider-light-color;
  border-bottom-width: 4rpx;
  border-bottom-style: solid;
}
.current:after {
  width: 50%;
}
.panel-scroll-box {
  height: 516rpx;
  margin-top: 8px;
}
.flex-row-c-c {
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex-direction: row;
  /* #endif */
  padding-left: 25px;
}
.city-text {
  /* #ifdef APP-NVUE */
  flex-direction: row;
  /* #endif */
  height: 35px;
  line-height: 35px;
  font-size: 13px;
}
.hide {
  opacity: 0;
}
.ischeck {
  /* #ifndef APP-NVUE */
  display: inline-flex !important;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex-direction: column;
  /* #endif */
  margin-right: 5px;
  vertical-align: middle;
}
.color {
  color: $light-color;
}
icon {
  margin-left: 40rpx;
}
</style>