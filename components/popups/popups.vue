<template>
  <view class="shadow" :class="!show?'':'shadow-show'" :style="{backgroundColor:show?maskBg:'rgba(0,0,0,0)'}" @tap="tapMask">
    <view class="popups" :class="[theme]" :style="{top: popupsTop ,left: popupsLeft,flexDirection:direction}">
      <text :class="dynPlace" :style="{width:'0px',height:'0px'}" v-if="triangle"></text>
      <view v-for="(item,index) in popData" :key="index" @tap.stop="tapItem(item)" class="itemChild view" :class="[direction=='row'?'solid-right':'solid-bottom',item.disabled?'disabledColor':'']">
        <view class="popup-icon" v-if="item.icon">
          <u-icon size="35rpx" :name="item.icon"></u-icon>
        </view>
        <span class="title">{{item.title}}</span>
      </view>
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, getCurrentInstance } from 'vue'

const props = withDefaults(defineProps<{
  maskBg?: string
  placement?: string
  direction?: string
  x?: number
  y?: number
  modelValue?: boolean
  popData?: any[]
  theme?: string
  dynamic?: boolean
  gap?: number
  triangle?: boolean
}>(), {
  maskBg: "rgba(0,0,0,0)",
  placement: "default",
  direction: "column",
  x: 0,
  y: 0,
  modelValue: false,
  popData: () => [],
  theme: "light",
  dynamic: false,
  gap: 20,
  triangle: true,
})

const emit = defineEmits(['update:modelValue', 'tapPopup'])

const instance = getCurrentInstance()

const popupsTop = ref("0rpx")
const popupsLeft = ref("0rpx")
const show = ref(false)
const dynPlace = ref("")

onMounted(() => {
  popupsPosition()
})

const tapMask = () => {
  emit("update:modelValue", !props.modelValue)
}

const tapItem = (item: any) => {
  if (item.disabled) return
  emit("tapPopup", item)
  emit("update:modelValue", !props.modelValue)
}

const getStatusBar = () => {
  const windowInfo = uni.getWindowInfo()
  // #ifdef H5
  return Promise.resolve(
    (windowInfo.statusBarHeight || 0) + (windowInfo.windowTop || 0)
  )
  // #endif
  // #ifndef H5
  return Promise.resolve(windowInfo.statusBarHeight || 0)
  // #endif
}

const popupsPosition = async () => {
  let statusBar = await getStatusBar()
  await new Promise<void>((resolve) => {
    let popupsDom = uni.createSelectorQuery().in(instance!.proxy).select(".popups")
    popupsDom
      .fields(
        {
          size: true,
        },
        (data: any) => {
          if (!data) {
            resolve()
            return
          }
          let width = data.width
          let height = data.height

          let y = props.dynamic
            ? dynamicGetY(props.y, props.gap)
            : transformRpx(props.y)

          let x = props.dynamic
            ? dynamicGetX(props.x, props.gap)
            : transformRpx(props.x)

          // #ifdef H5
          y = props.dynamic
            ? props.y + statusBar
            : transformRpx(props.y + statusBar)
          // #endif

          dynPlace.value =
            props.placement == "default"
              ? getPlacement(x, y)
              : props.placement

          switch (dynPlace.value) {
            case "top-start":
              popupsTop.value = `${y + 9}rpx`
              popupsLeft.value = `${x - 15}rpx`
              break
            case "top-end":
              popupsTop.value = `${y + 9}rpx`
              popupsLeft.value = `${x + 15 - width}rpx`
              break
            case "bottom-start":
              popupsTop.value = `${y - 18 - height}rpx`
              popupsLeft.value = `${x - 15}rpx`
              break
            case "bottom-end":
              popupsTop.value = `${y - 9 - height}rpx`
              popupsLeft.value = `${x + 15 - width}rpx`
              break
          }
          resolve()
        }
      )
      .exec()
  })
}

const getPlacement = (x: number, y: number) => {
  const { windowWidth: width, windowHeight: height } = uni.getWindowInfo()
  if (x > width / 2 && y > height / 2) {
    return "bottom-end"
  } else if (x < width / 2 && y < height / 2) {
    return "top-start"
  } else if (x > width / 2 && y < height / 2) {
    return "top-end"
  } else if (x < width / 2 && y > height / 2) {
    return "bottom-start"
  } else if (x > width / 2) {
    return "top-end"
  } else {
    return "top-start"
  }
}

