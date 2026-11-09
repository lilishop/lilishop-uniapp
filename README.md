<div align="center">
  <img src="./icon.png" width="80" alt="Lilishop Logo" />
  <h1>Lilishop(PickMall) 开源商城系统 - 移动端 (uni-app)</h1>

  <p>
    <a href="https://github.com/lilishop/lilishop"><img src="https://img.shields.io/github/stars/lilishop/lilishop.svg?style=social&logo=github" alt="GitHub Stars" /></a>
    <a href="https://gitee.com/beijing_hongye_huicheng/lilishop"><img src="https://gitee.com/beijing_hongye_huicheng/lilishop/badge/star.svg?theme=dark" alt="Gitee Stars" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License" /></a>
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3-brightgreen.svg" alt="Vue 3" /></a>
    <a href="https://uniapp.dcloud.net.cn/"><img src="https://img.shields.io/badge/uni--app-Vue3-blue.svg" alt="uni-app" /></a>
  </p>

  <p>
    <a href="https://pickmall.cn">🏠 官方网站</a> ·
    <a href="https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home">📖 产品文档</a> ·
    <a href="#2-在线演示">📱 在线演示</a> ·
    <a href="#7-社区与支持">💬 微信交流群</a>
  </p>

  <p>
    <b>简体中文</b> | <a href="./README.en.md">English</a>
  </p>
</div>

> ⭐ **如果觉得项目不错，请点击右上角 `Star` 收藏支持！您的 Star 是我们持续开源迭代的最大动力！**

**LILISHOP** 是基于 Spring Boot / Vue 3 / uni-app 开发的开源商城系统，支持 B2B2C 多商户商城、微信小程序商城、H5 商城、APP 商城、直播电商、分销返佣、秒杀活动。

### ✨ 为什么选择 Lilishop
- 🟢 **真 Apache-2.0 协议**：支持免费商用与私有化闭源二开，无版权后顾之忧。
- 🚀 **Vue 3 全新栈**：基于 `uni-app + Vue 3 + uview-plus 3.x`，告别老旧 Vue 2 模板。
- 🧩 **生产级完整度**：非静态切图模板，完整覆盖 B2B2C 多商户、可视化装修、IM 客服、秒杀拼团、分销直播全闭环。

---

## 1. 项目简介

**Lilishop** 是一款功能完善的 B2B2C 多商户商城系统，采用前后端分离架构，全端代码开源。  
后端基于 **Spring Boot 4**（Java 21）构建，具备高内聚、低耦合的特性，支持分布式部署；前端覆盖 PC、H5、小程序和 APP，基于 **Vue 3** 和 **uni-app** 开发。

本仓库（`lilishop-uniapp`）为 **买家端移动端源码**，一套代码同时支持 **H5、微信小程序、Android / iOS APP**。

- **官方网站**: <https://pickmall.cn>
- **官方文档**: [产品文档](https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)
- **Gitee 仓库**: <https://gitee.com/beijing_hongye_huicheng>
- **GitHub 主仓库**: <https://github.com/lilishop/lilishop>

---

## 2. 在线演示

> **注意**: 演示站手机验证码统一为 `111111`。演示环境部署于 `master` 分支。

