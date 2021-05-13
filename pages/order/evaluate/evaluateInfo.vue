<template>
	<view>
		<view class="info-view">
			<view class="info-text">
				1.对商品金额大于20元商品(虚拟商品除外)进行评价并通过审核后，根据商品价格和您的评价内容为您发放积分。
			</view>
			<view class="info-text">
				2.只能对90天内购买的订单进行商品评价。
			</view>
			<view class="info-text">
				3.同一订单和相隔15日内不同订单中的相同商品，只能评价一次。
			</view>
			<view class="info-text">
				4.退换货订单产生的商品评价将会被删除，且会扣除相应的优币。
			</view>
			<view class="info-text">
				5.鼓励发表原创、有价值的评价;杜绝剽窃、发表无意义、违反法律法规的评价内容，如果您发布的无效评价超过(包含)5条，则一年内您发表的商品评价都不会获得积分奖励。
			</view>
			<view class="info-text">
				6.晒单发表成功后会对晒图进行审核，审核过程中，心得文字会先展示出来，审核通过后，晒图会一起进行展示。
			</view>
			<view class="info-text">
				7.对于审核不通过的评价晒单，不能获得优币奖励，且文字、晒图均不能被展示出来，有下列情形之一的，审核不予通过：
			</view>
			<view class="info-text">
				• 评价心得文字与商品无关，且出现言辞露骨的情况;
			</view>
			<view class="info-text">
				• 图片与所购商品不一致;
			</view>
			<view class="info-text">
				• 晒单为截屏图片;
			</view>
			<view class="info-text">
				• 图片不清晰，不能达到晒单目的;
			</view>
			<view class="info-text">
				• 图片中涉及淫秽、色情等违法不良信息;
			</view>
			<view class="info-text">
				• 未经过他人同意，涉及使用他人图片或将他人图片进行编辑后发布;
			</view>
			<view class="info-text">
				• 盗用他人图片经举报、诉讼情况属实;
			</view>
			<view class="info-text">
				• 图片中涉及敏感词汇(如：曝光，315，假二水，翻新等);
			</view>
			<view class="info-text">
				• 图片涉及与客服聊天记录;
			</view>
			<view class="info-text">
				• 对于成人用品晒单，未对特殊部位进行遮掩或打马赛克。
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss">
page, .content{
	background: $page-color-base;
	height: 100%;
}
.info-view {
	padding: 50rpx;
	.info-text {
		color: #909399;
		margin-bottom: 8rpx;
	}
}
</style>
