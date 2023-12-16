<script setup lang="ts">
import { useRouteLocale } from '@vuepress/client'
import { useThemeLocaleData } from '@vuepress/plugin-theme-data/client'

const routeLocale = useRouteLocale()
const themeLocale = useThemeLocaleData()

const messages = themeLocale.value.notFound ?? ['Not Found']
const getMsg = (): string =>
  messages[Math.floor(Math.random() * messages.length)]
const homeLink = themeLocale.value.home ?? routeLocale.value
const homeText = themeLocale.value.backToHome ?? 'Back to home'
</script>

<template>
  <mdui-layout class="root-container">
    <mdui-layout-main class="not-found-page" style="min-height: 300px">
      <mdui-card class="not-found-msg-card mdui-prose">
        <h1>404 Not Found</h1>
        <p>{{ getMsg() }}</p>
        <mdui-button class="" :href="homeLink">
          {{ homeText }}
        </mdui-button>
      </mdui-card>
    </mdui-layout-main>
  </mdui-layout>
</template>

<style style="scss">
.root-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;

  .not-found-msg-card {
    padding: 40px 60px;
  }
}

@media (max-width: 600px) {
  .not-found-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0px;

    .not-found-msg-card {
      height: 100vh;
      width: 100vw;
    }
  }

}
</style>