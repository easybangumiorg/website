# Agent 任务指南：动漫网站数据采集与插件化

---

## 📋 任务概述

本指南指导 Agent 如何使用 **OpenClaw Browser 工具** 分析动漫网站结构，采集必要数据，并根据**纯纯看番插件系统**的组件要求完成网站插件化。

---

## 🎯 任务清单

### 阶段一：网站初步分析 (1-2 小时)

#### 任务 1.1：确认网站可访问性
- [ ] 使用 `curl` 测试网站首页访问
- [ ] 检查是否有地区限制/反爬机制
- [ ] 记录实际可用域名（可能有多个备用域名）

**工具命令：**
```bash
# 测试访问
curl -sL -A "Mozilla/5.0" https://www.example.com | head -100

# 检查响应头
curl -sI -A "Mozilla/5.0" https://www.example.com
```

**案例：次元城动漫** (域名已做替换，实际测试时请使用真实域名)
```
❌ www.cyc-example.net → "不提供服务"（地区限制）
✅ www.cycexample.org → 正常访问
```

---

#### 任务 1.2：使用浏览器工具打开网站
- [ ] 启动浏览器并打开网站首页
- [ ] 获取页面快照（ARIA refs）
- [ ] 记录页面主要结构和导航

**工具调用：**
```json
{
  "action": "open",
  "profile": "openclaw",
  "targetUrl": "https://www.example.com"
}
```

```json
{
  "action": "snapshot",
  "profile": "openclaw",
  "refs": "aria",
  "limit": 100
}
```

---

#### 任务 1.3：分析网络流量
- [ ] 获取页面加载的所有资源
- [ ] 识别 CDN 域名和资源类型
- [ ] 记录第三方统计/追踪服务

**工具调用：**
```json
{
  "action": "act",
  "profile": "openclaw",
  "request": {
    "kind": "evaluate",
    "fn": "() => { const entries = performance.getEntriesByType('resource'); return entries.map(e => ({name: e.name, type: e.initiatorType})); }"
  }
}
```

**案例：AGE 动漫 CDN 分析**
```javascript
[
  {name: "cdn.aiqingyu1314.com/.../main.css", type: "link"},
  {name: "cdn.aqdstatic.com:966/age/20260009.jpg", type: "img"},
  {name: "hm.baidu.com/hm.js", type: "script"}  // 百度统计
]
```

---

### 阶段二：内容结构分析 (2-3 小时)

#### 任务 2.1：首页内容分析
- [ ] 识别首页推荐/更新区域的 HTML 结构
- [ ] 记录番剧卡片的 DOM 结构
- [ ] 提取封面、标题、URL 的选择器

**需要获取的数据：**
| 字段 | 说明 | 示例选择器 |
|------|------|-----------|
| 封面图 | `data-original` 或 `src` | `img.data-original` |
| 标题 | 番剧名称 | `.video_item-title a` |
| URL | 详情页链接 | `a.href` |
| 集数 | 更新状态 | `.video_item--info` |
| 简介 | 可选 | `.video_item--desc` |

**案例：AGE 动漫首页结构**
```html
<div class="video_item">
  <img data-original="https://cdn.aqdstatic.com:966/age/20260009.jpg" />
  <span class="video_item--info">第 08 集</span>
  <a href="/detail/20260009">异世界的安泰全看社畜</a>
</div>
```

**对应 JS 代码：**
```javascript
var elements = doc.select("#recent_update_video_wrapper div.video_item");
for (var i = 0; i < elements.size(); i++) {
    var it = elements.get(i);
    var coverUrl = it.select("img").attr("data-original");
    var title = it.select("a").text();
    var url = it.select("a").attr("href");
    var episode = it.select(".video_item--info").text();
}
```

---

#### 任务 2.2：详情页分析
- [ ] 打开任意番剧详情页
- [ ] 记录基本信息结构（标题、封面、简介、类型等）
- [ ] 分析播放线路和剧集列表结构

**需要获取的数据：**
| 字段 | 说明 | 示例选择器 |
|------|------|-----------|
| 标题 | 番剧主标题 | `h2.video-title` |
| 封面 | 高清封面图 | `.video-cover img` |
| 简介 | 剧情描述 | `.video-desc` |
| 类型 | 分类标签 | `.genre span` |
| 状态 | 连载/完结 | `.status` |
| 播放线路 | 线路标签 | `ul.tabs li` |
| 剧集列表 | 每集链接 | `.episodes a` |

