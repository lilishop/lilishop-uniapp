<template><view v-if="quote" class="paid-price" @click.stop="open"><image v-if="quote.label" :src="quote.label" mode="aspectFit" /><text>会员价 ¥{{ Number(quote.price).toFixed(2) }}</text><text v-if="!quote.eligible" class="open">开通享 ›</text></view></template>
<script setup>
defineProps({quote:{type:Object,default:null}})
function open(){uni.navigateTo({url:'/pages/mine/paidMember'})}
</script>
<style scoped>.paid-price{display:flex;align-items:center;flex-wrap:wrap;gap:6rpx;margin-top:8rpx;color:#a77c3e;font-size:22rpx;line-height:1.6}.paid-price image{width:28rpx;height:28rpx}.open{font-size:20rpx;opacity:.8}</style>
