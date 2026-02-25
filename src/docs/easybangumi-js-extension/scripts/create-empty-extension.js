#!/usr/bin/env node

/**
 * 纯纯看番 JS 源扩展 - 空插件模板生成器
 *
 * 使用方法:
 *   node create-empty-extension.js <插件名称> [输出目录]
 *
 * 示例:
 *   node create-empty-extension.js my-anime
 *   node create-empty-extension.js my-anime ./extensions
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
const pluginName = args[0];
const outputDir = args[1] || '.';

if (!pluginName) {
    console.error('错误：请提供插件名称');
    console.error('用法：node create-empty-extension.js <插件名称> [输出目录]');
    process.exit(1);
}

// 生成插件文件名
const filename = `${pluginName}.js`;
const outputPath = path.join(outputDir, filename);

// 空插件模板
const template = `// @key com.example.${pluginName.replace(/-/g, '')}
// @label ${formatLabel(pluginName)}
// @versionName 1.0.0
// @versionCode 1
// @libVersion 13
// @cover https://example.com/favicon.ico
// TODO: 修改以上元数据，确保 @key 唯一且符合规范，@label 为显示名称，@cover 为图标地址

// ===== 注入工具类 =====
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;
var webProxyProvider = Inject_WebProxyProvider;

// ===== 偏好设置组件 =====
function PreferenceComponent_getPreference() {
    // TODO: 根据目标网站需求设计偏好设置项
    var res = new ArrayList();
    res.add(new SourcePreference.Edit("网站地址", "Host", "https://example.com"));
    return res;
}

// ===== 页面组件 =====
function PageComponent_getMainTabs() {
    // TODO: 根据目标网站结构设计主标签，示例中仅添加了一个“推荐”标签
    var res = new ArrayList();
    res.add(new MainTab("推荐", MainTab.MAIN_TAB_WITH_COVER));
    return res;
}

function PageComponent_getContent(mainTab, subTab, key) {
    // TODO: 实现内容获取逻辑
    var url = SourceUtils.urlParser(getRootUrl(), "/list?page=" + (key + 1));
    var doc = getDoc(url);
    var list = new ArrayList();

    // 示例：解析列表项
    // var items = doc.select(".anime-item");
    // for (var i = 0; i < items.size(); i++) {
    //     var item = items.get(i);
    //     list.add(makeCartoonCover({
    //         id: item.attr("data-id"),
    //         title: item.select(".title").text(),
    //         cover: item.select("img").attr("src"),
    //         url: SourceUtils.urlParser(getRootUrl(), item.select("a").attr("href"))
    //     }));
    // }

    if (list.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(key + 1, list);
}

// ===== 搜索组件 =====
function SearchComponent_search(page, keyword) {
    // TODO: 实现搜索逻辑
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/search?q=" + URLEncoder.encode(keyword, "utf-8") + "&page=" + (page + 1)
    );
    var doc = getDoc(url);
    var results = new ArrayList();

    // 示例：解析搜索结果
    // var items = doc.select(".search-item");
    // for (var i = 0; i < items.size(); i++) {
    //     var item = items.get(i);
    //     results.add(makeCartoonCover({
    //         id: item.attr("data-id"),
    //         title: item.select(".title").text(),
    //         cover: item.select("img").attr("src"),
    //         url: SourceUtils.urlParser(getRootUrl(), item.select("a").attr("href"))
    //     }));
    // }

    if (results.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(page + 1, results);
}

// ===== 详情组件 =====
function DetailedComponent_getDetailed(summary) {
    // TODO: 实现详情获取逻辑
    var url = SourceUtils.urlParser(getRootUrl(), "/detail/" + summary.id);
    var doc = getDoc(url);

    var cartoon = makeCartoon({
        id: summary.id,
        title: doc.select("h1.title").text(),
        cover: doc.select(".cover img").attr("src"),
        intro: doc.select(".intro").text(),
        description: doc.select(".description").text(),
        status: Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    });

    // TODO: 提取播放线路
    var playLines = new ArrayList();
    // 示例：
    // var episodes = doc.select(".episode-list a");
    // var episodeList = new ArrayList();
    // for (var i = 0; i < episodes.size(); i++) {
    //     var ep = episodes.get(i);
    //     episodeList.add(new Episode(ep.attr("data-id"), ep.text(), i));
    // }
    // playLines.add(new PlayLine("1", "默认线路", episodeList));

    return new Pair(cartoon, playLines);
}

// ===== 播放组件 =====
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    // TODO: 实现播放地址解析逻辑
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/play/" + summary.id + "/" + episode.id
    );
    var doc = getDoc(url);

    // 示例：解析视频地址
    var videoUrl = doc.select("video source").attr("src");

    if (!videoUrl) {
        // 尝试从 JSON 中提取
        // var jsonText = doc.toString();
        // var pattern = /"url":"([^"]+)"/;
        // var match = jsonText.match(pattern);
        // if (match) {
        //     videoUrl = match[1].replace(/\\\\\\//g, "/");
        // }
        throw new ParserException("无法找到视频地址");
    }

    var type = videoUrl.indexOf(".m3u8") > -1
        ? PlayerInfo.DECODE_TYPE_HLS
        : PlayerInfo.DECODE_TYPE_OTHER;

    return new PlayerInfo(type, videoUrl);
}

// ===== 辅助函数 =====
function getDoc(url) {
    var req = okhttpHelper.cloudflareWebViewClient.newCall(OkhttpUtils.get(url));
    var response = req.execute();
    return Jsoup.parse(response.body().string());
}

function getRootUrl() {
    // TODO: 修改为从偏好设置中获取网站地址，确保默认配置的地址正确
    return preferenceHelper.get("Host", "https://example.com");
}
`;

// 格式化插件名称为显示名称
function formatLabel(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
}

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 检查文件是否已存在
if (fs.existsSync(outputPath)) {
    console.error(`错误：文件 ${outputPath} 已存在`);
    process.exit(1);
}

// 写入文件
fs.writeFileSync(outputPath, template);

console.log(`✓ 已创建空插件模板：${outputPath}`);
console.log(`  下一步:`);
console.log(`  1. 修改元数据 (@key, @label, @cover)`);
console.log(`  2. 修改 getRootUrl() 返回目标网站地址`);
console.log(`  3. 根据网站结构实现各组件函数`);
console.log(`  4. 在纯纯看番中安装测试`);
