// @key heyanle.yhw
// @label 樱花动漫 (示例)
// @versionName 1.0
// @versionCode 1
// @libVersion 13
// @cover https://www.857yhw.com/favicon.ico

// ===== 注入工具类 =====
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;
var webProxyProvider = Inject_WebProxyProvider;

// ===== 偏好设置组件 =====
function PreferenceComponent_getPreference() {
    var res = new ArrayList();
    res.add(new SourcePreference.Edit("网页地址", "Host", "https://www.857yhw.com"));
    res.add(new SourcePreference.Edit("播放器正则", "PlayerReg", "https://danmu.yhdmjx.com/m3u8.php?.*"));
    return res;
}

// ===== 页面组件 - 主标签 =====
function PageComponent_getMainTabs() {
    var res = new ArrayList();
    res.add(new MainTab("日本动漫", MainTab.MAIN_TAB_WITH_COVER));
    res.add(new MainTab("国产动漫", MainTab.MAIN_TAB_WITH_COVER));
    res.add(new MainTab("更新时刻表", MainTab.MAIN_TAB_GROUP));
    return res;
}

// ===== 页面组件 - 子标签 =====
function PageComponent_getSubTabs(mainTab) {
    var res = new ArrayList();
    if (mainTab.label == "更新时刻表") {
        var url = SourceUtils.urlParser(getRootUrl(), "");
        var doc = getDoc(url);
        var contents = doc.select("div#content div.mod").iterator();
        var titles = doc.select("div.container div div div div div.col-lg-wide-3 title li").iterator();

        while (titles.hasNext() && contents.hasNext()) {
            var title = titles.next();
            var content = contents.next();
            var label = title.text();
            var liList = content.select("ul.new_anime_page li");
            var r = new ArrayList();

            for (var i = 0; i < liList.size(); i++) {
                var it = liList.get(i);
                var a = it.select("a").first();
                var span = it.select("span").first();
                var uu = a.attr("href");
                var url = SourceUtils.urlParser(getRootUrl(), uu);
                var titleText = a.text();
                var intro = span != null ? span.text() : "";

                if (uu.length() >= 13) {
                    var id = uu.subSequence(7, uu.length() - 5).toString();
                    r.add(makeCartoonCover({
                        id: id,
                        title: titleText,
                        url: url,
                        intro: intro,
                        cover: ""
                    }));
                }
            }
            res.add(new SubTab(label, false, r));
        }
    }
    return res;
}

// ===== 页面组件 - 内容获取 =====
function PageComponent_getContent(mainTab, subTab, key) {
    if (mainTab.label == "日本动漫") {
        var res = getContentList("ribendongman", key + 1);
        if (res == null || res.size() == 0) return new Pair(null, new ArrayList());
        return new Pair(key + 1, res);
    } else if (mainTab.label == "国产动漫") {
        var res = getContentList("guochandongman", key + 1);
        if (res == null || res.size() == 0) return new Pair(null, new ArrayList());
        return new Pair(key + 1, res);
    } else if (mainTab.label == "更新时刻表") {
        return new Pair(null, subTab.ext);
    }
    return new Pair(null, new ArrayList());
}

function getContentList(type, page) {
    var url = SourceUtils.urlParser(getRootUrl(), "show/" + type + "--------" + page + "---.html");
    var doc = getDoc(url);
    var res = new ArrayList();
    var elements = doc.select("ul.myui-vodlist li");

    for (var i = 0; i < elements.size(); i++) {
        var it = elements.get(i);
        var a = it.select("a").first();
        var uu = a.attr("href");
        var cover = a.attr("data-original");

        if (uu.length() >= 13) {
            var id = uu.subSequence(7, uu.length() - 5).toString();
            res.add(makeCartoonCover({
                id: id,
                title: a.attr("title"),
                url: SourceUtils.urlParser(getRootUrl(), uu),
                cover: SourceUtils.urlParser(getRootUrl(), cover)
            }));
        }
    }
    return res;
}

// ===== 详情组件 =====
function DetailedComponent_getDetailed(summary) {
    var url = SourceUtils.urlParser(getRootUrl(), "/video/" + summary.id + ".html");
    var doc = getDoc(url);
    var cartoon = detailed(doc, summary);
    var playLines = playline(doc, summary);
    return new Pair(cartoon, playLines);
}

