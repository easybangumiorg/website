<script setup>
import { defineProps } from 'vue'
import { useStore } from 'vuex';
import Card from './Card.vue'

const store = useStore()
const props = defineProps(['animations',])
</script>

<template>
    <div class="card-wrapper">
        <Card v-for="a in props.animations" :info="a" :base-url="store.state.distributive.path"/>
    </div>
</template>

<style lang="scss" scoped>
.card-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, 160px);
    grid-gap: 15px;
    grid-auto-rows: 240px;
}
</style>