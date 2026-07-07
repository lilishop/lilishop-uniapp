# Vue 3 语法改造计划

> 本文档用于按文件夹逐步改造业务代码。框架层（Vue 3 运行时、uView Plus、Vuex 4）已就绪，目标是让各模块语法与 Vue 3 完全兼容，并可选升级为 Composition API。

## 改造目标

| 层级 | 说明 | 是否必须 |
| --- | --- | --- |
| L1 兼容性修复 | 模板语法、uView Plus 组件、生命周期等 Vue 3 不兼容写法 | 必须 |
| L2 代码现代化 | Options API → `<script setup>` + composables | 可选，新改模块优先 |

**原则**：先保证 L1 全项目通过，再按文件夹做 L2。不必一次性改完 170+ 页面。

---

## 全局前置（第 0 步，一次性）

### 0.1 跑自动化脚本

```bash
npm install
npm run migrate:vue3
node scripts/migrate-uview-components.js
node scripts/migrate-navbar-props.js
node scripts/migrate-filters-usage.js
```

脚本覆盖范围：

- 模板过滤器 `{{ x \| unitPrice }}` → `{{ unitPrice(x) }}`
- `v-model` → `v-model:show`（popup 类组件）
- `slot="xxx"` → `#xxx`
- `this.$set` / `this.$delete` 替换
- uView 组件别名（`u-cell-item` → `u-cell` 等）

### 0.2 全局残留扫描

每完成一个文件夹，在**该文件夹**内执行：

```bash
# 模板过滤器
rg "\|\s*(unitPrice|unixToDate|beautifyTime|goodsFormatPrice)" pages/xxx --glob "*.vue"

# Vue 2 生命周期
rg "beforeDestroy|destroyed" pages/xxx --glob "*.vue"

# 旧 uView 组件
rg "u-cell-item|u-verification-code|u-alert-tips|<u-loading[^-]" pages/xxx --glob "*.vue"

# .sync 修饰符
rg "\.sync" pages/xxx --glob "*.vue"

# u-parse 旧属性
rg ":html=|show-with-animation|use-cache" pages/xxx --glob "*.vue"
```

### 0.3 单文件改造 SOP

每个 `.vue` 文件按以下顺序处理：

1. **模板**
   - 过滤器改为函数调用
   - uView Plus 组件 props 对照 [VUE3_MIGRATION.md](./VUE3_MIGRATION.md)
   - 插槽：`slot="right"` → `#right`
   - `.sync` → `v-model:xxx`

2. **Script（L1 最小改动）**
   - `beforeDestroy` → `beforeUnmount`
   - `destroyed` → `unmounted`
   - 删除 `filters: { }` 块（改用全局 mixin methods 或本地 methods）
   - `this.$set(obj, key, val)` → `obj[key] = val`

3. **Script（L2 可选升级）**
   - `<script>` → `<script setup lang="ts">`
   - `data()` → `ref()` / `reactive()`
   - `computed` → `computed()`
   - `methods` → 普通函数
   - 生命周期：`onLoad` / `onShow` 从 `@dcloudio/uni-app` 引入
   - 复杂逻辑抽到同目录 `composables/useXxx.ts`

4. **验证**
   - H5 打开对应页面
   - 微信开发者工具编译通过
   - 核心交互点手动点一遍

### 0.4 进度标记

本文档各文件夹表格中状态列取值：

- `[ ]` 未开始
- `[~]` 进行中
- `[x]` L1 完成（兼容）
- `[★]` L2 完成（Composition API）

---

## 批次总览

