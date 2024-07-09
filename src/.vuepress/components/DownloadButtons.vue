<script setup>
import { useStore } from 'vuex'
import { onMounted, ref, computed } from 'vue'

const store = useStore()

const data = ref({
  tag: "x.x.x",
  branch: "main",
  author: "unknown",
  version_list: []
})

onMounted(async () => {
  const stable_data = await store.dispatch("getStableReleaseData")
  data.value.tag = stable_data.tag_name
  data.value.branch = stable_data.target_commitish
  data.value.author = stable_data.author.login
  data.value.version_list = stable_data.assets
})

const download = (url) => {
  window.location.assign(url)
}

const parseVersion = (version) => {
  version = version.replace("easybangumi", "")
  version = version.replace(".apk", "")
  version = version.replace(data.value.tag, "")
  version = version.replaceAll("-", " ")
  version = version.trim()
  if (version === "") {
    version = "Universal"
  }
  return version
}

const totalDownload = computed(() => {
  return data.value.version_list.reduce((acc, cur) => acc + cur.download_count, 0)
})

</script>

<template>
  <div id="DownloadButtons">
    <button class="stable" v-for="dlinfo in data.version_list" :id="dlinfo.id"
      @click="download(data.browser_download_url)">
      <span>{{ data.tag }}</span>
      <br>
      <span class="downloadTag">{{ parseVersion(dlinfo.name) }}</span>
    </button>
    <span class="versionNotice">
      需要<strong>Android 6.0</strong>或更高版本。
    </span>
  </div>
</template>

<style lang="scss">
#DownloadButtons {
  text-align: center;

  button {
    outline: 0;
    cursor: pointer;

    font-size: 1.125rem;
    color: #ffffff;
    line-height: 1;

    margin: 0 0.5em !important;
    padding: 1.2rem 32px;
    border-radius: 0.5rem;
    border: 1px solid #dcdfe6;

    width: 10em;
    display: inline-block;
    box-sizing: border-box;

    &:focus {
      box-shadow: 0 0 30px #b1aeae52, 0 0 0 1px #fff, 0 0 0 3px rgba(50, 100, 150, 0.4);
      outline: none;
    }

    .downloadTag {
      font-size: 0.7em;
      margin-top: 2px;
    }
  }

  .stable {
    background-color: rgb(93 103 232 / var(--tw-bg-opacity));
    border-color: rgb(93 103 232 / var(--tw-bg-opacity));

    &:hover {
      background-color: lighten(rgb(93 103 232), 10%);
      border-color: lighten(rgb(93 103 232), 10%);
    }
  }

  .nightly {
    background-color: #2e84bf;
    border-color: #2e84bf;

    &:hover {
      background-color: lighten(#2e84bf, 10%);
      border-color: lighten(#2e84bf, 10%);
    }
  }

  .versionNotice {
    display: block;
    font-size: 0.9rem;
  }
}
</style>
