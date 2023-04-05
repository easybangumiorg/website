<script>
import {mapState} from 'vuex'
export default {

    computed:{
        ...mapState(['stable','nightly']),
        tagName(){
            return (this.stable.data && this.stable.data.tag_name)||'loading'
        },
        nightlyTagName(){
            return (this.nightly.data && this.nightly.data.tag_name)||'loading'
        },
        stableReleaseDate(){
            return this.getReleaseDateFromRelease(this.stable.data)
        },

        nightlyReleaseDate(){
            return this.getReleaseDateFromRelease(this.nightly.data)
        }
    },

    methods: {
        downloadStable() {
            this.downloadApk(this.stable.data)
        },
        downloadNightly() {
            this.downloadApk(this.nightly.data)
        },
        getReleaseDateFromRelease(release){
            const time = release && release.published_at
            if(!time){
                return
            }
            return this.$moment(time).fromNow()
        },
        downloadApk(release,fallbackUrl){
            let apkUrl;
            if (release&&release.assets) {
                release.assets.some(asset=>{
                    if (asset.browser_download_url.endsWith('.apk')) {
                        apkUrl = asset.browser_download_url
                        return true
                    }
                    return false
                })
            }
            location.assign(apkUrl||fallbackUrl)
        }
    },
};
</script>

<template>
    <div id="DownloadButtons">
        <button class="stable" @click="downloadStable" :disabled="!stable.data">
            <span>Stable</span>
            <br>
            <span class="downloadTag">{{ tagName }}</span> 
            <br>
            <span class="downloadTag" v-if="stableReleaseDate">{{ stableReleaseDate }}</span>
        </button>
        <button class="nightly" @click="downloadNightly" :disabled="!nightly.data">
            <span>Nightly</span>
            <br>
            <span class="downloadTag">{{ nightlyTagName }}</span>
            <br>
            <span class="downloadTag" v-if="nightlyReleaseDate">{{ nightlyReleaseDate }}</span>
        </button>
        <span class="versionNotice">
            Requires
            <strong>Android 6.0</strong>
            or higher.
        </span>
    </div>
</template>

<style lang="stylus">
#DownloadButtons
    text-align center
    button
        outline 0
        cursor pointer

        font-size 1.125rem
        color #ffffff
        line-height 1

        margin 0.1em !important
        padding 12px 32px
        border-radius 0.2rem
        border 1px solid #dcdfe6

        width 10em
        display inline-block
        box-sizing border-box

        &:focus
            box-shadow 0 0 30px #b1aeae52, 0 0 0 1px #fff, 0 0 0 3px rgba(50, 100, 150, 0.4)
            outline none

        .downloadTag
            font-size 0.7em
            margin-top 2px

    .stable
        background-color #3eaf7c
        border-color #3eaf7c
        &:hover
            background-color lighten(#3eaf7c, 10%)
            border-color lighten(#3eaf7c, 10%)

    .nightly
        background-color #2e84bf
        border-color #2e84bf
        &:hover
            background-color lighten(#2e84bf, 10%)
            border-color lighten(#2e84bf, 10%)

    .versionNotice
        display block
        font-size 0.9rem
</style>