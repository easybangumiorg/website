<script setup>
import { useStore } from 'vuex'
import { watch, ref, onMounted } from 'vue'
import CardWrapper from './CardWrapper.vue'

const store = useStore()

const data = ref({
    animations: []
})

function update() {
    data.value.animations = []
    if (store.getters.content.type != 'class') return

    fetch(`${store.state.distributive.path}/source/${store.getters.content.source}/class/${store.getters.content.tid}`)
        .then(res => res.json())
        .then(res => {
            data.value.animations = res.data
        })
        .catch(err => console.error(err))

}

onMounted(() => {
    watch(() => store.getters.content, () => {
        update()
    })

    update()
})
</script>

<template>
    <div v-if="store.getters.content.type == 'class'">
        <p>{{ store.getters.content.text }}</p>
        <CardWrapper :animations="data.animations" :tname="store.getters.content.title" />
    </div>
</template>

<style lang="scss" scoped></style>