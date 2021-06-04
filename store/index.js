import Vue from "vue";
import Vuex from "vuex";
import storage from "@/utils/storage";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    verificationKey: "", //获取key表示验证通过
    /**
     * 是否需要强制登录
     */
    forcedLogin: false,

    distributionId:"", //分销员Id 如果当前账户从未登录过时记录
    hasLogin: storage.getHasLogin(),
    userInfo: storage.getUserInfo(),
    uuid: storage.getUuid(),
    token: "",
    getHeadInfo: "",
    getWeixinHeightInfo: "",
  },
  mutations: {
    /**
     * 获取头部高度 异步使用
     * 文档链接在 https://uniapp.dcloud.io/api/system/info?id=getsysteminfosync
     * */
    GET_HEAD_HEIGHT(state) {
      return new Promise((resolve, reject) => {
        state.getHeadInfo = uni.getSystemInfoSync();
        resolve();
      });
    },
    /**
     * 获取微信小胶囊高度 */
    MP_WEIXIN_HEIGHT(state) {
      // width	number	宽度，单位：px
      // height	number	高度，单位：px
      // top	number	上边界坐标，单位：px
      // right	number	右边界坐标，单位：px
      // bottom	number	下边界坐标，单位：px
      // left	number	左边界坐标，单位：px

      state.getWeixinHeightInfo = uni.getMenuButtonBoundingClientRect();
    },
    // 前台存储登录状态
    SET_HAS_LOGIN(state, val) {
      state.hasLogin = val;
    },
    // 登录信息
    SET_USER_INFO(state, val) {
      state.userInfo = val;
    },

    login(state, userInfo) {
      state.userInfo = userInfo || {};
      state.userName =
        userInfo.Name || userInfo.Nickname || userInfo.Username || "匿名用户";
      state.hasLogin = true;
    },
    logout(state) {
      state.userName = "";
      state.hasLogin = false;
    },
  },
  actions: {},
});

export default store;