| 批次 | 文件夹 | 文件数 | 优先级 | 依赖 |
| --- | --- | --- | --- | --- |
| 0 | 全局基础设施 | — | P0 | — |
| 1 | `components/` | 22 | P0 | 被全项目引用 |
| 2 | `pages/tabbar/` | 34 | P0 | 首页 / 购物车 / 分类 / 我的 |
| 3 | `pages/product/` | 20 | P0 | 商品详情链路 |
| 4 | `pages/cart/` | 8 | P0 | 下单前 |
| 5 | `pages/order/` | 19 | P0 | 交易后 |
| 6 | `pages/passport/` | 10 | P1 | 登录注册 |
| 7 | `pages/mine/` | 41 | P1 | 个人中心分包 |
| 8 | `pages/promotion/` | 10 | P1 | 营销活动 |
| 9 | 零散页面 | 3 | P2 | 导航 / 空态 / 旧直播 |
| 10 | `App.vue` + `store/` | 2 | P0 | 应用入口 |

**建议顺序**：0 → 1 → 2 → 3 → 4 → 5 → 10（穿插）→ 6 → 7 → 8 → 9

---

## 批次 0：全局基础设施

> 框架层已基本完成，本批次以核对为主。

| 文件 | 状态 | 备注 |
| --- | --- | --- |
| `main.js` | [x] | `createSSRApp`、filter mixin、uView Plus |
| `manifest.json` | [x] | `"vueVersion": "3"` |
| `store/index.js` | [ ] | Vuex 4，可补充 `useStore()` 导出供 L2 使用 |
| `utils/filters.js` | [x] | 已改为普通函数 |
| `utils/mpShare.js` | [x] | 小程序分享 mixin |
| `utils/uploadHelper.js` | [x] | u-upload `@afterRead` 配套 |

### 批次 0 测试

- [ ] `npm install` 无报错
- [ ] H5 启动无白屏
- [ ] 小程序编译通过

---

## 批次 1：`components/`（22 文件）

> 公共组件，改完收益最大。优先改被高频引用的组件。

### 1.1 商品与交易

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `m-goods-list/list.vue` | [ ] | 价格过滤器 |
| `m-goods-list/base-list.vue` | [ ] | |
| `m-goods-list/common.vue` | [ ] | |
| `m-goods-list/promotion.vue` | [ ] | |
| `m-goods-recommend/index.vue` | [ ] | |
| `m-buy/goods.vue` | [ ] | popup、规格选择 |
| `m-take-down-sale-goods/index.vue` | [ ] | |

### 1.2 交互与工具

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `verification/verification.vue` | [ ] | `this.$store` |
| `verify-code/verify-code.vue` | [ ] | `u-code` |
| `popups/popups.vue` | [ ] | `v-model:show` |
| `uni-number-box.vue` | [ ] | |
| `uni-load-more/uni-load-more.vue` | [ ] | |
| `uniMap.vue` | [ ] | 地图 API |
| `m-city/m-city.vue` | [ ] | 城市选择 |

### 1.3 分享与展示

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `m-share/index.vue` | [ ] | 分享逻辑 |
| `m-placard/index.vue` | [ ] | 海报 |
| `m-canvas/index.vue` | [ ] | 画布 |
| `m-search-revision/m-search-revision.vue` | [ ] | |
| `m-airbtn/index.vue` | [ ] | H5 唤起 App |
| `default-page/default-page.vue` | [ ] | 空态页 |
| `u-time-line/u-time-line.vue` | [ ] | 自定义 easycom |
| `u-time-line/u-time-line-item.vue` | [ ] | |

### 批次 1 测试

- [ ] 首页商品列表渲染正常
- [ ] 商品详情加购弹窗正常
- [ ] 验证码 / 滑块验证正常

---

## 批次 2：`pages/tabbar/`（34 文件）

> 主包 Tab 页，用户入口，优先保证 L1。

### 2.1 首页核心（4 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `home/index.vue` | [ ] | 装修数据加载 |
| `home/views.vue` | [ ] | 模块渲染 |
| `home/title.vue` | [ ] | 消息 |
| `home/web-view.vue` | [ ] | 内嵌 H5 |

### 2.2 首页装修模板（23 文件）

