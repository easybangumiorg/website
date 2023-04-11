<script>
import moment from 'moment'

export default {
    props: {
        stable: {
            type: Boolean,
            default: false,
        },
        nightly: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            stablePublishRelative: "at an unknown time",
            stablePublishExact: "Can't connect to GitHub.",
            nightlyPublishRelative: "at an unknown time",
            nightlyPublishExact: "Can't connect to GitHub.",
        };
    },
    async mounted() {
        try {
            const data = await this.$store.dispatch("getStableReleaseData");
            this.$data.stablePublishRelative = moment(data.published_at).fromNow();
            this.$data.stablePublishExact = moment(data.published_at).format("dddd, MMMM Do YYYY [at] HH:mm");
        } catch (e) {
            console.error(e);
        }
        try {
            const data = await this.$store.dispatch("getNightlyReleaseData");
            this.$data.nightlyPublishRelative = moment(data.published_at).fromNow();
            this.$data.nightlyPublishExact = moment(data.published_at).format("dddd, MMMM Do YYYY [at] HH:mm");
        } catch (e) {
            console.error(e);
        }
    },
};
</script>

<template>
    <div v-if="stable" class="buildTime">
        <span>{{ stablePublishRelative }}</span>
    </div>
    <div v-else-if="nightly" class="buildTime">
        <span>{{ nightlyPublishRelative }}</span>
    </div>
    <span v-else>You need to specify props.</span>
</template>

<style lang="scss" scoped>
.buildTime {
    font-weight: 500;
    display: inline-block;
}
</style>