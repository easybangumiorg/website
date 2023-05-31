<script setup>
import { defineProps, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps(['source',])

const icon = computed(() => {
    if (props.source.icon) {
        return props.source.icon
    } else {
        return "/icons/FAVICON-RAW.png"
    }
})

const isActive = computed(() => props.source.tag == store.state.source.choose)

function choose() {
    store.dispatch('chooseSource', props.source.tag)
}
</script>

<template>
    <div class="box">
        <button :title="props.source.name" :class="{ active: isActive }" @click="choose">
            <img :src="icon" :alt="props.source.name">
        </button>
    </div>
</template>

<style lang="scss" scoped>
.box {
    display: grid;

    .active {
        border: 2px solid #3eaf7c;
        outline: none;
    }

    button {
        background-color: rgba(255, 255, 255, 0);
        place-self: center;
        height: 50px;
        width: 50px;
        cursor: pointer;
        border: 0px solid #dcdfe6;
        border-radius: 25px;
        overflow: hidden;
        padding: 0%;

        &:focus {
            box-shadow: inset 0px 0px 2px 0px beige;
            outline: none;
        }

        &:hover {
            border: 2px solid #3eaf7c;
        }

        img {
            place-self: center;
            height: 50px;
            width: 50px;
        }
    }


}
</style>