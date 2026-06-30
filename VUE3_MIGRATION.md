# Vue 3 升级说明

本项目已从 Vue 2 + uView 1.6 升级到 **Vue 3 + uView Plus**。

## 环境要求

- HBuilderX 3.8+
- Node.js 16+（用于安装 `uview-plus`、`vuex@4`、`sass`）

## 安装依赖

```bash
npm install
```

## 主要变更

| 项 | 变更 |
|---|---|
| `manifest.json` | 增加 `"vueVersion": "3"` |
| `main.js` | 使用 `createSSRApp` + `export function createApp()` |
| UI 库 | `uview-ui` → `uview-plus`（npm 依赖） |
| 状态管理 | Vuex 4 `createStore` |
| 全局 filter | 改为 `main.js` 全局 mixin methods |
| 小程序分享 | `utils/mpShare.js` |
| u-cell-item | 改为 `u-cell` |
| u-verification-code | 改为 `u-code` |
| u-swipe-action | 内层增加 `u-swipe-action-item` |
| u-upload | 关闭 `auto-upload`，使用 `@afterRead` + `utils/uploadHelper.js` |
| u-parse | `:html` 改为 `:content`，移除 `show-with-animation` / `use-cache` |

## 编译

请使用 HBuilderX 分别运行到 **H5**、**微信小程序**、**App** 进行验证。

## 回归测试清单

### 核心交易链路（H5 / 小程序）

- [ ] 首页装修模块加载（轮播、商品、优惠券等）
- [ ] 分类 / 搜索 / 商品详情
- [ ] 加购 / 购物车 / 填写订单
- [ ] 支付（H5 微信支付、小程序支付）
- [ ] 订单列表 / 订单详情 / 物流
- [ ] 售后申请 / 退款 / 评价
- [ ] 个人中心 / 地址 / 优惠券 / 积分

### 微商城专项（H5）

- [ ] 微信公众号内 JSSDK 分享
- [ ] 网页授权登录（`wechatH5Login`）
- [ ] `js_sdk/lili-pay/wx-pay.js` 微信支付
- [ ] 粘贴板分享链接跳转（`h5-copy`）
- [ ] H5 唤起 App 浮窗（`m-airbtn`）

### 微信小程序专项

- [ ] 分包加载正常
- [ ] `onShareAppMessage` 分享
- [ ] 定位 / 相册权限
- [ ] 海报 / 二维码（u-draw-poster、Sansnn-uQRCode）

### App 端（后续阶段）

- [ ] 5+ 原生模块：支付 / 分享 / OAuth / 定位 / 地图 / 指纹
- [ ] 头像裁剪（`okingtz-cropper`）
- [ ] 启动参数 / 唤起逻辑（`App.vue` `checkArguments`）

## 第三方插件

- `Sansnn-uQRCode`：声明支持 Vue3
- `u-draw-poster`：声明支持 Vue2/3
- `okingtz-cropper`：需在 App 端实测头像裁剪
