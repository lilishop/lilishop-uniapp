<template>
  <view>
    <!-- 常用工具 -->
    <view class="interact-tools" style="margin-bottom: 15px">

      <div class="paddingBox">
        <view class="interact-container">
			<view class="interact-item" @click="navigateTo('/pages/mine/address/addressManage')">
			  <image class="interact-item-icon" src="/static/mine/myaddress.png" mode=""></image>
			  <view>地址管理</view>
			</view>
			
			<view class="interact-item" @click="navigateTo('/pages/mine/myTracks')">
			  <image class="interact-item-icon" src="/static/mine/logistics.png" mode=""></image>
			  <view>我的足迹</view>
			</view>
		
			<view class="interact-item" @click="navigateTo('/pages/order/evaluate/myEvaluate')">
			  <image class="interact-item-icon" src="/static/mine/feedback.png" mode=""></image>
			  <view>我的评价</view>
			</view>
			<view class="interact-item" @click="linkMsgDetail()">
			  <image class="interact-item-icon" src="/static/mine/mycommit.png" mode=""></image>
			  <view>我的消息</view>
			</view>
		
		
			<view class="interact-item" @click="navigateTo('/pages/mine/myCollect')">
			  <image class="interact-item-icon" src="/static/mine/myfavorite.png" mode=""></image>
			  <view>我的关注</view>
			</view>
			
			
			
			<view class="interact-item" @click="navigateTo('/pages/mine/point/myPoint')">
			  <image class="interact-item-icon" src="/static/mine/mypoint.png" mode=""></image>
			  <view>我的积分</view>
			</view>
			
			<view class="interact-item" @click="distribution">
			  <image class="interact-item-icon" src="/static/mine/distribution.png" mode=""></image>
			  <view>我的分销</view>
			</view>
			
			
			
			<view class="interact-item" @click="navigateTo('/pages/order/complain/complainList')">
			  <image class="interact-item-icon" src="/static/mine/shensu.png" mode=""></image>
			  <view>我的投诉</view>
			</view>
				   
			<view class="interact-item" @click="navigateTo('/pages/cart/coupon/myCoupon')">
			  <image class="interact-item-icon" src="/static/mine/mycoupon.png" mode=""></image>
			  <view>优惠券</view>
			</view>
			
		
			        
					
          <view class="interact-item" @click="navigateTo('/pages/mine/signIn')">
            <image class="interact-item-icon" src="/static/mine/sign.png" mode=""></image>
            <view>每日签到</view>
          </view>
         
         
       
          

      
          <view class="interact-item" @click="navigateTo('/pages/cart/coupon/couponCenter')">
            <image class="interact-item-icon" src="/static/mine/couponcenter.png" mode=""></image>
            <view>领券中心</view>
          </view>
          
         
          
          <view class="interact-item" @click="navigateTo('/pages/promotion/bargain/log')">
            <image class="interact-item-icon" src="/static/mine/kanjia.png" mode=""></image>
            <view>砍价记录</view>
          </view>
		  
		
		  
          <view class="interact-item" @click="navigateTo('/pages/mine/set/feedBack')">
            <image class="interact-item-icon" src="/static/mine/feedback.png" mode=""></image>
            <view>意见反馈</view>
          </view>
          
          <view class="interact-item" @click="navigateTo('/pages/mine/set/editionIntro')">
            <image class="interact-item-icon" src="/static/mine/pointgift.png" mode=""></image>
            <view>关于</view>
          </view>
          
          <view class="interact-item" @click="navigateTo('/pages/passport/entry/seller/index')">
            <image class="interact-item-icon" src="/static/mine/feedback.png" mode=""></image>
            <view>店铺入驻</view>
          </view>
          
          
<!--          <view class="interact-item" @click="inviter()">-->
<!--          	<image class="interact-item-icon" src="/static/mine/share.png" mode=""></image>-->
<!--          	<view>邀新</view>-->
<!--          </view>-->
          <view class="interact-item" @click="navigateTo('/pages/mine/set/setUp')">
            <image class="interact-item-icon" src="/static/mine/setting.png" mode=""></image>
            <view>设置</view>
          </view>
        
		  
        </view>
      </div>
	  
	  			<template>
	  				<u-popup v-model:show="sharingShow" mode="bottom" border-radius="14">
	  					<view style="margin: 10px; text-align: center;"> 请邀请用户扫描二维码或者将地址复制转发给其他用户 </view>
	  					<view class='qrcode'>
	  						<uqrcode v-if="sharingLink" ref="uqrcode" canvas-id="qrcode" :value="sharingLink" :options="{ margin: 10 }">
	  						</uqrcode>
	  					</view>
	  
						  <view class="copy-text" @click="getDetail(sharingLink)">
							{{sharingLink}}
						  </view>
	  					<view class="confrim-btn">
	  						<u-button @click="sharingShow = false;">关闭</u-button>
	  					</view>
	  				</u-popup>
	  			</template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { distribution as fetchDistribution } from '@/api/distribution'
