<template>
  <view>
    <view class="goods-recommend">{{title ? `--${title}-- `:''}}</view>
		 <goodsTemplate :res='goodsList' />
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import goodsTemplate from '@/components/m-goods-list/list.vue'
import { getGoodsList } from "@/api/goods.js"

const props = withDefaults(defineProps<{
	title?: string
	pageSize?: number | null
	categoryId?: string | null
	storeId?: string | null
}>(), {
	title: '',
	pageSize: 12,
	categoryId: '',
	storeId: ''
})

const goodsList = ref<any[]>([])
const params = ref({
	pageNumber: 1,
})

onMounted(() => {
	initGoods()
})

/**
 * 初始化商品
 */
const initGoods = async () => {
	let submit = JSON.parse(
		JSON.stringify(
			Object.assign(params.value, {
				pageSize: props.pageSize,
				categoryId: props.categoryId,
				storeId: props.storeId,
			})
		)
	)

	Object.keys(submit).map((key) => {
		if (!submit[key] || (submit[key] as any).length == 0) {
			delete submit[key]
		}
	})
	let res = await getGoodsList(submit)
	goodsList.value.push(...(res.data.result.records as any[]))
}

const handleClick = (item: any) => {
	uni.navigateTo({
		url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
	})
}
</script>

<style scoped lang="scss">
/**商品代码 */
$w_94: 94%;
.goods-recommend {
  background: #f7f7f7;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  background: #f7f7f7;
}
.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}
.goods-img {
  position: relative;
  margin: 0 auto;
  width: $w_94;
  height: 350rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
}
.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;
  > .goods-title {
    font-size: 12px;
    height: 70rpx;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;

    -webkit-line-clamp: 2;

    overflow: hidden;
  }

  > .goods-bottom {
    display: flex;
    font-weight: bold;

    > .goods-price {
      line-height: 2;
      color: $main-color;
    }
  }
}
</style>
