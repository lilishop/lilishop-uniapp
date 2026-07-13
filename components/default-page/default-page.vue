<template>
	<view class="default-page">
		<view class="default-wrap">
			
			<text>{{title}}</text>
			<view v-if="isBtn" class="btn" @click="toHome">
				去逛逛
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
	type?: string
	isBtn?: boolean
	title?: string
}>(), {
	type: 'search',
	isBtn: false,
	title: '没有相关内容'
})

const src = ref('')

onMounted(() => {
	src.value = `/static/default/default_${props.type}.png`
})

const toHome = () => {
	uni.switchTab({
	    url: '/pages/home/home'
	})
}
</script>

<style lang="scss" scoped>
	.default-page{
		background: #FFFFFF;
		width: 100%;
		height: 100vh;
		.default-wrap{
			position: absolute;
			top: calc(50vh - 320rpx);
			left: calc(50% - 120rpx);
			display: flex;
			flex-direction: column;
			align-items: center;
			
			>image{
				width: 260rpx;
				height: 240rpx;
				
				margin-bottom: 24rpx;
			}
			text{
				font-size: 32rpx;
				color: #828385;
			}
			.btn{
				width: 160rpx;
				height: 56rpx;
				border: 2rpx solid #3180F6;
				border-radius: 6rpx;
				text-align: center;
				line-height: 56rpx;
				margin-top: 32rpx;
				font-size: 24rpx;
				color: #3180F6;
			}
		}
		
	}
</style>
