<script setup>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue'
</script>

<template>
    <ParentLayout>
        <template #page>
            <Content class="webapp-wrapper"></Content>
        </template>
    </ParentLayout>
</template>

<style lang="scss" scoped>
.webapp-wrapper {
    padding-top: var(--navbar-height);
    height: calc(100vh - var(--navbar-height));
    max-width: 100vw;
    margin: 0;
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>