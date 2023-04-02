<script>

export default {
    data() {
        return {
            tagName: "0.0.0",
            browserDownloadUrl: "",
        };
    },

    async mounted() {
        try {
            const data = await this.$store.dispatch("getStableReleaseData");
            this.$data.tagName = data.tag_name;
            this.$data.browserDownloadUrl = data.assets[0].browser_download_url;
        } catch (e) {
            console.error(e);
        }
    },

    methods: {
        downloadStable() {
            window.location.assign(this.$data.browserDownloadUrl || "https://github.com/tachiyomiorg/tachiyomi/releases/latest");
        },
    },
};
</script>

<template>
    <div id="DownloadButtons">
        <button type="success" @click="downloadStable">
            <span>Stable</span>
            <br />
            <span class="downloadTag">{{ $data.tagName }}</span>
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
        background-color #2e84bf
        border-color #2e84bf
        &:focus
            box-shadow 0 0 30px #b1aeae52, 0 0 0 1px #fff, 0 0 0 3px rgba(50, 100, 150, 0.4)
            outline none
        &:hover
            background-color lighten(#2e84bf, 10%)
            border-color lighten(#2e84bf, 10%)
        .downloadTag
            font-size 0.7em
            margin-top 2px
    .versionNotice
        display block
        font-size 0.9rem
</style>