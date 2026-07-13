<template>
	<div>
		<div v-for="(item, index) in res" :key="index" class="goods-row" @click="navigateToDetailPage(item)">
			<div class="flex goods-col">
				<div class="goods-img">
					<u-image width="230rpx" mode="aspectFit" border-radius='16' height="230rpx" :src="item.goodsImage || item.thumbnail">
						<template #loading><u-loading-icon></u-loading-icon></template>
					</u-image>
				</div>
				<div class="goods-detail">
					<div class="title clamp3">{{ item.goodsName }}</div>
					<div class='flex flex-a-c flex-j-sb'>
						<view class="price-box">
							<!-- 秒杀 / 拼团 -->
							<div class="price" v-if="!type && item.price!=undefined">
								¥<span class="price-int">{{ goodsFormatPrice(item.price )[0] }} </span>.{{
										goodsFormatPrice(item.price )[1]
									}}
							</div>
							<!-- 砍价 -->
							<div class="price" v-if="type && item.purchasePrice!=undefined">
								最低：
								¥<span class="price-int">{{ goodsFormatPrice(item.purchasePrice )[0] }} </span>.{{
										goodsFormatPrice(item.purchasePrice )[1]
									}}
							</div>
							<!-- 兜底策略如果金额是0 -->
							<div class="price" v-if="!item.price && !type">
								¥<span class="price-int">0 </span>.00
							</div>
						</view>
						<div>
							<image class="buy" src="/static/buy.png"></image>
						</div>
					</div>
					<div class='count-config' v-if="!type">
						<text class="count-config-text">即将恢复{{ item.originalPrice}}元</text>
					</div>
				</div>
			</div>

		</div>
	</div>
</template>

<script setup lang="ts">
import { useGoodsListCommon } from './common'
import { goodsFormatPrice } from '@/utils/filters.js'

const { navigateToDetailPage } = useGoodsListCommon()

const props = withDefaults(defineProps<{
	res?: any[]
	type?: string | null
}>(), {
	res: () => [],
	type: ''
})

// 跳转到商品详情（覆盖公共方法，增加砍价跳转）
const navigateToDetailPageOverride = (item: any) => {
	if(props.type == 'kanJia'){
		 uni.navigateTo({
			url: `/pages/promotion/bargain/detail?id=${item.id}`,
		})
		return
	}
	navigateToDetailPage({
		id: item.skuId,
		goodsId: item.goodsId,
	})
}
</script>

<style lang='scss' scoped>
	.buy {
		width: 152rpx;
		height: 108rpx;
	}
.flex-j-sb {
		width: 100%;
	}
.goods-row {
	background: #fff;
	padding: 16rpx;
	>.goods-col {
		display: flex;
		>.goods-img {
			overflow: hidden;
			flex: 4;
		}
		>.goods-detail {
			flex: 7;
		}
	}
}
.goods-detail {
	margin: 0 20rpx;
	>.title {
		font-size: $font-base;
		color: $font-color-dark;
		line-height: 1.5;
		height: 86rpx;
		padding: 10rpx 0 0;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.count-config {
		padding: 5rpx 0;
		color: #666;
		display: flex;
		font-size: 24rpx;
		letter-spacing:2rpx;
		padding-left: 10rpx;

		.count-config-text {
			font-size: 24rpx;
		}
	}



}

.price-box {
	margin-top: 10rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 10rpx;
	font-size: 24rpx;
	color: $font-color-light;

	>.price {
		font-size: 26rpx;
		line-height: 1;
		color: $main-color;
		font-weight: bold;

		.price-int {
			font-size: 48rpx;
		}
	}
}
</style>
