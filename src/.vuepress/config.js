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

    // 元信息
    title: "EasyBangumi",
    description: "Free and open source bangumi(animation) player for Android",

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
        editLinkText: "Help us improve this page",
        docsRepo: "easybangumiorg/website",
        docsBranch: 'main',
        docsDir: "src",

        // 上次编辑
        lastUpdated: true,
        lastUpdatedText: "Last updated",

        // 合作者
        contributors: true,
        contributorsText: "Contributors",

        // 导航栏
        navbar: [
            { text: "Home", link: "/" },
            { text: "Download", link: "/download/" },
            { text: "Extensions", link: "/extensions/" },
        ],

        // 侧边栏
        sidebar: 'auto',
    }),

    // 插件
    plugins: [
        registerComponentsPlugin({
            componentsDir: path.resolve(__dirname, './components'),
        }),
        // 以下插件在开发模式启用可能会导致页面无法预览
        googleAnalyticsPlugin({
            id: "G-9CF0ZQPB32"
        }),
    ],
})