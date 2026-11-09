<template>
  <view class="merchant-login-page">
    <!-- 顶部状态栏沉浸背景 -->
    <view class="header-bg">
      <view class="brand-box">
        <view class="badge-icon">
          <u-icon name="bag" size="32" color="#ffffff"></u-icon>
        </view>
        <text class="brand-title">商家管理工作台</text>
        <text class="brand-desc">随时随地 · 快捷扫码核销与订单管理</text>
      </view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 模式切换 Tab -->
      <view class="tab-header">
        <view
          class="tab-item"
          :class="{ active: loginType === 'account' }"
          @click="switchTab('account')"
        >
          <text>账号密码登录</text>
          <view class="active-indicator" v-if="loginType === 'account'"></view>
        </view>
        <view
          class="tab-item"
          :class="{ active: loginType === 'sms' }"
          @click="switchTab('sms')"
        >
          <text>短信验证码登录</text>
          <view class="active-indicator" v-if="loginType === 'sms'"></view>
        </view>
      </view>

      <!-- 账号密码表单 -->
      <view class="form-container" v-if="loginType === 'account'">
        <view class="input-item">
          <u-input
            v-model="accountForm.username"
            placeholder="请输入商家账号/手机号"
            border="surround"
            prefixIcon="account"
            :prefixIconStyle="{ color: '#8c8c8c', fontSize: '36rpx', marginRight: '16rpx' }"
            :customStyle="customInputStyle"
            clearable
          />
        </view>

        <view class="input-item">
          <u-input
            v-model="accountForm.password"
            placeholder="请输入登录密码"
            type="password"
            border="surround"
            prefixIcon="lock"
            :prefixIconStyle="{ color: '#8c8c8c', fontSize: '36rpx', marginRight: '16rpx' }"
            :customStyle="customInputStyle"
            clearable
          />
        </view>
      </view>

      <!-- 短信验证码表单 -->
      <view class="form-container" v-else>
        <view class="input-item">
          <u-input
            v-model="smsForm.mobile"
            placeholder="请输入店主手机号"
            type="number"
            maxlength="11"
            border="surround"
            prefixIcon="phone"
            :prefixIconStyle="{ color: '#8c8c8c', fontSize: '36rpx', marginRight: '16rpx' }"
            :customStyle="customInputStyle"
            clearable
          />
        </view>

        <view class="input-item">
          <u-input
            v-model="smsForm.code"
            placeholder="请输入 6 位短信验证码"
            type="number"
            maxlength="6"
            border="surround"
            prefixIcon="email"
            :prefixIconStyle="{ color: '#8c8c8c', fontSize: '36rpx', marginRight: '16rpx' }"
            :customStyle="customInputStyle"
            clearable
          >
            <template #suffix>
              <view
                class="send-btn"
                :class="{ disabled: smsCount > 0 || !smsForm.mobile }"
                @click="handleSendSms"
              >
                <text>{{ smsCount > 0 ? `${smsCount}s后重试` : '获取验证码' }}</text>
              </view>
            </template>
          </u-input>
        </view>
      </view>

      <!-- 登录提交按钮 -->
      <view class="action-btn" :class="{ loading: submitting }" @click="handleLogin">
        <text class="btn-text">{{ submitting ? '正在登录...' : '立即进入工作台' }}</text>
      </view>

      <view class="notice-tip">
        <u-icon name="info-circle" size="14" color="#8c8c8c"></u-icon>
        <text class="notice-text">仅限已入驻商城的店主/店员账号登录</text>
      </view>
    </view>



    <!-- 安全滑块拼图验证码弹窗 -->
    <myVerification
      v-if="codeFlag"
      ref="verificationRef"
      apiType="store"
      business="LOGIN"
      @send="handleVerificationSuccess"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import storage from '@/utils/storage.js'
import { md5 } from '@/utils/md5.js'
import myVerification from '@/components/verification/verification.vue'
import {
  userLogin,
  smsLogin,
  sendStoreSms,
  getStoreSettings,
  getStoreUserInfo,
  getStoreDetail,
} from '../../api/passport.js'

const loginType = ref<'account' | 'sms'>('account')
const submitting = ref(false)
const smsCount = ref(0)
let timer: any = null

