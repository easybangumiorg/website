# 纯纯看番 JS 源扩展 - 最佳实践

## 目录

1. [代码组织](#1-代码组织)
2. [选择器优化](#2-选择器优化)
3. [空值安全](#3-空值安全)
4. [性能优化](#4-性能优化)
5. [处理反爬](#5-处理反爬)
6. [错误处理](#6-错误处理)
7. [调试技巧](#7-调试技巧)

---

## 1. 代码组织

### 推荐结构

```javascript
// ===== 元数据 =====
// @key com.example.anime
// @label 示例动漫源
// @versionName 1.0.0
// @versionCode 1
// @libVersion 13
// @cover https://example.com/logo.png

// ===== 注入依赖 =====
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;
var webProxyProvider = Inject_WebProxyProvider;

// ===== 组件函数 =====
function PreferenceComponent_getPreference() { ... }
function PageComponent_getMainTabs() { ... }
function PageComponent_getSubTabs(mainTab) { ... }
function PageComponent_getContent(mainTab, subTab, key) { ... }
function DetailedComponent_getDetailed(summary) { ... }
function SearchComponent_search(page, keyword) { ... }
function PlayComponent_getPlayInfo(summary, playLine, episode) { ... }

// ===== 业务函数 =====
function getRootUrl() { ... }
function getDoc(url) { ... }
function getContentList(url) { ... }
function detailed(doc, summary) { ... }
function playline(doc, summary) { ... }
```

### 提取公共函数

```javascript
// 不好的做法：重复代码
function PageComponent_getContent(mainTab, subTab, key) {
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(getPreferenceHelper().get("Host") + "/list?page=" + key)
    );
    ...
}

function SearchComponent_search(page, keyword) {
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(getPreferenceHelper().get("Host") + "/search?q=" + keyword)
    );
    ...
}

// 好的做法：提取公共函数
function getDoc(url) {
    var fullUrl = SourceUtils.urlParser(getRootUrl(), url);
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(fullUrl)
    );
    return Jsoup.parse(req.execute().body().string());
}

function getRootUrl() {
    return preferenceHelper.get("Host", "https://example.com");
}
```

---

## 2. 选择器优化

### 好的选择器

```javascript
// 具体且稳定
doc.select(".module-item a.title")
doc.select("div#content article.post")
doc.select("[data-type='anime']")
doc.select("a[href^='/detail/']")
```

### 避免的选择器

```javascript
// 过于依赖位置
doc.select("body > div > div:nth-child(3) > a")
doc.select(".container > div:nth-child(2) > ul > li:nth-child(1)")

// 易变的类名
doc.select(".css-1a2b3c4")  // CSS-in-JS 生成的类名
doc.select(".sc-bdVaJa")    // 混淆类名
```

### 容错处理

```javascript
// 提供多个备选选择器
var title = doc.select("h1.title").first();
if (title == null) {
    title = doc.select(".video-title").first();
}
if (title == null) {
    title = doc.select("[data-name]").first();
}
var titleText = title != null ? title.text() : "未知标题";
```

---

## 3. 空值安全

### 始终检查元素是否存在

```javascript
// 不好的做法：可能 NPE
var coverUrl = doc.select(".cover img").first().attr("src");

// 好的做法：检查 null
var imgEle = doc.select(".cover img").first();
var coverUrl = "";
if (imgEle != null) {
    coverUrl = imgEle.attr("src");
}
```

### 使用三元运算符

```javascript
var titleEle = doc.select(".title").first();
var title = titleEle != null ? titleEle.text() : "未知标题";

var introEle = doc.select(".intro").first();
var intro = introEle != null ? introEle.text() : "";
```

### 默认值处理

```javascript
function getRootUrl() {
    // 提供默认值
    return preferenceHelper.get("Host", "https://example.com");
}

var episodeId = link.attr("data-id");
if (episodeId == null || episodeId.isEmpty()) {
    episodeId = link.attr("href").replace("/detail/", "");
}
```

---

## 4. 性能优化

### 避免循环中重复选择

```javascript
// 不好的做法
for (var i = 0; i < items.size(); i++) {
    var item = items.get(i);
    var title = doc.select(".item .title").get(i).text();  // 每次都重新选择
}

// 好的做法
var items = doc.select(".item");
for (var i = 0; i < items.size(); i++) {
    var item = items.get(i);
    var title = item.select(".title").text();  // 在当前元素上选择
}
```

### 缓存常用值

```javascript
// 缓存根 URL
var ROOT_URL = null;
function getRootUrl() {
    if (ROOT_URL == null) {
        ROOT_URL = preferenceHelper.get("Host", "https://example.com");
    }
    return ROOT_URL;
}
```

### 预编译正则

```javascript
// 在函数外定义正则
var urlPattern = /"url"\s*:\s*"([^"]+)"/;

function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var match = doc.toString().match(urlPattern);
    ...
}
```

---

## 5. 处理反爬

### 使用 CloudflareClient

```javascript
// 自动处理 Cloudflare 防护
var req = okhttpHelper.cloudflareWebViewClient.newCall(
    OkhttpUtils.get(url)
);
var response = req.execute();
```

### 设置合理的 User-Agent

```javascript
var request = new Request.Builder()
    .url(url)
    .header("User-Agent", networkHelper.defaultLinuxUA)
    .build();
```

### 使用 WebView 代理

```javascript
// 处理需要 JS 渲染的网站
var webProxy = webProxyProvider.getWebProxy();
webProxy.loadUrl(url, networkHelper.defaultLinuxUA);
webProxy.waitingForPageLoaded(10000);
var content = webProxy.getContent();
webProxy.close();
```

### 添加 Referer

```javascript
var request = new Request.Builder()
    .url(videoUrl)
    .header("Referer", getRootUrl())
    .header("User-Agent", networkHelper.defaultLinuxUA)
    .build();
```

---

## 6. 错误处理

### 捕获异常

```javascript
try {
    var doc = getDoc(url);
    var content = parseContent(doc);
    return new Pair(key + 1, content);
} catch (e) {
    Log.e("MyAnime", "获取内容失败：" + e.message);
    throw new ParserException("获取内容失败：" + e.message);
}
```

### 抛出异常

```javascript
// 视频地址解析失败
if (!videoUrl) {
    throw new ParserException("视频地址解析失败");
}

// 元素不存在
if (titleEle == null) {
    throw new ParserException("无法找到标题元素");
}
```

### 返回空结果

```javascript
// 无更多数据时返回空列表
if (items.size() == 0) {
    return new Pair(null, new ArrayList());
}
```

---

## 7. 调试技巧

### 日志输出

```javascript
// 在关键位置添加日志
Log.d("MyAnime", "请求 URL: " + url);
Log.d("MyAnime", "解析元素数量：" + elements.size());
Log.d("MyAnime", "视频地址：" + videoUrl);

// 输出列表内容
for (var i = 0; i < covers.size(); i++) {
    var cover = covers.get(i);
    Log.d("MyAnime", "Cover " + i + ": " + cover.title);
}
```

### 使用 Toast 提示

```javascript
// 快速验证逻辑
StringHelper.toast("加载完成：" + list.size() + " 项");
```

### 分步验证

```javascript
// 1. 先验证能获取 HTML
var html = getDoc(url);
Log.d("Test", "HTML 长度：" + html.toString().length());

// 2. 验证选择器
var items = html.select(".item");
Log.d("Test", "元素数量：" + items.size());

// 3. 验证属性提取
if (items.size() > 0) {
    var first = items.get(0);
    Log.d("Test", "标题：" + first.select(".title").text());
}
```

---

## 8. 测试清单

在提交扩展前检查：

- [ ] 元数据注释完整（@key, @label, @versionName, @versionCode, @libVersion, @cover）
- [ ] 至少实现 PageComponent 或 SearchComponent
- [ ] URL 拼接使用 `SourceUtils.urlParser`
- [ ] 空值检查（元素可能不存在）
- [ ] 错误处理（网络异常、解析异常）
- [ ] 无硬编码 URL（使用 `preferenceHelper.get("Host")`）
- [ ] 日志输出便于调试
- [ ] 选择器稳定可靠
- [ ] 分页逻辑正确（返回 null 表示无更多）
- [ ] PlayerInfo 类型正确（HLS/Other）
