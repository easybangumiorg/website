<script setup>
import { defineProps, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps(['type', 'data'])

const data = ref({
    type: '',
    title: '',
    subTitle: '',
    id: null,
    payload: {},
    source: ''
})

function onclick() {
    switch (data.value.type) {
        case 'class':
            store.dispatch('openContent', {
                type: data.value.type,
                title: data.value.title,
                text: data.value.subTitle,
                source: data.value.source,
                tid: data.value.id,
                payload: data.value.payload
            })
            break;
    }
}

onMounted(() => {
    switch (props.type) {
        case 'class':
            data.value.type = 'class'
            data.value.title = props.data.name
            data.value.subTitle = props.data.description
            data.value.id = props.data.tid
            data.value.source = store.state.source.choose
            break;
    }
})
</script>

<template>
    <div v-if="data.type == 'class'" class="box-item" @click="onclick()">
        <div class="title">
            <h6>{{ data.title }}</h6>
            <span>{{ data.subTitle }}</span>
        </div>
        <div class="title-icon">
            <span class="arrow-right"></span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.box-item {
    height: 64px;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    border: 1px solid #dcdfe6;

    .title {
        flex-grow: 1;

        h6 {
            padding-top: 10px;
            padding-left: 14px;
            margin: 0;
        }

        span {
            padding-left: 14px;
            font-size: xx-small;
            font-weight: lighter;
        }
    }

    .title-icon {
        width: 64px;
        display: grid;

        .arrow-right {
            place-self: center;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 12px solid var(--c-bg-arrow);
            display: inline-block;
            width: 0;
            height: 0;
        }
    }

    &:hover {
        box-shadow: inset 0px 0px 4px 0px beige;
        border: 1px solid #3eaf7c;
    }
}
</style>