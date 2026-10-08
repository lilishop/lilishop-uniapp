<template>
	<view class="xt__verify-code">
		<!-- 输入框 -->
		<input
			ref="codeInput"
			id="xt__input"
			:value="code"
			class="xt__input"
			:focus="focused"
			:password="isPassword"
			:type="inputType"
			:maxlength="size"
			@input="handleInput"
			@focus="inputFocus"
			@blur="inputBlur"
		/>

		<!-- 光标 -->
		<view
			id="xt__cursor"
			v-if="cursorVisible && type !== 'middle'"
			class="xt__cursor"
			:style="{ left: codeCursorLeft[code.length] + 'px', height: cursorHeight + 'px', backgroundColor: cursorColor }"
		></view>

		<!-- 输入框 - 组 -->
		<view id="xt__input-ground" class="xt__input-ground" @click="focusInput">
			<template v-for="(item, index) in size" :key="index">
				<view
					:style="{ borderColor: code.length === index && cursorVisible ? boxActiveColor : boxNormalColor }"
					:class="['xt__box', `xt__box-${type + ''}`, `xt__box::after`]"
				>
					<view :style="{ borderColor: boxActiveColor }" class="xt__middle-line" v-if="type === 'middle' && !code[index]"></view>
					<text class="xt__code-text">{{ codeFormat(code[index], isPassword) }}</text>
				</view>
			</template>
		</view>
	</view>
</template>
<script setup lang="ts">
/**
 * @description 输入验证码组件
 * @property {string} type = [box|middle|bottom] - 显示类型 默认：box -eg:bottom
 * @property {string} inputType = [text|number] - 输入框类型 默认：number -eg:number
 * @property {number} size = [4|6] - 支持的验证码数量 默认：6 -eg:6
 * @property {boolean} isFocus - 是否立即聚焦 默认：true
 * @property {boolean} isPassword - 是否以密码形式显示 默认false -eg:false
 * @property {string} cursorColor - 光标颜色 默认：#cccccc
 * @property {string} boxNormalColor - 光标未聚焦到的框的颜色 默认：#cccccc
 * @property {string} boxActiveColor - 光标聚焦到的框的颜色 默认：#000000
 * @event {Function(data)} confirm - 输入完成
 */
import { ref, watch, onMounted, nextTick, getCurrentInstance } from 'vue'

const emit = defineEmits(['update:modelValue', 'input', 'confirm'])
const props = withDefaults(defineProps<{
	modelValue?: string
	value?: string
	type?: string
	inputType?: string
	size?: number
	isFocus?: boolean
	isPassword?: boolean
	cursorColor?: string
	boxNormalColor?: string
	boxActiveColor?: string
}>(), {
	modelValue: '',
	value: '',
	type: 'box',
	inputType: 'number',
	size: 6,
	isFocus: true,
	isPassword: false,
	cursorColor: '#cccccc',
	boxNormalColor: '#cccccc',
	boxActiveColor: '#000000'
})

const instance = getCurrentInstance()
const codeInput = ref<any>(null)
const focused = ref(false)
const cursorVisible = ref(false)
const cursorHeight = ref(35)
const code = ref('') // 输入的验证码
const codeCursorLeft = ref<number[]>([]) // 向左移动的距离数组

// 初始化
watch([() => props.modelValue, () => props.value], ([modelVal, val]) => {
	code.value = modelVal || val || ''
}, { immediate: true })

onMounted(() => {
	focused.value = props.isFocus
	cursorVisible.value = props.isFocus
	init()
	if (props.isFocus) {
		nextTick(() => {
			focusInput()
		})
	}
})

function focusInput() {
	focused.value = false
	nextTick(() => {
		focused.value = true
		// #ifdef H5
		const inputEl = codeInput.value
		if (inputEl && typeof inputEl.focus === 'function') {
			inputEl.focus()
		}
		// #endif
	})
}

/**
 * @description 初始化
 */
function init() {
	getCodeCursorLeft()
	setCursorHeight()
}

