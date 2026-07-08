<template>
	<default-page v-if="type" :type="type" title="您的设备已断网" :isBtn="false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import defaultPage from '@/components/default-page/default-page.vue'

const type = ref<string>()

onLoad(() => {
	type.value = 'msg'
})
</script>

<style>

</style>
