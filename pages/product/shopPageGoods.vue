<template>
	<div>
		<u-navbar
			:title="title"
			:fixed="true"
			:placeholder="true"
			:border="false"
			:auto-back="true"
		></u-navbar>
		<!-- 商品 -->
		<div class="contant">
			<view  v-if="!goodsList.length" class="empty">暂无商品信息</view>
			<goodsTemplate  style="width: 100%;" :res='goodsList' :storeName='false' />
		</div>
	</div>

</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import { getGoodsList } from '@/api/goods.js'
import goodsTemplate from '@/components/m-goods-list/list'

const title = ref('')
const routerVal = ref<any>('')
const goodsList = ref<any[]>([])
const params = reactive({
  pageNumber: 1,
  pageSize: 10,
  keyword: '',
  storeCatId: '',
  storeId: '',
})

async function getGoodsData() {
  const res = await getGoodsList(params)
  if (res.data.success) {
    goodsList.value.push(...res.data.result.records)
  }
}

onLoad((options: any) => {
  routerVal.value = options
  params.storeId = options.storeId
  params.storeCatId = options.id
  title.value = options.title
})

onShow(() => {
  goodsList.value = []
  params.pageNumber = 1
  getGoodsData()
})

onReachBottom(() => {
  params.pageNumber++
  getGoodsData()
})
</script>

<style lang="scss" scoped>
	.contant {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;

		>.empty {
			width: 100%;
			display: flex;
			justify-content: center;
			margin-top: 40rpx;
		}
}
</style>
