<script setup>
import { useStore } from 'vuex'
import { watch, ref, onMounted, computed } from 'vue'
import ContentClass from './content/ContentClass.vue';
import ContentPlay from './content/ContentPlay.vue';

const store = useStore()

function backeard() {
    store.dispatch('backwardContent')
}

const path = computed(() => store.state.source.list[store.getters.content.source].name + " / " + store.getters.content.title)

</script>

<template>
    <div v-if="store.getters.content.type == 'blank'" class="content-container">
        <div>
            <h2>{{ store.getters.content.title }}</h2>
            <p>{{ store.getters.content.text }}</p>
        </div>
    </div>
    <div v-else>
        <div class="content-header">
            <div class="backward-button" @click="backeard()" v-show="store.state.contentCanBackward">
                <span class="arrow-left"></span>
                <div class="button-text">&nbsp;返回</div>
            </div>
            <h4>{{ path }}</h4>
        </div>
        <div class="content-container">
            <div v-if="store.getters.content.type == 'class'">
                <ContentClass />
            </div>
            <div v-if="store.getters.content.type == 'play'">
                <ContentPlay />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.content-header {
    height: 54px;
    border-bottom: 1px solid var(--c-border);
    display: flex;
    flex-direction: row;
    overflow: hidden;

    h4 {
        margin: 14px;
        padding: 0;

    }

    .backward-button {
        margin: 16px 16px;
        cursor: pointer;
        text-align: center;
        color: #3eaf7c;
        display: flex;

        .arrow-left {
            place-self: center;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 12px solid #3eaf7c;
            display: inline-block;
            width: 0;
            height: 0;
        }
    }
}

.content-container {
    max-width: var(--content-width);
    padding: 8px 12px;
    padding-top: 0;
    height: 100%;
}

@media all and (min-width: 1160px) {
    .content-container {
        margin: 0 auto;
        padding: 0rem 2.5rem;

        div {
            width: var(--content-width);
        }

    }
}
</style>