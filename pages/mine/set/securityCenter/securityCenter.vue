<template>
  <view class="securityCenter">
    <u-cell-group>
      <u-cell title="修改密码" @click="navigateTo('/pages/mine/set/securityCenter/updatePwdTab')"></u-cell>
      <u-cell title="注销账户" @click="confirmAccountDeletion"></u-cell>
    </u-cell-group>
  </view>
</template>

<script setup lang="ts">
function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function confirmAccountDeletion() {
  uni.showModal({
    title: '警告',
    content: '您确定要注销当前账号吗？',
    confirmText: '确定注销',
    confirmColor: '#FF0000',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '谨慎操作',
          content: '再次向您确认，您确定要注销当前账号吗？',
          confirmText: '坚持注销',
          confirmColor: '#FF0000',
          cancelText: '取消',
          success: (confirmRes) => {
            if (confirmRes.confirm) {
              uni.showToast({
                title: '您的注销申请已经提交，待管理员审核后。会自动注销当前账号',
                duration: 10000,
              })
            }
          },
        })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.securityCenter {
  .u-cell {
    line-height: normal;
  }
}
</style>
