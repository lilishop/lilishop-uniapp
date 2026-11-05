<template>
  <view class="records-page">
    <view v-for="order in rows" :key="order.id" class="record-card">
      <view class="heading"><text>{{ memberName(order) }}</text><text class="status">{{ status(order) }}</text></view>
      <text class="amount">¥{{ Number(order.amount).toFixed(2) }} <text class="months">/ {{ order.months }}个月</text></text>
      <text class="line">订单号：{{ order.sn }}</text><text class="line">创建时间：{{ order.createTime }}</text>
      <template v-if="order.status === 'PAID'"><text class="line">支付时间：{{ order.payTime }}</text><text class="line">有效期：{{ order.startTime }} 至 {{ order.endTime }}</text></template>
      <view v-if="canPay(order)" class="actions"><button class="cancel" @click="cancel(order)">取消订单</button><button class="pay" @click="pay(order)">继续支付</button></view>
    </view>
    <view v-if="!rows.length" class="empty">{{ loading ? '加载中…' : error ? '加载失败，点击重试' : '暂无购买记录' }}</view>
    <view v-if="error" class="load-more" @click="load(retryReset)">点击重新加载</view><view v-else-if="rows.length" class="load-more" @click="load(false)">{{ loading ? '加载中…' : more ? '上拉或点击加载更多' : '已显示全部记录' }}</view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh, onUnload } from '@dcloudio/uni-app'
import { getPaidMemberOrders, cancelPaidMemberOrder } from '@/api/paid-member'
import { isLogin, navigateToLogin } from '@/utils/filters'
const rows=ref([]),loading=ref(false),error=ref(false),more=ref(true)
let page=1,owner='',request=0,retryReset=true
const time=value=>new Date(String(value||'').replace(/-/g,'/')).getTime()
function memberName(order){try{return JSON.parse(order.configSnapshot).name}catch{return '付费会员'}}
function canPay(order){return order.status==='UNPAID' && time(order.payDeadline)>Date.now()}
function status(order){return order.status==='PAID' ? time(order.startTime)>Date.now() ? '待生效' : time(order.endTime)<=Date.now() ? '已到期' : '会员有效' : order.status==='CANCELLED' ? '已取消' : canPay(order) ? '待支付' : '已超时'}
function pay(order){uni.navigateTo({url:`/pages/cart/payment/payOrder?paid_member_sn=${order.sn}`})}
function cancel(order){uni.showModal({title:'取消会员订单',content:'确定取消这笔未支付订单？',success:async result=>{if(result.confirm){const res=await cancelPaidMemberOrder(order.sn);if(res.data?.success)load(true)}}})}
async function load(reset=false){
  const memberId=String(isLogin()?.id||'');if(!memberId){request++;rows.value=[];owner='';navigateToLogin();uni.stopPullDownRefresh();return}
  if(!reset && (loading.value || !more.value))return
  if(owner!==memberId){owner=memberId;rows.value=[];reset=true}
  const id=++request,next=reset?1:page;loading.value=true;error.value=false;retryReset=reset
  try{const res=await getPaidMemberOrders({pageNumber:next,pageSize:20});if(id!==request||String(isLogin()?.id||'')!==memberId)return;if(!res.data?.success)throw new Error('load');const data=res.data.result||{};rows.value=reset ? data.records||[] : [...rows.value,...(data.records||[]).filter(row=>!rows.value.some(old=>old.id===row.id))];page=next+1;more.value=next*20<Number(data.total||0);retryReset=false}catch{if(id===request)error.value=true}finally{if(id===request)loading.value=false;uni.stopPullDownRefresh()}
}
onShow(()=>load(true));onPullDownRefresh(()=>load(true));onReachBottom(()=>{if(!error.value)load(false)});onUnload(()=>request++)
</script>
<style scoped>.records-page{min-height:100vh;box-sizing:border-box;padding:24rpx 28rpx calc(30rpx + env(safe-area-inset-bottom));background:#f5f6f9}.record-card{padding:28rpx;background:#fff;border-radius:20rpx;margin-bottom:20rpx}.heading{display:flex;align-items:center;justify-content:space-between;font-size:29rpx;font-weight:600}.status{font-size:23rpx;color:#a78149;font-weight:400}.amount{display:block;font-size:40rpx;margin:20rpx 0;color:#9d753e}.months{font-size:23rpx;color:#989faa}.line{display:block;font-size:22rpx;line-height:1.9;color:#929aa6;overflow-wrap:anywhere}.actions{display:flex;justify-content:flex-end;gap:16rpx;margin-top:22rpx}.actions button{margin:0;padding:0 26rpx;font-size:23rpx;line-height:58rpx;border-radius:30rpx}.actions button::after{border:none}.pay{background:#f0dfc2;color:#8d6836}.cancel{background:#f2f3f5;color:#929aa6}.empty,.load-more{padding:40rpx 0;text-align:center;font-size:25rpx;color:#a0a7b1}</style>
