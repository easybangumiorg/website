// @key com.example.simple
// @label 简单示例 (基础模板)
// @versionName 1.0.0
// @versionCode 1
// @libVersion 13
// @cover https://example.com/favicon.ico

// ===== 注入工具类 =====
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;

// ===== 偏好设置 =====
function PreferenceComponent_getPreference() {
    var res = new ArrayList();
    res.add(new SourcePreference.Edit("网站地址", "Host", "https://example.com"));
    return res;
}

// ===== 页面组件 =====
function PageComponent_getMainTabs() {
    var res = new ArrayList();
    res.add(new MainTab("推荐", MainTab.MAIN_TAB_WITH_COVER));
    return res;
}

function PageComponent_getContent(mainTab, subTab, key) {
    var url = SourceUtils.urlParser(getRootUrl(), "/list?page=" + (key + 1));
    var doc = getDoc(url);
    var list = new ArrayList();

    // 解析列表项
    var items = doc.select(".anime-item");
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);
        var a = item.select("a").first();

        if (a != null) {
            var href = a.attr("href");
            var id = extractId(href);
            var title = a.select(".title").text();
            var cover = a.select("img").attr("src");

            list.add(makeCartoonCover({
                id: id,
                title: title,
                url: SourceUtils.urlParser(getRootUrl(), href),
                cover: SourceUtils.urlParser(getRootUrl(), cover)
            }));
        }
    }

    // 无更多数据
    if (list.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(key + 1, list);
}

// ===== 搜索组件 =====
function SearchComponent_search(page, keyword) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/search?q=" + URLEncoder.encode(keyword, "utf-8") + "&page=" + (page + 1)
    );
    var doc = getDoc(url);
    var results = new ArrayList();

    var items = doc.select(".search-item");
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);
        var a = item.select("a").first();

        if (a != null) {
            var href = a.attr("href");
            var id = extractId(href);
            var title = a.select(".title").text();
            var cover = item.select("img").attr("src");

            results.add(makeCartoonCover({
                id: id,
                title: title,
                url: SourceUtils.urlParser(getRootUrl(), href),
                cover: SourceUtils.urlParser(getRootUrl(), cover)
            }));
        }
    }

    if (results.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(page + 1, results);
}

// ===== 详情组件 =====
function DetailedComponent_getDetailed(summary) {
    var url = SourceUtils.urlParser(getRootUrl(), "/detail/" + summary.id);
    var doc = getDoc(url);

    // 提取详情信息
    var title = doc.select("h1.title").text();
    var coverEle = doc.select(".cover img").first();
    var cover = coverEle != null ? coverEle.attr("src") : "";
    var intro = doc.select(".intro").text();

    var cartoon = makeCartoon({
        id: summary.id,
        title: title,
        cover: SourceUtils.urlParser(getRootUrl(), cover),
        intro: intro,
        description: intro,
        status: Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    });

    // 提取播放线路
    var playLines = new ArrayList();
    var episodeList = new ArrayList();

    var episodes = doc.select(".episode-list a");
    for (var i = 0; i < episodes.size(); i++) {
        var ep = episodes.get(i);
        episodeList.add(new Episode(
            ep.attr("data-episode-id"),
            ep.text(),
            i
        ));
    }

    playLines.add(new PlayLine("1", "默认线路", episodeList));

    return new Pair(cartoon, playLines);
}

// ===== 播放组件 =====
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/play/" + summary.id + "/" + episode.id
    );
    var doc = getDoc(url);

    // 解析视频地址
    var videoUrl = doc.select("video source").attr("src");

    if (!videoUrl) {
        // 尝试从 JSON 中提取
        var jsonText = doc.toString();
        var pattern = /"url":"([^"]+)"/;
        var match = jsonText.match(pattern);
        if (match) {
            videoUrl = match[1].replace(/\\\//g, "/");
        }
    }

    if (!videoUrl) {
        throw new ParserException("无法找到视频地址");
    }

    var type = videoUrl.indexOf(".m3u8") > -1
        ? PlayerInfo.DECODE_TYPE_HLS
        : PlayerInfo.DECODE_TYPE_OTHER;

    return new PlayerInfo(type, videoUrl);
}

// ===== 辅助函数 =====
function getDoc(url) {
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(url)
    );
    var response = req.execute();
    return Jsoup.parse(response.body().string());
}

function getRootUrl() {
    return preferenceHelper.get("Host", "https://example.com");
}

function extractId(href) {
    // 从 URL 中提取 ID，例如 /detail/123 -> 123
    var parts = href.split("/");
    return parts[parts.length - 1].replace(".html", "");
}
