import { createStore } from 'vuex'
import storage from '@/utils/storage'

const store = createStore({
  state: {
    isShowToast: false,
    remark: [],
    shareLink: '',
    verificationKey: '',
    distributionId: '',
    hasLogin: storage.getHasLogin(),
    userInfo: storage.getUserInfo(),
    uuid: storage.getUuid(),
    token: ''
  },
  mutations: {
    login(state, userInfo) {
      state.userInfo = userInfo || {}
      state.userName =
        userInfo.Name || userInfo.Nickname || userInfo.Username || '匿名用户'
      state.hasLogin = true
    },
    logout(state) {
      state.userName = ''
      state.hasLogin = false
    },
    setRemark(state, remark) {
      state.remark = remark
    }
  },
  actions: {}
})

export default store