**案例：AGE 动漫详情页**
```javascript
function DetailedComponent_getDetailed(summary) {
    var url = SourceUtils.urlParser(getRootUrl(), "/detail/" + summary.id);
    var doc = getDoc(url);
    
    // 获取标题
    var title = doc.select("h2").text();
    
    // 获取封面
    var cover = doc.select(".video-detail-cover img").attr("data-original");
    
    // 获取简介
    var desc = doc.select(".video-detail-desc").text();
    
    // 获取播放线路
    var tabs = doc.select(".playlist-tabs li");
    var episodes = doc.select(".playlist-content ul li");
    
    return makeCartoon({
        id: summary.id,
        title: title,
        cover: cover,
        description: desc,
        // ...
    });
}
```

---

#### 任务 2.3：搜索功能分析
- [ ] 测试网站搜索功能
- [ ] 分析搜索 URL 格式
- [ ] 记录搜索结果页结构

**常见搜索 URL 格式：**
```
# 格式 1: query 参数
/search?query=关键词&page=1

# 格式 2: RESTful
/search/关键词----------1---/

# 格式 3: POST 请求
POST /api/search
Body: {keyword: "...", page: 1}
```

**案例：AGE 动漫搜索**
```javascript
function SearchComponent_search(page, keyword) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/search?query=" + URLEncoder.encode(keyword, "utf-8") + "&page=" + (page+1)
    );
    var doc = getDoc(url);
    var elements = doc.select("#cata_video_list div.card");
    
    // 解析搜索结果...
    return new Pair(page + 1, results);
}
```

---

### 阶段三：视频资源分析 (2-3 小时)

#### 任务 3.1：播放页分析
- [ ] 打开第一集播放页
- [ ] 等待页面完全加载（包括 iframe）
- [ ] 获取所有 iframe 的 src

**工具调用：**
```json
{
  "action": "act",
  "profile": "openclaw",
  "request": {
    "kind": "evaluate",
    "fn": "() => { const iframes = document.querySelectorAll('iframe'); return Array.from(iframes).map((iframe, i) => ({index: i, src: iframe.src, id: iframe.id})); }"
  }
}
```

**案例：次元城动漫播放页**
```javascript
[
  {index: 0, src: "https://www.cycexample.org/watch/7497/1/1.html", id: "buffer"},
  {index: 1, src: "https://www.cycexample.org/watch/7497/1/1.html", id: "install"},
  {index: 2, src: "https://player.cycexampleme.com/?url=cycexample-xxx", id: ""}  // 实际播放器
]
```

---

#### 任务 3.2：视频资源抓取
- [ ] 打开播放器 iframe 页面
- [ ] 等待视频加载完成（5-10 秒）
- [ ] 获取所有视频相关资源

**工具调用：**
```json
{
  "action": "act",
  "profile": "openclaw",
  "request": {
    "kind": "evaluate",
    "fn": "() => { const entries = performance.getEntriesByType('resource'); const videos = entries.filter(e => e.initiatorType === 'video' || e.name.includes('.m3u8') || e.name.includes('.mp4')); return videos.map(e => ({url: e.name, type: e.initiatorType, size: e.transferSize})); }"
  }
}
```

---

#### 任务 3.3：验证视频 URL
- [ ] 使用 `curl` 测试视频 URL 可访问性
- [ ] 检查响应头（Content-Type, Content-Length）
- [ ] 记录 CDN 信息和时效性

**工具命令：**
```bash
# 获取响应头
curl -sI -A "Mozilla/5.0" "https://video-url..."

# 测试下载前 1KB
curl -sL -A "Mozilla/5.0" -r 0-1024 "https://video-url..." | head -5
```

**案例：AGE 动漫视频响应**
```http
HTTP/2 200
server: Byte-nginx
content-type: video/mp4
content-length: 381191736
x-expires: 1767708787458  # 有时效性
```

---

#### 任务 3.4：实现 PlayComponent
根据视频类型选择合适的解析方式：

**方式 1: 直接 MP4 链接**
```javascript
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = SourceUtils.urlParser(getRootUrl(), "/play/" + summary.id + "/" + playLine.id + "/" + episode.id);
    
    // 使用 WebView 代理等待视频资源
    var webProxy = webProxyProvider.getWebProxy();
    webProxy.loadUrl(url, networkHelper.defaultLinuxUA);
    webProxy.waitingForPageLoaded();
    
    // 等待 MP4 或 m3u8 资源
    var mp4Url = webProxy.waitingForResourceLoaded(".*\\.mp4", true, 2000);
    var m3u8Url = webProxy.waitingForResourceLoaded(".*index\\.m3u8", true, 2000);
    
    var videoUrl = m3u8Url || mp4Url;
    var type = videoUrl.endsWith(".m3u8") 
        ? PlayerInfo.DECODE_TYPE_HLS 
        : PlayerInfo.DECODE_TYPE_OTHER;
    
    return new PlayerInfo(type, videoUrl);
}
```

