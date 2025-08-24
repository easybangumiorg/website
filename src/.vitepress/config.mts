import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "EasyBangumi",
  description: "免费开源的安卓动漫播放器",
  lang: "zh-CN",
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  mpa: true,

  head: [
    // 站点图标
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#82abddff" }],

    // 字体
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
        rel: "stylesheet",
      },
    ],

    // Google Analytics
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-9CF0ZQPB32",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9CF0ZQPB32');`,
    ],

    // 社交媒体分享
    [
      "meta",
      {
        prefix: "og: http://ogp.me/ns#",
        property: "og:image",
        content: "https://easybangumi.org/icons/FAVICON-RAW.png",
      },
    ],
    [
      "meta",
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
  ],

  // 主题配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icons/logo-05x.ico",

    search: {
      provider: "local",
    },

    footer: {
      message: "Apache-2.0 Licensed.",
      copyright: "Copyright © 2019-present EasyBangumi",
    },

    editLink: {
      pattern: "https://github.com/easybangumiorg/website/edit/main/src/:path",
      text: "在 GitHub 上编辑",
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Download", link: "/download" },
      { text: "Docs", link: "/docs/getting-started" },
    ],

    sidebar: [
      {
        text: "用户指南",
        items: [
          { text: "开始使用纯纯看番", link: "/docs/getting-started" },
          { text: "常见问题", link: "/docs/faq" },
        ],
      },
      {
        text: "开发",
        items: [
          { text: "构建", link: "/docs/contribution" },
          { text: "安卓扩展例程", link: "/docs/native-extension-example" },
          { text: "JS扩展例程", link: "/docs/js-extension-example" },
          { text: "JS扩展 API参考", link: "/docs/js-extension-utils" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/easybangumiorg/EasyBangumi" },
    ],
  },

  sitemap: {
    hostname: "https://easybangumi.org",
  },
});
