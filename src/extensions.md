---
title: 扩展
description: 可供纯纯看番使用的扩展。
meta:
  - name: keywords
    content: 纯纯看番, Extensions, Official, Android app
lang: zh_CN
sidebar: false
---
# 扩展

这里有两篇教程

[JS仓库导入](/docs/getting-started#_1-js-仓库导入-推荐)

[APK直接安装导入](/docs/getting-started#_2-apk-直接安装导入)

<script setup>
import { onMounted, ref } from 'vue'

const plugin_list = ref([])

onMounted(() => {
  fetch("/repository/v2/index.jsonl")
    .then((response) => response.text())
    .then((jsonl) => {
      const lines = jsonl.trim().split('\n');
      const data = lines.map(line => JSON.parse(line));
      plugin_list.value = data;
    })
})
</script>

## 社区JS源

```
https://easybangumi.org/repository/v2/index.jsonl
```

<ul :class="$style.pluginList">
  <li v-for="plugin in plugin_list" :key="plugin.key" :class="$style.pluginItem">
    <div :class="$style.pluginInfo">
      <div :class="$style.pluginLabel">{{ plugin.label }}</div>
      <div :class="$style.pluginVersion">版本：{{ plugin.versionName }} ({{ plugin.versionCode }})</div>
      <div :class="$style.pluginKey">插件标识：{{ plugin.key }}</div>
    </div>
  </li>
</ul>

<style module>
.pluginList {
  list-style: none;
  padding: 0;
  margin: 24px 0;
}

.pluginItem {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
}

.pluginItem:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pluginInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pluginLabel {
  font-size: 1.2em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.pluginVersion {
  color: #6c757d;
  font-size: 0.9em;
}

.pluginKey {
  color: #6c757d;
  font-size: 0.85em;
  font-family: monospace;
}

@media (max-width: 768px) {
  .pluginItem {
    flex-direction: column;
    text-align: center;
  }
  
  .pluginCover {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style>