/**
 * @description 获取元素节点
 * @param {string} elm - 节点的id、class 相当于 document.querySelect的参数 -eg: #id
 * @param {string} type = [single|array] - 单个元素获取多个元素 默认是单个元素
 * @param {Function} callback - 回调函数
 */
function getElement(elm: string, type: string = 'single', callback: Function) {
	uni
		.createSelectorQuery()
		.in(instance?.proxy)
		[type === 'array' ? 'selectAll' : 'select'](elm)
		.boundingClientRect()
		.exec((data: any) => {
			callback(data[0])
		})
}

/**
 * @description 计算光标的高度
 */
function setCursorHeight() {
	getElement('.xt__box', 'single', (boxElm: any) => {
		cursorHeight.value = boxElm.height * 0.6
	})
}

/**
 * @description 获取光标在每一个box的left位置
 */
function getCodeCursorLeft() {
	// 获取父级框的位置信息
	getElement('#xt__input-ground', 'single', (parentElm: any) => {
		const parentLeft = parentElm.left
		// 获取各个box信息
		getElement('.xt__box', 'array', (elms: any) => {
			codeCursorLeft.value = []
			elms.forEach((elm: any) => {
				codeCursorLeft.value.push(elm.left - parentLeft + elm.width / 2)
			})
		})
	})
}

// 输入框输入变化的回调
function handleInput(e: any) {
	const inputValue = e?.detail?.value ?? e?.target?.value ?? ''
	const value = String(inputValue).replace(/\D/g, '').slice(0, props.size)
	code.value = value
	cursorVisible.value = value.length !== props.size
	emit('update:modelValue', value)
	emit('input', value)
	inputSuccess(value)
}

// 输入完成回调
function inputSuccess(value: string) {
	if (value.length === props.size) {
		emit('confirm', value)
	}
}

// 输入聚焦
function inputFocus() {
	cursorVisible.value = code.value.length !== props.size
}

// 输入失去焦点
function inputBlur() {
	cursorVisible.value = false
}

function codeFormat(val: string | undefined, isPassword: boolean): string {
	let value = ''
	if (val) {
		value = isPassword ? '*' : val
	}
	return value
}
</script>
<style lang="scss" scoped>
.xt__verify-code {
	position: relative;
	width: 100%;
	box-sizing: border-box;

	.xt__input {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		opacity: 0;
		z-index: 2;
	}
	.xt__cursor {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: inline-block;
		width: 2px;
		z-index: 1;
		pointer-events: none;
		animation-name: cursor;
		animation-duration: 0.8s;
		animation-iteration-count: infinite;
	}

	.xt__input-ground {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		.xt__box {
			position: relative;
			display: inline-block;
			width: 76rpx;
			height: 112rpx;
			pointer-events: none;
			&-bottom {
				border-bottom-width: 2px;
				border-bottom-style: solid;
			}

			&-box {
				border-width: 2px;
				border-style: solid;
			}

			&-middle {
				border: none;
			}

			.xt__middle-line {
				position: absolute;
				top: 50%;
				left: 50%;
				width: 50%;
				transform: translate(-50%, -50%);
				border-bottom-width: 2px;
				border-bottom-style: solid;
			}

			.xt__code-text {
				position: absolute;
				top: 50%;
				left: 50%;
				z-index: 1;
				color: #333;
				font-size: 52rpx;
				transform: translate(-50%, -50%);
			}
		}
	}
}

/* #ifdef APP-PLUS */
/*
 * App 的原生 input 如果覆盖在验证码格上，部分 Android 设备会出现
 * 原生光标/输入绘制层与自绘数字冲突。沿用 u-code-input 的隐藏输入方式，
 * 将输入内容和原生光标移出可视区域，验证码格只负责展示响应式状态。
 */
.xt__verify-code {
	overflow: hidden;
}

.xt__input {
	left: -750rpx;
	width: 1500rpx;
	z-index: 1;
}

.xt__input-ground {
	z-index: 2;
}

.xt__cursor {
	z-index: 3;
}
/* #endif */

@keyframes cursor {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0;
	}
}
</style>
