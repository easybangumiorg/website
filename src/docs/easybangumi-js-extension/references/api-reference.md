# 纯纯看番 JS 源扩展 - 工具 API 参考

## 目录

1. [网络请求](#1-网络请求)
2. [URL 处理](#2-url-处理)
3. [HTML 解析](#3-html-解析-jsoup)
4. [WebView 代理](#4-webview-代理)
5. [日志与提示](#5-日志与提示)
6. [偏好设置](#6-偏好设置)

---

## 1. 网络请求

### OkHttp 直接请求

```javascript
// GET 请求
var req = okhttpHelper.cloudflareWebViewClient.newCall(
    OkhttpUtils.get(url)
);
var response = req.execute();
var html = response.body().string();

// POST 请求
var body = RequestBody.create("application/json", jsonData);
var req = okhttpHelper.client.newCall(
    OkhttpUtils.post(url, body)
);
var response = req.execute();
```

### 带自定义 Headers

```javascript
var request = new Request.Builder()
    .url(url)
    .header("User-Agent", networkHelper.defaultLinuxUA)
    .header("Referer", refererUrl)
    .header("Accept", "application/json")
    .build();

var req = okhttpHelper.client.newCall(request);
var response = req.execute();
```

### Cloudflare 绕过

```javascript
// 使用 cloudflareClient 自动处理 Cloudflare 防护
var req = okhttpHelper.cloudflareWebViewClient.newCall(
    OkhttpUtils.get(url)
);
var response = req.execute();
```

---

## 2. URL 处理

### URL 拼接

```javascript
// 自动处理相对路径
var fullUrl = SourceUtils.urlParser("https://example.com", "/path/to/page");
// 结果：https://example.com/path/to/page

var fullUrl2 = SourceUtils.urlParser("https://example.com/a/b", "../c");
// 结果：https://example.com/c

// 在代码中使用
function getFullUrl(path) {
    return SourceUtils.urlParser(getRootUrl(), path);
}
```

### URL 编码

```javascript
var encoded = URLEncoder.encode(keyword, "UTF-8");
var searchUrl = "/search?q=" + encoded;
```

---

## 3. HTML 解析 (Jsoup)

### 基础解析

```javascript
var doc = Jsoup.parse(html);
```

### 选择器

```javascript
// 类选择器
var elements = doc.select(".class-name");

// ID 选择器
var element = doc.select("#id-name").first();

// 标签选择器
var divs = doc.select("div");

// 组合选择器
var items = doc.select("div.container > ul.list > li.item");

// 属性选择器
var links = doc.select("a[href^='/detail/']");
var dataItems = doc.select("[data-type='anime']");
```

### 获取属性

```javascript
var href = element.attr("href");
var dataId = element.attr("data-id");
var imgSrc = element.select("img").attr("src");
var text = element.text();
var html = element.html();
```

### 遍历元素

```javascript
var elements = doc.select(".item");
for (var i = 0; i < elements.size(); i++) {
    var item = elements.get(i);
    // 处理每个元素
}
```

### 文本处理

```javascript
// 获取文本（包含子元素）
var text = element.text();

// 仅自身文本
var ownText = element.ownText();

// 拼接多个元素文本
var genres = doc.select(".genre a");
var genreText = genres.joinText(", ");
```

---

## 4. WebView 代理

用于处理需要 JavaScript 渲染或反爬的场景。

### 获取代理实例

```javascript
var webProxy = webProxyProvider.getWebProxy();
```

### 加载页面

```javascript
webProxy.loadUrl(
    url,                                    // URL
    networkHelper.defaultLinuxUA,           // User-Agent (可选)
    null,                                   // Headers (可选)
    ".*\\.(css|js|jpg|png).*",             // 资源拦截正则 (可选)
    false                                   // 是否需要 Blob (可选)
);
```

### 等待加载

```javascript
// 等待页面加载完成
var loaded = webProxy.waitingForPageLoaded(10000); // 超时 ms

// 等待特定资源
var m3u8Url = webProxy.waitingForResourceLoaded(".*\\.m3u8", true, 15000);

// 等待并提取文本
var result = webProxy.waitingForBlobText(
    ".*\\.js$",    // URL 正则
    "token",       // 文本正则
    true,          // sticky
    10000          // 超时
);
```

### 获取内容

```javascript
// 获取页面源码
var content = webProxy.getContent(5000);

// 获取 iframe 内容
var content = webProxy.getContentWithIframe(5000);
```

### 执行 JavaScript

```javascript
var result = webProxy.executeJavaScript("document.title", 1000);
```

### 页面跳转

```javascript
webProxy.href("https://new-url.com", false);
```

### 调试

```javascript
// 添加到窗口（用于调试）
webProxy.addToWindow(true);
```

### 关闭

```javascript
webProxy.close();
```

### 完整示例

```javascript
function getVideoUrl(playUrl) {
    var webProxy = webProxyProvider.getWebProxy();

    webProxy.loadUrl(
        playUrl,
        networkHelper.defaultLinuxUA
    );

    webProxy.waitingForPageLoaded(10000);

    // 等待 m3u8 资源
    var videoUrl = webProxy.waitingForResourceLoaded(".*\\.m3u8", true, 15000);

    webProxy.close();

    return videoUrl;
}
```

---

## 5. 日志与提示

### 日志输出

```javascript
Log.d("Tag", "debug message");
Log.i("Tag", "info message");
Log.w("Tag", "warning message");
Log.e("Tag", "error message");
Log.v("Tag", "verbose message");
```

### 用户提示

```javascript
// Toast
StringHelper.toast("操作成功");

// Snackbar
StringHelper.moeSnackBar("加载中...");

// 对话框
StringHelper.moeDialog("详细内容", "标题");
```

---

## 6. 偏好设置

### 读取

```javascript
var host = preferenceHelper.get("Host", "https://default.com");
var enableHd = preferenceHelper.get("EnableHd", "true") == "true";
```

### 写入

```javascript
preferenceHelper.put("LastUpdate", new Date().getTime().toString());
```

### 获取所有

```javascript
var allPrefs = preferenceHelper.map();
```

---

## 7. 实体创建

### CartoonCover

```javascript
var cover = makeCartoonCover({
    id: "unique-id",
    url: "https://...",
    title: "标题",
    intro: "简介",
    cover: "封面图 URL"
    // source 自动注入
});
```

### Cartoon

```javascript
var cartoon = makeCartoon({
    id: "unique-id",
    url: "https://...",
    title: "标题",
    genreList: genreList,  // ArrayList<String>
    cover: "封面 URL",
    intro: "短简介",
    description: "详细描述",
    status: Cartoon.STATUS_UNKNOWN,
    updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS,
    isUpdate: false
});
```

### PlayerInfo

```javascript
// 普通视频
var info = new PlayerInfo(PlayerInfo.DECODE_TYPE_OTHER, "https://.../video.mp4");

// HLS 流
var info = new PlayerInfo(PlayerInfo.DECODE_TYPE_HLS, "https://.../video.m3u8");
```

---

## 8. Java 工具类

### ArrayList

```javascript
var list = new ArrayList();
list.add(item);
list.size();
list.get(index);
```

### Pair

```javascript
var pair = new Pair(first, second);
pair.first;
pair.second;
```

### HashMap

```javascript
var map = new HashMap();
map.put(key, value);
map.get(key);
map.containsKey(key);
```

### System

```javascript
var timestamp = System.currentTimeMillis();
```
