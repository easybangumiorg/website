<script>
import ExtensionList from "./ExtensionList.vue";

const GITHUB_EXTENSION_JSON = "https://raw.githubusercontent.com/easybangumiorg/EasyBangumi-sources/main/index.json"

export default {
    components: { ExtensionList },
    data() {
        return {
            extensions: [],
            loading: true,
        };
    },
    async beforeMount() {
        const data = await fetch(GITHUB_EXTENSION_JSON).then(res => res.json())
        this.$data.extensions = data;
        this.$nextTick(() => {
            this.loading = false;
        });
    },
    updated() {
        if (window.location.hash) {
            window.location.replace(window.location.hash);
        }
    }
};
</script>

<template>
    <div v-if="loading" v-loading.lock="loading" style="min-height: 200px"></div>
    <div v-else>
        <ExtensionList :list="extensions" :total-count="extensions.length" />
    </div>
</template>