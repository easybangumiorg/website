<script setup>
import Artplayer from "./webapp/Artplayer.vue";
import { ref } from "vue"

const data = ref({
    option: {
        url: "path/to/video.mp4",
    },
    style: {
        width: "600px",
        height: "400px",
        margin: "60px auto 0",
    },
})

function getInstance(art) {
    console.info(art);
}

</script>

<template>
    <div>
        <h1>测试页面</h1>
        <Artplayer @get-instance="getInstance" :option="data.option" :style="data.style" />
    </div>
</template>
