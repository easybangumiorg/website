<script setup>
import { defineProps, watch, ref, onMounted } from 'vue'

const props = defineProps(['source'])

const features = ref({
    zh_info: "",
    basic: false,
    class: false,
    search: false
})

const data = ref({
    version: 'unknown'
})

function add_zh_info(msg) {
    if (features.value.zh_info) {
        features.value.zh_info += `，${msg}`
    } else {
        features.value.zh_info += msg
    }
}

function update() {
    features.value.zh_info = ''
    props.source.features.split(',').filter(i => {
        console.log(i)
        switch (i) {
            case 'basic':
                features.value.basic = true
                add_zh_info("基础")
                break;

            case 'class':
                features.value.class = true
                add_zh_info("分类")
                break;

            case 'search':
                features.value.search = true
                add_zh_info("搜索")
                break;
        }
        return true
    })
    data.value.version = 'v' + props.source.version
}

onMounted(() => {
    watch(props, () => {
        console.log("source change")
        update()
    })

    update()
})

</script>

<template>
    <div class="panel-wrapper">
        <div v-if="features.search" class="header">
            搜索栏
        </div>

        <div v-if="features.basic" class="body">
            {{ props.source }}
        </div>

        <div v-else class="body">

        </div>

        <div class="footer">
            <div class="f-l">
                源能力：{{ features.zh_info }}
            </div>
            <div class="f-r">
                {{ data.version }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.panel-wrapper {
    display: flex;
    flex-direction: column;

    .header {
        height: 48px;
        border-bottom: 1px solid var(--c-border);
    }

    .body {
        flex-grow: 1;
    }

    .footer {
        height: 24px;
        border-top: 1px solid var(--c-border);
        text-align: left;
        overflow: hidden;
        font-size: small;
        white-space: nowrap;
        font-weight: bold;
        padding-left: 8px;
        display: flex;
        overflow-y: hidden;

        .f-l {
            flex-grow: 1;
        }

        .f-r {
            text-align: right;
            padding-right: 9px;

            color: #3eaf7c;
        }
    }


}
</style>