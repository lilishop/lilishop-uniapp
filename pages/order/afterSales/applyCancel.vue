<template>
	<view>
		<view class="cancel-head">
			<u-cell-group>
				<u-cell-item title="未收货" :arrow="false">
					<u-radio-group wrap v-model="rog"><u-radio active-color="#1ABC9C" name="NO" @click="radioChange('NO')"></u-radio></u-radio-group>
				</u-cell-item>
				<u-cell-item title="已收货" v-if="applyService" :arrow="false">
					<u-radio-group wrap v-model="rog"><u-radio active-color="#1ABC9C" name="YES" @click="radioChange('YES')"></u-radio></u-radio-group>
				</u-cell-item>
			</u-cell-group>
		</view>
		<view class="cancle-body" v-if="rog === 'NO'">
			<view class="cancel-tips">
				<view class="tips-header">温馨提示：</view>
				<view>1. 订单取消后无法恢复;</view>
				<view>2. 订单取消后，使用的优惠券将不再返还，积分可以退回;</view>
				<view>3. 订单取消后，订单中的赠品要随商品一起返还给商家;</view>
			</view>
			<u-cell-group>
				<u-cell-item title="退款方式" value="原路退回" :arrow="false" v-if="isRetrace"></u-cell-item>
				<u-cell-item title="退款方式" value="账号退款" :arrow="false" v-else></u-cell-item>
				<u-cell-item title="退款金额" :value="refund_info.refund_price" :arrow="false"></u-cell-item>
				<u-cell-item title="取消原因" :value="refund_info.reason" @click="handleShowReason" :arrow="true" arrow-direction="down" required></u-cell-item>
				<u-action-sheet :list="reasonSelectActions" v-model="reasonSelectShow" @click="onSelectReason"></u-action-sheet>
				<view v-if="!isRetrace">
					<u-cell-item title="账户类型" :value="accountTypeText" @click="handleShowAccountType" :arrow="true" arrow-direction="down" required></u-cell-item>
					<u-action-sheet :list="accountTypeSelectActions" v-model="accountTypeSelectShow" @click="onSelectAccountType"></u-action-sheet>
					<view v-if="refund_info.account_type === 'BANK_TRANSFER'">
						<u-field v-model="refund_info.bank_name" required clearable label="银行名称" input-align="right" placeholder="请输入银行名称"></u-field>
						<u-field v-model="refund_info.bank_deposit_name" label-width="150" required clearable label="银行开户行" input-align="right" placeholder="请输入银行开户行"></u-field>
						<u-field v-model="refund_info.bank_account_name" label-width="150" required clearable label="银行开户名" input-align="right" placeholder="请输入银行开户名"></u-field>
						<u-field v-model="refund_info.bank_account_number" required clearable label="银行账号" input-align="right" placeholder="请输入银行账号"></u-field>
					</view>
					<u-field v-model="refund_info.return_account" required clearable label="退款账号" input-align="right" placeholder="请输入退款账号"></u-field>
				</view>
				<u-field v-model="refund_info.mobile" required clearable label="联系方式" input-align="right" placeholder="请输入手机号码"></u-field>
			</u-cell-group>
			<view class="submit-btn">
				<u-button shape="circle" class="cancel-btn" @click="handleCancelSubmit">取消</u-button>
				<u-button shape="circle" class="main-btn" @click="handleSubmitApply">提交</u-button>
			</view>
		</view>
		<view class="service-body" v-else>
			<view class="cancel-tips">
				<view class="tips-header">温馨提示：</view>
				<view>1. 当前订单还未确认收货，如果申请售后，则订单自动确认收货;</view>
				<view>2. 如申请售后，使用的优惠券和积分等将不再返还;</view>
				<view>3. 订单中的赠品要随申请售后的商品一起返还给商家;</view>
			</view>
			<view class="submit-btn"><u-button shape="circle" class="main-btn" @click="handleApplyService">申请售后</u-button></view>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
import Foundation from '@/utils/Foundation.js';
import RegExp from '@/utils/RegExp.js';
import { applyCancelOrder } from '@/api/after-sale.js';
import { confirmReceipt, getOrderDetail } from '@/api/order.js';