路径：`pages/tabbar/home/template/`

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `tpl_banner.vue` | [ ] | 轮播 |
| `tpl_goods.vue` | [ ] | `beforeDestroy` 残留 |
| `tpl_menu.vue` | [ ] | 宫格 |
| `tpl_search.vue` | [ ] | 搜索框 |
| `tpl_notice.vue` | [ ] | 公告 |
| `tpl_title.vue` | [ ] | 标题 |
| `tpl_spike.vue` | [ ] | 秒杀 |
| `tpl_group.vue` | [ ] | 拼团 |
| `tpl_join_group.vue` | [ ] | 参团 |
| `tpl_integral.vue` | [ ] | 积分 |
| `tpl_hot_zone.vue` | [ ] | 热区 |
| `tpl_text_picture.vue` | [ ] | 图文 |
| `tpl_promotions_detail.vue` | [ ] | 促销详情 |
| `fetch_coupon.vue` | [ ] | 领券 |
| `tpl_flex_one.vue` | [ ] | 布局 |
| `tpl_flex_two.vue` | [ ] | |
| `tpl_flex_three.vue` | [ ] | |
| `tpl_flex_four.vue` | [ ] | |
| `tpl_flex_five.vue` | [ ] | |
| `tpl_top_one_bottom_two.vue` | [ ] | |
| `tpl_top_two_bottom_one.vue` | [ ] | |
| `tpl_left_one_right_two.vue` | [ ] | |
| `tpl_left_two_right_one.vue` | [ ] | |

> 模板文件结构相似，建议抽一个 `template` 公共 composable 后再批量 L2。

### 2.3 其他 Tab（7 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `cart/cartList.vue` | [ ] | `this.$store`、SwipeAction |
| `category/category.vue` | [ ] | 分类树 |
| `user/my.vue` | [ ] | 个人中心入口 |
| `user/similarGoods.vue` | [ ] | 相似商品 |
| `user/utils/tool.vue` | [ ] | 工具函数组件 |
| `screen/fullScreen.vue` | [ ] | 全屏广告 |
| `special/special.vue` | [ ] | 专题页 |

### 批次 2 测试

- [ ] 首页各装修模块加载
- [ ] 下拉刷新
- [ ] 购物车加减 / 删除
- [ ] 分类切换
- [ ] 我的页面登录态展示

---

## 批次 3：`pages/product/`（20 文件）

> 商品详情是核心转化页，建议 `goods.vue` 优先 L2。

### 3.1 商品主流程（7 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `goods.vue` | [ ] | 主页面，`this.$store`，子组件多 |
| `askList.vue` | [ ] | 问答 |
| `comment.vue` | [ ] | 评价 |
| `shopList.vue` | [ ] | 店铺列表 |
| `shopPage.vue` | [ ] | 店铺首页 |
| `shopPageGoods.vue` | [ ] | 店铺商品 |
| `licencePhoto.vue` | [ ] | 证照 |
| `customerservice/index.vue` | [ ] | 客服 |

### 3.2 商品详情子组件（12 文件）

路径：`pages/product/product/`

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `goods/-goods-swiper.vue` | [ ] | 轮播 |
| `goods/-goods-intro.vue` | [ ] | **u-parse `:html`** |
| `goods/-goods-desc.vue` | [ ] | 详情 |
| `goods/-goods-recommend.vue` | [ ] | 推荐 |
| `evaluation/-evaluation.vue` | [ ] | 评价列表 |
| `shop/-shop.vue` | [ ] | 店铺信息 |
| `popup/address.vue` | [ ] | 地址弹窗 |
| `promotion/-promotion.vue` | [ ] | 促销 |
| `promotion/-promotion-coupon.vue` | [ ] | 优惠券 |
| `promotion/-promotion-details.vue` | [ ] | 促销详情 |
| `promotion/-promotion-assemble-list.vue` | [ ] | 拼团列表 |
| `promotion/-promotion-assemble-promotions.vue` | [ ] | 拼团促销 |

### 批次 3 测试

- [ ] 商品详情完整加载（图 / 价 / 规格 / 促销）
- [ ] 加购 / 立即购买
- [ ] 富文本详情渲染（u-parse）
- [ ] 店铺跳转

---

## 批次 4：`pages/cart/`（8 文件）

