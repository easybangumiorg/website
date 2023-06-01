<script setup>
import { useStore } from "vuex";
import { watch, ref, onMounted, onBeforeUnmount, computed } from "vue";
import Artplayer from "artplayer";

const store = useStore();
const data = ref({
    id: null,
    tid: null,
    title: "未知",
    coverUrl: "未知",
    description: "未知",
    tags: "未知",
    actor: "未知",
    director: "未知",
    writer: "未知",
    pubdate: "未知",
    score: null,
    source: "未知",
    play_list: [],
    isArtShow: false,
    artInstance: null,
});

function update() {
    fetch(
        `${store.state.distributive.path}/source/${store.getters.content.source}/id/${store.getters.content.payload.id}`
    )
        .then((res) => res.json())
        .then((res) => {
            data.value.id = res.data.id;
            data.value.tid = res.data.tid;
            data.value.title = res.data.title;
            data.value.coverUrl = res.data.coverUrl;
            data.value.description = res.data.description;
            data.value.tags = res.data.tags;
            data.value.actor = res.data.actor;
            data.value.director = res.data.director;
            data.value.writer = res.data.writer;
            data.value.pubdate = res.data.pubdate;
            data.value.score = res.data.score;
            data.value.source = res.data.source;

            // 解算播放号
            const play_line = res.data.play_list;
            const line = []
            let line_n = 0
            for (let l in play_line) {
                const line_info = play_line[l]
                const episods = []

                for (let e in line_info) {
                    episods.push({
                        index: e,
                        name: line_info[e]
                    })
                }

                line.push({
                    index: line_n,
                    name: l,
                    episods
                })

                line_n++
            }
            data.value.play_list = line
            play(0, 0)
        })
        .catch((err) => console.error(err));
}

function play(line, episod) { // artplayerApp
    destroyInstance()
    data.value.artInstance = null

    fetch(`${store.state.distributive.path}/source/${data.value.source}/id/${data.value.id}/line/${line}/episod/${episod}`)
        .then(res => res.json())
        .then(res => {
            data.value.isArtShow = true

            const artOptions = {
                container: "#artplayerApp",
                theme: '#3eaf7c',
                autoMini: true,
                playbackRate: true,
                pip: true,
                fullscreen: true,
                fullscreenWeb: true,
            }

            if (res.data.path.startsWith("http")) {
                data.value.artInstance = new Artplayer({
                    url: res.data.path,
                    ...artOptions
                })
            } else {
                data.value.artInstance = new Artplayer({
                    url: `${store.state.distributive.path}${encodeURI(res.data.path).replace(/%5C/g, '/')}`,
                    ...artOptions
                })
            }

        })
        .catch(err => console.log(err))
}

function destroyInstance() {
    data.value.isArtShow = false
    if (data.value.artInstance && data.value.artInstance.destroy) {
        data.value.artInstance.destroy(false);
    }
}

onBeforeUnmount(() => {
    destroyInstance()
})

onMounted(() => {
    watch(
        () => store.getters.content,
        () => {
            destroyInstance()
            update();
        }
    );
    update();
});
</script>

<template>
    <div v-if="store.getters.content.type == 'play'">

        <div class="info-wrapper">
            <div class="img-box">
                <img :src="store.state.distributive.path + data.coverUrl" alt="" />
            </div>
            <div class="info">
                <h2>{{ data.title }}</h2>
                <p>{{ data.description }}</p>
                <p class="info-pair"><span>放映日期：</span>{{ data.pubdate }}</p>
                <p class="info-pair"><span>参演：</span>{{ data.actor }}</p>
                <p class="info-pair"><span>导演：</span>{{ data.director }}</p>
                <p class="info-pair"><span>编剧：</span>{{ data.writer }}</p>
                <p class="info-pair"><span>标签：</span>{{ data.tags }}</p>
            </div>
        </div>

        <div class="play-list">
            <h2>播放列表</h2>
            <div v-for="l in data.play_list" class="play-list-content">
                <h5>{{ l.name }}</h5>
                <div class="play-list-buttons">
                    <button v-for="e in l.episods" @click="play(l.index, e.index)">{{ e.name }}</button>
                </div>
            </div>
        </div>

        <div :class="{ 'artplayer-app': data.isArtShow }" id="artplayerApp"></div>

    </div>
</template>

<style lang="scss" scoped>
.artplayer-app {
    height: 480px;
    margin: 20px auto 0;
}

.play-list {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    padding: 10px;

    .play-list-content {
        padding-bottom: 10px;

        h5 {
            margin: 8px;
        }

        .play-list-buttons {
            margin: 0px 8px;
            display: grid;
            grid-template-columns: repeat(auto-fill, 64px);
            grid-gap: 8px;

            button {
                height: 28px;
                background: none;
                border: 1px solid #dcdfe6;
                border-radius: 3px;
                cursor: pointer;
                color: #ffffff;

                background-color: #3eaf7c;
                border-color: #3eaf7c;

                &:hover {
                    background-color: lighten(#3eaf7c, 10%);
                    border-color: lighten(#3eaf7c, 10%);
                }
            }
        }
    }

    h2 {
        margin: 0px 8px;
    }
}

.info-wrapper {
    margin-top: 10px;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto auto;
    grid-gap: 20px 5px;

    .img-box {
        height: 220px;
        position: relative;
        border-radius: 5px;

        img {
            height: 100%;
            width: auto;
            max-width: 180px;
            object-fit: cover;
            object-position: center;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 5px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
        }
    }

    .info {
        padding: 0 15px;

        h2,
        h4 {
            padding: 0;
            margin: 0;
        }

        .info-pair {
            font-size: small;
            margin: 0;

            span {
                font-weight: bold;
            }
        }
    }
}

@media all and (min-width: 720px) {
    .info-wrapper {
        grid-template-columns: 180px auto;
    }
}
</style>
