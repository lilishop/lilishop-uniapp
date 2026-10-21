<template>
  <view>
    <view
      v-if="!state.hid"
      class="flex-row-center"
      :style="{ top: state.scHight }"
      style="width: 750rpx; position: fixed; z-index: 100; left: 0; background-color: #ffffff; padding: 40rpx 0"
    >
      <view class="flex-column-center">
        <movable-area
          class="flex"
          style="width: 100%"
          animation="false"
          :style="{ height: state.originalHeight }"
        >
          <movable-view
            scale-value="1"
            animation="false"
            damping="5000"
            :x="state.moveX"
            :style="{
              height: state.sliderHeight,
              width: state.sliderWidth,
              'z-index': 101,
            }"
            direction="horizontal"
          >
            <image
              :src="state.imgbk"
              class="image"
              mode="aspectFit"
              :style="{
                height: state.sliderHeight,
                width: state.sliderWidth,
                'margin-top': state.imgbKH,
              }"
            ></image>
          </movable-view>
          <image
            :src="state.img"
            mode="aspectFit"
            :style="{ height: state.originalHeight, width: state.originalWidth }"
            style="border-radius: 24rpx"
          ></image>
        </movable-area>

        <movable-area class="v-track" animation="false">
          <view class="v-fill" :style="{ width: fillWidth }"></view>
          <text class="v-track-text" :style="{ color: state.col }">{{
            state.hasImg
          }}</text>
          <movable-view
            scale-value="1"
            animation="false"
            damping="50"
            :x="state.movePv"
            class="v-handle"
            :style="handleStyle"
            direction="horizontal"
            @change="moveChange"
            @touchend="end"
          >
            <u-icon
              color="#ffffff"
              size="38"
              v-if="state.endLoad"
              name="arrow-right"
            ></u-icon>
            <u-icon color="#ffffff" size="38" v-else name="reload"></u-icon>
          </movable-view>
        </movable-area>

        <view class="v-foot">
          <view class="v-icon-btn" @click="getCode">
            <u-icon color="#888888" size="32" name="reload"></u-icon>
          </view>
          <view class="v-icon-btn" @click="hide">
            <u-icon color="#888888" size="30" name="close"></u-icon>
          </view>
        </view>
        <view class="v-mark">
          <text class="cuIcon-safe v-mark-icon"></text>
          <text>Lili-FRAMEWORK 安全验证</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useStore } from '@/store'
import api from '@/config/api.js'
import storage from '@/utils/storage.js'
import uuid from '@/utils/uuid.modified.js'

const emit = defineEmits(['send'])
const props = withDefaults(defineProps<{
  height?: string
  width?: string
  left?: string
  top?: string
  business?: string
}>(), {
  height: '80rpx',
  width: '350rpx',
  left: '180rpx',
  top: '30rpx',
  business: 'LOGIN'
})

const store = useStore()
const phone = uni.getSystemInfoSync()
const l = phone.screenWidth / 750

const mainColor = computed(() => store.getters.mainColor)
const fillWidth = computed(() => `${state.moveX + 42 * l}px`)
const handleStyle = computed(() => {
  const glow = /^#[0-9a-fA-F]{6}$/.test(mainColor.value)
    ? mainColor.value + '59'
    : 'rgba(0, 0, 0, 0.18)'
  return { background: mainColor.value, boxShadow: `0 6rpx 20rpx ${glow}` }
})
const state = reactive({
  flage: false,
  key: '', // key
  vsrtx: '点击进行验证', // 按钮提示语
  vsr: false,
  hid: true,
  col: '#838383',
  movePv: 0,
  hasImg: '拖动滑块已完成拼图',
  spcode: '',
  tl: 0,
  moveCode: 0,
  // X轴移动距离
  moveX: 0,
  // 模版高度
  originalHeight: '',
  // 模版宽度
  originalWidth: '',
  // 拼图高度
  sliderHeight: '',
  // 平涂宽度
  sliderWidth: '',
  scHight: 0,
  // 原图
  img: '',
  // 拼图
  imgbk: '',
  endLoad: true,
  imgbKH: ''
})

// 可自行调整
state.scHight = phone.screenHeight / 2 - 200 + 'px'
getCode()

function show() {
  state.hid = false
}

function hide() {
  if (!state.vsr) {
    // vsr判断是否验证成功，成功隐藏验证框
    state.hid = !state.hid
  }
}

function error() {
  state.vsr = false
  state.hid = false
  state.moveX = 0
  state.moveCode = 0
}

// 获取验证图片
function getCode() {
  state.col = '#b3afae'
  state.hasImg = '图片加载中...'
  if (!storage.getUuid()) {
    storage.setUuid(uuid.v1())
  }
  uni.request({
    url: api.buyer + '/common/slider/' + props.business,
    header: {
      uuid: storage.getUuid()
    },
    success: (res: any) => {
      state.col = '#838383'
      state.hasImg = '拖动滑块以完成拼图'
      const data = res.data.result

      // base64的图片
      state.img = data.backImage
      state.imgbk = data.slidingImage
      // 根据参数动态适应验证图片的高宽
      state.imgbKH = data.randomY * 1.8 + 'rpx'
      state.originalHeight = data.originalHeight * 1.8 + 'rpx'
      state.originalWidth = data.originalWidth * 1.8 + 'rpx'
      state.sliderHeight = data.sliderHeight * 1.8 + 'rpx'
      state.sliderWidth = data.sliderWidth * 1.8 + 'rpx'
      // 适应比率，用来适应滑动距离
      state.tl = 1 / (1.8 * l)
      // 无用信息
      state.spcode = data.capcode
      // 验证令牌
      state.key = data.key
      store.state.verificationKey = data.key
    }
  })
}

