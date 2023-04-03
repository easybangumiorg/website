<script>
export default {
    props: ["item"],
    computed: {
        pkgId: function () {
            return this.item.pkg
        },
        pkgName: function () {
            return this.item.name
        },
        pkgVersion: function () {
            return "v" + this.item.version
        },
        iconUrl: function () {
            return `https://raw.githubusercontent.com/easybangumiorg/EasyBangumi-sources/main/icon/${this.item.icon}`
        },
        apkUrl: function () {
            return `https://raw.githubusercontent.com/easybangumiorg/EasyBangumi-sources/main/apks/${this.item.apk}`
        },
    },
};
</script>
<template>
    <div v-if="item" class="extension">
        <a :href="`#${pkgId}`" class="header-anchor" aria-hidden="true" @click.stop>#</a>
        <img class="extension-icon" :src="iconUrl" loading="lazy" width="42" height="42" />
        <div class="extension-text">
            <div class="upper">
                {{ pkgName }}
                <Badge :text="pkgVersion" />
            </div>
            <div class="lower">
                {{ pkgId }}
            </div>
        </div>
        <a :href="apkUrl" class="extension-download" title="Download APK" download>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-cloud-arrow-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708l2 2z" />
                <path
                    d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
            </svg>
            <span>Download</span>
        </a>
    </div>
</template>
<style lang="stylus">
.extension
        align-items center
        display flex
        padding 0.4em 1.5em
        .header-anchor
            padding-left 0.2em
            padding-right 0.2em
            font-size 1.4em
            opacity 0
        &:hover .header-anchor
            opacity 1
        .extension-icon
            margin-right 0.5em
        .extension-text
            flex 1
            .upper
                font-weight: 600
                .badge
                    font-weight: 400
                    margin-left 8px
            .lower
                color #6c757d
                font-family monospace
                font-size 0.9rem
        .extension-download
            margin-right 0.5em
            padding-left 1rem
            padding-right 1rem
            padding-top .5rem
            padding-bottom .5rem
            font-weight 700
            border-radius 4px
            color white
            background-color $accentColor
            border 1px solid $accentColor
            .material-icons
                color white
                max-width 18px
            &:hover
                background-color white
                color $accentColor
                text-decoration none
                .material-icons
                    color $accentColor
        @media (max-width 767px)
            padding 0.4em 0em
            .extension-text .lower,
            .extension-download span
                display none
    @media (max-width 767px)
        .extension
            border 1px solid $borderColor
            border-radius 8px
            .extension-download
                background-color $accentColor
    &:target
        .extension
            background-color $containerBackground
            border-radius 8px
            transition 500ms background-color
</style>