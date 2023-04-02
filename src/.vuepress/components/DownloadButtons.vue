<script>

export default {
    data() {
        return {
            tagName: "0.0.0",
            browserDownloadUrl: "",
            nightlyTagName: "0.0.0",
            nightlyBrowserDownloadUrl: "",
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
        try {
            const data = await this.$store.dispatch("getNightlyReleaseData");
            this.$data.nightlyTagName = data.tag_name.split("-")[1];
            this.$data.nightlyBrowserDownloadUrl = data.assets[0].browser_download_url;
        } catch (e) {
            console.error(e);
        }
    },

    methods: {
        downloadStable() {
            window.location.assign(this.$data.browserDownloadUrl || "https://github.com/easybangumiorg/EasyBangumi/releases/latest");
        },
        downloadNightly() {
            window.location.assign(this.$data.nightlyBrowserDownloadUrl || "https://github.com/easybangumiorg/EasyBangumi-nightly/releases/latest");
        },
    },
};
</script>

<template>
    <div id="DownloadButtons">
        <button class="stable" @click="downloadStable">
            <span>Stable</span>
            <br />
            <span class="downloadTag">{{ $data.tagName }}</span>
        </button>
        <button class="nightly" @click="downloadNightly">
            <span>Nightly</span>
            <br />
            <span class="downloadTag">{{ $data.nightlyTagName }}</span>
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