**方式 2: iframe 嵌套解析**
```javascript
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = SourceUtils.urlParser(getRootUrl(), "/play/" + summary.id + "/" + playLine.id + "/" + episode.id);
    
    // 获取播放页 HTML
    var html = getHtml(url);
    var doc = Jsoup.parse(html);
    
    // 提取 iframe src
    var iframeSrc = doc.select("iframe").attr("src");
    
    // 解析 iframe 中的视频地址
    var videoUrl = parseIframeVideo(iframeSrc);
    
    return new PlayerInfo(PlayerInfo.DECODE_TYPE_OTHER, videoUrl);
}
```

---

### 阶段四：插件代码实现 (3-4 小时)

#### 任务 4.1：创建插件骨架
- [ ] 复制模板文件
- [ ] 填写元数据（@key, @label, @version 等）
- [ ] 注入必要的工具类

**模板代码：**
```javascript
// @key heyanle.example              // 反向域名
// @label 示例动漫源                  // 显示名称
// @versionName 1.0.0
// @versionCode 1
// @libVersion 13
// @cover https://www.example.com/favicon.ico

// 注入工具
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;
var webProxyProvider = Inject_WebProxyProvider;
```

---

#### 任务 4.2：实现 PreferenceComponent
```javascript
function PreferenceComponent_getPreference() {
    var res = new ArrayList();
    
    // 添加网站地址设置
    var host = new SourcePreference.Edit(
        "网页",           // 分组名
        "Host",           // 键
        "www.example.com" // 默认值
    );
    res.add(host);
    
    return res;
}

function getRootUrl() {
    return preferenceHelper.get("Host", "https://www.example.com");
}
```

---

#### 任务 4.3：实现 PageComponent
```javascript
// 主标签页
function PageComponent_getMainTabs() {
    var res = new ArrayList();
    
    // 推荐页
    res.add(new MainTab("今日推荐", MainTab.MAIN_TAB_WITH_COVER));
    
    // 更新表（分组类型）
    res.add(new MainTab("更新时刻表", MainTab.MAIN_TAB_GROUP));
    
    return res;
}

// 子标签页（仅当主标签是分组类型时需要）
function PageComponent_getSubTabs(mainTab) {
    var res = new ArrayList();
    
    if (mainTab.label == "更新时刻表") {
        // 按星期几分组
        res.add(new SubTab("周一", true, "monday"));
        res.add(new SubTab("周二", true, "tuesday"));
        // ...
    }
    
    return res;
}

// 内容获取
function PageComponent_getContent(mainTab, subTab, key) {
    if (mainTab.label == "今日推荐") {
        var url = getRootUrl() + "/recommend/" + (key + 1);
        var results = parseRecommend(url);
        return new Pair(key + 1, results);  // 返回下一页码
    }
    
    return new Pair(null, new ArrayList());
}
```

---

#### 任务 4.4：实现 SearchComponent
```javascript
function SearchComponent_search(page, keyword) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/search?query=" + URLEncoder.encode(keyword, "utf-8") + "&page=" + (page + 1)
    );
    
    var doc = getDoc(url);
    var elements = doc.select(".search-results .item");
    var results = new ArrayList();
    
    for (var i = 0; i < elements.size(); i++) {
        var it = elements.get(i);
        var cover = it.select("img").attr("data-original");
        var title = it.select("h3").text();
        var url = it.select("a").attr("href");
        var id = extractId(url);
        
        results.add(makeCartoonCover({
            id: id,
            source: source.key,
            url: SourceUtils.urlParser(getRootUrl(), url),
            title: title,
            cover: SourceUtils.urlParser(getRootUrl(), cover),
            intro: ""
        }));
    }
    
    return new Pair(page + 1, results);
}
```

---

#### 任务 4.5：实现 DetailedComponent
```javascript
function DetailedComponent_getDetailed(summary) {
    var url = SourceUtils.urlParser(getRootUrl(), "/detail/" + summary.id);
    var doc = getDoc(url);
    
    // 获取基本信息
    var cartoon = makeCartoon({
        id: summary.id,
        source: summary.source,
        title: doc.select("h1").text(),
        cover: doc.select(".cover img").attr("src"),
        description: doc.select(".desc").text(),
        genre: extractGenres(doc),
        status: Cartoon.STATUS_ONGOING,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    });
    
    // 获取播放线路
    var playLines = extractPlayLines(doc);
    
    return new Pair(cartoon, playLines);
}

function extractPlayLines(doc) {
    var playLines = new ArrayList();
    var tabs = doc.select(".tabs li");
    
    for (var i = 0; i < tabs.size(); i++) {
        var tab = tabs.get(i);
        var episodes = new ArrayList();
        var eps = doc.select(".episodes-" + i + " li");
        
        for (var j = 0; j < eps.size(); j++) {
            var ep = eps.get(j);
            episodes.add(new Episode(
                (j + 1).toString(),  // id
                ep.text(),            // label (如"第 01 集")
                j                     // order
            ));
        }
        
        playLines.add(new PlayLine(
            (i + 1).toString(),  // id
            tab.text(),           // label (如"线路 1")
            episodes
        ));
    }
    
    return playLines;
}
```

