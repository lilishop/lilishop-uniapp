<template></template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getAddressCode } from '@/api/address'
import config from '@/config/config'

const emit = defineEmits<{
	callback: [payload: Record<string, any>]
	close: []
}>()

onMounted(() => {
	init()
})

function initMap() {
	uni.chooseLocation({
		success(res) {
			posToCity(res.latitude, res.longitude).then((val) => {
				getAddressCode(
					val.regeocode.addressComponent.citycode,
					val.regeocode.addressComponent.township,
				).then((code) => {
					emit('callback', { ...val, ...res, ...code })
					emit('close')
				})
			})
		},
		fail(e) {
			console.log(e)
			emit('close')
		},
	})
}

function init() {
	// #ifdef MP-WEIXIN
	wechatMap()
	// #endif
	// #ifndef MP-WEIXIN
	initMap()
	// #endif
}

function wechatMap() {
	uni.authorize({
		scope: 'scope.userLocation',
		success() {
			initMap()
		},
		fail() {
			uni.showModal({
				content: '检测到您没打开获取地址功能权限，是否去设置打开？',
				confirmText: '确认',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.openSetting({
							success: () => {
								initMap()
							},
						})
					} else {
						emit('close')
					}
				},
			})
		},
	})
}

function posToCity(latitude: number, longitude: number) {
	return new Promise<any>((resolve, reject) => {
		uni.request({
			url: 'https://restapi.amap.com/v3/geocode/regeo',
			method: 'GET',
			data: {
				key: config.aMapKey,
				location: `${longitude},${latitude}`,
			},
			success: ({ data }: any) => {
				const { status, info } = data
				if (status === '1') {
					resolve(data)
				} else {
					reject(info)
				}
			},
			fail: (err) => {
				reject(err)
			},
		})
	})
}
</script>

<style lang="scss" scoped>
</style>
