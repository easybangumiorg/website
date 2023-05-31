<script setup>
import { defineProps, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps(['type',])
</script>

<template>
    <div v-if="props.type == 'class'" class="box-item">
        
    </div>
</template>

<style lang="scss" scoped>
    .box-item {
        background: ivory;
        height: 80px;
    }
</style>