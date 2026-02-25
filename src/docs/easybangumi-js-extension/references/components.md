# 纯纯看番 JS 源扩展 - 组件详解

本文件详细介绍纯纯看番 JS 源扩展的五大核心组件。

## 目录

1. [PreferenceComponent](#1-preferencecomponent-偏好设置组件)
2. [PageComponent](#2-pagecomponent-页面呈现组件)
3. [SearchComponent](#3-searchcomponent-搜索组件)
4. [DetailedComponent](#4-detailedcomponent-详情组件)
5. [PlayComponent](#5-playcomponent-播放组件)

---

## 1. PreferenceComponent 偏好设置组件

用于定义用户可配置的选项，如网站地址、画质选择等。

### 函数签名

```javascript
function PreferenceComponent_getPreference() -> ArrayList<SourcePreference>
```

### 偏好设置类型

```javascript
// 文本输入框
var edit = new SourcePreference.Edit("网站地址", "Host", "https://example.com");

// 开关
var sw = new SourcePreference.Switch("启用高清", "EnableHd", true);

// 选择器
var sel = new SourcePreference.Selection(
    "画质选择",           // 标签
    "Quality",           // 键
    "1080P",             // 默认值
    ["1080P", "720P"]    // 选项列表
);
```

### 完整示例

```javascript
function PreferenceComponent_getPreference() {
    var res = new ArrayList();

    // 网站地址（必填）
    var host = new SourcePreference.Edit(
        "网页地址",
        "Host",
        "https://www.example.com"
    );
    res.add(host);

    // 是否启用高清
    var enableHd = new SourcePreference.Switch(
        "启用高清",
        "EnableHd",
        true
    );
    res.add(enableHd);

    // 画质选择
    var quality = new SourcePreference.Selection(
        "默认画质",
        "Quality",
        "1080P",
        ["1080P", "720P", "480P"]
    );
    res.add(quality);

    return res;
}
```

### 读取配置值

```javascript
var host = preferenceHelper.get("Host", "https://default.com");
var enableHd = preferenceHelper.get("EnableHd", "true") == "true";
var quality = preferenceHelper.get("Quality", "1080P");
```

---

## 2. PageComponent 页面呈现组件

负责展示主页内容列表，支持单页和分组标签。

### 函数签名

```javascript
function PageComponent_getMainTabs() -> ArrayList<MainTab>
function PageComponent_getSubTabs(mainTab: MainTab) -> ArrayList<SubTab>
function PageComponent_getContent(mainTab, subTab, key) -> Pair<nextKey, ArrayList<CartoonCover>>
```

### getMainTabs - 获取主标签

```javascript
function PageComponent_getMainTabs() {
    var res = new ArrayList();

    // 带封面的单页（最常用）
    res.add(new MainTab("番剧", MainTab.MAIN_TAB_WITH_COVER));
    res.add(new MainTab("电影", MainTab.MAIN_TAB_WITH_COVER));

    // 分组标签（包含子标签）
    res.add(new MainTab("时刻表", MainTab.MAIN_TAB_GROUP));

    return res;
}
```

### getSubTabs - 获取子标签（仅分组标签使用）

```javascript
function PageComponent_getSubTabs(mainTab) {
    var res = new ArrayList();

    if (mainTab.label == "时刻表") {
        var doc = getDoc("/schedule");
        var days = doc.select(".day-list");

        for (var i = 0; i < days.size(); i++) {
            var day = days.get(i);
            var label = day.select(".day-title").text();

            // 预加载内容到 ext
            var contentList = new ArrayList();
            var items = day.select(".anime-item");
            for (var j = 0; j < items.size(); j++) {
                var item = items.get(j);
                contentList.add(makeCartoonCover({
                    id: item.attr("data-id"),
                    title: item.select(".title").text(),
                    cover: item.select("img").attr("src"),
                    url: item.attr("href")
                }));
            }

            var key = label + System.currentTimeMillis();
            subTabTemp.put(key, contentList);

            // SubTab(label, active, ext)
            res.add(new SubTab(label, true, key));
        }
    }

    return res;
}
```

### getContent - 获取页面内容

```javascript
function PageComponent_getContent(mainTab, subTab, key) {
    // 处理带封面的主标签
    if (mainTab.type == MainTab.MAIN_TAB_WITH_COVER) {
        var url = "/list?page=" + (key + 1);
        var doc = getDoc(url);
        var list = new ArrayList();

        var items = doc.select(".anime-item");
        for (var i = 0; i < items.size(); i++) {
            var item = items.get(i);
            list.add(makeCartoonCover({
                id: item.attr("data-id"),
                title: item.select(".title").text(),
                cover: item.select("img").attr("src"),
                url: item.attr("href")
            }));
        }

        // 无更多数据
        if (list.size() == 0) {
            return new Pair(null, new ArrayList());
        }
        return new Pair(key + 1, list);
    }

    // 处理分组标签的子标签
    if (mainTab.type == MainTab.MAIN_TAB_GROUP) {
        var cachedList = subTabTemp.get(subTab.ext);
        return new Pair(null, cachedList);
    }

    return new Pair(null, new ArrayList());
}
```

---

## 3. SearchComponent 搜索组件

负责搜索功能。

### 函数签名

```javascript
function SearchComponent_search(page: number, keyword: string) -> Pair<nextKey, ArrayList<CartoonCover>>
```

### 完整示例

```javascript
function SearchComponent_search(page, keyword) {
    // page: 当前页码（从 0 开始）
    // keyword: 搜索关键词（已 URL 编码）

    var url = "/search?q=" + keyword + "&page=" + (page + 1);
    var doc = getDoc(url);

    var results = new ArrayList();
    var items = doc.select(".search-item");

    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);
        results.add(makeCartoonCover({
            id: item.attr("data-id"),
            title: item.select(".title").text(),
            cover: item.select("img").attr("src"),
            url: item.attr("href"),
            intro: item.select(".desc").text()
        }));
    }

    if (results.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(page + 1, results);
}
```

---

## 4. DetailedComponent 详情组件

负责获取番剧详情和播放线路。

### 函数签名

```javascript
function DetailedComponent_getDetailed(summary: CartoonSummary) -> Pair<Cartoon, ArrayList<PlayLine>>
```

### 完整示例

```javascript
function DetailedComponent_getDetailed(summary) {
    var url = "/detail/" + summary.id;
    var doc = getDoc(url);

    var cartoon = detailed(doc, summary);
    var playLines = playline(doc, summary);

    return new Pair(cartoon, playLines);
}

// 构建详情信息
function detailed(doc, summary) {
    // 提取类型列表
    var genreList = new ArrayList();
    var genres = doc.select(".genre a");
    for (var i = 0; i < genres.size(); i++) {
        genreList.add(genres.get(i).text());
    }

    return makeCartoon({
        id: summary.id,
        url: SourceUtils.urlParser(getRootUrl(), "/detail/" + summary.id),
        source: summary.source,
        title: doc.select("h1.title").text(),
        genreList: genreList,
        cover: doc.select(".cover img").attr("src"),
        intro: doc.select(".intro").text(),
        description: doc.select(".description").text(),
        status: Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS,
        isUpdate: false
    });
}

// 构建播放线路
function playline(doc, summary) {
    var playLines = new ArrayList();
    var tabs = doc.select(".tab-item");
    var episodeLists = doc.select(".episode-list");

    for (var i = 0; i < tabs.size() && i < episodeLists.size(); i++) {
        var tab = tabs.get(i);
        var episodes = episodeLists.get(i);

        var episodeList = new ArrayList();
        var links = episodes.select("a");

        for (var j = 0; j < links.size(); j++) {
            var link = links.get(j);
            episodeList.add(new Episode(
                link.attr("data-episode-id"),
                link.text(),
                j
            ));
        }

        playLines.add(new PlayLine(
            tab.attr("data-line-id"),
            tab.text(),
            episodeList
        ));
    }

    return playLines;
}
```

---

## 5. PlayComponent 播放组件

负责获取实际播放地址。

### 函数签名

```javascript
function PlayComponent_getPlayInfo(summary, playLine, episode) -> PlayerInfo
```

### 播放类型

```javascript
PlayerInfo.DECODE_TYPE_OTHER  // 普通视频 (mp4 等)
PlayerInfo.DECODE_TYPE_HLS    // HLS 流 (m3u8)
```

### 完整示例

```javascript
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = "/play/" + summary.id + "-" + playLine.id + "-" + episode.id;
    var doc = getDoc(url);

    // 方式 1: 直接解析 video 标签
    var videoUrl = doc.select("video source").attr("src");

    // 方式 2: 从 JSON 中提取
    if (!videoUrl) {
        var jsonText = doc.toString();
        var pattern = /"url"\s*:\s*"([^"]+)"/;
        var match = jsonText.match(pattern);
        if (match) {
            videoUrl = match[1].replace(/\\\//g, "/");
        }
    }

    // 方式 3: 使用 WebView 代理（处理动态加载）
    if (!videoUrl) {
        var webProxy = webProxyProvider.getWebProxy();
        webProxy.loadUrl(
            SourceUtils.urlParser(getRootUrl(), url),
            networkHelper.defaultLinuxUA
        );
        webProxy.waitingForPageLoaded(10000);
        videoUrl = webProxy.waitingForResourceLoaded(".*\\.m3u8", true, 15000);
    }

    // 判断类型
    var type = PlayerInfo.DECODE_TYPE_OTHER;
    if (videoUrl && videoUrl.indexOf(".m3u8") > -1) {
        type = PlayerInfo.DECODE_TYPE_HLS;
    }

    return new PlayerInfo(type, videoUrl);
}
```

---

## 辅助函数模板

```javascript
// 获取根 URL
function getRootUrl() {
    return preferenceHelper.get("Host", "https://example.com");
}

// 获取 HTML 文档
function getDoc(url) {
    var fullUrl = SourceUtils.urlParser(getRootUrl(), url);
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(fullUrl)
    );
    var response = req.execute();
    return Jsoup.parse(response.body().string());
}

// 通用请求函数
function fetch(url, headers) {
    var builder = new Request.Builder().url(url);
    if (headers) {
        for (var key in headers) {
            builder.header(key, headers[key]);
        }
    }
    var req = okhttpHelper.client.newCall(builder.build());
    return req.execute();
}
```