| 微信小程序 | 移动端 H5（[点击直接访问](https://m-b2b2c.pickmall.cn)） |
| :---: | :---: |
| <img src="https://static.pickmall.cn/images/h5-qrcode.png" width="180" alt="微信小程序体验码" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/h5-qrcode.png" width="180" alt="移动端 H5 体验二维码" /> |
| 微信扫码体验小程序 | 手机扫码或访问 <https://m-b2b2c.pickmall.cn> |

- **商城 PC 端**: <https://pc-b2b2c.pickmall.cn>
- **平台管理端**: <https://admin-b2b2c.pickmall.cn>
  - 账号: `admin` / 密码: `123456`
- **店铺管理端**: <https://store-b2b2c.pickmall.cn>
  - 账号: `13011111111` / 密码: `111111`

### 移动端界面预览

| 商城首页 | 商品列表 | 商品详情 | 填写订单 | 个人中心 |
| :---: | :---: | :---: | :---: | :---: |
| <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image.png" width="160" alt="商城首页" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image3.png" width="160" alt="商品列表" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image4.png" width="160" alt="商品详情" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image5.png" width="160" alt="填写订单" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image2.png" width="160" alt="个人中心" /> |

---

## 3. 核心特性与技术栈

### 核心特性
- **全端覆盖**: 一套 `uni-app` 代码库支持 H5、微信小程序、Android / iOS APP，大幅降低多端开发与维护成本。
- **商家入驻**: 支持多商家入驻，构建平台化 B2B2C 电商生态。
- **可视化装修**: 支持首页及专题楼层（`pages/floor`）动态可视化配置与主题色切换。
- **即时通讯与直播**: 集成腾讯云 IM / MQTT 消息推送及 HLS 视频流，支持在线客服与直播带货。
- **完整电商闭环**: 涵盖商品浏览、购物车、多种促销（秒杀/拼团/优惠券/积分/砍价/分销）、订单履约、售后维权、会员中心等全流程。

### 移动端技术栈
| 类别 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| 核心框架 | `uni-app` + `Vue 3` | 跨端开发框架（支持 Vue 3 语法与渲染） |
| 状态管理 | `Vuex 4` | 全局登录态、购物车与用户状态管理 |
| UI 组件库 | `uview-plus 3.x` | 适配 Vue 3 的 uni-app 多端 UI 组件库 |
| 即时通讯 | `mqtt 5.x` / `@tencentcloud/chat` | 客服消息与实时通知推送 |
| 音视频流 | `hls.js` | 直播流播放支持 |
| 样式预处理 | `Sass (SCSS)` | 全局主题变量（`uni.scss`）与组件样式定制 |

---

## 4. 目录结构

```text
lilishop-uniapp
├── api/                  # 各业务模块接口定义（会员、商品、订单、促销、IM 等）
├── components/           # 公共业务与基础组件
├── config/               # 全局配置目录
│   ├── api.js            # 接口域名配置（buyer / im / mqtt）
│   └── config.js         # 商城名称、小程序 AppID、高德 Key、主题色等全局参数
├── hybrid/               # App 端本地 HTML 资源（如异常页、WebView 辅助页）
├── js_sdk/               # 第三方及 uni-app 插件 SDK
├── lib/                  # 基础工具库封装
├── pages/                # 页面与分包目录
│   ├── tabbar/           # 底部导航主包页面（首页、分类、购物车、我的等）
│   ├── passport/         # 登录、注册、找回密码分包
│   ├── product/          # 商品详情、列表、评价、店铺主页分包
│   ├── cart/             # 购物车与结算页分包
│   ├── order/            # 订单列表、详情、售后、物流、发票分包
│   ├── promotion/        # 秒杀、拼团、砍价、积分商城、分销、直播等营销分包
│   ├── mine/             # 个人中心、钱包、积分、收藏、地址管理分包
│   ├── floor/            # 可视化装修楼层组件与专题页
│   └── navigation/       # 导航与搜索相关页面
├── patches/              # patch-package 第三方依赖补丁
├── scripts/              # 构建与依赖修补脚本（如 postinstall 补丁）
├── static/               # 静态图片与字体资源
├── store/                # Vuex 状态管理
├── styles/               # 公共样式文件
├── uni_modules/          # uni_modules 模块（含 uview-plus 等）
├── utils/                # 请求拦截器、加密、校验、存储等工具函数
├── App.vue               # 应用入口组件
├── main.js               # 应用初始化入口
├── manifest.json         # uni-app 多端应用配置（AppID、权限、SDK 配置等）
├── pages.json            # 页面路由、分包加载与导航栏配置
└── uni.scss              # 全局 SCSS 变量与主题色定义
```

---

## 5. 配套源码仓库

本仓库专注于买家端 **H5 / 小程序 / APP**（`lilishop-uniapp`）。完整系统由以下四个核心仓库组成：

| 仓库名称 | 职责说明 | 仓库地址 |
| :--- | :--- | :--- |
| **`lilishop`** | 后端服务源码（Spring Boot 4 / Java 21） | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop) · [GitHub](https://github.com/lilishop/lilishop) |
| **`lilishop-ui`** | PC 商城 / 商家端 / 运营管理端 / IM Web 前端 | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-ui) |
| **`lilishop-uniapp`** | 买家端 H5 / 微信小程序 / Android & iOS APP | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-uniapp) |
| **`docker`** | 容器化部署编排、镜像与数据库脚本 | [Gitee](https://gitee.com/beijing_hongye_huicheng/docker) · [MySQL 脚本](https://gitee.com/beijing_hongye_huicheng/docker/tree/master/init/mysql) |

---

## 6. 开源与授权

本项目遵循 [Apache-2.0](./LICENSE) 开源协议，版权归 **北京宏业汇成科技有限公司** 所有。允许个人及企业免费用于学习、研究、修改和商业用途（需保留原始版权和许可声明）。

---

## 7. 社区与支持

我们欢迎任何形式的交流与贡献。在提问前，请先查阅 [产品文档](https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)，并参考 [《提问的智慧》](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md) 以便高效沟通。

- **[在线客服](https://work.weixin.qq.com/kfid/kfc4d8dc24a73c15f44)**
- **微信交流群**:  
  <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/wechat.jpg" width="200" alt="微信群" />

---

## 8. 升级计划

> 更新日期：2026-11-05，依据各端提交记录及当前代码实现同步。

### ✅ 已完成功能

按可核实的实现或完善时间倒序记录；日期表示代码完成或功能更新时间，不代表生产上线时间。

| 时间 | 功能模块 | 完成内容 |
| :--- | :--- | :--- |
| 2026-11-06 | 提货卡 | 支持提货卡活动与候选商品配置、制卡发卡、兑换核销及使用记录管理。 |
| 2026-11-05 | 付费会员 | 单一付费会员、开通与续费、有效期、关联权益、商家与商品折扣、平台补贴及付费记录。 |
| 2026-11-04 | 客户等级体系 / 客户权益 | 等级配置、权益介绍、经验值任务与明细、权益发放及重试，提供默认等级与权益数据。 |
| 2026-11-04 | 小程序订单管理 | 增加小程序订单查询入口及微信订单自动上报开关。 |
| 2026-11-04 | 立减优惠券 | 新增立减券，完善优惠券校验、领取与订单优惠计算。 |
| 2026-11-04 | 商品定时上下架 | 完善定时上下架计划管理、独立列表及执行校验。 |
| 2026-11-04 | 微信小程序原生能力 | 接入微信地址导入、头像选择和昵称填写。 |
| 2026-11-02 | 消息模板 | 支持多渠道模板矩阵维护，统一站内信、短信、微信公众号及小程序订阅消息的场景配置和异步发送。 |
| 2026-10-30 | PC 页面装修 | 重构楼层组件，支持自适应高度、可视化热区绘制及配置交互优化。 |
| 2026-10-29 | 定时任务管理 | 重构为数据库配置驱动，支持运营后台维护任务。 |
| 2026-10-29 | 敏感词管理 | 支持按业务场景配置过滤开关，并优化词库加载。 |
| 2026-10-29 | PC 店铺搜索 | 新增店铺列表，支持商品与店铺双模式搜索。 |
| 2026-10-22 | 分类设置 | 支持四种分类页模板选择、商品列表展示字段开关及模板图片预览。 |
| 2026-10-20 | 移动端页面装修 | 完善可视化编辑器，新增首页组合组件及优惠券、店铺、文章等楼层。 |
| 2026-10-09 | 主题色管理 | 完善主题设置，支持自定义模式。 |
| 2026-10-02 | 预约服务商品 | 完善预约商品、预约交易及订单详情功能。 |
| 2026-08-05 | 二级分销 | 由一级分销扩展为二级分销，增加节点配置及分销员中心。 |
| 2026-08-03 | 卡密商品 | 完善电子卡券履约、订单状态及卡池管理。 |
| 2026-07-23 | 素材库管理 | 增加文件分类、目录管理及目录归属校验。 |
| 2026-07-20 | 经营统计报表 | 新增店铺业绩、商品同比环比、销售订单明细及商品销售汇总报表。 |
| 2026-07-13 | 腾讯云直播 | 接入并完善直播、聊天与直播商品相关功能。 |
| 2026-06-30 | 移动端技术升级 | 升级 Vue 3 与 uView Plus，适配组件和页面。 |
| 2026-06-29 | 电子面单发货 | 完善快递鸟电子面单，支持自动携带运单号发货。 |
| 2026-06-05 | 后端与管理端框架升级 | 5 月 25 日至 6 月 5 日完成 Spring Boot 4、管理端 Vue 3 与 Element Plus 升级。 |
| 2026-05-22 | 购物卡 | 新增礼品卡接口，以及选择、绑定、激活和列表管理。 |
| 2026-05-20 | 微信提现 | 完善转账状态查询、确认回调和重试处理，后续补充提现规则说明配置。 |
| 2026-04-16 | 置顶评论 | 支持评论置顶及商品评价管理。 |
| 2026-04-13 | 专用发票（发票上传） | 完善发票信息字段、发票详情及管理展示。 |
| 2026-04-01 | 商品虚拟销量 | 支持按商品规格设置虚拟销量，提供单个及批量设置入口。 |
| 2026-03-30 | 商品分组 | 新增商品分组管理及商品关联功能。 |
| 2026-03-24 | 会员分组 | 新增会员分组管理。 |

### 🔜 近期规划中
- 🔜 微信小店对接
- 🔜 抖店对接
- 🔜 微信小程序原生重构与体验对齐（持续完善；已接入预约交易、分类多模板与首页楼层装修）
- 🔜 OpenAPI 开放平台与开发者中心
