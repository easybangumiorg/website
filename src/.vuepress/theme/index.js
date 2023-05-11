import { defaultTheme } from '@vuepress/theme-default'
import { path } from '@vuepress/utils'

export default (options) => {
    return {
        name: 'vuepress-theme-easybangumi',
        extends: defaultTheme(options),
        layouts: {
            webapp: path.resolve(__dirname, 'layouts/webapp.vue'),
        },
    }
}