### 4.1 优惠券（4 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `coupon/index.vue` | [ ] | `this.$store` |
| `coupon/myCoupon.vue` | [ ] | |
| `coupon/couponCenter.vue` | [ ] | |
| `coupon/couponDetail.vue` | [ ] | |

### 4.2 支付（4 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `payment/payOrder.vue` | [ ] | 支付核心，`this.$store` |
| `payment/success.vue` | [ ] | 支付成功 |
| `payment/shareOrderGoods.vue` | [ ] | 分享订单 |
| `payment/error.vue` | [ ] | 支付失败 |

### 批次 4 测试

- [ ] 选券 / 用券
- [ ] H5 微信支付
- [ ] 小程序支付
- [ ] 支付成功 / 失败页

---

## 批次 5：`pages/order/`（19 文件）

### 5.1 订单主流程（4 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `fillorder.vue` | [ ] | 填单，`this.$store` |
| `myOrder.vue` | [ ] | 订单列表 |
| `orderDetail.vue` | [ ] | 订单详情 |
| `deliverDetail.vue` | [ ] | 物流 |

### 5.2 售后（7 文件）

路径：`pages/order/afterSales/`

| 文件 | 状态 |
| --- | --- |
| `afterSales.vue` | [ ] |
| `afterSalesSelect.vue` | [ ] |
| `applyDetail.vue` | [ ] |
| `applyProgress.vue` | [ ] |
| `applySuccess.vue` | [ ] |
| `afterSalesDetail.vue` | [ ] |
| `afterSalesDetailExpress.vue` | [ ] |

### 5.3 评价（3 文件）

| 文件 | 状态 |
| --- | --- |
| `evaluate/myEvaluate.vue` | [ ] |
| `evaluate/releaseEvaluate.vue` | [ ] |
| `evaluate/evaluateDetail.vue` | [ ] |

### 5.4 投诉与发票（5 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `complain/complain.vue` | [ ] | |
| `complain/complainList.vue` | [ ] | |
| `complain/complainInfo.vue` | [ ] | |
| `invoice/setInvoice.vue` | [ ] | **`.sync` 多处** |
| `invoice/invoiceDetail.vue` | [ ] | |

### 批次 5 测试

- [ ] 提交订单 → 支付 → 订单列表
- [ ] 申请售后全流程
- [ ] 评价发布
- [ ] 发票填写

---

## 批次 6：`pages/passport/`（10 文件）

### 6.1 登录（5 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `login.vue` | [ ] | `this.$store`、核心入口 |
| `wechatH5Login.vue` | [ ] | H5 公众号授权 |
| `wechatMPLogin.vue` | [ ] | 小程序登录 |
| `scannerCodeLoginConfirm.vue` | [ ] | 扫码登录 |
| `article.vue` | [ ] | **u-parse `:html`** |

### 6.2 商家入驻（5 文件）

路径：`pages/passport/entry/seller/`

| 文件 | 状态 |
| --- | --- |
| `index.vue` | [ ] |
| `control.vue` | [ ] |
| `step1.vue` | [ ] |
| `step2.vue` | [ ] |
| `step3.vue` | [ ] |

### 批次 6 测试

- [ ] H5 账号密码登录
- [ ] 微信小程序授权登录
- [ ] 登录态写入 Vuex / storage

---

## 批次 7：`pages/mine/`（41 文件）

> 最大分包，按子文件夹拆分推进。

### 7.1 根目录（4 文件）

| 文件 | 状态 |
| --- | --- |
| `signIn.vue` | [ ] |
| `myTracks.vue` | [ ] |
| `myCollect.vue` | [ ] |
| `point/myPoint.vue` | [ ] |

### 7.2 地址（4 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `address/address.vue` | [ ] | `this.$store` |
| `address/add.vue` | [ ] | |
| `address/addressManage.vue` | [ ] | |
| `address/storeAddress.vue` | [ ] | |

### 7.3 预存款（6 文件）

