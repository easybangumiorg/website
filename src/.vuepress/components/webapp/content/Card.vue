<script setup>
import { defineProps } from 'vue'

const props = defineProps(['info', 'baseUrl'])
</script>

<template>
    <div class="card">
        <div class="img-box">
            <img :src="props.baseUrl + props.info.coverUrl" :alt="props.info.title">
        </div>
        <div class="title-box">
            <h5>{{ props.info.title }}</h5>
            <span>{{ props.info.pubdate }}</span>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.card {
    width: 160px;
    height: 240px;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    .img-box {
        height: 180px;
        overflow: hidden;
        position: relative;

        border-bottom: 1px solid #dcdfe6;

        img {
            width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .title-box {
        flex-grow: 1;
        overflow: hidden;

        h5 {
            margin: 6px 8px 0px;
        }

        span {
            margin: 0px 8px;
            font-size: small;
            font-weight: lighter;
        }
    }
}
</style>