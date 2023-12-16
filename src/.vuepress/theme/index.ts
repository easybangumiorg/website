import { activeHeaderLinksPlugin } from '@vuepress/plugin-active-header-links';
import { backToTopPlugin } from '@vuepress/plugin-back-to-top';
import { containerPlugin } from '@vuepress/plugin-container';
import { externalLinkIconPlugin } from '@vuepress/plugin-external-link-icon';
import { gitPlugin } from '@vuepress/plugin-git';
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom';
import { nprogressPlugin } from '@vuepress/plugin-nprogress';
import { palettePlugin } from '@vuepress/plugin-palette';
import { prismjsPlugin } from '@vuepress/plugin-prismjs';
import { themeDataPlugin } from '@vuepress/plugin-theme-data';
import { fs, getDirname, path } from '@vuepress/utils';

const DEFAULT_LOCALE_OPTIONS = {
  // color mode
  colorMode: 'auto',
  colorModeSwitch: true,
  // navbar
  navbar: [],
  logo: null,
  repo: null,
  selectLanguageText: 'Languages',
  selectLanguageAriaLabel: 'Select language',
  // sidebar
  sidebar: 'auto',
  sidebarDepth: 2,
  // page meta
  editLink: true,
  editLinkText: 'Edit this page',
  lastUpdated: true,
  lastUpdatedText: 'Last Updated',
  contributors: true,
  contributorsText: 'Contributors',
  // 404 page messages
  notFound: [
    `There's nothing here.`,
    `How did we get here?`,
    `That's a Four-Oh-Four.`,
    `Looks like we've got some broken links.`,
  ],
  backToHome: 'Take me home',
  // a11y
  openInNewWindow: 'open in new window',
  toggleColorMode: 'toggle color mode',
  toggleSidebar: 'toggle sidebar',
};
const DEFAULT_LOCALE_DATA = {
  // navbar
  selectLanguageName: 'English',
};
/**
* Assign default options
*/
const assignDefaultLocaleOptions = (localeOptions) => {
  if (!localeOptions.locales) {
    localeOptions.locales = {};
  }
  if (!localeOptions.locales['/']) {
    localeOptions.locales['/'] = {};
  }
  Object.assign(localeOptions, {
    ...DEFAULT_LOCALE_OPTIONS,
    ...localeOptions,
  });
  Object.assign(localeOptions.locales['/'], {
    ...DEFAULT_LOCALE_DATA,
    ...localeOptions.locales['/'],
  });
};

const resolveContainerPluginOptions = (localeOptions, type) => {
  const locales = Object.entries(localeOptions.locales || {}).reduce((result, [key, value]) => {
    result[key] = {
      defaultInfo: value?.[type] ?? localeOptions[type],
    };
    return result;
  }, {});
  return {
    type,
    locales,
  };
};


const __dirname = getDirname(import.meta.url);

export const mduiTheme = ({ themePlugins= {}, ...localeOptions } = {}) => {
  assignDefaultLocaleOptions(localeOptions);
  return {
    name: '@vuepress/theme-default',
    templateBuild: path.resolve(__dirname, './templates/build.html'),
    alias: {
      // use alias to make all components replaceable
      ...Object.fromEntries(fs
        .readdirSync(path.resolve(__dirname, './components'))
        .filter((file) => file.endsWith('.vue'))
        .map((file) => [
          `@theme/${file}`,
          path.resolve(__dirname, './components', file),
        ])),
    },
    clientConfigFile: path.resolve(__dirname, './config.js'),
    extendsPage: (page) => {
      // save relative file path into page data to generate edit link
      page.data.filePathRelative = page.filePathRelative;
      // save title into route meta to generate navbar and sidebar
      page.routeMeta.title = page.title;
    },
    plugins: [
      // @vuepress/plugin-active-header-link
      themePlugins.activeHeaderLinks !== false
        ? activeHeaderLinksPlugin({
          headerLinkSelector: 'a.sidebar-item',
          headerAnchorSelector: '.header-anchor',
          // should greater than page transition duration
          delay: 300,
        })
        : [],
      // @vuepress/plugin-back-to-top
      themePlugins.backToTop !== false ? backToTopPlugin() : [],
      // @vuepress/plugin-container
      themePlugins.container?.tip !== false
        ? containerPlugin(resolveContainerPluginOptions(localeOptions, 'tip'))
        : [],
      themePlugins.container?.warning !== false
        ? containerPlugin(resolveContainerPluginOptions(localeOptions, 'warning'))
        : [],
      themePlugins.container?.danger !== false
        ? containerPlugin(resolveContainerPluginOptions(localeOptions, 'danger'))
        : [],
      themePlugins.container?.details !== false
        ? containerPlugin({
          type: 'details',
          before: (info) => `<details class="custom-container details">${info ? `<summary>${info}</summary>` : ''}\n`,
          after: () => '</details>\n',
        })
        : [],
      themePlugins.container?.codeGroup !== false
        ? containerPlugin({
          type: 'code-group',
          before: () => `<CodeGroup>\n`,
          after: () => '</CodeGroup>\n',
        })
        : [],
      themePlugins.container?.codeGroupItem !== false
        ? containerPlugin({
          type: 'code-group-item',
          before: (info) => `<CodeGroupItem title="${info}">\n`,
          after: () => '</CodeGroupItem>\n',
        })
        : [],
      // @vuepress/plugin-external-link-icon
      themePlugins.externalLinkIcon !== false
        ? externalLinkIconPlugin({
          locales: Object.entries(localeOptions.locales || {}).reduce((result, [key, value]) => {
            result[key] = {
              openInNewWindow: value.openInNewWindow ?? localeOptions.openInNewWindow,
            };
            return result;
          }, {}),
        })
        : [],
      // @vuepress/plugin-git
      themePlugins.git !== false
        ? gitPlugin({
          createdTime: false,
          updatedTime: localeOptions.lastUpdated !== false,
          contributors: localeOptions.contributors !== false,
        })
        : [],
      // @vuepress/plugin-medium-zoom
      themePlugins.mediumZoom !== false
        ? mediumZoomPlugin({
          selector: '.theme-default-content > img, .theme-default-content :not(a) > img',
          zoomOptions: {},
          // should greater than page transition duration
          delay: 300,
        })
        : [],
      // @vuepress/plugin-nprogress
      themePlugins.nprogress !== false ? nprogressPlugin() : [],
      // @vuepress/plugin-palette
      palettePlugin({ preset: 'sass' }),
      // @vuepress/plugin-prismjs
      themePlugins.prismjs !== false ? prismjsPlugin() : [],
      // @vuepress/plugin-theme-data
      themeDataPlugin({ themeData: localeOptions }),
    ],
  };
};


// export const mduiTheme = (options: DefaultThemeOptions): Theme => {
//   return {
//     name: 'vuepress-theme-mdui',
//     // extends: defaultTheme(options),
//     clientConfigFile: path.resolve(__dirname, './config.js'),
//     templateBuild: path.resolve(__dirname, './templates/build.html'),
//   }
// }