| 文件 | 状态 |
| --- | --- |
| `deposit/index.vue` | [ ] |
| `deposit/info.vue` | [ ] |
| `deposit/recharge.vue` | [ ] |
| `deposit/withdrawal.vue` | [ ] |
| `deposit/withdrawApply.vue` | [ ] |
| `deposit/operation.vue` | [ ] |

### 7.4 分销（7 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `distribution/home.vue` | [ ] | `this.$store` |
| `distribution/list.vue` | [ ] | |
| `distribution/join.vue` | [ ] | |
| `distribution/auth.vue` | [ ] | |
| `distribution/achievement.vue` | [ ] | |
| `distribution/history.vue` | [ ] | |
| `distribution/withdrawal.vue` | [ ] | |

### 7.5 消息（6 文件）

| 文件 | 状态 |
| --- | --- |
| `msgTips/main.vue` | [ ] |
| `msgTips/sysMsg/index.vue` | [ ] |
| `msgTips/packageMsg/index.vue` | [ ] |
| `msgTips/packageMsg/logisticsDetail.vue` | [ ] |
| `msgTips/serviceMsg/index.vue` | [ ] |
| `im/index.vue` | [ ] |
| `im/list.vue` | [ ] |

### 7.6 设置（12 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `set/setUp.vue` | [ ] | |
| `set/personMsg.vue` | [ ] | **`.sync`** |
| `set/feedBack.vue` | [ ] | u-upload |
| `set/editionIntro.vue` | [ ] | |
| `set/versionFunctionList.vue` | [ ] | |
| `help/tips.vue` | [ ] | **u-parse `:html`** |
| `set/securityCenter/securityCenter.vue` | [ ] | |
| `set/securityCenter/bindMobile.vue` | [ ] | |
| `set/securityCenter/editPassword.vue` | [ ] | |
| `set/securityCenter/editLoginPassword.vue` | [ ] | |
| `set/securityCenter/faceLogin.vue` | [ ] | |
| `set/securityCenter/fingerLogin.vue` | [ ] | |
| `set/securityCenter/updatePwdTab.vue` | [ ] | |

### 批次 7 测试

- [ ] 地址增删改
- [ ] 收藏 / 足迹
- [ ] 分销中心
- [ ] 修改密码 / 绑定手机

---

## 批次 8：`pages/promotion/`（10 文件）

### 8.1 直播（1 文件 + utils）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `live/room.vue` | [ ] | 1300+ 行，**`.sync` 10 处**，建议 L2 拆 composables |
| `live/utils/liveChat.js` | [ ] | IM 聊天服务 |
| `live/utils/liveMqtt.js` | [ ] | MQTT |
| `live/utils/liveRecommend.js` | [ ] | 推荐商品 |
| `live/utils/liveSetting.js` | [ ] | 直播配置 |
| `live/mqtt/mqtt.js` | [ ] | MQTT 客户端 |

> 旧路径 `pages/live/room.vue` 为冗余文件，改造完成后删除并核对 `pages.json` 路由。

### 8.2 营销活动（9 文件）

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `lives.vue` | [ ] | 直播列表 |
| `seckill.vue` | [ ] | 秒杀 |
| `joinGroup.vue` | [ ] | 拼团 |
| `bargain/list.vue` | [ ] | 砍价列表 |
| `bargain/detail.vue` | [ ] | **u-parse `:html`** |
| `bargain/log.vue` | [ ] | 砍价记录 |
| `point/pointList.vue` | [ ] | 积分商城 |
| `point/detail.vue` | [ ] | **u-parse `:html`** |
| `point/user.vue` | [ ] | 积分用户 |

### 批次 8 测试

- [ ] 进入直播间 / 拉流 / 聊天
- [ ] 秒杀 / 拼团 / 砍价页面
- [ ] 积分兑换

---

## 批次 9：零散页面（3 文件）

| 文件 | 状态 | 备注 |
| --- | --- | --- |
| `pages/navigation/search/searchPage.vue` | [ ] | 搜索页，`this.$store` |
| `pages/floor/empty.vue` | [ ] | 空楼层 |
| `pages/live/room.vue` | [ ] | **待删除**，与 `promotion/live` 重复 |

