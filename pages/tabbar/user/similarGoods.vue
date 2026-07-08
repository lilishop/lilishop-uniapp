<template>
	<view class="similar-goods">
		<view class="goods" @click="goDetail(goods.goods_id)">
			<image :src="goods.goods_img" mode=""></image>
			<view class="goods-intro">
				<view>{{goods.goodsName}}</view>
				<view>{{goods.goods_sn}}</view>
				<view>¥{{unitPrice(goods.goods_price)}}</view>
			</view>
			<!-- <button>找相似</button> -->
		</view>
		<view class="title">相似好货&nbsp;为您推荐</view>
		<view class="scroll-con">
			<view v-if="nomsg">没有相似商品</view>
			<view v-else class="con" v-for="(item,index) in goodsList" :key="index" @click="goDetail(item)">
				<image :src="item.thumbnail" mode=""></image>
				<view class="nowrap">{{item.name}}</view>
				<view>
					<text>￥{{unitPrice(item.price)}}
					<!-- <text v-if="item.point">+{{item.point || 0}}积分</text> -->
					</text>
					<text>￥{{item.mktprice}}</text>
				</view>
				<view>
					<text>已售{{item.buy_count}}件</text>
					<text>{{item.grade}}%好评</text>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadStatus"></uni-load-more>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getGoodsList } from '@/api/goods.js'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'

const store = useStore()

const loadStatus = ref('more')
const params = reactive({
  pageNumber: 1,
  pageSize: 10,
  keyword: '',
})
const goods = ref<any>({})
const goodsList = ref<any[]>([])
const nomsg = ref(false)

function getList() {
  uni.showLoading({ title: '加载中' })
  params.keyword = goods.value.goodsName
  getGoodsList(params).then((res) => {
    if (store.state.isShowToast) {
      uni.hideLoading()
    }
    if (res.statusCode == 200) {
      const data = res.data
      if (data.data_total == 0) {
        loadStatus.value = 'noMore'
      } else if (data.data_total < 10) {
        loadStatus.value = 'noMore'
        goodsList.value.push(...data.data)
      } else {
        goodsList.value.push(...data.data)
        if (data.data.length < 10) loadStatus.value = 'noMore'
      }
    }
  })
}

function goDetail(item: any) {
  uni.navigateTo({
    url: '/pages/product/goods?id=' + item.id + '&goodsId=' + item.goodsId,
  })
}

function loadData() {
  if (loadStatus.value != 'noMore') {
    params.pageNumber++
    getList()
  }
}

onLoad((option) => {
  goods.value = JSON.parse(decodeURIComponent(option.goods))
  getList()
})

onReachBottom(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
	@import './collect.scss';

	.title {
		height: 110rpx;
		line-height: 110rpx;
		text-align: center;
		color: #333;
		background-color: #F1F1F1;
		margin-top: 20rpx;
		font-size: $font-base;
	}

	.goods {
		padding: 0 30rpx;
	}

	.scroll-con {
		width: 750rpx;
		flex-wrap: wrap;

		.con {
			width: 345rpx;
			margin: 20rpx 0 0 20rpx;
			background-color: #FFFFFF;
			border-radius: 10rpx;
			box-sizing: border-box;
			display: inline-block;
			font-size: $font-sm;

			// line-height: 1.5em;
			image {
				width: 100%;
				height: 320rpx;
				border-radius: 8rpx 8rpx 0 0;
			}
			view{
				padding: 0 20rpx;
				&::after{
					content: '';
					display: block;
					clear: right;
				}
				text {
					display: inline-block;
					color: #999;
				}
				
				text:nth-child(2) {
					float: right;
					text-align: right;
				}
			}
			view:last-child{
				margin-bottom: 20rpx;
			}
			.nowrap {
				position: relative;
				line-height: 1.4em;
				max-height: 2.8em; //height是line-height的整数倍，防止文字显示不全
				overflow: hidden;
			}

			

			view:nth-child(2) {
				font-size: 26rpx;
			}

			view:nth-child(3) {
				margin-top: 10rpx;
				font-weight: bold;

				text:nth-child(1) {
					color: #f56c6c;
				}

				text:nth-child(2) {
					color: #d7d7d7;
					text-decoration: line-through;
				}
			}

			view:nth-child(4) {
				margin-top: 10rpx;
			}

		}
	}
</style>
