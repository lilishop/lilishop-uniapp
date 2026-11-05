<template>
  <view class="paid-page">
    <view v-if="loading && !data.config" class="empty">加载中…</view>
    <view v-else-if="error && !data.config" class="empty" @click="load">加载失败，点击重试</view>
    <template v-else-if="data.config">
      <view v-if="error" class="poll-message" @click="load">刷新失败，点击重试</view>
      <view class="member-card" :style="cardStyle">
        <image v-if="data.config.backgroundType === 'IMAGE' && data.config.backgroundImage" class="card-bg" :src="data.config.backgroundImage" mode="aspectFill" />
        <view class="card-content"><view class="card-title"><image v-if="data.config.icon" class="member-icon" :src="data.config.icon" mode="aspectFit" /><text>{{ data.config.name }}</text></view><text class="member-status">{{ data.active ? '会员有效期至 ' + data.endTime : data.status === 'EXPIRED' ? '会员已到期' : '开通会员，享专属权益' }}</text><text v-if="data.status !== 'UNOPENED'" class="saved">累计已优惠 ¥{{ money(data.savedAmount) }}</text></view>
      </view>
      <view v-if="pollMessage" class="poll-message" @click="checkPayment">{{ pollMessage }}</view>
      <view class="purchase-card"><view><text class="price">¥{{ money(data.config.price) }}</text><text class="period"> / {{ data.config.months }}个月</text></view><text class="hint">{{ data.active ? '续费将从原到期时间顺延，续费权益在新周期开始后生效' : '支付成功后开通，按自然月计算有效期' }}</text></view>
      <view class="section"><view class="section-heading"><text>专属权益</text><text class="record-link" @click="goRecords">购买记录 ›</text></view>
        <view class="rights-grid"><view v-for="b in displayedBenefits" :key="b.id" class="right-item" @click="detail = b"><image v-if="b.benefitLogo" :src="b.benefitLogo" mode="aspectFit" /><u-icon v-else name="gift" size="28" color="#ae8245" /><text>{{ b.benefitName }}</text></view></view><text v-if="!displayedBenefits.length" class="hint">{{ data.active ? '当前暂无关联权益' : '开通后按会员配置享有权益' }}</text>
        <view class="discount-note"><text>会员专享商品折扣</text><text>优惠由平台提供，限适用商家及商品。实际优惠以结算页为准。</text></view>
      </view>
      <view v-if="data.recommendedGoods?.length" class="section"><view class="section-heading">为你推荐</view><view class="goods-grid"><view v-for="g in data.recommendedGoods" :key="g.id" class="goods-card" @click="goGoods(g)"><image class="goods-cover" :src="g.thumbnail" mode="aspectFit" /><text class="goods-name">{{ g.goodsName }}</text><text class="goods-price">¥{{ money(g.price) }}</text><view v-if="quotes[g.id]" class="member-price"><image v-if="quotes[g.id].label" class="member-price-label" :src="quotes[g.id].label" mode="aspectFit" /><text>会员价 ¥{{ money(quotes[g.id].price) }}</text></view></view></view></view>
      <view v-if="data.config.description" class="section"><view class="section-heading">购买说明</view><rich-text :nodes="data.config.description" /></view>
      <view class="purchase-footer"><view class="agreement-row" @click="agreed = !agreed"><u-icon :name="agreed ? 'checkmark-circle-fill' : 'checkmark-circle'" size="17" color="#a78149" /><text>我已阅读并同意</text><text class="agreement-link" @click.stop="showAgreement = true">《付费会员协议》</text></view><button :disabled="!data.config.enabled || buying || !agreed" :loading="buying" class="buy-button" @click="buy">{{ !data.config.enabled ? '暂未开放购买和续费' : data.active ? '立即续费' : '立即开通' }}</button></view>
    </template>
    <view v-if="detail || showAgreement" class="overlay"><view class="mask" @click="closeDetail" @touchmove.stop.prevent /><view class="sheet"><text class="sheet-title">{{ detail?.benefitName || '付费会员协议' }}</text><scroll-view scroll-y class="sheet-scroll"><rich-text :nodes="detail ? detail.benefitDesc || '暂无说明' : data.config?.agreement || '请联系平台查看会员协议'" /></scroll-view><button class="close-button" @click="closeDetail">关闭</button></view></view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow, onHide, onUnload, onPullDownRefresh } from '@dcloudio/uni-app'