export default {
	data() {
		return {
			/** 订单编号 */
			order_sn: 0,
			/** 订单详细 */
			order: '',
			/** 是否允许申请售后 */
			applyService: false,
			/** 是否已收货 */
			rog: 'NO',
			/** 是否支持原路退款 */
			isRetrace: false,
			/** 申请取消订单参数 */
			refund_info: {
				reason: '请选择取消原因',
				mobile: '',
				account_type: '',
				return_account: '',
				refund_price: 0.0
			},
			/** 是否展示取消原因下拉框 */
			reasonSelectShow: false,
			/** 取消原因下拉框数据 */
			reasonSelectActions: [
				{ text: '商品无货' },
				{ text: '配送时间问题' },
				{ text: '不想要了' },
				{ text: '商品信息填写错误' },
				{ text: '地址信息填写错误' },
				{ text: '商品降价' },
				{ text: '货物破损已拒签' },
				{ text: '订单无物流跟踪记录' },
				{ text: '非本人签收' },
				{ text: '其他' }
			],
			/** 账户类型下拉框选中的值 */
			accountTypeText: '请选择账户类型',
			/** 是否展示账户类型下拉框 */
			accountTypeSelectShow: false,
			/** 账户类型下拉框数据 */
			accountTypeSelectActions: [{ text: '支付宝', value: 'ALIPAY' }, { text: '微信', value: 'WEIXINPAY' }, { text: '银行卡', value: 'BANK_TRANSFER' }]
		};
	},
	onLoad(options) {
		this.order_sn = options.sn;
		this.GET_OrderCancelDetail();
	},
	methods: {
		// 选中任一radio时，由radio-group触发
		radioChange(e) {
			this.rog = e;
		},
		/** 展示申请原因上拉框事件绑定 */
		handleShowReason() {
			this.reasonSelectShow = true;
		},

		/** 申请原因选中事件绑定 */
		onSelectReason(index) {
			this.reasonSelectShow = false;
			this.refund_info.reason = this.reasonSelectActions[index].text;
		},

		/** 展示账户类型上拉框事件绑定 */
		handleShowAccountType() {
			this.accountTypeSelectShow = true;
		},

		/** 账户类型选中事件绑定 */
		onSelectAccountType(index) {
			this.accountTypeSelectShow = false;
			this.accountTypeText = this.accountTypeSelectActions[index].text;
			this.refund_info.account_type = this.accountTypeSelectActions[index].value;
		},

		/** 跳转至订单列表页面 */
		handleCancelSubmit() {
			uni.redirectTo({
				url: '/pages/order/myOrder?status=0'
			});
		},

		/** 申请售后 */
		handleApplyService() {
			confirmReceipt(this.order_sn).then(() => {
				uni.redirectTo({
					url: '/pages/order/afterSales/afterSales'
				});
			});
		},

		/** 校验参数 */
		handleCheckParams() {
			// 取消原因校验
			if (!this.refund_info.reason || this.refund_info.reason === '请选择取消原因') {
				this.$refs.uToast.show({ title: '请选择取消原因!', type: 'error' });
				return false;
			}
			// 联系方式校验
			if (!this.refund_info.mobile || !this.$u.test.mobile(this.refund_info.mobile)) {
				this.$refs.uToast.show({ title: '请输入正确格式的手机号码!', type: 'error' });
				return false;
			}

			// 如果不支持原路退款
			if (!this.isRetrace) {
				// 账户类型校验
				if (!this.refund_info.account_type) {
					this.$refs.uToast.show({ title: '请选择账户类型!', type: 'error' });
					return false;
				}

				// 如果账户类型不为银行卡
				if (this.refund_info.account_type != 'BANK_TRANSFER') {
					// 退款账号校验
					if (!this.refund_info.return_account) {
						this.$refs.uToast.show({ title: '请输入退款账号!', type: 'error' });
						return false;
					}
				} else {
					// 银行名称校验
					if (!this.refund_info.bank_name) {
						this.$refs.uToast.show({ title: '请输入银行名称!', type: 'error' });
						return false;
					}
					// 银行开户行校验
					if (!this.refund_info.bank_deposit_name) {
						this.$refs.uToast.show({ title: '请输入银行开户行!', type: 'error' });
						return false;
					}
					// 银行开户名校验
					if (!this.refund_info.bank_account_name) {
						this.$refs.uToast.show({ title: '请输入银行开户名!', type: 'error' });
						return false;
					}
					// 银行账号校验
					if (!this.refund_info.bank_account_number) {
						this.$refs.uToast.show({ title: '请输入银行账号!', type: 'error' });
						return false;
					}
				}
			}

			return true;
		},

		/** 提交取消订单申请 */
		handleSubmitApply() {
			// 校验参数
			if (!this.handleCheckParams()) {
				return false;
			}

			this.refund_info.order_sn = this.order_sn;

			applyCancelOrder(this.refund_info).then(() => {
				this.$refs.uToast.show({ title: '提交成功!', type: 'success' });
				this.handleCancelSubmit();
			});
		},

		/** 获取订单详情信息 */
		GET_OrderCancelDetail() {
			getOrderDetail(this.order_sn).then(response => {
				this.order = response.data;
				this.isRetrace = this.order.is_retrace;
				this.refund_info.refund_price = Foundation.formatPrice(this.order.order_price);
				this.applyService = this.order.order_status === 'SHIPPED' && this.order.ship_status === 'SHIP_YES';
			});
		}
	}
};
</script>

<style lang="scss">
/deep/ .u-cell { 
	// #ifdef MP-WEIXIN
	width: 100vw !important;
	overflow: hidden !important;
	display: block !important;
	
	// #endif
}
/deep/ .u-cell_title{
	// #ifdef MP-WEIXIN
	float: left;
	// #endif
}
/deep/ .u-cell__value{
	// #ifdef MP-WEIXIN
	float: right;
	// #endif
}

.cancel-head {
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
}
.submit-btn {
	display: flex;
	margin-top: 40rpx;
	margin-bottom: 40rpx;
	text-align: center;
	justify-content: center;
	align-items: center;
}
.cancel-tips {
	display: flex;
	flex-direction: column;
	padding: 20rpx;
	font-size: 22rpx;
	font-family: PingFang SC, PingFang SC-Regular;
	color: #999999;
	view {
		margin-top: 6rpx;
	}
	.tips-header {
		color: #ff6262;
		font-size: 26rpx;
		margin-bottom: 6rpx;
	}
}
.main-btn {
	width: 40%;
	background-color: $light-color;
	color: #ffffff;
}
.cancel-btn {
	margin-right: 30px;
	width: 40%;
	border-color: $light-color;
	color: $light-color;
}
</style>