// 滑块验证码相关控制
const codeFlag = ref(false)
const verificationRef = ref<any>(null)
const verifyAction = ref<'login' | 'sms'>('login')

const customInputStyle = {
  backgroundColor: '#f9fafb',
  borderRadius: '16rpx',
  height: '84rpx',
  paddingLeft: '16rpx',
  fontSize: '28rpx',
}

const accountForm = reactive({
  username: '',
  password: '',
})

const smsForm = reactive({
  mobile: '',
  code: '',
})

onLoad(() => {
  // 如果已存在商家 token，直接进入工作台
  if (storage.getStoreAccessToken()) {
    uni.redirectTo({
      url: '/pages-sub/merchant/pages/index/index',
    })
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

function switchTab(type: 'account' | 'sms') {
  loginType.value = type
}

// 弹出滑块拼图验证码
function openVerification(action: 'login' | 'sms') {
  verifyAction.value = action
  codeFlag.value = true
  nextTick(() => {
    verificationRef.value?.show()
    verificationRef.value?.getCode()
  })
}

// 点击获取短信验证码
const handleSendSms = () => {
  if (smsCount.value > 0) return
  if (!/^1[3-9]\d{9}$/.test(smsForm.mobile)) {
    uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
    return
  }

  // 发送短信验证码前先通过滑块拼图验证
  openVerification('sms')
}

// 点击“立即进入工作台”按钮
const handleLogin = () => {
  if (submitting.value) return

  if (loginType.value === 'account') {
    if (!accountForm.username.trim()) {
      uni.showToast({ title: '请输入商家账号', icon: 'none' })
      return
    }
    if (!accountForm.password) {
      uni.showToast({ title: '请输入登录密码', icon: 'none' })
      return
    }

    // 账号密码登录：必须先通过安全滑块拼图验证
    openVerification('login')
  } else {
    // 短信验证码登录
    if (!/^1[3-9]\d{9}$/.test(smsForm.mobile)) {
      uni.showToast({ title: '请输入有效的手机号', icon: 'none' })
      return
    }
    if (!smsForm.code.trim()) {
      uni.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    // 短信验证码登录直接提交
    doSmsLogin()
  }
}

// 滑块验证码成功回调
const handleVerificationSuccess = () => {
  if (verifyAction.value === 'login') {
    doAccountLogin()
  } else if (verifyAction.value === 'sms') {
    doSendSms()
  }
}

// 执行账号密码登录（密码需先做 MD5 摘要以匹配后端 BCrypt(md5(明文)) 校验口径）
const doAccountLogin = async () => {
  submitting.value = true
  uni.showLoading({ title: '正在登录...' })

  try {
    const res: any = await userLogin({
      username: accountForm.username.trim(),
      password: md5(accountForm.password),
    })

    uni.hideLoading()
    submitting.value = false

    if (res?.data && res.data.success && res.data.result) {
      codeFlag.value = false
      const { accessToken, refreshToken } = res.data.result
      storage.setStoreAccessToken(accessToken)
      if (refreshToken) {
        storage.setStoreRefreshToken(refreshToken)
      }

      // 获取店铺与店员信息
      try {
        const [settingsRes, userRes, storeRes] = (await Promise.all([
          getStoreSettings().catch(() => null),
          getStoreUserInfo().catch(() => null),
          getStoreDetail().catch(() => null),
        ])) || []

        const storeInfo = {
          settings: settingsRes?.data?.result || {},
          user: userRes?.data?.result || {},
          store: storeRes?.data?.result || {},
        }
        storage.setStoreInfo(storeInfo)
      } catch (e) {
        console.warn('获取店铺额外信息失败', e)
      }

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages-sub/merchant/pages/index/index',
        })
      }, 500)
    } else {
      uni.showToast({
        title: res?.data?.message || '登录失败，请检查账号密码',
        icon: 'none',
      })
      verificationRef.value?.getCode()
    }
  } catch (err: any) {
    uni.hideLoading()
    submitting.value = false
    verificationRef.value?.getCode()
    uni.showToast({
      title: err?.data?.message || '网络连接异常或账号密码错误',
      icon: 'none',
    })
  }
}

