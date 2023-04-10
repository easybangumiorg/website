<script>
    import DownloadButtons from './DownloadButtons.vue'
    import WhatsNew from './WhatsNew';
    export default {
        components:{
            WhatsNew,
            DownloadButtons
        },
        beforeMount(){
            this.$store.dispatch('getStableReleaseData')
            this.$store.dispatch('getNightlyReleaseData')
        }
    }
</script>
<template>
    <div>
        <DownloadButtons/>
        <WhatsNew/>
    </div>
</template>