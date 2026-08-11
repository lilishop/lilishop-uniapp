<template>
  <view class="serach">
    <view class="left-box" @tap="onClickLeft">
      <u-icon name="arrow-left" size="28rpx" color="#606266"></u-icon>
    </view>
    <view class="content" :style="{ 'border-radius': radius + 'px' }">
      <!-- HM修改 增加进入输入状态的点击范围 -->
      <view class="content-box" :class="{ center: mode === 2 }">
        <u-icon name="search" size="30rpx" color="#909399" style="padding:0 14rpx;"></u-icon>
        <!-- HM修改 增加placeholder input confirm-type confirm-->
        <input style="width:100%; " :placeholder="placeholder" placeholder-class="placeholder-color"
          @input="inputChange" confirm-type="search" @confirm="triggerConfirm" class="input"
          :class="{ center: !active && mode === 2 }" :focus="isFocus" v-model="inputVal" @focus="focus" @blur="blur" />
        <view
          class="clear-icon"
          v-if="showClear && isDelShow"
          @tap.stop.prevent="clear"
        >
          <u-icon name="close" size="28rpx" color="#909399"></u-icon>
        </view>
      </view>

    </view>
    <view class="button active" >
      <view v-if="isShowSeachGoods !=true" class="button-item">
        <div @click="out()">取消</div>
      </view>

      <view v-else class="button-item">
        <u-icon name="grid-fill" size="32rpx" color="var(--theme-light, #ff6b35)" @click="handelListClass()" v-if="!switchLayout"></u-icon>
        <u-icon v-else @click="handelListClass()" name="list-dot" size="32rpx" color="var(--theme-light, #ff6b35)"></u-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
	mode?: number
	placeholder?: string
	modelValue?: string
	value?: string
	radius?: string
	isFocusVal?: boolean
	showClear?: boolean
}>(), {
	mode: 1,
	placeholder: "请输入搜索内容",
	modelValue: "",
	value: "",
	radius: "60",
	isFocusVal: true,
	showClear: true,
})

const emit = defineEmits(['confirm', 'input', 'update:modelValue', 'search', 'SwitchType'])

const isShowSeachGoods = ref(false)
const active = ref(false)
const inputVal = ref("")
const isDelShow = ref(false)
const isFocus = ref(false)
const switchLayout = ref(true)

onMounted(() => {
	isFocus.value = props.isFocusVal
	inputVal.value = props.modelValue || props.value || ''
})

//
const out = () => {
	uni.reLaunch({
		url: "/pages/tabbar/home/index",
	})
}
// 切换排列顺序
const handelListClass = () => {
	switchLayout.value = !switchLayout.value
	emit("SwitchType")
}
//HM修改 触发组件confirm事件
const triggerConfirm = () => {
	emit("confirm", false)
	uni.hideKeyboard()
}
//HM修改 触发组件input事件
const inputChange = (event: any) => {
	var keyword = event.detail.value
	emit("input", keyword)
	emit("update:modelValue", keyword)
	if (inputVal.value) {
		isDelShow.value = true
	}
}
const focus = () => {
	active.value = true
	//HM修改 增加获取焦点判断
	if (inputVal.value) {
		isDelShow.value = true
	}
}
const blur = () => {
	isFocus.value = false
	if (!inputVal.value) {
		active.value = false
	}
}
const clear = () => {
	//HM修改 收起键盘
	uni.hideKeyboard()
	isFocus.value = false
	inputVal.value = ""
	active.value = false
	isDelShow.value = false
	//HM修改 清空内容时候触发组件input
	emit("input", "")
	emit("update:modelValue", "")
	//this.$emit('search', '');//HM修改 清空内容时候不进行搜索
}

const setInputValue = (value: string) => {
	inputVal.value = value || ''
	emit("input", inputVal.value)
	emit("update:modelValue", inputVal.value)
}

/**
 * 回退到上一级
 */
const onClickLeft = () => {
	const paths = getCurrentPages()
	console.log(paths)
	if(paths.length > 1){
		uni.navigateBack()
	}else{
		uni.switchTab({
			url:"/pages/tabbar/home/index"
		})
	}
}

/**
 * 内容为空时，输入默认关键字
 */
const search = () => {
	if (!inputVal.value) {
		if (false) { // searchName == "取消" - 兼容旧逻辑
			uni.hideKeyboard()
			isFocus.value = false
			active.value = false
			return
		}
	}
	emit("search", inputVal.value ? inputVal.value : props.placeholder)
}

/**
 * 监听当前是否有值 是否显示清除图标
 */
watch(inputVal, (newVal) => {
	newVal ? (isDelShow.value = true) : (isDelShow.value = false)
})

watch(() => props.modelValue, (newVal) => {
	if (newVal !== inputVal.value) {
		inputVal.value = newVal || ''
	}
})

defineExpose({
	isShowSeachGoods,
	inputVal,
	clear,
	setInputValue,
})
</script>

<style lang="scss" scoped>
.serach {
  display: flex;
  width: 100%;
  align-items: center;
  box-sizing: border-box;
  font-size: 24rpx;

  .left-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: auto;
    padding: 0 8rpx;
  }

  .content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 70rpx;
    color: #999;
    background: #eee;
    overflow: hidden;
    transition: all 0.2s linear;
    border-radius: 1000rpx;

    .content-box {
      width: 100%;
      display: flex;
      align-items: center;
      &.center {
        justify-content: flex-start;
      }

      .input {
        flex: 1;
        min-width: 0;
        width: auto;
        line-height: 60rpx;
        height: 60rpx;
        transition: all 0.2s linear;

        &.center {
          width: auto;
        }
      }

      .clear-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 72rpx;
        height: 70rpx;
      }
    }
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 0;
    overflow: hidden;
    transition: all 0.2s linear;
    white-space: nowrap;

    &.active {
      padding-left: 12rpx;
      width: auto;
      min-width: 80rpx;
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