function end() {
  state.endLoad = false
  // 验证拼图位置是否正确
  uni.request({
    method: 'POST',
    url:
      api.buyer +
      '/common/slider/' +
      props.business +
      '?xPos=' +
      parseInt(String(state.moveCode * state.tl)),
    header: {
      uuid: storage.getUuid()
    },
    success: (res: any) => {
      state.endLoad = true
      if (res.data.result == false) {
        res.data.result = false
      } else {
        res.data.result = true
      }

      if (res.data && res.data.result) {
        // 验证成功后把key发送出去,后端会把验证信息存在缓存里
        emit('send', state.key)
        hide()
        state.vsr = true
        state.vsrtx = '已通过验证'
      } else {
        getCode() // 让滑块回到起始位置
        if (state.movePv == 1) {
          state.movePv = 0
        } else {
          state.movePv = 1
        }
      }
    },
    fail: () => {
      uni.showToast({ title: '连接服务器失败', icon: 'none' })
    }
  })
}

// 绑定拼图位置
function moveChange(e: any) {
  state.moveX = e.detail.x
  state.moveCode = e.detail.x
}

defineExpose({
  show,
  hide,
  error,
  getCode,
})
</script>

<style lang="scss" scoped>
@import "./animation.css";
@import "./icon.css";
// @import './main.css';

.v-track {
  position: relative;
  width: 100%;
  height: 84rpx;
  margin-top: 36rpx;
  background-color: #f7f7f8;
  border-radius: 42rpx;
}

.v-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #ffe9e5;
  border-radius: 42rpx;
}

.v-track-text {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  line-height: 84rpx;
  text-align: center;
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.v-handle {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-foot {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  margin-top: 28rpx;
}

.v-icon-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background-color: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 24rpx;
}

.v-mark {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  font-size: 22rpx;
  color: #d2d2d2;
}

.v-mark-icon {
  margin-right: 8rpx;
  font-size: 22rpx;
  color: #d9d9d9;
}
.dh-wt {
  animation: at 1.1s ease;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  background-color: $main-color;
  border-radius: 50%;
}

@keyframes at {
  from {
    width: 27rpx;
    height: 27rpx;
  }

  to {
    width: 45rpx;
    height: 45rpx;
  }
}

.ttcl {
  color: $main-color;
}

.border-index {
  border: 1rpx solid $main-color;
}

.status_bar {
  height: var(--status-bar-height);
  background-color: #f1f1f1;
  width: 100%;
}

.status_bar-nobg {
  height: var(--status-bar-height);
  width: 100%;
}

/* 转圈动画 */
.turn-load {
  animation: turnmy 1s linear infinite;
}

@keyframes turnmy {
  0% {
    -webkit-transform: rotate(0deg);
  }

  25% {
    -webkit-transform: rotate(90deg);
  }

  50% {
    -webkit-transform: rotate(180deg);
  }

  75% {
    -webkit-transform: rotate(270deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
  }
}

.status_bar-fixed {
  height: var(--status-bar-height);
  width: 100%;
  position: fixed;
  background-color: #f1f1f1;
  z-index: 20;
}

.head-dh-my {
  display: flex;
  position: fixed;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 10rpx;
  z-index: 15;
  background-color: #e3e3e3;
  width: 750rpx;
}

.padding-left {
  padding-left: 20rpx;
}

.padding-left-top {
  padding-left: 20rpx;
  padding-top: 20rpx;
}

.padding-right {
  padding-right: 20rpx;
}

.input-my {
  padding-left: 20rpx;
  border-radius: 40rpx;
  height: 50rpx;
  margin: 10rpx;
}

.tb-tag-absolute {
  position: absolute;
  z-index: 5;
  border-radius: 25rpx;
  font-size: 16rpx;
  margin-left: 25rpx;
  margin-top: -35rpx;
}

.flex-column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.flex-column-between {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.flex-column-start {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.flex-column-around {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.flex-row-start {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-row-around {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.flex-row-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.flex-row-between {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.my-title {
  font-size: 35rpx;
  font-weight: bold;
}

.my-neirong {
  font-size: 26rpx;
  color: #6d6d6d;
}

.my-neirong-sm {
  font-size: 23rpx;
  color: #616161;
}

.my-tag-text {
  font-size: 22rpx;
  padding-top: 20rpx;
  color: #bababa;
}

.padding-top {
  padding-top: 35rpx;
}

.padding-top-sm {
  padding-top: 20rpx;
}

.bottom-dh {
  background-color: #f1f1f1;
  position: fixed;
  z-index: 10;
  bottom: 0;
  width: 750rpx;
  height: 110rpx;
}

.tb-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bottom-text {
  width: 750rpx;
  position: fixed;
  text-align: center;
  font-size: 26rpx;
  color: #9d9d9d;
  bottom: 70rpx;
}

.moneycolor {
  color: #ea5002;
}

.margin-top {
  margin-top: 20rpx;
}

.margin-top-sm {
  margin-top: 12rpx;
}

.margin {
  margin: 20rpx;
}

.margin-left {
  margin-left: 20rpx;
}

.margin-right {
  margin-right: 20rpx;
}

.main-color {
  color: #07d188;
}
</style>
