<template>
	<view class="myTracks">
		<u-navbar
			title="我的足迹"
			:fixed="true"
			:placeholder="true"
			:auto-back="true"
		>
			<template #right>
        <div class="light-color edit" @click="isEdit = !isEdit">{{ !isEdit ? '编辑' : '完成'}}</div>
      </template>
		</u-navbar>
		<view class="tracks-tip">
			<u-icon name="volume" color="#f9ae3d" size="19"></u-icon>
			<text class="tracks-tip-text">右划删除浏览记录</text>
		</view>
		<u-empty text="暂无历史记录" style="margin-top:200rpx;" mode="history" v-if="whetherEmpty"></u-empty>
		<view v-else class="tracks-list">
			<block v-for="(item, index) in trackList" :key="index">
				<view
					class="myTracks-title"
					v-if="getStoreName(item)"
					@click="navigateToStore(item)"
				>{{ getStoreName(item) }}</view>
				<u-swipe-action class="myTracks-swipe">
					<u-swipe-action-item
						:show="item.show"
						:name="index"
						@click="delTracks"
						@open="open"
						:options="options"
					>
						<view class="myTracks-item">
							<u-checkbox-group v-if="isEdit" class="store-line-check">
								<u-checkbox
									usedAlone
									shape="circle"
									:active-color="lightColor"
									v-model:checked="item.checked"
									@change="checkboxChangeDP(item)"
								></u-checkbox>
							</u-checkbox-group>
							<view class="myTracks-item-img" @click.stop="navigateToDetail(item)">
								<image class="track-thumb" :src="item.thumbnail"></image>
							</view>
							<view class="myTracks-item-content" @click.stop="navigateToDetail(item)">
								<view class="myTracks-item-title">
									{{ item.goodsName }}
								</view>
								<view class="myTracks-item-price">
									￥{{ unitPrice(item.price) }}
								</view>
							</view>
						</view>
					</u-swipe-action-item>
				</u-swipe-action>
				<view class="myTracks-divider"></view>
			</block>
			<view v-if="isEdit" class="submit" @click="handleClickDeleteSelected">
				删除所选
			</view>
		</view>

	</view>
</template>

