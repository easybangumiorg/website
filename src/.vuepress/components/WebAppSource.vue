<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SourceButton from './webapp/SourceButton.vue';
import SourcePanel from './webapp/SourcePanel.vue';
import SourceContent from './webapp/SourceContent.vue';

const store = useStore()
const router = useRouter()

const data = ref({
    sourceList: {}
})

onMounted(async () => {
    if (!store.state.distributive.isConnect) {
        router.push("/zh/webapp")
    }
    data.value.sourceList = await store.dispatch('getSourceList')
})

</script>

<template>
    <div class="source-weapper">
        <div class="source-bar">
            <SourceButton class="item" v-for="s in data.sourceList" :source="s" />
        </div>
        <div class="class-bar">
            <SourcePanel class="panel" :source="store.state.source.list[store.state.source.choose]" />
        </div>
        <div class="content-bar">
            <SourceContent />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.source-weapper {
    display: flex;
    flex-direction: row;
    height: 100%;

    .source-bar {
        width: 70px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--c-border);

        .item {
            padding-top: 10px;
        }
    }

    .class-bar {
        width: 280px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--c-border);

        .panel {
            flex-grow: 1;
        }
    }

    .content-bar {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-y: scroll;
        overflow-x: hidden;
    }
}
</style>