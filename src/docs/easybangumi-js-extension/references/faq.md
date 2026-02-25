# 纯纯看番 JS 源扩展 - 常见问题

## 目录

1. [开发环境](#1-开发环境)
2. [组件实现](#2-组件实现)
3. [网络请求](#3-网络请求)
4. [数据处理](#4-数据处理)
5. [调试与错误](#5-调试与错误)

---

## 1. 开发环境

### Q: 如何开始开发一个 JS 源？

A: 按以下步骤开始：
1. 创建 `.js` 文件
2. 添加元数据注释（@key, @label 等）
3. 注入工具类（Inject_NetworkHelper 等）
4. 实现至少一个组件函数
5. 在纯纯看番中安装测试

### Q: libVersion 应该填多少？

A: 查看纯纯看番 App 源码中的 `ExtensionInfo.kt` 文件：
- `LIB_VERSION_MIN`: 最低支持版本
- `LIB_VERSION_MAX`: 最高支持版本

当前推荐填写 **13**。

### Q: 如何在本地调试？

A: 有三种方式：
1. 使用 JsDev 调试服务器实时同步
2. 在纯纯看番中安装本地 JS 文件
3. 添加日志输出，查看应用日志

---

## 2. 组件实现

### Q: 必须实现所有组件吗？

A: 不需要。最少需要实现：
- **PageComponent** 或 **SearchComponent**（至少一个）

推荐实现顺序：
1. PageComponent（首页展示）
2. SearchComponent（搜索）
3. DetailedComponent（详情）
4. PlayComponent（播放）
5. PreferenceComponent（可选配置）

### Q: PageComponent 和 SearchComponent 有什么区别？

A:
- **PageComponent**: 展示预设的内容列表（如番剧列表、分类）
- **SearchComponent**: 处理用户搜索请求

### Q: 如何实现分组标签？

A: 使用 `MainTab.MAIN_TAB_GROUP` 类型：

```javascript
function PageComponent_getMainTabs() {
    var res = new ArrayList();
    res.add(new MainTab("时刻表", MainTab.MAIN_TAB_GROUP));
    return res;
}

function PageComponent_getSubTabs(mainTab) {
    if (mainTab.label == "时刻表") {
        var res = new ArrayList();
        res.add(new SubTab("周一", true, extData));
        return res;
    }
    return new ArrayList();
}
```

### Q: getContent 返回的 nextKey 是什么？

A: nextKey 用于分页：
- 返回 `key + 1` 表示下一页
- 返回 `null` 表示无更多数据

```javascript
if (list.size() == 0) {
    return new Pair(null, new ArrayList());  // 无更多
}
return new Pair(key + 1, list);  // 下一页
```

---

## 3. 网络请求

### Q: 如何设置 User-Agent？

A: 使用 `networkHelper.defaultLinuxUA`：

```javascript
var request = new Request.Builder()
    .url(url)
    .header("User-Agent", networkHelper.defaultLinuxUA)
    .build();
```

### Q: 如何处理 Cloudflare 防护？

A: 使用 `cloudflareClient`：

```javascript
var req = okhttpHelper.cloudflareWebViewClient.newCall(
    OkhttpUtils.get(url)
);
var response = req.execute();
```

### Q: 如何设置 Referer？

A: 在请求头中添加：

```javascript
var request = new Request.Builder()
    .url(url)
    .header("Referer", getRootUrl())
    .build();
```

### Q: 如何处理需要登录的网站？

A: 在 PreferenceComponent 中添加账号配置：

```javascript
function PreferenceComponent_getPreference() {
    var res = new ArrayList();
    res.add(new SourcePreference.Edit("用户名", "Username", ""));
    res.add(new SourcePreference.Edit("密码", "Password", ""));
    return res;
}

// 使用时带上 Cookie
var username = preferenceHelper.get("Username", "");
var password = preferenceHelper.get("Password", "");
// 登录后保存 Cookie，后续请求自动携带
```

---

## 4. 数据处理

### Q: 如何处理相对 URL？

A: 使用 `SourceUtils.urlParser`：

```javascript
var fullUrl = SourceUtils.urlParser(getRootUrl(), "/detail/123");
// 结果：https://example.com/detail/123

var relativeUrl = SourceUtils.urlParser("https://example.com/a/b", "../c");
// 结果：https://example.com/c
```

### Q: 如何解析动态加载的内容？

A: 使用 WebView 代理：

```javascript
var webProxy = webProxyProvider.getWebProxy();
webProxy.loadUrl(url, networkHelper.defaultLinuxUA);
webProxy.waitingForPageLoaded(10000);
var content = webProxy.getContent();
var videoUrl = webProxy.waitingForResourceLoaded(".*\\.m3u8");
webProxy.close();
```

### Q: 如何处理多个播放线路？

A: 返回 PlayLine 列表：

```javascript
function playline(doc, summary) {
    var playLines = new ArrayList();

    // 线路 1
    var ep1 = new ArrayList();
    ep1.add(new Episode("1", "第 1 集", 0));
    playLines.add(new PlayLine("line1", "线路 1", ep1));

    // 线路 2
    var ep2 = new ArrayList();
    ep2.add(new Episode("1", "第 1 集", 0));
    playLines.add(new PlayLine("line2", "线路 2", ep2));

    return playLines;
}
```

### Q: 如何判断视频类型？

A: 根据 URL 后缀：

```javascript
var type = PlayerInfo.DECODE_TYPE_OTHER;
if (videoUrl.indexOf(".m3u8") > -1) {
    type = PlayerInfo.DECODE_TYPE_HLS;
}
return new PlayerInfo(type, videoUrl);
```

---

## 5. 调试与错误

### Q: 如何调试 JS 错误？

A: 使用日志输出：

```javascript
Log.d("MyAnime", "请求 URL: " + url);
Log.d("MyAnime", "解析元素数量：" + elements.size());
Log.e("MyAnime", "错误：" + e.message);
```

然后在纯纯看番的日志查看器中查看。

### Q: ParserException 是什么？

A: 用于抛出解析错误的异常：

```javascript
if (!videoUrl) {
    throw new ParserException("视频地址解析失败");
}
```

抛出后应用会显示错误提示。

### Q: 如何处理跨域问题？

A: 使用 WebView 代理或设置合适的 Headers：

```javascript
var request = new Request.Builder()
    .url(url)
    .header("Origin", getRootUrl())
    .header("Referer", getRootUrl())
    .build();
```

### Q: 为什么页面内容为空？

A: 可能原因：
1. 网站需要 JavaScript 渲染 - 使用 WebView 代理
2. 选择器不正确 - 检查 HTML 结构
3. 网站有反爬 - 使用 cloudflareClient
4. URL 拼接错误 - 使用 SourceUtils.urlParser

### Q: 如何处理网站改版？

A:
1. 更新选择器以匹配新结构
2. 增加 @versionCode 版本号
3. 在纯纯看番中更新扩展

---

## 6. 其他

### Q: 如何提交到官方仓库？

A:
1. 确保扩展功能完整
2. 遵循元数据格式规范
3. 无硬编码配置
4. 提交到 CommunityJsExtensionEasyBangumi 仓库

### Q: 支持哪些视频格式？

A:
- MP4 (DECODE_TYPE_OTHER)
- HLS/m3u8 (DECODE_TYPE_HLS)
- 其他格式需要额外配置

### Q: 如何处理图片防盗链？

A: 设置 Referer：

```javascript
var request = new Request.Builder()
    .url(coverUrl)
    .header("Referer", getRootUrl())
    .build();
```
