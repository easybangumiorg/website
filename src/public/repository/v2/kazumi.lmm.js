// @key kazumi.lmm
// @label LMM
// @versionName 2.2
// @versionCode 20200
// @libVersion 15
// @cover https://www.lmm85.com/favicon.ico

var networkHelper = Inject_NetworkHelper;
var okhttpHelper = Inject_OkhttpHelper;
var preferenceHelper = Inject_PreferenceHelper;
var webProxyProvider = Inject_WebProxyProvider;
var LMM_DEFAULT_HOST = "https://www.lmm85.com";
var LMM_MEDIA_WAIT = 8000;

function lmmText(value) { return value == null ? "" : String(value).replace(/\s+/g, " ").trim(); }
function lmmFail(message) { throw new ParserException(String(message), null); }
function PreferenceComponent_getPreference() {
    var list = new ArrayList();
    list.add(new SourcePreference.Edit("网页", "Host", LMM_DEFAULT_HOST));
    return list;
}
function normalizeRootUrl(raw) {
    var value = lmmText(raw) || LMM_DEFAULT_HOST;
    if (value.indexOf("//") == 0) value = "https:" + value;
    else if (!/^https?:\/\//i.test(value)) {
        if (value.indexOf("://") >= 0 || (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[^\s/?#:]+:\d+(?:\/|[?#]|$)/.test(value))) lmmFail("网页 Host 仅支持 http 或 https");
        value = "https://" + value;
    }
    var uri;
    try { uri = URI.create(value); } catch (ignored) { lmmFail("网页 Host 格式无效"); }
    var scheme = lmmText(uri.getScheme()).toLowerCase();
    if ((scheme != "http" && scheme != "https") || !lmmText(uri.getHost()) || uri.getRawUserInfo() != null || uri.getPort() > 65535) lmmFail("网页 Host 格式无效，仅支持 http 或 https");
    return (scheme + "://" + uri.getRawAuthority() + lmmText(uri.getRawPath())).replace(/\/+$/, "");
}
function getRootUrl() { return normalizeRootUrl(preferenceHelper.get("Host", LMM_DEFAULT_HOST)); }
function lmmUrl(path) { return getRootUrl() + "/" + lmmText(path).replace(/^\/+/, ""); }
function lmmHeaders(page) {
    var headers = new HashMap();
    headers.put("User-Agent", networkHelper.defaultAndroidUA);
    headers.put("Referer", page || getRootUrl() + "/");
    headers.put("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    return headers;
}
function lmmAbsolute(value) {
    var text = lmmText(value);
    if (!text) return "";
    if (/^https?:\/\//i.test(text)) {
        var uri;
        try { uri = URI.create(text); } catch (ignored) { return ""; }
        if (/^(?:www\.)?(?:lmm85|lmmzx)\.com$/i.test(lmmText(uri.getHost()))) return lmmUrl(lmmText(uri.getRawPath())) + (uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery());
        return text;
    }
    if (text.indexOf("//") == 0) return lmmText(URI.create(getRootUrl()).getScheme()) + ":" + text;
    if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return "";
    return SourceUtils.urlParser(getRootUrl() + "/", text);
}
function lmmRoute(value, kind) {
    var text = lmmText(value), path;
    try { path = lmmText(URI.create(text).getPath()); } catch (ignored) { return null; }
    var base = lmmText(URI.create(getRootUrl()).getPath()).replace(/\/+$/, "");
    if (base && path.indexOf(base + "/") == 0) path = path.substring(base.length);
    if (kind == "detail") return /^\/(?:vod\/)?detail\/(\d+)\.html$/.exec(path);
    return /^\/(?:vod\/)?play\/(\d+)_(\d+)_(\d+)\.html$/.exec(path);
}
function lmmVerification(html) {
    return /Just a moment|cf-chl-|challenge-platform|cf-turnstile|安全验证|请输入验证码|人机验证|verify-submit|登录后(?:观看|播放)|请先登录/i.test(String(html));
}
function lmmHttp(url) {
    var response = okhttpHelper.client.newCall(OkhttpUtils.get(url, lmmHeaders())).execute();
    try {
        var body = response.body(), text = body == null ? "" : String(body.string());
        if (lmmVerification(text) || response.code() == 401 || response.code() == 403) return { verification: true, html: text };
        if (!response.isSuccessful()) lmmFail("路漫漫请求失败: HTTP " + response.code());
        if (!lmmUsableHtml(text)) lmmFail("路漫漫返回空页面");
        return { verification: false, html: text };
    } finally { response.close(); }
}
function lmmUsableHtml(html) {
    if (!lmmText(html)) return false;
    var doc = Jsoup.parse(String(html));
    return lmmText(doc.text()).length > 0 || doc.select("a[href],video,iframe,form,script[src],.video-img-box").size() > 0;
}
function lmmProxyHtml(proxy, expectedUrl) {
    proxy.waitingForPageLoaded(5000);
    var html = "";
    // loadUrl is asynchronous; a previous about:blank event may finish first.
    // Require the requested URL plus meaningful content before parsing a result.
    for (var i = 0; i < 12; i++) {
        html = String(proxy.getContent() || "");
        if (lmmUsableHtml(html) && lmmProxyMatched(proxy, expectedUrl) && !lmmVerification(html)) return html;
        if (i < 11) proxy.delay(500);
    }
    return lmmUsableHtml(html) ? html : "";
}
function lmmGetDoc(url) {
    var result = lmmHttp(url);
    if (!result.verification) return Jsoup.parse(result.html, url);
    var proxy = webProxyProvider.getWebProxy();
    try {
        proxy.loadUrl(url, networkHelper.defaultAndroidUA, null, null, false);
        var html = lmmProxyHtml(proxy, url);
        if (!html || lmmVerification(html)) lmmFail("路漫漫网页需要验证，请先在源搜索中完成原网页验证，再刷新此页面");
        if (!lmmProxyMatched(proxy, url)) lmmFail("路漫漫网页发生跳转，请检查网页 Host 后重试");
        return Jsoup.parse(html, url);
    } finally { proxy.close(); }
}
function lmmFirstText(root, selectors) {
    for (var i = 0; i < selectors.length; i++) { var node = root.select(selectors[i]).first(); if (node != null && lmmText(node.text())) return lmmText(node.text()); }
    return "";
}
function lmmImage(root) {
    var image = root.select("img").first();
    if (image == null) return "";
    var attributes = ["data-src", "data-original", "src"];
    for (var i = 0; i < attributes.length; i++) { var value = lmmText(image.attr(attributes[i])); if (value && !/^data:/i.test(value)) return lmmAbsolute(value); }
    return "";
}
function lmmCards(root) {
    var nodes = root.select(".video-img-box"), result = new ArrayList(), seen = {};
    for (var i = 0; i < nodes.size(); i++) {
        var node = nodes.get(i), link = node.select(".img-box a[href]").first();
        if (link == null) link = node.select("h6.title a[href]").first();
        if (link == null) continue;
        var route = lmmRoute(link.attr("href"), "detail"), title = lmmFirstText(node, ["h6.title a", "h6 a", ".title a"]);
        if (!route || !title || seen[route[1]]) continue;
        seen[route[1]] = true;
        result.add(makeCartoonCover({ id: "lmm-v2:" + route[1], source: source.key, url: lmmUrl("detail/" + route[1] + ".html"), title: title,
            intro: lmmFirstText(node, [".img-box span.label", ".label", ".remarks"]), cover: lmmImage(node) }));
    }
    return result;
}
function lmmHomeSections(doc) {
    var sections = doc.select("section"), result = [];
    for (var i = 0; i < sections.size(); i++) {
        var node = sections.get(i);
        if (lmmCards(node).size() == 0) continue;
        var label = lmmFirstText(node, [".section-title h2", ".section-title", "h2", ".module-title"]);
        result.push({ label: label || "首页推荐", node: node });
    }
    if (result.length == 0 && lmmCards(doc).size() > 0) result.push({ label: "首页推荐", node: doc });
    if (result.length == 0) lmmFail("路漫漫首页未识别到番剧列表，请检查网页是否完成验证");
    return result;
}
function PageComponent_getMainTabs() {
    var result = new ArrayList();
    result.add(new MainTab("首页", MainTab.MAIN_TAB_GROUP));
    return result;
}
function PageComponent_getSubTabs(mainTab) {
    var result = new ArrayList(), sections = lmmHomeSections(lmmGetDoc(lmmUrl("")));
    for (var i = 0; i < sections.length; i++) result.add(new SubTab(sections[i].label, true, String(i)));
    return result;
}
function PageComponent_getContent(mainTab, subTab, pageKey) {
    if (Number(pageKey) > 0) return new Pair(null, new ArrayList());
    var sections = lmmHomeSections(lmmGetDoc(lmmUrl(""))), index = Number(subTab && subTab.ext);
    if (!isFinite(index) || index < 0 || Math.floor(index) != index || index >= sections.length) lmmFail("路漫漫首页分组已变化，请刷新首页");
    return new Pair(null, lmmCards(sections[index].node));
}
function lmmSearchUrl(pageKey, keyword) {
    var key = Math.max(0, Math.floor(Number(pageKey) || 0));
    return lmmUrl("vod/search.html") + "?wd=" + encodeURIComponent(lmmText(keyword)) + (key == 0 ? "" : "&page=" + (key + 1));
}
function lmmSearchResult(pageKey, keyword, html) {
    if (!lmmUsableHtml(html)) lmmFail("路漫漫搜索返回空页面");
    var doc = Jsoup.parse(html, lmmSearchUrl(pageKey, keyword)), result = lmmCards(doc), nextKey = null;
    var links = doc.select("a[href]");
    for (var i = 0; i < links.size(); i++) {
        var text = lmmText(links.get(i).text()), href = lmmText(links.get(i).attr("href"));
        if (/^(?:下一页|下页|Next|›|»|>)$/i.test(text) && href && href != "#" && !/^javascript:/i.test(href)) {
            var current = URI.create(lmmSearchUrl(pageKey, keyword)), next = URI.create(lmmAbsolute(href));
            if (lmmText(next.getPath()) == lmmText(current.getPath()) && lmmQuery(next.getRawQuery(), "wd") == lmmText(keyword) && Number(lmmQuery(next.getRawQuery(), "page")) == Number(pageKey) + 2) nextKey = Number(pageKey) + 1;
        }
    }
    if (result.size() == 0 && !/没有(?:找到|搜索到)|暂无(?:相关|数据|内容)|未找到|无相关|搜索结果.*0/i.test(String(doc.text()))) lmmFail("路漫漫搜索页未识别到结果，请确认原网页已完成验证");
    return new Pair(result.size() > 0 ? nextKey : null, result);
}
function lmmQuery(query, key) {
    var parts = String(query || "").split("&");
    for (var i = 0; i < parts.length; i++) { var separator = parts[i].indexOf("="); if (separator >= 0 && URLDecoder.decode(parts[i].substring(0, separator), "utf-8") == key) return String(URLDecoder.decode(parts[i].substring(separator + 1), "utf-8")); }
    return "";
}
function lmmJsValue(value) { try { return JSON.parse(String(value)); } catch (ignored) { return null; } }
function lmmProxyMatched(proxy, url) {
    var script = "(function(){var e=new URL(" + JSON.stringify(url) + ");var u=new URL(location.href);return u.origin+u.pathname===e.origin+e.pathname&&u.searchParams.get('wd')===e.searchParams.get('wd')&&(u.searchParams.get('page')||'1')===(e.searchParams.get('page')||'1');})()";
    return lmmJsValue(proxy.executeJavaScript(script, 1000)) === true;
}
function SearchComponent_search(pageKey, keyword) {
    var url = lmmSearchUrl(pageKey, keyword), proxy = webProxyProvider.getWebProxy();
    proxy.loadUrl(url, networkHelper.defaultAndroidUA, null, null, false);
    return lmmSearchWithProxy(pageKey, keyword, proxy);
}
function SearchComponent_searchWithCheck(pageKey, keyword, proxy) { return lmmSearchWithProxy(pageKey, keyword, proxy); }
function lmmSearchWithProxy(pageKey, keyword, proxy) {
    var html = lmmProxyHtml(proxy, lmmSearchUrl(pageKey, keyword));
    if (!html || lmmVerification(html)) proxy.needUserCheck("请在路漫漫原搜索页完成验证或登录，出现搜索结果后点验证完成");
    if (!lmmProxyMatched(proxy, lmmSearchUrl(pageKey, keyword))) proxy.needUserCheck("请返回原搜索词和页码对应的路漫漫搜索结果，再点验证完成");
    var result = lmmSearchResult(pageKey, keyword, html);
    proxy.close();
    return result;
}
function lmmDecodeLegacy(value) {
    var parts = String(value).split("|"), result = [];
    try { for (var i = 0; i < Math.min(parts.length, 3); i++) result.push(String(URLDecoder.decode(parts[i], "utf-8"))); }
    catch (ignored) { lmmFail("旧路漫漫收藏格式无效，请重新搜索并收藏"); }
    return { url: result[0] || "", title: result[1] || "", cover: result[2] || "" };
}
function lmmSummary(summary) {
    var id = lmmText(summary.id), modern = /^lmm-v2:(\d+)$/.exec(id);
    if (modern && Number(modern[1]) > 0) return { id: modern[1], title: "", cover: "" };
    if (id.indexOf("lmm-v2:") == 0) lmmFail("路漫漫番剧 ID 无效，请重新搜索");
    var old = lmmDecodeLegacy(id), route = lmmRoute(old.url, "detail");
    if (!route || Number(route[1]) <= 0 || !lmmText(old.title)) lmmFail("旧路漫漫收藏无法安全迁移，请重新搜索并收藏");
    return { id: route[1], title: lmmText(old.title), cover: lmmAbsolute(old.cover) };
}
function lmmDetailIntro(doc) {
    var items = doc.select(".video-info-items");
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i), label = lmmFirstText(item, [".video-info-itemtitle"]);
        if (/^集数[：:]?$/.test(label)) return lmmFirstText(item, [".video-info-item"]);
    }
    return lmmFirstText(doc, [".remarks", ".module-info-item-content", ".video-info-items"]);
}
function lmmDetail(doc, summary) {
    var remote = lmmSummary(summary), title = lmmFirstText(doc, ["h1", ".video-info h1", ".module-info-heading h1"]);
    if (!title) lmmFail("路漫漫详情标题为空，请确认原网页可访问");
    if (remote.title && title != remote.title) lmmFail("路漫漫收藏与当前作品标题不一致，请重新搜索并收藏");
    var coverNode = doc.select("meta[property=og:image]").first();
    var cover = coverNode == null ? "" : lmmAbsolute(coverNode.attr("content"));
    if (!cover) { var imageRoot = doc.select(".video-cover,.detail-pic,.module-item-pic,.img-box").first(); cover = imageRoot == null ? remote.cover : lmmImage(imageRoot); }
    var description = lmmFirstText(doc, [".module-info-introduction-content", ".video-info-content", ".vod-content", ".detail-content"]);
    var intro = lmmDetailIntro(doc);
    var groups = doc.select(".scroll-content"), tabs = doc.select(".module-tab-item.tab-item"), lines = new ArrayList(), usedLines = {};
    for (var i = 0; i < groups.size(); i++) {
        var links = groups.get(i).select("a[href]"), episodes = new ArrayList(), lineId = "", usedEpisodes = {};
        for (var j = 0; j < links.size(); j++) {
            var link = links.get(j), route = lmmRoute(link.attr("href"), "play"), label = lmmText(link.text());
            if (!route || route[1] != remote.id || !label) continue;
            if (lineId && lineId != route[2]) lmmFail("路漫漫线路结构不一致，请刷新详情");
            lineId = route[2];
            var episodeId = "lmm-v2:" + route[1] + ":" + route[2] + ":" + route[3];
            if (usedEpisodes[episodeId]) continue;
            usedEpisodes[episodeId] = true;
            episodes.add(new Episode(episodeId, label, episodes.size()));
        }
        if (episodes.size() == 0) continue;
        if (usedLines[lineId]) lmmFail("路漫漫返回重复线路，请刷新详情");
        usedLines[lineId] = true;
        var lineLabel = i < tabs.size() ? lmmText(tabs.get(i).text()) : "";
        lines.add(new PlayLine("lmm-v2:" + lineId, lineLabel || "播放线路 " + lineId, episodes));
    }
    var cartoon = makeCartoon({ id: String(summary.id), source: source.key, url: lmmUrl("detail/" + remote.id + ".html"), title: title, cover: cover || "", intro: intro,
        description: description, status: /已完结|全\d+话|全\d+集/.test(intro) ? Cartoon.STATUS_COMPLETED : Cartoon.STATUS_UNKNOWN, updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS });
    return new Pair(cartoon, lines);
}
function DetailedComponent_getDetailed(summary) { var remote = lmmSummary(summary); return lmmDetail(lmmGetDoc(lmmUrl("detail/" + remote.id + ".html")), summary); }
function lmmPlayContext(summary, line, episode) {
    var remote = lmmSummary(summary), match = /^lmm-v2:(\d+):(\d+):(\d+)$/.exec(lmmText(episode.id));
    if (!match) lmmFail("旧路漫漫选集已失效，请刷新详情后重新选集");
    if (remote.id != match[1] || lmmText(line.id) != "lmm-v2:" + match[2] || Number(match[2]) <= 0 || Number(match[3]) <= 0) lmmFail("路漫漫作品或线路不匹配，请刷新详情");
    return { id: remote.id, line: match[2], order: match[3], page: lmmUrl("play/" + match[1] + "_" + match[2] + "_" + match[3] + ".html") };
}
function lmmHttpMedia(value) {
    var uri;
    try { uri = URI.create(lmmText(value)); } catch (ignored) { return false; }
    return /^(?:http|https)$/i.test(lmmText(uri.getScheme())) && lmmText(uri.getHost()).length > 0 && uri.getRawUserInfo() == null;
}
function lmmDirectMedia(value) {
    var uri;
    try { uri = URI.create(lmmText(value)); } catch (ignored) { return false; }
    return /^(?:http|https)$/i.test(lmmText(uri.getScheme())) && lmmText(uri.getHost()).length > 0 && /\.(?:m3u8|mp4|mpd)$/i.test(lmmText(uri.getPath()));
}
function lmmPlayerInfo(value, page) {
    var url = lmmText(value);
    if (!lmmHttpMedia(url)) lmmFail("路漫漫未返回可用媒体地址，请确认原网页当前集数可播放");
    var result = new PlayerInfo(/\.m3u8(?:[?#]|$)/i.test(url) ? PlayerInfo.DECODE_TYPE_HLS : PlayerInfo.DECODE_TYPE_OTHER, url);
    result.header = new HashMap();
    result.header.put("User-Agent", networkHelper.defaultAndroidUA);
    result.header.put("Referer", page);
    return result;
}
function lmmEmbeddedMedia(html, context) {
    var match = /(?:var\s+)?player_aaaa\s*=\s*(\{[^;]*?\})\s*;?\s*<\/script>/i.exec(String(html)), player = null;
    if (!match) return "";
    try { player = JSON.parse(match[1]); } catch (ignored) { return ""; }
    if (String(player.id) != context.id || String(player.sid) != context.line || String(player.nid) != context.order) lmmFail("路漫漫播放器与所选作品、线路或集数不一致");
    if (lmmText(player.link)) {
        var route = lmmRoute(player.link, "play");
        if (!route || route[1] != context.id || route[2] != context.line || route[3] != context.order) lmmFail("路漫漫播放器链接与所选集数不一致");
    }
    var url = lmmText(player.url);
    if (Number(player.encrypt) == 1) { try { url = decodeURIComponent(url); } catch (ignoredEncoding) { return ""; } }
    return lmmDirectMedia(url) || (Number(player.encrypt) == 0 && lmmText(player.from) == "dpmp4" && lmmHttpMedia(url)) ? url : "";
}
function lmmProxyMedia(proxy, context, html, allowFreshResources) {
    if (!lmmProxyMatched(proxy, context.page)) proxy.needUserCheck("请返回当前作品的原线路和所选集数，再点验证完成");
    var issued = lmmEmbeddedMedia(html, context);
    if (issued && lmmProxyMatched(proxy, context.page)) return lmmPlayerInfo(issued, context.page);
    var script = "(function(){function find(w){try{var v=w.document.querySelector('video');if(v&&/^(?:http|https):/.test(v.currentSrc||v.src||''))return v.currentSrc||v.src;var f=w.document.querySelectorAll('iframe');for(var i=0;i<f.length;i++){var s=find(f[i].contentWindow);if(s)return s;}}catch(e){}return '';}return find(window);})()";
    var media = lmmJsValue(proxy.executeJavaScript(script, 1000));
    if (lmmHttpMedia(media) && lmmProxyMatched(proxy, context.page)) return lmmPlayerInfo(media, context.page);
    // Only a freshly loaded proxy may use its resource list. A verification callback
    // may contain other episodes in history, so it never reads that list.
    if (allowFreshResources === true) media = proxy.waitingForResourceLoaded("(?i)https?://[^/?#\\s]+/[^?#\\s]*\\.(?:m3u8|mp4|mpd)(?:[?#][^\\s]*)?", true, LMM_MEDIA_WAIT);
    if (allowFreshResources === true && lmmDirectMedia(media) && lmmProxyMatched(proxy, context.page)) return lmmPlayerInfo(media, context.page);
    proxy.needUserCheck("路漫漫尚未返回当前选集的媒体，请在原页面完成验证或登录并确认能播放，再点验证完成");
}
function PlayComponent_getPlayInfo(summary, line, episode) {
    var context = lmmPlayContext(summary, line, episode), page = lmmHttp(context.page);
    if (!page.verification) { var direct = lmmEmbeddedMedia(page.html, context); if (direct) return lmmPlayerInfo(direct, context.page); }
    var proxy = webProxyProvider.getWebProxy();
    proxy.loadUrl(context.page, networkHelper.defaultAndroidUA, null, null, false);
    var html = lmmProxyHtml(proxy, context.page);
    if (!html || lmmVerification(html)) proxy.needUserCheck("请在路漫漫原播放页完成验证或登录；保持当前作品、线路和集数，播放成功后点验证完成");
    return lmmProxyMedia(proxy, context, html, true);
}
function PlayComponent_getPlayInfoWithCheck(summary, line, episode, proxy) {
    var context = lmmPlayContext(summary, line, episode), html = lmmProxyHtml(proxy, context.page);
    if (!html || lmmVerification(html)) proxy.needUserCheck("路漫漫原网页仍需验证或登录，请完成后点验证完成");
    return lmmProxyMedia(proxy, context, html, false);
}
