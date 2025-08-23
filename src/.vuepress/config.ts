import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { recoTheme } from 'vuepress-theme-reco'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'

export default defineUserConfig({
    // 头部设置
    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "theme-color", content: "#343D48" }],
        ["meta", { prefix: "og: http://ogp.me/ns#", property: "og:image", content: "https://easybangumi.org/icons/FAVICON-RAW.png" }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ],

    bundler: viteBundler({ }),

    // 主题配置
    theme: recoTheme({

        // 基本配置
        logo: "/icons/logo.ico",
        repo: "easybangumiorg/easybangumi",
        // 协同编辑
        docsRepo: "https://github.com/easybangumiorg/website",
        docsBranch: 'main',
        docsDir: "src",

        series: { // 系列文章
            '/docs/reference': [
                {
                    text: '常见问题',
                    children: [
                        '/docs/reference/faq',
                    ]
                },
                {
                    text: '用户指南',
                    children: [
                        '/docs/reference/getting-started',
                    ]

                },
                {
                    text: '开发',
                    children: [
                        '/docs/reference/contribution',
                        '/docs/reference/extension-js',
                        '/docs/reference/extension-example',
                        '/docs/reference/extension-utils',
                    ]
                },
            ]
        },

        navbar: [ // 顶部导航栏
            { text: "主页", link: "/" },
            { text: "下载", link: "/download/" },
            {
                text: "参考",
                children: [
                    {
                        text: "常见问题",
                        link: "/docs/reference/faq",
                    },
                    {
                        text: "用户指南",
                        children: [
                            '/docs/reference/getting-started'
                        ],
                    },
                    {
                        text: "开发",
                        children: [
                            '/docs/reference/contribution',
                            '/docs/reference/extension-js',
                            '/docs/reference/extension-example',
                            '/docs/reference/extension-utils'
                        ],
                    },
                ]
            },
        ],
    }),

    // 网站多语言支持
    title: '纯纯看番',
    description: '免费且开源的安卓动漫播放器',

    // 插件
    plugins: [
        googleAnalyticsPlugin({
            id: "G-9CF0ZQPB32"
        }),
    ],
})