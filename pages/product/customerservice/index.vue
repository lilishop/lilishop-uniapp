<template>
	<view>
		<chat></chat>
	</view>
</template>
<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad((e: any) => {
	// 腾讯云智服客服插件需在 manifest.json 的 mp-weixin.plugins 中注册后方可使用，
	// 未注册时 requirePlugin 会抛出 "has not registered any plugins"，此处做容错处理。
	let chat
	try {
		chat = requirePlugin('myPlugin')
	} catch (err) {
		uni.showToast({
			title: '客服功能暂未配置',
			icon: 'none',
			duration: 2000
		})
		return
	}
	const params = JSON.parse(decodeURIComponent(e.params))
	chat.init({
		sign: params.mpSign,
		token: params.token,
		uid: params.uuid,
		title: params.storageName,
		isRMB: '',
		data: {
		  c1: '',
		  c2: '',
		  c3: '',
		  c4: '',
		  c5: '',
		  d1: params.goodsName,
		  d2: params.price,
		  d3: '',
		  d4: params.goodsImg,
		  d5: '',
		  d6: params.goodsId,
		  data: ''
		},
		viewUrl(res: string){
		if (res) {
		  wx.navigateTo({
			url: '/pages/webview/index?href=' + res
		  })
		}
		},
		setTitle(res: string){
		if (res) {
		  wx.setNavigationBarTitle({
			title: res
		  })
		}
		},
		setBarColor(res: string) {
		if (res) {
		  wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: res
		  })
		}
		},
		success(res: any){
		if (res.data == 'success') {
		  console.log('success');
		}
		},
		fail(res: any){
		if (res.data == 'initError') {
		  console.log(res.message);
		}
		},
		leave(res: any){
		if (res) {
		  console.log(res);
		}
		}
	})
})
</script>
