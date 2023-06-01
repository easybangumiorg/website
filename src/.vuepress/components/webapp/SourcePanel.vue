<script setup>
import { defineProps, watch, ref, onMounted } from "vue";
import { useStore } from "vuex";
import SourceItem from "./SourceItem.vue";

const store = useStore();
const props = defineProps(["source"]);

const features = ref({
    zh_info: "",
    basic: false,
    class: false,
    search: false,
});

const data = ref({
    version: "unknown",
    name: "未知源",
    description: "未知描述",
    source: "",
    class: [],
});

function add_zh_info(msg) {
    if (features.value.zh_info) {
        features.value.zh_info += `，${msg}`;
    } else {
        features.value.zh_info += msg;
    }
}

function update() {
    if (!props.source) return;
    features.value.zh_info = "";
    features.value.basic = false;
    features.value.class = false;
    features.value.search = false;
    data.value.class = [];
    props.source.features.split(",").filter((i) => {
        switch (i) {
            case "basic":
                features.value.basic = true;
                add_zh_info("基础");
                break;

            case "class":
                features.value.class = true;
                add_zh_info("分类");
                break;

            case "search":
                features.value.search = true;
                add_zh_info("搜索");
                break;
        }
        return true;
    });
    data.value.version = "v" + props.source.version;
    data.value.name = props.source.name;
    data.value.description = props.source.description;
    data.value.source = props.source.tag;

    if (features.value.class)
        fetch(`${store.state.distributive.path}/source/${data.value.source}/class`)
            .then((res) => res.json())
            .then((res) => {
                data.value.class = res.data;
            })
            .catch((err) => console.error(err));
}

onMounted(() => {
    watch(props, () => {
        update();
    });

    update();
});
</script>

<template>
    <div class="panel-wrapper">
        <div class="header">
            <div class="title">
                <h6>{{ data.name }}</h6>
                <span>{{ data.description }}</span>
            </div>
            <div v-if="features.search" class="search">搜索栏占位</div>
        </div>

        <div v-if="features.basic" class="body">
            <SourceItem v-for="d in data.class" type="class" :data="d" />
        </div>

        <div v-else class="body">
            <span>源不具备索引能力</span>
        </div>

        <div class="footer">
            <div class="f-l">源能力：{{ features.zh_info }}</div>
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
        height: 54px;
        border-bottom: 1px solid var(--c-border);
        display: flex;
        flex-direction: row;
        overflow: hidden;

        .title {
            flex-grow: 1;

            h6 {
                padding-top: 6px;
                padding-left: 9px;
                margin: 0;
            }

            span {
                padding-left: 9px;
                font-size: xx-small;
                font-weight: lighter;
            }
        }

        .search {
            width: 48px;
        }
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
            padding-top: 2px;
        }

        .f-r {
            text-align: right;
            padding-right: 9px;
            padding-top: 2px;
            color: #3eaf7c;
        }
    }
}
</style>