import configs from '@/config/config'
import storage from '@/utils/storage'
import { tipsToLogin, setClipboard } from '@/utils/filters.js'
import {
  checkSelfRecruitEntry,
  DISTRIBUTION_CLOSE_MESSAGE,
  DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
  DISTRIBUTION_RETREAT_MESSAGE,
  DISTRIBUTION_STATUS,
} from '@/utils/distributionStatus'

const sharingShow = ref(false)
const sharingLink = ref('')

function handleNavigate(url: string) {
  uni.navigateTo({ url })
}

function inviter() {
  if (storage.getUserInfo().id) {
    sharingLink.value = configs.shareLink + '?inviter=' + storage.getUserInfo().id
    sharingShow.value = true
  } else {
    uni.showToast({
      title: '请先登录',
      duration: 2000,
      icon: 'none',
    })
  }
}

function getDetail(link: string) {
  setClipboard(link)
}

function navigateTo(url: string) {
  const ignores = [
    '/pages/mine/set/setUp',
    '/pages/mine/set/editionIntro',
    '/pages/mine/set/feedBack',
  ]
  if (!ignores.includes(url)) {
    if (tipsToLogin('normal')) {
      handleNavigate(url)
    }
  } else {
    handleNavigate(url)
  }
}

function linkMsgDetail() {
  if (tipsToLogin('normal')) {
    uni.navigateTo({
      url: '/pages/tabbar/home/title',
    })
  }
}

function goRecruitJoin() {
  uni.navigateTo({
    url: '/pages/mine/distribution/join',
  })
}

function enterSelfRecruitOrToast() {
  checkSelfRecruitEntry().then((gate) => {
    if (gate === 'distribution_closed') {
      uni.showToast({
        title: DISTRIBUTION_CLOSE_MESSAGE,
        duration: 2000,
        icon: 'none',
      })
      return
    }
    if (gate === 'entry_closed') {
      uni.showToast({
        title: DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
        duration: 2000,
        icon: 'none',
      })
      return
    }
    goRecruitJoin()
  })
}

function distribution() {
  if (!tipsToLogin('normal')) {
    return
  }
  // 入口按 distributionStatus 路由：有对象 ≠ 有效分销员。清退停住，不进 join / home。
  fetchDistribution().then((res) => {
    if (res.data.result) {
      const type = res.data.result.distributionStatus
      if (type == DISTRIBUTION_STATUS.PASS) {
        uni.navigateTo({
          url: '/pages/mine/distribution/home',
        })
      } else if (type == DISTRIBUTION_STATUS.REFUSE) {
        enterSelfRecruitOrToast()
      } else if (type == DISTRIBUTION_STATUS.RETREAT) {
        uni.showToast({
          title: DISTRIBUTION_RETREAT_MESSAGE,
          duration: 2000,
          icon: 'none',
        })
      } else {
        uni.showToast({
          title: '您的信息正在审核',
          duration: 2000,
          icon: 'none',
        })
      }
    } else if (!res.data.success && res.data.code == 22000) {
      uni.showToast({
        title: '分销功能暂未开启',
        duration: 2000,
        icon: 'none',
      })
    } else {
      enterSelfRecruitOrToast()
    }
  })
}
</script>

<style lang="scss" scoped>
.copy-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  line-break: anywhere;
}

.interact-tools {
	border-left: none;
	border-right: none;


	.interactBox {
		height: 156rpx;
	}

	.interact-container {
		margin: 0 20rpx;
		background: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 24rpx 0 rgba($color: #f6f6f6, $alpha: 1);

		.interact-item-icon {
			width: 56rpx;
			height: 56rpx;
			margin-bottom: 10rpx;
		}

		display: flex;
		align-items: center;
		flex-wrap: wrap;
		text-align: center;

		.interact-item {
			font-size: 24rpx;
			width: 25%;
			flex: 0 0 25%;
			box-sizing: border-box;
			height: 150rpx;
			padding: 20rpx 8rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #666;
		}
	}
}

.qrcode {
	margin: 0 auto;
	width: 200px;
}
</style>
