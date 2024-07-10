---
home: true
modules: # 指定首页展示模块
  - bannerBrand
  - Features
  - MdContent
  - Footer

bannerBrand:
  bgImage: '/images/bg.webp'
  title: 纯纯看番
  description: 使用 Compose 开发的看番软件，支持多番剧源。
  tagline: 纯纯看番 6，您追番的强大动力，支持番剧搜索、首页推荐、番剧收藏（追番）、番剧分类、多主题、倍速播放、播放历史、投屏功能、番剧下载、弹幕、插件化、插件市场...
  buttons:
    - { text: 下载, link: "/download/" }
  socialLinks:
    - { icon: "LogoGithub", link: "https://github.com/easybangumiorg/EasyBangumi" }
    - { icon: "SendAltFilled", link: "https://t.me/easybangumi" }

features:
  - title: 追番
    details: 自动管理你追的番剧，确保第一时间获得更新。
  - title: 自定义
    details: 具有相当多的主题选项，也可以跟随系统自动设置暗黑模式。
  - title: 插件化
    details: 系统的插件化框架，通过安装插件来获取更多功能。
  - title: 第三方云同步
    details: 支持使用番组计划同步观看进度和收藏，将各种信息保存至云端。
  - title: 本地源
    details: 将手机内下载的番剧通过纯纯看番管理，自动刮削最新最全的元信息，随时随地观看！
  - title: 智能下载
    details: 看上什么资源了？纯纯看番的下载功能将自动为你处理番剧的各种信息以及编码。


footer:
  record: Apache-2.0 Licensed
  recordLink: https://easybangumi.org
  startYear: 2022
---

<build-state/>

## 须知

1. 纯纯看番是为了学习 Jitpack compose 和音视频相关技术进行开发的一个项目，官方不提供打包和下载，其源代码仅供交流学习。因其他人私自打包发行后造成的一切后果本方概不负责。
2. 纯纯看番打包后不提供任何视频内容，需要用户自己手动添加。用户自行导入的内容和本软件无关。
3. 纯纯看番源码完全免费，在 Github 开源。用户可自行下载打包。如果你是收费购买的本软件，则本方概不负责。

## 开发计划

- [x] 番剧搜索
- [x] 首页推荐
- [x] 番剧收藏（追番）
- [x] 番剧分类
- [x] 番剧播放
- [x] 多主题
- [x] 倍速播放
- [x] 播放历史
- [x] 投屏功能
- [x] 添加源管理
- [x] 番剧下载
- [x] 数据保存，恢复
- [x] 插件化，添加插件市场
- [ ] pc 版
- [ ] 保存数据云同步
- [ ] 添加弹幕功能
- [ ] 视频录制 Gif
- [ ] 基于 Bangumi 的刮削功能
- [ ] 基于 Bangumi 的数据同步功能