<script>
	import {
		myTrackList,
		deleteHistoryListId
	} from "@/api/members.js";
	import { getStoreBaseInfo } from "@/api/store.js";

	export default {
		data() {
			return {
				isEdit:false,
				whetherEmpty: false, //是否数据为空
				params: {
					pageNumber: 1,
					pageSize: 10,
					order: "desc",
					sort: "updateTime",
				},
				lightColor:this.$lightColor,
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}],
				trackList: [], //足迹列表
				storeNameMap: {},
			};
		},

		/**
		 * 滑到底部加载下一页数据
		 */
		onReachBottom() {
			this.params.pageNumber++;
			this.getList();
		},
		onShow() {
			this.params.pageNumber = 1
			this.trackList = [];
			this.getList();
		},
		onPullDownRefresh() {
			this.trackList = [];
			this.getList();
		},
		methods: {
			getStoreName(item) {
				return item.storeName || this.storeNameMap[item.storeId] || "";
			},
			async enrichStoreNames(records) {
				const storeIds = [
					...new Set(
						records
							.filter((item) => !item.storeName && item.storeId)
							.map((item) => item.storeId)
					),
				].filter((storeId) => !this.storeNameMap[storeId]);

				await Promise.all(
					storeIds.map(async (storeId) => {
						try {
							const res = await getStoreBaseInfo(storeId);
							const name = res.data?.result?.storeName;
							if (name) {
								this.storeNameMap[storeId] = name;
							}
						} catch (e) {
							// ignore
						}
					})
				);
			},
			checkboxChangeDP(val){
				console.log(val)
			},
			// 删除所选的数据
			handleClickDeleteSelected(val){
				const ids = this.trackList.filter(item=>item.checked).map(item=>item.goodsId);
				if(!ids.length){
					uni.showToast({
						title:"请选择删除数据",
						icon:"none"
					})
				}else{
					this.delTracks(0,ids)
				}
			},
			/**
			 * 导航到店铺
			 */
			navigateToStore(val) {
				uni.navigateTo({
					url: "/pages/product/shopPage?id=" + val.storeId,
				});
			},
			open(index) {
				// 先将正在被操作的swipeAction标记为打开状态，否则由于props的特性限制，
				// 原本为'false'，再次设置为'false'会无效
				this.trackList[index].show = true;
				this.trackList.map((val, idx) => {
					if (index != idx) this.trackList[idx].show = false;
				})
			},
			/**
			 * 跳转详情
			 */
			navigateToDetail(item) {
				uni.navigateTo({
					url: "/pages/product/goods?id=" + item.id + "&goodsId=" + item.goodsId,
				});
			},

			/**
			 * 获取我的足迹列表
			 */
			getList() {
				uni.showLoading({
					title: "加载中",
				});
				myTrackList(this.params).then(async (res) => {
					uni.stopPullDownRefresh();
					uni.hideLoading();
					if (res.statusCode == 200) {
						const records = res.data.result.records || [];
						records.forEach((item) => {
							item.show = false;
							item.checked = false;
						});

						if (!records.length) {
							if (this.trackList.length === 0) {
								this.whetherEmpty = true;
							}
						} else {
							await this.enrichStoreNames(records);
							this.trackList.push(...records);
						}
					}
				});
			},


			/**
			 * 删除足迹
			 */
			delTracks(e, ids) {
				const index = typeof e === 'object' ? (e.name ?? e.index) : e;
				const goodsId = ids || this.trackList[index]?.goodsId;
				if (!goodsId) return;
				deleteHistoryListId(goodsId).then((res) => {
					if (res.data.code == 200) {
						this.trackList = [];
						this.params.pageNumber = 1
						this.getList();
					} else {
						uni.showToast({
							title: res.data.message,
							duration: 2000,
							icon: "none",
						});
					}
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.submit {
		position: fixed;
		bottom: calc(20rpx + constant(safe-area-inset-bottom));
		bottom: calc(20rpx + env(safe-area-inset-bottom));
		left: 10%;
		width: 80%;
		height: 80rpx;
		color: #fff;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: $light-color;
		z-index: 99;
	}

	.myTracks {
		width: 100%;
		padding-top: 2rpx;
	}

	.tracks-tip {
		display: flex;
		align-items: center;
		padding: 18rpx 24rpx;
		background: #fdf6ec;
	}

	.tracks-tip-text {
		margin-left: 10rpx;
		font-size: 28rpx;
		color: #f9ae3d;
		line-height: 1.4;
	}

	.tracks-list {
		width: 100%;
	}

	.myTracks-swipe,
	:deep(.u-swipe-action),
	:deep(.u-swipe-action-item),
	:deep(.u-swipe-action-item__content) {
		width: 100%;
	}

	:deep(.u-swipe-action-item__content) {
		overflow: hidden;
	}

	.myTracks-title {
		width: 100%;
		height: 110rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: bold;
		background-color: #fff;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.myTracks-item {
		width: 100%;
		min-height: 226rpx;
		padding: 30rpx 20rpx;
		background-color: #fff;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.store-line-check {
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.myTracks-item-img {
		margin-right: 20rpx;
		flex-shrink: 0;

		.track-thumb {
			width: 130rpx;
			height: 130rpx;
			border-radius: 8rpx;
			display: block;
		}
	}

	.myTracks-item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.myTracks-item-title {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.myTracks-item-price {
		font-size: 28rpx;
		color: $light-color;
		padding-top: 10rpx;
	}

	.myTracks-divider {
		width: 100%;
		height: 20rpx;
		background: #f5f5f5;
	}

	.edit {
		padding-right: 32rpx;
	}
</style>
