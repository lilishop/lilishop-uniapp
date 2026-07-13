<template>
  <view class="recommend-box" v-if="res && res.length">
    <h4 class="goods-recommend-title">热门商品</h4>
		<goodsList :res='res' :storeName="false" :tabBarGap="false" />
	 </view>
</template>

<script setup lang="ts">
import goodsList from '@/components/m-goods-list/list.vue'

defineProps<{
  res?: any[]
}>()
</script>

<style lang="scss" scoped>
@import "../product.scss";
</style>
