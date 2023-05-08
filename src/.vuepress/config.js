import { defineUserConfig, defaultTheme } from 'vuepress'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { getDirname, path } from '@vuepress/utils'

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
    // 文件目录
    dest: "./dist",
    temp: "./.temp",
    cache: "./.cache",

    // 头部设置
    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "theme-color", content: "#343D48" }],
        ["meta", { prefix: "og: http://ogp.me/ns#", property: "og:image", content: "https://easybangumi.org/icons/FAVICON-RAW.png" }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ],

    // 主题配置
    theme: defaultTheme({
        // 基本配置
        logo: "/icons/logo.ico",
        repo: "easybangumiorg/easybangumi",
        // 协同编辑
        editLinks: true,
        docsRepo: "easybangumiorg/website",
        docsBranch: 'main',
        docsDir: "src",
        // 上次编辑
        lastUpdated: true,
        // 合作者
        contributors: false,
        // 侧边栏
        sidebar: 'auto',

        // 主题多语言设置
        locales: {
            '/': { // 英语设置
                selectLanguageName: 'English',
                editLinkText: "Help us improve this page",
                lastUpdatedText: "Last updated",
                contributorsText: "Contributors",

                navbar: [
                    { text: "Home", link: "/" },
                    {
                        text: "Download",
                        children: [
                            { text: "EasyBangumi", link: "/download/" },
                            { text: "Extensions", link: "/extensions/" },
                        ]
                    },
                ],
            },
            '/zh/': { // 简体中文设置
                selectLanguageName: '简体中文',
                editLinkText: "帮助我们改善此页",
                lastUpdatedText: "上次更新",
                contributorsText: "贡献者",

                navbar: [
                    { text: "主页", link: "/zh/" },
                    {
                        text: "下载",
                        children: [
                            { text: "本体", link: "/zh/download/" },
                            { text: "扩展", link: "/zh/extensions/" },
                        ]
                    },
                    {
                        text: "帮助",
                        children: [
                            {
                                text: "常见问题",
                                link: "/zh/guide/faq/",
                            },
                            {
                                text: "用户指南",
                                children: [
                                    '/zh/guide/user-manual/getting-started.md'
                                ],
                            },
                            {
                                text: "开发",
                                children: [
                                    '/zh/guide/contribution/'
                                ],
                            },
                        ]
                    },
                ],

                sidebar: {
                    '/zh/guide/': [
                        {
                            text: '常见问题',
                            collapsible: true,
                            link: '/zh/guide/faq/',
                        }, {
                            text: '用户指南',
                            collapsible: true,
                            children: [
                                '/zh/guide/user-manual/getting-started.md',
                            ],
                        }, {
                            text: '开发',
                            collapsible: true,
                            children: [
                                '/zh/guide/contribution/',
                            ],
                        },
                    ],
                },

                // 简体中文的额外设置
                selectLanguageText: '选择语言',
                selectLanguageAriaLabel: '选择语言',
                tip: '提示',
                warning: '注意',
                danger: '警告',
                notFound: [
                    '这里什么都没有',
                    '我们怎么到这来了？',
                    '这是一个 404 页面',
                    '看起来我们进入了错误的链接',
                ],
                backToHome: '返回首页',
                openInNewWindow: '在新窗口打开',
                toggleColorMode: '切换颜色模式',
                toggleSidebar: '切换侧边栏',
            },
        },
    }),

    // 多语言支持
    locales: {
        '/': {
            lang: 'en-US',
            title: 'EasyBangumi',
            description: 'Free and open source bangumi(animation) player for Android',
        },
        '/zh/': {
            lang: 'zh-CN',
            title: '纯纯看番',
            description: '免费且开源的安卓动漫播放器',
        },
    },

    // 插件
    plugins: [
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
        googleAnalyticsPlugin({
            id: "G-9CF0ZQPB32"
        }),
    ],
})