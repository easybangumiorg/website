<script>
import ExtensionItem from "./ExtensionItem.vue";

export default {
    components: { ExtensionItem },
    props: ["list", "totalCount"],
};
</script>

<template>
    <div class="extension-group">
        <h3>
            ALL

            <span class="extensions-total">
                Total:
                <span class="extensions-total-sum">
                    {{ totalCount }}
                </span>
            </span>
        </h3>
        <div v-for="extension in list" :id="extension.package" :key="extension.package" class="anchor">
            <ExtensionItem :item="extension" />
        </div>
    </div>
</template>

<style lang="scss">
.extensions-total {
    float: right;

    &-sum {
        color: #3eaf7c;
    }
}

.anchor {
    margin-top: -3.9em;
    padding-bottom: 0.2em;
    padding-top: 4.5em;

    &:first-child {
        border-top: 1px solid #3eaf7c;
    }
}
</style>
