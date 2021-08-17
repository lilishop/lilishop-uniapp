import Vue from "vue";
import App from "./App";
import * as filters from "./utils/filters.js"; // global filter
import uView from "uview-ui";
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

// 引入Vuex
Vue.prototype.$store = store;
Vue.use(uView);
Vue.config.productionTip = false;
// 主题色
Vue.prototype.$mainColor = "#ff3c2a";
// 高亮主题色
Vue.prototype.$lightColor = "#ff6b35";


App.mpType = "app";

const app = new Vue({
  ...App,
});
app.$mount();
