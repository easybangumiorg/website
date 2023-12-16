import { defineClientConfig } from '@vuepress/client'
import store from './store'

export default defineClientConfig({
    enhance({ app, router, siteData }) {
        app.use(store)
    },
    setup() { },
    layouts: { },
    rootComponents: [],
})