function detailed(doc, summary) {
    var title = doc.select("h1.title").text();
    var coverEle = doc.select(".myui-content__thumb img").first();
    var cover = coverEle != null ? coverEle.attr("data-original") : "";
    var descEle = doc.select(".myui-content__detail p.data").first();
    var desc = descEle != null ? descEle.ownText() : "";

    return makeCartoon({
        id: summary.id,
        url: SourceUtils.urlParser(getRootUrl(), "/video/" + summary.id + ".html"),
        title: title,
        cover: SourceUtils.urlParser(getRootUrl(), cover),
        intro: "",
        description: desc,
        status: Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    });
}

function playline(doc, summary) {
    var tabs = doc.select(".myui-panel_hd ul li").iterator();
    var epRoot = doc.select(".tab-content div").iterator();
    var playLines = new ArrayList();
    var ii = 1;

    while (tabs.hasNext() && epRoot.hasNext()) {
        var tab = tabs.next();
        var ul = epRoot.next();
        var es = new ArrayList();
        var ulc = ul.select("li");

        for (var index = 0; index < ulc.size(); index++) {
            var element = ulc.get(index);
            var label = element != null ? element.text() : "";
            es.add(new Episode((index + 1).toString(), label, index));
        }
        playLines.add(new PlayLine(ii.toString(), tab.text(), es));
        ii++;
    }
    return playLines;
}

// ===== 搜索组件 =====
function SearchComponent_search(page, keyword) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/search/" + URLEncoder.encode(keyword, "utf-8") + "----------" + (page + 1) + "---.html"
    );
    var doc = getDoc(url);
    var res = new ArrayList();
    var elements = doc.select("ul#searchList li");

    for (var i = 0; i < elements.size(); i++) {
        var par = elements.get(i);
        var a = par.select("a").first();
        if (a == null) continue;

        var uu = a.attr("href");
        if (uu.length() < 13) continue;

        var id = uu.subSequence(7, uu.length() - 5).toString();
        var cover = a.attr("data-original");
        if (cover.startsWith("//")) cover = "http:" + cover;

        res.add(makeCartoonCover({
            id: id,
            title: a.attr("title"),
            url: SourceUtils.urlParser(getRootUrl(), uu),
            cover: SourceUtils.urlParser(getRootUrl(), cover)
        }));
    }

    if (res.size() == 0) return new Pair(null, new ArrayList());
    return new Pair(page + 1, res);
}

// ===== 播放组件 =====
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var url = SourceUtils.urlParser(
        getRootUrl(),
        "/play/" + summary.id + "-" + playLine.id + "-" + episode.id + ".html"
    );

    var webProxy = webProxyProvider.getWebProxy();
    webProxy.loadUrl(url, networkHelper.defaultLinuxUA);

    // 等待匹配正则的资源
    var res = webProxy.waitingForResourceLoaded(
        preferenceHelper.get("PlayerReg", ".*\\.m3u8.*")
    );

    if (res != null && res.length() > 0) {
        webProxy.href(res);
        webProxy.waitingForPageLoaded();
    }

    // 等待视频加载
    var tt = 0, video = null;
    while (tt < 6) {
        webProxy.delay(500);
        var content = webProxy.getContentWithIframe();
        var doc = Jsoup.parse(content);
        video = doc.select("#lelevideo").first();
        if (video != null) break;
        tt++;
    }

    if (video == null) throw new ParserException("视频解析失败");

    var src = video.attr("src");
    var type = src.contains(".m3u8") ? PlayerInfo.DECODE_TYPE_HLS : PlayerInfo.DECODE_TYPE_OTHER;

    return new PlayerInfo(type, src);
}

// ===== 辅助函数 =====
function getDoc(url) {
    var req = okhttpHelper.cloudflareWebViewClient.newCall(OkhttpUtils.get(url));
    return Jsoup.parse(req.execute().body().string());
}

function getRootUrl() {
    return preferenceHelper.get("Host", "https://www.857yhw.com");
}