---

## 批次 10：应用入口

| 文件 | 状态 | 关注点 |
| --- | --- | --- |
| `App.vue` | [ ] | `mapMutations`、`this.$store`、onLaunch |
| `store/index.js` | [ ] | 可添加 `useStore()` 导出 |

### App.vue L2 参考写法

```ts
// store/index.js 补充
import { useStore as useVuexStore } from 'vuex'
export function useStore() {
  return useVuexStore()
}
```

---

## 已知高风险文件清单

以下文件含已知 Vue 2 残留，改造时优先处理：

| 文件 | 问题 |
| --- | --- |
| `pages/tabbar/home/template/tpl_goods.vue` | `beforeDestroy` |
| `pages/order/invoice/setInvoice.vue` | `.sync` × 7 |
| `pages/promotion/live/room.vue` | `.sync` × 10，1300+ 行 |
| `pages/mine/set/personMsg.vue` | `.sync` |
| `pages/product/product/goods/-goods-intro.vue` | u-parse `:html` |
| `pages/mine/help/tips.vue` | u-parse `:html` |
| `pages/passport/article.vue` | u-parse `:html` |
| `pages/promotion/bargain/detail.vue` | u-parse `:html` |
| `pages/promotion/point/detail.vue` | u-parse `:html` |

---

## 含 `this.$store` 的文件（L2 时改为 `useStore()`）

共 39 处 / 37 个文件，集中在：

- `pages/cart/`（4 文件）
- `pages/order/`（10 文件）
- `pages/mine/`（12 文件）
- `pages/passport/login.vue`
- `pages/product/goods.vue`
- `pages/tabbar/cart/cartList.vue`
- `App.vue`
- `components/verification/verification.vue`

---

## 第三方模块（仅验证，不改源码）

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| Sansnn-uQRCode | `uni_modules/Sansnn-uQRCode/` | 声明支持 Vue 3 |
| okingtz-cropper | `uni_modules/okingtz-cropper/` | App 端实测头像裁剪 |
| u-draw-poster | `js_sdk/u-draw-poster/` | 海报生成 |

---

## 推荐里程碑

| 里程碑 | 完成标准 | 预计工作量 |
| --- | --- | --- |
| M1 可运行 | 批次 0–2 L1 完成，主 Tab 无报错 | 3–5 天 |
| M2 可交易 | 批次 3–5 L1 完成，下单支付通 | 3–5 天 |
| M3 全兼容 | 全部 L1 完成，三端回归通过 | 5–7 天 |
| M4 现代化 | 核心模块 L2（tabbar / product / live） | 按需持续 |

---

## 进度汇总

| 批次 | 文件夹 | 文件数 | L1 进度 | L2 进度 |
| --- | --- | --- | --- | --- |
| 0 | 全局基础设施 | — | 80% | — |
| 1 | `components/` | 22 | 0/22 | 0/22 |
| 2 | `pages/tabbar/` | 34 | 0/34 | 0/34 |
| 3 | `pages/product/` | 20 | 0/20 | 0/20 |
| 4 | `pages/cart/` | 8 | 0/8 | 0/8 |
| 5 | `pages/order/` | 19 | 0/19 | 0/19 |
| 6 | `pages/passport/` | 10 | 0/10 | 0/10 |
| 7 | `pages/mine/` | 41 | 0/41 | 0/41 |
| 8 | `pages/promotion/` | 10 | 0/10 | 0/10 |
| 9 | 零散页面 | 3 | 0/3 | 0/3 |
| 10 | 应用入口 | 2 | 0/2 | 0/2 |
| **合计** | | **169** | **0/169** | **0/169** |

---

## 相关文档

- [VUE3_MIGRATION.md](./VUE3_MIGRATION.md) — 框架升级说明与回归清单
- [uView Plus 文档](https://uview-plus.jiangruyi.com/) — 组件 API 对照
