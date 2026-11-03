<div align="center">
  <img src="./icon.png" width="80" alt="Lilishop Logo" />
  <h1>Lilishop(PickMall) - Mobile Client (uni-app)</h1>

  <p>
    <a href="https://github.com/lilishop/lilishop"><img src="https://img.shields.io/github/stars/lilishop/lilishop.svg?style=social&logo=github" alt="GitHub Stars" /></a>
    <a href="https://gitee.com/beijing_hongye_huicheng/lilishop"><img src="https://gitee.com/beijing_hongye_huicheng/lilishop/badge/star.svg?theme=dark" alt="Gitee Stars" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License" /></a>
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3-brightgreen.svg" alt="Vue 3" /></a>
    <a href="https://uniapp.dcloud.net.cn/"><img src="https://img.shields.io/badge/uni--app-Vue3-blue.svg" alt="uni-app" /></a>
  </p>

  <p>
    <a href="https://pickmall.cn">🏠 Official Website</a> ·
    <a href="https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home">📖 Product Documentation</a> ·
    <a href="#2-online-demo">📱 Online Demo</a> ·
    <a href="https://github.com/lilishop/lilishop">💻 GitHub</a>
  </p>

  <p>
    <a href="./README.md">简体中文</a> | <b>English</b>
  </p>
</div>

> ⭐ **If you like this project, please click `Star` in the top-right corner to support us! Your Star is our greatest motivation for continuous open-source iteration!**

**LILISHOP** is an open-source e-commerce system built with Spring Boot, Vue 3, and uni-app. It supports B2B2C multi-vendor marketplaces, WeChat Mini Programs, H5, Android/iOS Apps, live-streaming e-commerce, affiliate distribution, and flash sales.

### ✨ Why Choose Lilishop
- 🟢 **True Apache-2.0 License**: Free for commercial use and private secondary development without licensing concerns.
- 🚀 **Modern Vue 3 Stack**: Built on `uni-app + Vue 3 + uview-plus 3.x`, leaving legacy Vue 2 templates behind.
- 🧩 **Production-Ready Completeness**: Not a static UI template—fully integrated with B2B2C multi-vendor workflows, visual storefront decoration, IM customer service, flash sales, group buying, affiliate distribution, and live streaming.

---

## 1. Overview

This repository (`lilishop-uniapp`) is the **Mobile Buyer Client** of Lilishop, supporting **H5, WeChat Mini Program, Android, and iOS Apps** from a single codebase powered by **Vue 3** and **uni-app**.

