<template>
</template>

<script>
	export default {
		methods: {
			// 高亮显示搜索内容	
			lightSearchStr(keyword, str) {
				if (!keyword) {
					return str
				} else {
					let unicodes = '';
					for (let i of Array.from(keyword)) {
						unicodes += this.unicode(i) + "|"
					}
					const rule = '(' + unicodes + ')'
					const reg = new RegExp(rule, 'gi');
					return str ? str.replace(reg, matchValue =>
						`<span style="color:${this.lightColor}">${matchValue}</span>`
					) : ''
				}
			},
			//  转换为unicode
			unicode(str) {
				var value = '';
				for (var i = 0; i < str.length; i++) {
					value += '\\u' + this.left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
				}
				return value;
			},
			left_zero_4(str) {
				if (str != null && str != '' && str != 'undefined') {
					if (str.length == 2) {
						return '00' + str;
					}
				}
				return str;
			},


			// 格式化金钱  1999 --> [1999,00]
			formatPrice(val) {
				if (typeof val == "undefined") {
					return val;
				}
				
				return Number(val).toFixed(2).split(".");
			},

			// 数据去重一下 只显示一次 减免 劵 什么的
			getPromotion(item) {
				if (item.promotionMap) {
					let array = [];
					Object.keys(item.promotionMap).forEach((child) => {
						if (!array.includes(child.split("-")[0])) {
							array.push(child.split("-")[0]);
						}
					});
					return array;
				}
			},
			// 跳转到商品详情
			navigateToDetailPage(item) {
				uni.navigateTo({
					url: `/pages/product/goods?id=${item.content.id}&goodsId=${item.content.goodsId}`,
				});
			},
			// 跳转地址
			navigateToStoreDetailPage(item) {
				uni.navigateTo({
					url: `/pages/product/shopPage?id=${item.content.storeId}`,
				});
			},
		},
	}
</script>

<style lang='scss' scoped>
	
</style>
