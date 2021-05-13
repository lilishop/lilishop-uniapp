import Vue from "vue";
import App from "./App";
import * as filters from "./utils/filters.js"; // global filter
import uView from "uview-ui";
import empty from "./components/empty";
import store from "./store";

// #ifdef H5
// 在h5页面手动挂载 h5唤醒app插件
import airBtn from "@/components/m-airbtn/index.vue";
let btn = Vue.component("airBtn", airBtn); //全局注册
document.body.appendChild(new btn().$mount().$el);
// #endif

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

const msg = (title, duration = 1500, mask = false, icon = "none") => {
  //统一提示方便全局修改
  if (Boolean(title) === false) {
    return;
  }
  uni.showToast({
    title,
    duration,
    mask,
    icon,
  });
};
// 引入vuex
Vue.prototype.$store = store;
// 全局引入空组件
Vue.component("empty", empty);
Vue.use(uView);
Vue.config.productionTip = false;
// 主题色
Vue.prototype.$mainColor = "#ff3c2a";
// 高亮主题色
Vue.prototype.$lightColor = "#ff6b35";
// 可直接 this.$api调用
Vue.prototype.$api = { msg };

App.mpType = "app";

const app = new Vue({
  ...App,
});
app.$mount();