import { getPaidMember, createPaidMemberOrder, getPaidMemberOrder, getPaidMemberQuotes } from '@/api/paid-member'
import { isLogin, navigateToLogin } from '@/utils/filters'
const data=ref({}), quotes=ref({}), loading=ref(false), error=ref(false), agreed=ref(false), buying=ref(false), detail=ref(null), showAgreement=ref(false), pollMessage=ref('')
let request=0, owner='', purchaseRequest='', paymentSn='', timer=null, pollId=0, pollCount=0
const money=value=>(Number(value)||0).toFixed(2)
const cardStyle=computed(()=>({backgroundColor:data.value.config?.backgroundColor || '#51443b',color:data.value.config?.fontColor || '#fff1d8'}))
const displayedBenefits=computed(()=>data.value.active ? data.value.benefits || [] : data.value.offeredBenefits || [])
function closeDetail(){detail.value=null;showAgreement.value=false}
function goRecords(){uni.navigateTo({url:'/pages/mine/paidMemberRecords'})}
function goGoods(g){uni.navigateTo({url:`/pages/product/goods?id=${g.id}&goodsId=${g.goodsId}`})}
async function load(){
  const memberId=String(isLogin()?.id || '')
  if(!memberId){request++;stopPolling();owner='';data.value={};quotes.value={};loading.value=false;agreed.value=false;purchaseRequest='';paymentSn='';pollMessage.value='';navigateToLogin();uni.stopPullDownRefresh();return}
  if(owner!==memberId){if(owner){stopPolling();paymentSn='';pollMessage.value=''}owner=memberId;data.value={};quotes.value={};agreed.value=false;purchaseRequest='';detail.value=null}
  const id=++request;loading.value=true;error.value=false
  try{
    const res=await getPaidMember()
    if(id!==request || String(isLogin()?.id||'')!==memberId)return
    if(!res.data?.success)throw new Error('load')
    if(data.value.configVersion !== res.data.result?.configVersion) agreed.value=false
    data.value=res.data.result||{};quotes.value={}
    const ids=(data.value.recommendedGoods||[]).map(g=>g.id)
    const results=await Promise.all(Array.from({length:Math.ceil(ids.length/100)},(_,i)=>getPaidMemberQuotes(ids.slice(i*100,i*100+100))))
    if(id===request && String(isLogin()?.id||'')===memberId) quotes.value=Object.assign({},...results.filter(q=>q.data?.success).map(q=>q.data.result||{}))
  }catch{if(id===request)error.value=true}finally{if(id===request)loading.value=false;uni.stopPullDownRefresh()}
}
async function buy(){
  if(buying.value || !agreed.value || !data.value.config?.enabled)return
  buying.value=true
  const memberId=owner
  purchaseRequest=purchaseRequest || 'pm_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)
  try{
    const res=await createPaidMemberOrder({requestId:purchaseRequest,configVersion:data.value.configVersion,agreed:true})
    if(String(isLogin()?.id||'')!==memberId)return
    if(res.data?.success){const o=res.data.result;purchaseRequest='';if(o.status==='PAID')uni.redirectTo({url:'/pages/mine/paidMember?payment_sn='+encodeURIComponent(o.sn)});else uni.navigateTo({url:`/pages/cart/payment/payOrder?paid_member_sn=${o.sn}`})}
    else{purchaseRequest='';agreed.value=false;await load()}
  }catch{uni.showToast({title:'购买结果暂未确认，请重试或查看购买记录',icon:'none'})}finally{buying.value=false}
}
function stopPolling(){pollId++;if(timer)clearTimeout(timer);timer=null}
async function checkPayment(){
  if(!paymentSn)return
  const id=++pollId;pollMessage.value='正在确认支付结果…'
  try{const res=await getPaidMemberOrder(paymentSn);if(id!==pollId)return;if(res.data?.success && res.data.result.status==='PAID'){paymentSn='';pollMessage.value='支付已确认，会员资格已更新';await load();return}pollCount++;if(pollCount<10){timer=setTimeout(checkPayment,1500)}else pollMessage.value='支付结果待确认，点击刷新或查看购买记录'}catch{if(id===pollId)pollMessage.value='支付结果待确认，点击重试'}
}
onLoad(options=>{paymentSn=options?.payment_sn||''})
onShow(async()=>{await load();if(paymentSn){pollCount=0;checkPayment()}})
onPullDownRefresh(load)
onHide(stopPolling)
onUnload(()=>{request++;stopPolling()})
</script>
<style scoped lang="scss">
.paid-page{min-height:100vh;box-sizing:border-box;background:#f5f6f9;padding:28rpx 28rpx 240rpx;color:#292f39}.member-card{position:relative;overflow:hidden;border-radius:24rpx;min-height:240rpx}.card-bg{position:absolute;inset:0;width:100%;height:100%}.card-content{position:relative;padding:36rpx}.card-title{display:flex;align-items:center;gap:16rpx;font-size:38rpx;font-weight:600}.member-icon{width:70rpx;height:70rpx}.member-status,.saved{display:block;margin-top:18rpx;font-size:24rpx}.saved{opacity:.8}.purchase-card,.section{margin-top:24rpx;background:#fff;padding:28rpx;border-radius:20rpx}.price{font-size:48rpx;font-weight:600;color:#a67b3d}.period{font-size:25rpx;color:#929aa6}.hint{display:block;margin-top:14rpx;font-size:23rpx;line-height:1.7;color:#929aa6}.section-heading{display:flex;align-items:center;justify-content:space-between;font-size:30rpx;font-weight:600;margin-bottom:24rpx}.record-link{font-size:23rpx;font-weight:400;color:#a78149}.rights-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28rpx 16rpx}.right-item{display:flex;flex-direction:column;align-items:center;gap:12rpx;text-align:center;font-size:24rpx}.right-item image{width:72rpx;height:72rpx}.discount-note{margin-top:24rpx;padding:20rpx;background:#fbf6ed;border-radius:14rpx;font-size:23rpx;color:#a78149;line-height:1.8}.discount-note text{display:block}.goods-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24rpx}.goods-cover{width:100%;height:230rpx}.goods-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:24rpx;line-height:1.6}.goods-price,.member-price{display:block;margin-top:8rpx;font-size:25rpx}.member-price{display:flex;align-items:center;gap:6rpx;color:#9c7139;font-size:22rpx}.member-price-label{width:28rpx;height:28rpx;flex-shrink:0}.purchase-footer{position:fixed;left:0;right:0;bottom:0;background:#fff;padding:22rpx 28rpx calc(22rpx + env(safe-area-inset-bottom));border-top:1rpx solid #eee;z-index:8}.agreement-row{display:flex;justify-content:center;align-items:center;gap:8rpx;font-size:22rpx;color:#929aa6;margin-bottom:18rpx}.agreement-link{color:#a78149}.buy-button,.close-button{background:#ead5b1;color:#705125;border-radius:44rpx;font-size:28rpx;line-height:84rpx}button::after{border:none}.empty{padding:160rpx 20rpx;text-align:center;color:#969da8;font-size:27rpx}.poll-message{padding:20rpx;background:#fff2d9;border-radius:12rpx;margin-top:20rpx;color:#9d753e;font-size:24rpx}.overlay{position:fixed;inset:0;z-index:20;display:flex;align-items:flex-end}.mask{position:absolute;inset:0;background:rgba(0,0,0,.4)}.sheet{position:relative;width:100%;background:#fff;border-radius:28rpx 28rpx 0 0;padding:30rpx;box-sizing:border-box;padding-bottom:calc(30rpx + env(safe-area-inset-bottom))}.sheet-title{display:block;text-align:center;font-size:32rpx;font-weight:600;margin-bottom:24rpx}.sheet-scroll{height:50vh;margin-bottom:24rpx;font-size:26rpx;line-height:1.8}
</style>