const dynamicGetY = (y: number, gap: number) => {
  const { windowHeight: height } = uni.getWindowInfo()
  y = y < gap ? gap : y
  y = height - y < gap ? height - gap : y
  return y
}

const dynamicGetX = (x: number, gap: number) => {
  const { windowWidth: width } = uni.getWindowInfo()
  x = x < gap ? gap : x
  x = width - x < gap ? width - gap : x
  return x
}

const transformRpx = (params: number) => {
  const { screenWidth } = uni.getWindowInfo()
  return (params * screenWidth) / 375
}

watch(() => props.modelValue, async (newVal) => {
  if (newVal) await popupsPosition()
  show.value = newVal
}, { immediate: true })

watch(() => props.placement, (newVal) => {
  dynPlace.value = newVal
}, { immediate: true })
</script>

<style lang="scss" scoped>
.title {
  margin-left: 16rpx;
}
.shadow {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  z-index: 9999;
  transition: background 0.3s ease-in-out;
  visibility: hidden;

  &.shadow-show {
    visibility: visible;
  }
}

.popups {
  position: absolute;
  padding: 20rpx;
  border-radius: 5px;
  display: flex;
  .view {
    display: flex;
    align-items: center;
    padding: 15rpx 10rpx;
    font-size: 25rpx;
  }
  .popup-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40rpx;
    height: 40rpx;
    line-height: 40rpx;
  }
  .image {
    display: inline-block;
    vertical-align: middle;
    width: 40rpx;
    height: 40rpx;
    margin-right: 20rpx;
  }
}
.dark {
  background-color: #4c4c4c;
  color: #fff;
  .top-start:after {
    content: "";
    position: absolute;
    top: -18rpx;
    left: 10rpx;
    border-width: 0 20rpx 20rpx;
    border-style: solid;
    border-color: transparent transparent #4c4c4c;
  }
  .top-end:after {
    content: "";
    position: absolute;
    top: -18rpx;
    right: 10rpx;
    border-width: 0 20rpx 20rpx;
    border-style: solid;
    border-color: transparent transparent #4c4c4c;
  }
  .bottom-start:after {
    content: "";
    position: absolute;
    bottom: -18rpx;
    left: 10rpx;
    border-width: 20rpx 20rpx 0;
    border-style: solid;
    border-color: #4c4c4c transparent transparent;
  }
  .bottom-end:after {
    content: "";
    position: absolute;
    bottom: -18rpx;
    right: 10rpx;
    border-width: 20rpx 20rpx 0;
    border-style: solid;
    border-color: #4c4c4c transparent transparent;
  }
  .disabledColor {
    color: #c5c8ce;
  }
}
.light {
  color: #515a6e;
  box-shadow: 0upx 0upx 30upx rgba(0, 0, 0, 0.2);
  background: #fff;
  .top-start:after {
    content: "";
    position: absolute;
    top: -18rpx;
    left: 10rpx;
    border-width: 0 20rpx 20rpx;
    border-style: solid;
    border-color: transparent transparent #fff;
  }
  .top-end:after {
    content: "";
    position: absolute;
    top: -18rpx;
    right: 10rpx;
    border-width: 0 20rpx 20rpx;
    border-style: solid;
    border-color: transparent transparent #fff;
  }
  .bottom-start:after {
    content: "";
    position: absolute;
    bottom: -18rpx;
    left: 10rpx;
    border-width: 20rpx 20rpx 0;
    border-style: solid;
    border-color: #fff transparent transparent;
  }
  .bottom-end:after {
    content: "";
    position: absolute;
    bottom: -18rpx;
    right: 10rpx;
    border-width: 20rpx 20rpx 0;
    border-style: solid;
    border-color: #fff transparent transparent;
  }
  .disabledColor {
    color: #c5c8ce;
  }
}
.solid-bottom {
  border-bottom: 1px solid #f3f5f7;
}
.solid-right {
  border-right: 1px solid #ccc;
}
.popups .itemChild:last-child {
  border: none;
}
</style>