// 执行发送短信验证码
const doSendSms = async () => {
  try {
    uni.showLoading({ title: '发送中...' })
    const res = await sendStoreSms(smsForm.mobile, 'LOGIN')
    uni.hideLoading()
    if (res?.data && res.data.success) {
      codeFlag.value = false
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      smsCount.value = 60
      timer = setInterval(() => {
        smsCount.value--
        if (smsCount.value <= 0) {
          clearInterval(timer)
          timer = null
        }
      }, 1000)
    } else {
      verificationRef.value?.getCode()
      uni.showToast({
        title: res?.data?.message || '发送失败，请稍后重试',
        icon: 'none',
      })
    }
  } catch (e: any) {
    uni.hideLoading()
    verificationRef.value?.getCode()
    uni.showToast({ title: e?.data?.message || '网络异常，发送失败', icon: 'none' })
  }
}

// 执行短信登录
const doSmsLogin = async () => {
  submitting.value = true
  uni.showLoading({ title: '正在登录...' })

  try {
    const res: any = await smsLogin({
      mobile: smsForm.mobile.trim(),
      code: smsForm.code.trim(),
    })

    uni.hideLoading()
    submitting.value = false

    if (res?.data && res.data.success && res.data.result) {
      const { accessToken, refreshToken } = res.data.result
      storage.setStoreAccessToken(accessToken)
      if (refreshToken) {
        storage.setStoreRefreshToken(refreshToken)
      }

      try {
        const [settingsRes, userRes, storeRes] = (await Promise.all([
          getStoreSettings().catch(() => null),
          getStoreUserInfo().catch(() => null),
          getStoreDetail().catch(() => null),
        ])) || []

        const storeInfo = {
          settings: settingsRes?.data?.result || {},
          user: userRes?.data?.result || {},
          store: storeRes?.data?.result || {},
        }
        storage.setStoreInfo(storeInfo)
      } catch (e) {
        console.warn('获取店铺额外信息失败', e)
      }

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages-sub/merchant/pages/index/index',
        })
      }, 500)
    } else {
      uni.showToast({
        title: res?.data?.message || '登录失败，请检查验证码',
        icon: 'none',
      })
    }
  } catch (err: any) {
    uni.hideLoading()
    submitting.value = false
    uni.showToast({ title: err?.data?.message || '网络连接异常', icon: 'none' })
  }
}


</script>

<style lang="scss" scoped>
.merchant-login-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.header-bg {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 100rpx 40rpx 140rpx 40rpx;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;

  .brand-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .badge-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 24rpx;
      background: rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24rpx;
    }

    .brand-title {
      font-size: 38rpx;
      font-weight: 700;
      letter-spacing: 2rpx;
      margin-bottom: 12rpx;
    }

    .brand-desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.login-card {
  margin: -80rpx 32rpx 40rpx 32rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.06);

  .tab-header {
    display: flex;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 36rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding-bottom: 24rpx;
      font-size: 30rpx;
      color: #8c8c8c;
      font-weight: 500;
      position: relative;

      &.active {
        color: #111827;
        font-weight: 700;
      }

      .active-indicator {
        position: absolute;
        bottom: -1rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 6rpx;
        background: #111827;
        border-radius: 3rpx;
      }
    }
  }

  .form-container {
    .input-item {
      margin-bottom: 28rpx;

      .send-btn {
        padding: 10rpx 20rpx;
        background: #111827;
        color: #ffffff;
        border-radius: 10rpx;
        font-size: 24rpx;
        white-space: nowrap;

        &.disabled {
          background: #d1d5db;
          color: #9ca3af;
        }
      }
    }
  }

  .action-btn {
    background: #111827;
    border-radius: 18rpx;
    height: 92rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 32rpx;
    box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.2);

    .btn-text {
      color: #ffffff;
      font-size: 32rpx;
      font-weight: 600;
    }

    &.loading {
      opacity: 0.7;
    }
  }

  .notice-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 28rpx;
    gap: 8rpx;

    .notice-text {
      font-size: 22rpx;
      color: #9ca3af;
    }
  }
}


</style>
