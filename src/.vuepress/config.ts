import { defineUserConfig } from 'vuepress'
import { recoTheme } from 'vuepress-theme-reco'
// import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
// import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
// import { searchPlugin } from '@vuepress/plugin-search'
// import { getDirname, path } from '@vuepress/utils'

// const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
    // 头部设置
    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "theme-color", content: "#343D48" }],
        ["meta", { prefix: "og: http://ogp.me/ns#", property: "og:image", content: "https://easybangumi.org/icons/FAVICON-RAW.png" }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ],

    // 主题配置
    theme: recoTheme({

        // 基本配置
        style: "@vuepress-reco/style-default",
        logo: "/icons/logo.ico",
        repo: "easybangumiorg/website",
        sourceDir: "src",
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
                        '/docs/reference/extension-example',
                        '/docs/reference/extension-utils',
                    ]
                },
            ]
        },

        navbar: [ // 顶部导航栏
            { text: "主页", link: "/" },
            {
                text: "下载",
                children: [
                    { text: "本体", link: "/download/" },
                    { text: "扩展", link: "/extensions/" },
                ]
            },
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
        // registerComponentsPlugin({
        //      componentsDir: path.resolve(__dirname, './components'),
        // }),
        // googleAnalyticsPlugin({
        //     id: "G-9CF0ZQPB32"
        // }),
        // searchPlugin({
        //     locales: {
        //         '/en/': {
        //             placeholder: 'Search',
        //         },
        //         '/': {
        //             placeholder: '搜索',
        //         },
        //     },
        // }),
    ],
})