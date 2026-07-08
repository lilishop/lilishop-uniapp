<template>
	<view class="uni-numbox">
		<view @click="_calcValue('minus')" class="uni-numbox__minus uni-numbox-btns" :style="{background}">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue <= min || disabled }" :style="{color}">-</text>
		</view>
		<input :disabled="disabled" @focus="_onFocus" @blur="_onBlur" class="uni-numbox__value" type="number"
			v-model="inputValue" :style="{background, color}" />
		<view @click="_calcValue('plus')" class="uni-numbox__plus uni-numbox-btns" :style="{background}">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue >= max || disabled }" :style="{color}">+</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
	value?: number | string
	modelValue?: number | string
	min?: number
	max?: number
	step?: number
	background?: string
	color?: string
	disabled?: boolean
}>(), {
	value: 1,
	modelValue: 1,
	min: 0,
	max: 100,
	step: 1,
	background: '#f5f5f5',
	color: '#333',
	disabled: false,
})

const emit = defineEmits<{
	change: [value: number]
	input: [value: number]
	'update:modelValue': [value: number]
	blur: [event: Event]
	focus: [event: Event]
}>()

const inputValue = ref(0)

watch(() => props.value, (val) => {
	inputValue.value = +val
})

watch(() => props.modelValue, (val) => {
	inputValue.value = +val
})

if (props.value === 1) {
	inputValue.value = +props.modelValue
}
if (props.modelValue === 1) {
	inputValue.value = +props.value
}

function _getDecimalScale() {
	let scale = 1
	if (~~props.step !== props.step) {
		scale = Math.pow(10, String(props.step).split('.')[1].length)
	}
	return scale
}

function _emitValue() {
	const val = +inputValue.value
	emit('change', val)
	emit('input', val)
	emit('update:modelValue', val)
}

function _calcValue(type: 'minus' | 'plus') {
	if (props.disabled) {
		return
	}
	const scale = _getDecimalScale()
	let value = inputValue.value * scale
	const step = props.step * scale
	if (type === 'minus') {
		value -= step
		if (value < props.min * scale) {
			return
		}
		if (value > props.max * scale) {
			value = props.max * scale
		}
	}

	if (type === 'plus') {
		value += step
		if (value > props.max * scale) {
			return
		}
		if (value < props.min * scale) {
			value = props.min * scale
		}
	}

	inputValue.value = Number((value / scale).toFixed(String(scale).length - 1))
	_emitValue()
}

function _onBlur(event: any) {
	emit('blur', event)
	let value = event.detail.value
	if (!value) {
		return
	}
	value = +value
	if (value > props.max) {
		value = props.max
	} else if (value < props.min) {
		value = props.min
	}
	const scale = _getDecimalScale()
	inputValue.value = Number(value.toFixed(String(scale).length - 1))
	_emitValue()
}

function _onFocus(event: Event) {
	emit('focus', event)
}
</script>

<style lang="scss" scoped>
$box-height: 48rpx;
$bg: #f5f5f5;
$br: 4rpx;
$color: #333;

.uni-numbox {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
}

.uni-numbox-btns {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding: 0 8px;
	background-color: $bg;
	/* #ifdef H5 */
	cursor: pointer;
	/* #endif */
}

.uni-numbox__value {
	margin: 0 4rpx;
	background-color: $bg;
	width: 70rpx;
	height: $box-height;
	text-align: center;
	font-size: 24rpx;
	border-left-width: 0;
	border-right-width: 0;
	color: $color;
}

.uni-numbox__minus {
	border-top-left-radius: $br;
	border-bottom-left-radius: $br;
}

.uni-numbox__plus {
	border-top-right-radius: $br;
	border-bottom-right-radius: $br;
}

.uni-numbox--text {
	line-height: 40rpx;
	font-size: 40rpx;
	font-weight: 300;
	color: $color;
}

.uni-numbox .uni-numbox--disabled {
	color: #c0c0c0 !important;
	/* #ifdef H5 */
	cursor: not-allowed;
	/* #endif */
}
</style>
