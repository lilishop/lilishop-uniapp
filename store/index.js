import { createStore } from 'vuex'
import storage from '@/utils/storage'
import config from '@/config/config'
import { DEFAULT_THEME, loadCachedTheme } from '@/utils/theme'

const cachedTheme = loadCachedTheme()

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
    token: '',
    theme: cachedTheme || { ...DEFAULT_THEME },
  },
  getters: {
    mainColor: (state) => state.theme.mainColor,
    lightColor: (state) => state.theme.lightColor,
    aiderLightColor: (state) => state.theme.aiderLightColor,
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
    },
    SET_THEME(state, theme) {
      state.theme = {
        mainColor: theme.mainColor || DEFAULT_THEME.mainColor,
        lightColor: theme.lightColor || DEFAULT_THEME.lightColor,
        aiderLightColor: theme.aiderLightColor || DEFAULT_THEME.aiderLightColor,
      }
    },
  },
  actions: {}
})

export default store
