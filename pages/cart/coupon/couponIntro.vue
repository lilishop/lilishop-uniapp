<template>
	<view class="coupin-intro">
		<view class="title">
			1.优惠券的获取
		</view>
		<view class="mb-60">
			通过活动赠送、客服补偿等获得(系统自动添加, 无需兑换);
		</view>
		<view class="title">
			2.优惠券使用
		</view>
		<view>1）每张抵用券仅能使用一次，不找零，不退换，不兑换现金</view>
		<view>2）单笔订单只能使用1张优惠券, 不支持同时使用多张, 用券后差额不找零, 不退回；</view>
		<view>3）优惠券 (包括新用户券) 不能抵扣运费, 只能抵扣商品金额。特价商品不可使用优惠券, 与其他优惠不同享；</view>
		<view>4）每张优惠券的使用条件请查看对应优惠券的使用说明；</view>
		<view>5）请在有效期内使用优惠券, 未使用的优惠券过期后, 将自动作废；</view>
		<view>6）每个用户仅限使用1张新用户专享优惠券, 同一帐号和手机号均视为同一用户；</view>
		<view>7）用券前订单满88元即可包邮（港澳台地区需满500元包邮）；</view>
		<view class="mb-60">8）使用抵用券抵扣部分的货款不开具发票</view>
		<view class="title">3.优惠券失效</view>
		<view>1）新用户券使用一张后其他新用户券失效, 取消订单后不返还；</view>
		<view>2）使用优惠券的订单, 若产生退货, 优惠券均不退回, 退款金额按优惠后的小计金额退款；</view>
		<view>3）参加满赠券活动获得的赠券,发生退货时,若订单中剩余商品不满足赠券条件,实物赠品需勾选退货并寄回,否则将从退款中扣减对应金额,客服审核通过退货申请后,所获赠券将会自动失效；</view>
		<view>4）优惠券严禁出售或转让, 如经发现并证实的, 该券将予以失效处理；</view>
		<view>5）如需了解更多, 请联系在线客服或拨打客服电话400-0000-000。</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss">
.coupin-intro{
	background-color: #fff;
	color: #999999;
	font-size: $font-sm;
	padding: 30rpx;
	border-top: 1px solid $border-color-light;
	line-height: 2.5em;
	.title{
		font-size: $font-base;
		font-weight: bold;
		
	}
	.mb-60{
		margin-bottom: 60rpx;
	}
}
</style>