- **Official Website**: <https://pickmall.cn>
- **Documentation**: [Product Documentation](https://bdwx2tfwwt.feishu.cn/wiki/space/7675179368632617952?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)
- **Gitee Repository**: <https://gitee.com/beijing_hongye_huicheng>
- **GitHub Main Repository**: <https://github.com/lilishop/lilishop>

---

## 2. Online Demo

> **Note**: The verification code for the demo environment is `111111`.

| WeChat Mini Program | Mobile H5 ([Visit Directly](https://m-b2b2c.pickmall.cn)) |
| :---: | :---: |
| <img src="https://static.pickmall.cn/images/h5-qrcode.png" width="180" alt="WeChat Mini Program QR Code" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/h5-qrcode.png" width="180" alt="Mobile H5 QR Code" /> |
| Scan with WeChat | Scan or visit <https://m-b2b2c.pickmall.cn> |

- **PC Mall**: <https://pc-b2b2c.pickmall.cn>
- **Admin Panel**: <https://admin-b2b2c.pickmall.cn> (`admin` / `123456`)
- **Store Panel**: <https://store-b2b2c.pickmall.cn> (`13011111111` / `111111`)

### Mobile UI Preview

| Home | Product List | Product Detail | Checkout | User Center |
| :---: | :---: | :---: | :---: | :---: |
| <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image.png" width="160" alt="Home" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image3.png" width="160" alt="Product List" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image4.png" width="160" alt="Product Detail" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image5.png" width="160" alt="Checkout" /> | <img src="https://lilishop-wechat.oss-cn-beijing.aliyuncs.com/image2.png" width="160" alt="User Center" /> |

---

## 3. Core Features & Tech Stack

### Core Features
- **Cross-Platform**: One codebase runs on H5, WeChat Mini Program, Android, and iOS.
- **Multi-Vendor B2B2C**: Supports merchant onboarding and store-level operations.
- **Visual Storefront Decoration**: Dynamic home page & floor layouts (`pages/floor`) and customizable theme colors.
- **Live Streaming & IM**: Integrated with Tencent Cloud IM / MQTT and HLS video streaming.
- **Full E-Commerce Workflow**: Product browsing, cart, promotions (flash sale, group buy, coupons, points, bargain, affiliate), order fulfillment, after-sales, and member center.

### Mobile Tech Stack
| Category | Technology | Description |
| :--- | :--- | :--- |
| Core Framework | `uni-app` + `Vue 3` | Cross-platform framework with Vue 3 support |
| State Management | `Vuex 4` | Global auth, cart, and user state management |
| UI Library | `uview-plus 3.x` | Vue 3 compatible uni-app multi-platform UI library |
| Messaging & IM | `mqtt 5.x` / `@tencentcloud/chat` | Real-time customer service and notification push |
| Video Streaming | `hls.js` | Live streaming playback support |
| CSS Preprocessor | `Sass (SCSS)` | Global theme variables (`uni.scss`) and styling |

---

## 4. Directory Structure

```text
lilishop-uniapp
├── api/                  # API module definitions (member, goods, order, promotion, IM, etc.)
├── components/           # Shared business and base components
├── config/               # Global configuration
│   ├── api.js            # API base URLs (buyer / im / mqtt)
│   └── config.js         # Mall name, Mini Program AppID, AMap Key, theme colors, etc.
├── hybrid/               # Local HTML assets for App WebView
├── js_sdk/               # Third-party and uni-app SDKs
├── lib/                  # Base utility libraries
├── pages/                # Pages and sub-packages
│   ├── tabbar/           # Main tabbar pages (Home, Category, Cart, Mine)
│   ├── passport/         # Auth sub-package (Login, Register, Reset Password)
│   ├── product/          # Product detail, list, reviews, store homepage
│   ├── cart/             # Shopping cart and checkout
│   ├── order/            # Order list, detail, after-sales, logistics, invoice
│   ├── promotion/        # Flash sale, group buy, bargain, points mall, distribution, live
│   ├── mine/             # User center, wallet, points, favorites, addresses
│   ├── floor/            # Visual decoration floor components and topic pages
│   └── navigation/       # Navigation and search pages
├── patches/              # patch-package patches for dependencies
├── scripts/              # Build and postinstall runtime patch scripts
├── static/               # Static images and fonts
├── store/                # Vuex store modules
├── styles/               # Global stylesheets
├── uni_modules/          # uni_modules plugins (including uview-plus)
├── utils/                # Request interceptors, encryption, validators, storage helpers
├── App.vue               # Root application component
├── main.js               # Application entry point
├── manifest.json         # uni-app multi-platform configuration
├── pages.json            # Page routes, sub-packages, and navigation bar settings
└── uni.scss              # Global SCSS variables and theme color definitions
```

---

## 5. Related Repositories

| Repository | Description | Links |
| :--- | :--- | :--- |
| **`lilishop`** | Backend Services (Spring Boot 4 / Java 21) | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop) · [GitHub](https://github.com/lilishop/lilishop) |
| **`lilishop-ui`** | PC Mall / Seller / Admin / IM Web Frontend | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-ui) |
| **`lilishop-uniapp`** | Mobile Buyer Client (H5 / Mini Program / App) | [Gitee](https://gitee.com/beijing_hongye_huicheng/lilishop-uniapp) |
| **`docker`** | Docker Compose, Images & SQL Init Scripts | [Gitee](https://gitee.com/beijing_hongye_huicheng/docker) · [MySQL Scripts](https://gitee.com/beijing_hongye_huicheng/docker/tree/master/init/mysql) |

---

## 6. License

Lilishop is licensed under the [Apache-2.0](./LICENSE) License. Copyright © 2020-2026 **Beijing Hongye Huicheng Technology Co., Ltd.**
