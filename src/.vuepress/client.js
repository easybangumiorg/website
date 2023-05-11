import { defineClientConfig } from '@vuepress/client'
import store from './store'
import webappLayout from './layouts/webapp.vue'

export default defineClientConfig({
    enhance({ app, router, siteData }) {
        app.use(store)
    },
    setup() { },
    layouts: {
        webapp: webappLayout
    },
    rootComponents: [],
})