---

#### 任务 4.6：实现 PlayComponent
参考任务 3.4 的实现。

---

### 阶段五：测试与调试 (2-3 小时)

#### 任务 5.1：本地测试
- [ ] 使用调试服务器加载插件
- [ ] 测试每个功能模块
- [ ] 添加日志输出

**调试代码：**
```javascript
function getDoc(url) {
    Log.d("MyAnime", "请求 URL: " + url);
    
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(url)
    );
    var html = req.execute().body().string();
    
    Log.d("MyAnime", "响应长度：" + html.length);
    
    return Jsoup.parse(html);
}
```

---

#### 任务 5.2：常见问题排查

**问题 1: 元素选择器不匹配**
```javascript
// 错误：选择器写错
var elements = doc.select(".video-item");  // 实际是 .video_item

// 调试：打印 HTML
Log.d("Debug", doc.html().substring(0, 1000));
```

**问题 2: 视频地址解析失败**
```javascript
// 添加更多等待时间
webProxy.waitingForResourceLoaded(".*\\.m3u8", true, 5000);  // 5 秒

// 尝试备用解析方式
if (videoUrl == null) {
    var content = webProxy.getContentWithIframe();
    videoUrl = Jsoup.parse(content).select("video").attr("src");
}
```

**问题 3: URL 拼接错误**
```javascript
// 始终使用 urlParser 处理
var fullUrl = SourceUtils.urlParser(rootUrl, path);

// 不要手动拼接
// 错误：rootUrl + "/" + path
// 正确：SourceUtils.urlParser(rootUrl, path)
```

---

## 📚 实战案例

### 案例 A：AGE 动漫完整实现

**关键特点：**
- 使用第三方解析接口 (`jx.ejtsyc.com:8443`)
- 多播放源支持（7 个线路）
- WebView 代理等待视频资源

---

### 案例 B：次元城动漫实现要点

**网站特点：**
- 域名：`www.cycexample.org` (域名已做替换)
- 播放器：`player.cycexampleme.com` (域名已做替换)
- 视频 CDN：字节 ImageX (`byteimg.com`)
- 视频格式：MP4 (HEVC)

**实现要点：**
```javascript
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = SourceUtils.urlParser(
        getRootUrl(), 
        "/watch/" + summary.id + "/" + playLine.id + "/" + episode.id + ".html"
    );
    
    // 获取播放页 HTML
    var html = getHtml(url);
    var doc = Jsoup.parse(html);
    
    // 提取播放器 iframe
    var iframe = doc.select("iframe[src*='player.cycexampleme.com']").attr("src");
    
    // 解析 iframe 中的视频地址
    var videoUrl = parsePlayerUrl(iframe);
    
    return new PlayerInfo(PlayerInfo.DECODE_TYPE_OTHER, videoUrl);
}
```

---

## 🔧 工具脚本

### 创建空插件模板
```bash
cd /home/ayala/Projects/JsDev/skills/easybangumi-js-extension
node scripts/create-empty-extension.js my-anime ./extensions
```

### 验证插件语法
```bash
# 检查 JavaScript 语法
node -c extensions/my-anime.js
```

---

## 📝 检查清单

在提交插件前，确保完成以下检查：

### 代码质量
- [ ] 所有组件都已实现
- [ ] 错误处理完善（try-catch）
- [ ] 添加了必要的日志
- [ ] 没有硬编码的 URL（使用 `getRootUrl()`）

### 功能测试
- [ ] 首页正常显示
- [ ] 搜索功能正常
- [ ] 详情页正常
- [ ] 视频可以播放
- [ ] 多线路切换正常

### 元数据
- [ ] @key 唯一（反向域名格式）
- [ ] @label 清晰易懂
- [ ] @cover 使用网站 favicon
- [ ] 版本号正确

### 文档
- [ ] README 中添加了网站说明
- [ ] 记录了已知的限制/问题
- [ ] 提供了备用域名信息

---

## 📞 获取帮助

- **官方文档：** https://easybangumi.org/docs/js-extension-example
- **API 参考：** https://easybangumi.org/docs/js-extension-utils
- **示例代码：** [简单示例.js](examples/简单示例.js)
- **类型定义：** [easyplugin.d.ts](references/types/easyplugin.d.ts)

---
