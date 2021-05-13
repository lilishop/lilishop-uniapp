<template>
	<default-page v-if="type" :type="type" title="您的设备已断网" :isBtn="false" />
</template>

<script>
	import defaultPage from '@/components/default-page/default-page.vue';
	export default {
		components: {
			defaultPage
		},
		data() {
			return {
				type: undefined
			}
		},
		onLoad(options) {
			let pages = getCurrentPages();
			if (pages.length) {
				let route = pages[0].route;
			}
			this.type = options.type;
		}
	}
</script>

<style>

</style>
