// @key kazumi.mifun
// @label MiFun
// @versionName 1.1.1
// @versionCode 10101
// @libVersion 15
// @cover https://ios.mifun.org/favicon.ico

var networkHelper = Inject_NetworkHelper;
var okhttpHelper = Inject_OkhttpHelper;
var preferenceHelper = Inject_PreferenceHelper;
var webProxyProvider = Inject_WebProxyProvider;
var DEFAULT_BASE_URL = "https://ios.mifun.org";
var searchPagination = { host: "", keyword: "", paths: {} };
var PLAY_CHECK_TIPS = "请在 MiFun 网页中完成验证并播放当前剧集，网页开始播放后返回。";

function PreferenceComponent_getPreference() {
    var result = new ArrayList();
    result.add(new SourcePreference.Edit("网页", "Host", DEFAULT_BASE_URL));
    return result;
}

function PageComponent_getMainTabs() {
    return new NonLabelMainTab(MainTab.MAIN_TAB_WITH_COVER);
}
function PageComponent_getSubTabs(mainTab) { return new ArrayList(); }
function PageComponent_getContent(mainTab, subTab, pageKey) {
    if (pageKey != null && String(pageKey) != "0" && String(pageKey) != "1") {
        return new Pair(null, new ArrayList());
    }
    var doc = getDoc(siteUrl("/"));
    // Banner and regular cards share the real document order; rankings are excluded.
    var nodes = doc.select(".conch-br-swiper a.hl-br-thumb[href], .conch-content .hl-vod-list .hl-list-item");
    return new Pair(null, parseCards(nodes, 40));
}

function SearchComponent_search(pageKey, keyword) {
    var pageNumber = searchPageNumber(pageKey);
    var url = searchUrl(pageNumber, keyword);
    var page = requestPage(url);
    if (page.status == 403 || page.status == 503 || isVerificationDocument(page.doc)) {
        var webProxy = webProxyProvider.getWebProxy();
        webProxy.loadUrl(url, userAgent(), makeHeaders(), null, false);
        var loaded = webProxy.waitingForPageLoaded(8000);
        return searchFromWebProxy(webProxy, pageNumber, keyword, loaded);
    }
    requireSuccessfulPage(page);
    return parseSearch(page.doc, pageNumber, keyword);
}
function SearchComponent_searchWithCheck(pageKey, keyword, webProxy) {
    var loaded = webProxy.waitingForPageLoaded(5000);
    return searchFromWebProxy(webProxy, searchPageNumber(pageKey), keyword, loaded);
}
function searchFromWebProxy(webProxy, pageNumber, keyword, loaded) {
    ensureSearchContext(keyword, false);
    for (var i = 0; i < 3; i++) {
        var before = readWebLocation(webProxy);
        var html = webProxy.getContent(4000);
        var doc = Jsoup.parse(String(html == null ? "" : html), siteUrl("/"));
        var after = readWebLocation(webProxy);
        if (validWebOrigin(after) && isVerificationDocument(doc)) {
            // needUserCheck transfers this exact window, including on a second check.
            webProxy.needUserCheck("请在 MiFun 网页完成搜索验证，出现搜索结果后返回。");
        }
        if (stableWebLocation(before, after) && currentSearchPath(before, pageNumber, keyword) && currentSearchPath(after, pageNumber, keyword) && searchDocumentReady(doc)) {
            try { return parseSearch(doc, pageNumber, keyword); }
            finally { webProxy.close(); }
        }
        // A false SDK load result or about:blank never counts as an empty search.
        // Independent complete-page state can confirm a page that finishes during these bounded polls.
        webProxy.delay(250);
    }
    webProxy.close();
    throw new ParserException(loaded === false ? "MiFun 搜索页加载超时，请等待网页出现搜索结果后重新搜索" : "MiFun 搜索页尚未就绪或已跳转，请重新搜索", null);
}
function searchDocumentReady(doc) {
    var nodes = doc.select(".hl-one-list > .hl-list-item");
    if (parseCards(nodes, 0).size() > 0) { return true; }
    if (nodes.size() > 0) { return false; }
    // A genuine empty page must explicitly report zero, not just lack result cards.
    var total = doc.select(".hl-rb-total .hl-total").first();
    if (total != null && trimText(total.text()) == "0" && doc.select(".hl-one-list, .hl-search-form").size() > 0) { return true; }
    // The observed server-rendered empty template leaves .hl-total blank.
    return doc.select(".hl-one-list").size() > 0 && nodeText(doc, ".hl-empty-wrap") == "没有找到匹配数据";
}
function currentSearchPath(state, pageNumber, keyword) {
    var actual = sitePath(state.path);
    if (pageNumber == 0 || pageNumber == 1) {
        if (actual == "/vodsearch/") { return Number(state.wdCount) == 1 && String(state.wd) == String(keyword); }
        try { return String(new URI(actual).getPath()) == "/vodsearch" + String(keyword) + "/page/1/"; } catch (ignored) { return false; }
    }
    var expected = searchPagination.paths[String(pageNumber)];
    try { return expected && String(new URI(actual).getPath()) == String(new URI(expected).getPath()); } catch (ignored) { return false; }
}
function readWebLocation(webProxy) {
    // Export only the public wd value/count on query-form search routes, never the full query or session data.
    var script = "(function(){var s={origin:location.origin,path:location.pathname,ready:document.readyState,wd:'',wdCount:0};if(/\\/vodsearch\\/?$/.test(s.path)){var values=new URLSearchParams(location.search).getAll('wd');s.wdCount=values.length;s.wd=values.length?values[0]:'';}return JSON.stringify(s);})();";
    try {
        var state = JSON.parse(String(webProxy.executeJavaScript(script, 100)));
        if (typeof state == "string") { state = JSON.parse(state); }
        return state || {};
    } catch (ignored) { return {}; }
}
function validWebOrigin(state) {
    try { return state.origin && isSiteUri(new URI(String(state.origin))); } catch (ignored) { return false; }
}
function stableWebLocation(before, after) {
    return validWebOrigin(before) && validWebOrigin(after) && before.ready == "complete" && after.ready == "complete" &&
        String(before.origin) == String(after.origin) && String(before.path) == String(after.path);
}
function searchPageNumber(pageKey) {
    if (pageKey == null) { return 0; }
    var value = String(pageKey);
    if (!/^\d+$/.test(value)) { throw new ParserException("MiFun 搜索页码无效，请重新搜索", null); }
    return parseInt(value, 10);
}
function ensureSearchContext(keyword, reset) {
    var host = getRootUrl();
    var word = String(keyword);
    if (searchPagination.host != host) { searchPagination = { host: host, keyword: "", paths: {} }; }
    if (reset) { searchPagination = { host: host, keyword: word, paths: {} }; }
    if (searchPagination.keyword != word) { throw new ParserException("MiFun 搜索分页上下文已过期，请重新搜索", null); }
}
function searchUrl(pageNumber, keyword) {
    if (pageNumber == 0 || pageNumber == 1) {
        ensureSearchContext(keyword, true);
        return siteUrl("/vodsearch/?wd=" + URLEncoder.encode(String(keyword), "UTF-8") + "&submit=");
    }
    ensureSearchContext(keyword, false);
    var path = searchPagination.paths[String(pageNumber)];
    if (!path) { throw new ParserException("MiFun 搜索分页上下文已过期，请重新搜索", null); }
    return siteUrl(path);
}
function parseSearch(doc, pageNumber, keyword) {
    ensureSearchContext(keyword, false);
    if (!searchDocumentReady(doc)) { throw new ParserException("MiFun 搜索页缺少有效结果或明确的零结果提示，请重新搜索", null); }
    var list = parseCards(doc.select(".hl-one-list > .hl-list-item"), 0);
    var next = null;
    var links = doc.select(".hl-page-wrap a[href]");
    for (var i = 0; i < links.size(); i++) {
        var a = links.get(i);
        if (trimText(a.text()).indexOf("下一页") >= 0 && !a.hasClass("hl-disad") && !a.parent().hasClass("hl-disad")) {
            var path = sitePath(a.attr("href"));
            var match = String(path).match(/^\/vodsearch([^?#]*)\/page\/(\d+)\/$/);
            if (match != null) {
                var returnedWord = "";
                try { returnedWord = String(URLDecoder.decode(match[1], "UTF-8")); } catch (ignored) {}
                var number = parseInt(match[2], 10);
                if (returnedWord == String(keyword) && number > (pageNumber == 0 ? 1 : pageNumber)) {
                    searchPagination.paths[String(number)] = path;
                    // API15 JSSearchComponent coerces Pair.first to Int, so only return the number.
                    next = number;
                }
            }
            break;
        }
    }
    return new Pair(next, list);
}
function parseCards(nodes, limit) {
    var result = new ArrayList();
    var seen = new HashMap();
    for (var i = 0; i < nodes.size(); i++) {
        var item = nodes.get(i);
        var a = item.tagName() == "a" ? item : item.select("a.hl-item-thumb[href]").first();
        if (a == null) { continue; }
        var id = detailIdFromPath(sitePath(a.attr("href")));
        var title = trimText(a.attr("title"));
        if (!title) { title = nodeText(item, ".hl-item-title, .hl-br-title"); }
        if (!id || !title || seen.containsKey(id)) { continue; }
        seen.put(id, true);
        result.add(makeCartoonCover({ id: id, source: source.key, url: detailUrl(id), title: title,
            intro: nodeText(item, ".remarks, .hl-br-remarks"), cover: imageUrl(a) }));
        if (limit > 0 && result.size() >= limit) { break; }
    }
    return result;
}

function DetailedComponent_getDetailed(summary) {
    var loaded = loadDetail(summary);
    return new Pair(makeCartoon({ id: String(summary.id), source: source.key, url: detailUrl(loaded.id),
        title: loaded.title, cover: imageUrl(loaded.doc.select(".hl-dc-pic .hl-item-thumb").first()),
        intro: loaded.description, description: loaded.description, status: detailStatus(loaded.doc),
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS }), parsePlayLines(loaded.doc, loaded.id));
}
function loadDetail(summary) {
    var saved = readDetailId(summary.id);
    if (saved.legacy && !trimText(saved.title)) { throw new ParserException("MiFun 旧收藏缺少作品标题，请重新搜索并确认作品", null); }
    var doc = getDoc(detailUrl(saved.id));
    var title = nodeText(doc, ".hl-dc-title");
    if (!title) { throw new ParserException("MiFun 详情页缺少作品标题", null); }
    if (saved.legacy) {
        var previousTitle = saved.title;
        // Old .tw URLs are retained only after verifying the work, never just the numeric ID.
        if (!previousTitle || normalizedTitle(previousTitle) != normalizedTitle(title)) {
            throw new ParserException("MiFun 旧收藏作品信息不匹配，请重新搜索并确认作品", null);
        }
    }
    return { id: saved.id, doc: doc, title: title, description: nodeText(doc, ".hl-content-text") };
}
function parsePlayLines(doc, detailId) {
    var lists = doc.select(".hl-play-source .hl-plays-list");
    var tabs = doc.select(".hl-play-source .hl-plays-from a[href]");
    var result = new ArrayList();
    for (var i = 0; i < lists.size(); i++) {
        var links = lists.get(i).select("a[href]");
        var episodes = new ArrayList();
        var lineId = "";
        for (var j = 0; j < links.size(); j++) {
            var a = links.get(j);
            var ep = episodeIdFromPath(sitePath(a.attr("href")));
            if (!ep || ep.split("-")[0] != detailId) { continue; }
            lineId = ep.split("-")[1];
            episodes.add(new Episode(ep, trimText(a.text()), episodes.size()));
        }
        if (episodes.size() > 0) {
            var label = i < tabs.size() ? trimText(tabs.get(i).attr("alt")) : "";
            result.add(new PlayLine(lineId || String(i), label || "播放线路" + (i + 1), episodes));
        }
    }
    return result;
}
function detailStatus(doc) {
    var nodes = doc.select(".hl-vod-data li");
    for (var i = 0; i < nodes.size(); i++) {
        var text = trimText(nodes.get(i).text());
        if (text.indexOf("状态：") == 0) {
            if (/完结|全\d+集/.test(text)) { return Cartoon.STATUS_COMPLETED; }
            if (/更新|第\d+集/.test(text)) { return Cartoon.STATUS_ONGOING; }
        }
    }
    return Cartoon.STATUS_UNKNOWN;
}

function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var pageUrl = checkedEpisodeUrl(summary, episode);
    var page = requestPage(pageUrl);
    if (page.status == 403 || page.status == 503 || isVerificationDocument(page.doc)) { return startWebPlayback(pageUrl); }
    requireSuccessfulPage(page);
    var doc = page.doc;
    var info = currentPlayerMedia(doc, readEpisodeId(episode.id));
    if (info != null) { return info; }
    return startWebPlayback(pageUrl);
}
function startWebPlayback(pageUrl) {
    var webProxy = webProxyProvider.getWebProxy();
    webProxy.loadUrl(pageUrl, userAgent(), makeHeaders(), null, false);
    var loaded = webProxy.waitingForPageLoaded(8000);
    return resolveWebPlayback(webProxy, false, episodeIdFromPath(sitePath(pageUrl)), loaded);
}
function PlayComponent_getPlayInfoWithCheck(summary, playLine, episode, webProxy) {
    var ep = readEpisodeId(episode.id);
    if (ep.split("-")[0] != readDetailId(summary.id).id) { throw new ParserException("MiFun 剧集与作品不匹配", null); }
    var state = readWebLocation(webProxy);
    if (validWebOrigin(state) && state.ready == "complete" && episodeIdFromPath(sitePath(state.path)) != ep) {
        // href preserves the original verified window, but its Android resource table is not cleared.
        webProxy.href(siteUrl("/vodplay/" + ep + "/"), true);
        webProxy.delay(250);
    }
    var loaded = webProxy.waitingForPageLoaded(5000);
    return resolveWebPlayback(webProxy, true, ep, loaded);
}
function playerMatchesEpisode(config, episodeId) {
    if (config == null) { return false; }
    var identified = false;
    if (config.id != null && config.sid != null && config.nid != null) {
        if (String(config.id) + "-" + String(config.sid) + "-" + String(config.nid) != episodeId) { return false; }
        identified = true;
    }
    if (config.link) {
        if (episodeIdFromPath(sitePath(config.link)) != episodeId) { return false; }
        identified = true;
    }
    return identified;
}
function currentPlayerMedia(doc, episodeId) {
    var config = playerConfig(doc);
    if (!playerMatchesEpisode(config, episodeId)) { return null; }
    var media = Number(config.encrypt || 0) == 0 ? resolveUrl(config.url) : "";
    if (isHttpMedia(media)) { return makeMediaInfo(media, makeMediaHeaders(true)); }
    // This official frame is derived from the selected episode's current player object.
    // Read only the public parameters supplied by the site; never generate or re-sign them.
    var frameUrl = officialFrameUrl(doc, config);
    if (frameUrl) {
        try { var parsed = publicFrameMedia(frameUrl); if (parsed) { return makeMediaInfo(parsed.url, parsed.headers); } }
        catch (ignored) { /* Site verification or a changed public parser remains user-visible below. */ }
    }
    return null;
}
function checkedEpisodeUrl(summary, episode) {
    var loaded = loadDetail(summary);
    var ep = readEpisodeId(episode.id);
    if (ep.split("-")[0] != loaded.id) { throw new ParserException("MiFun 剧集与作品不匹配", null); }
    var links = loaded.doc.select(".hl-play-source .hl-plays-list a[href]");
    for (var i = 0; i < links.size(); i++) {
        if (episodeIdFromPath(sitePath(links.get(i).attr("href"))) == ep) { return siteUrl("/vodplay/" + ep + "/"); }
    }
    throw new ParserException("MiFun 剧集已变化，请刷新详情后重试", null);
}
function playerConfig(doc) {
    var scripts = doc.select("script");
    for (var i = 0; i < scripts.size(); i++) {
        var match = String(scripts.get(i).data()).match(/player_aaaa\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
        if (match != null) { try { return JSON.parse(match[1]); } catch (ignored) {} }
    }
    return null;
}
function officialFrameUrl(doc, config) {
    if (config == null || !config.url) { return ""; }
    var html = String(doc.html());
    var match = html.match(/['"]((?:https?:)?\/\/[^'"\s]+\?url=)['"]\s*\+\s*player_aaaa\.url/);
    if (match != null) { return resolveUrl(match[1]) + String(config.url); }
    var frame = doc.select("#playerMainFrame[src], .MacPlayer iframe[src]").first();
    return frame == null ? "" : resolveUrl(frame.attr("src"));
}
function publicFrameMedia(frameUrl) {
    var frame = getDoc(frameUrl);
    var html = String(frame.html());
    var rawUrl = publicScriptString(html, "Url");
    var rawSign = publicScriptString(html, "Sign");
    var apiMatch = html.match(/url\s*:\s*['"](api\.php)['"]/);
    if (!rawUrl || !rawSign || apiMatch == null) { return null; }
    var api = String(new URI(frameUrl).resolve(apiMatch[1])) + "?url=" + URLEncoder.encode(rawUrl, "UTF-8") + "&sign=" + URLEncoder.encode(rawSign, "UTF-8");
    var root = JSON.parse(getText(api, makeHeaders(frameUrl)));
    if (Number(root.code) != 200 || !isHttpUrl(root.url)) { return null; }
    var noReferrer = frame.select("meta[name=referrer][content=no-referrer]").size() > 0;
    var headers = makeMediaHeaders(!noReferrer);
    if (!noReferrer) { headers.put("Referer", frameUrl); }
    return { url: String(root.url), headers: headers };
}
function publicScriptString(html, name) {
    var match = String(html).match(new RegExp("(?:const|var|let)\\s+" + name + "\\s*=\\s*(\"(?:[^\"\\\\]|\\\\.)*\")"));
    if (match == null) { return ""; }
    try { return String(JSON.parse(match[1])); } catch (ignored) { return ""; }
}
function resolveWebPlayback(webProxy, afterCheck, episodeId, loaded) {
    var currentDoc = null;
    for (var i = 0; i < 3; i++) {
        var before = readWebLocation(webProxy);
        var html = webProxy.getContent(4000);
        var doc = Jsoup.parse(String(html == null ? "" : html), siteUrl("/vodplay/" + episodeId + "/"));
        var after = readWebLocation(webProxy);
        if (validWebOrigin(after) && isVerificationDocument(doc)) { webProxy.needUserCheck(PLAY_CHECK_TIPS); }
        if (stableWebLocation(before, after) && episodeIdFromPath(sitePath(after.path)) == episodeId && playerMatchesEpisode(playerConfig(doc), episodeId)) {
            currentDoc = doc;
            break;
        }
        webProxy.delay(250);
    }
    if (currentDoc == null) {
        webProxy.close();
        throw new ParserException(loaded === false ? "MiFun 当前剧集页面加载超时，请返回所选剧集后重试" : "MiFun 网页剧集与当前选择不一致或尚未就绪，请返回所选剧集后重试", null);
    }
    // Do not sniff the sticky resource list: href() keeps historical requests, even with sticky=false.
    // Only this complete selected document's player data / corresponding official frame can supply media.
    var info = currentPlayerMedia(currentDoc, episodeId);
    if (info != null) { webProxy.close(); return info; }
    if (!afterCheck) { webProxy.needUserCheck(PLAY_CHECK_TIPS); }
    webProxy.close();
    throw new ParserException("MiFun 当前剧集的官方播放器尚未提供可用媒体，请在所选剧集网页完成播放后重试或切换线路", null);
}
function makeMediaInfo(url, headers) {
    if (!isHttpUrl(url)) { return null; }
    // Preserve the official address. The real player determines media availability;
    // preflight HEAD/Range requests are not equivalent to playback on every CDN.
    var info = new PlayerInfo(isM3u8Url(url) ? PlayerInfo.DECODE_TYPE_HLS : PlayerInfo.DECODE_TYPE_OTHER, String(url));
    info.header = headers;
    return info;
}

function readDetailId(value) {
    var raw = String(value);
    if (/^\d+$/.test(raw)) { return { id: raw, legacy: false, title: "" }; }
    var parts = raw.split("|");
    var url;
    try { url = String(URLDecoder.decode(parts[0], "UTF-8")); } catch (ignored) { url = ""; }
    var id = detailIdFromPath(sitePath(url));
    if (!id) { throw new ParserException("MiFun 作品标识无效，请重新搜索", null); }
    var title = "";
    try { if (parts.length > 1) { title = String(URLDecoder.decode(parts[1], "UTF-8")); } } catch (ignoredTitle) {}
    return { id: id, legacy: true, title: title };
}
function readEpisodeId(value) {
    var raw = String(value);
    if (/^\d+-\d+-\d+$/.test(raw)) { return raw; }
    try { raw = String(URLDecoder.decode(raw.split("|")[0], "UTF-8")); } catch (ignored) { raw = ""; }
    var id = episodeIdFromPath(sitePath(raw));
    if (!id) { throw new ParserException("MiFun 剧集标识无效，请刷新详情", null); }
    return id;
}
function detailIdFromPath(path) { var m = String(path).match(/^\/voddetail\/(\d+)\/?$/); return m == null ? "" : m[1]; }
function episodeIdFromPath(path) { var m = String(path).match(/^\/vodplay\/(\d+-\d+-\d+)\/?$/); return m == null ? "" : m[1]; }
function detailUrl(id) { return siteUrl("/voddetail/" + id + "/"); }
function siteUrl(path) { return getRootUrl() + "/" + String(path).replace(/^\/+/, ""); }
function sitePath(value) {
    try {
        var uri = new URI(trimText(value));
        if (uri.isAbsolute() || uri.getRawAuthority() != null) {
            if (!isSiteUri(uri)) { return ""; }
        }
        var path = String(uri.getRawPath() || "");
        var basePath = String(new URI(getRootUrl()).getRawPath() || "");
        if (basePath && path.indexOf(basePath + "/") == 0) { path = path.substring(basePath.length); }
        return path;
    } catch (ignored) { return ""; }
}
function isKnownSiteHost(host) { return /^(?:www\.)?mifun\.tw$/.test(host) || host == "ios.mifun.org"; }
function uriPort(uri, scheme) { return uri.getPort() < 0 ? (scheme == "https" ? 443 : 80) : uri.getPort(); }
function isSiteUri(uri) {
    var current = new URI(getRootUrl());
    var scheme = String(uri.getScheme() || current.getScheme()).toLowerCase();
    if (!/^https?$/.test(scheme) || uri.getUserInfo() != null) { return false; }
    var host = String(uri.getHost() || "").toLowerCase();
    if (isKnownSiteHost(host) && uriPort(uri, scheme) == (scheme == "https" ? 443 : 80)) { return true; }
    var currentScheme = String(current.getScheme()).toLowerCase();
    return host == String(current.getHost()).toLowerCase() && scheme == currentScheme && uriPort(uri, scheme) == uriPort(current, currentScheme);
}
function resolveUrl(value) {
    var raw = trimText(value);
    if (!raw) { return ""; }
    try {
        var uri = new URI(raw);
        var current = new URI(getRootUrl());
        if (uri.isAbsolute() && !/^https?$/i.test(String(uri.getScheme()))) { return ""; }
        if ((uri.isAbsolute() || uri.getRawAuthority() != null) && !isSiteUri(uri)) {
            return String(current.resolve(raw));
        }
        var path = sitePath(raw);
        var query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        return siteUrl(path) + query;
    } catch (ignored) { return ""; }
}
function getRootUrl() { return normalizeRootUrl(preferenceHelper.get("Host", DEFAULT_BASE_URL)); }
function normalizeRootUrl(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) { raw = DEFAULT_BASE_URL; }
    if (!/^https?:\/\//i.test(raw)) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^:/]+:\d+(?:\/|$)/.test(raw)) {
            throw new ParserException("MiFun Host 仅支持 http 或 https 地址", null);
        }
        raw = "https://" + raw;
    }
    try {
        var uri = new URI(raw);
        var scheme = String(uri.getScheme() || "").toLowerCase();
        if (!/^https?$/.test(scheme) || uri.getHost() == null || uri.getUserInfo() != null || uri.getPort() > 65535) { throw new Error("invalid"); }
        var path = String(uri.getRawPath() || "").replace(/\/+$/, "");
        return scheme + "://" + String(uri.getRawAuthority()) + path;
    } catch (ignored) { throw new ParserException("MiFun Host 地址无效，请填写有效网页地址", null); }
}
function imageUrl(node) {
    if (node == null) { return ""; }
    var attrs = ["data-original", "data-src", "src"];
    for (var i = 0; i < attrs.length; i++) { var value = trimText(node.attr(attrs[i])); if (value) { return resolveUrl(value); } }
    var image = node.select("img, [data-original], [data-src]").first();
    return image == null ? "" : imageUrl(image);
}
function nodeText(node, selector) { var item = node.select(selector).first(); return item == null ? "" : trimText(item.text()); }
function trimText(value) { return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
function normalizedTitle(value) { return trimText(value).replace(/[\s《》]/g, ""); }
function userAgent() { return String(networkHelper.defaultLinuxUA); }
function makeHeaders(referer) { var result = makeMediaHeaders(false); result.put("Referer", referer || siteUrl("/")); return result; }
function makeMediaHeaders(withReferer) { var result = new HashMap(); result.put("User-Agent", userAgent()); if (withReferer) { result.put("Referer", siteUrl("/")); } return result; }
function isHttpUrl(value) { try { var uri = new URI(String(value || "")); return /^https?$/i.test(String(uri.getScheme())) && uri.getHost() != null; } catch (ignored) { return false; } }
function mediaPath(value) { try { return String(new URI(String(value || "")).getPath() || ""); } catch (ignored) { return ""; } }
function isM3u8Url(value) { return /\.m3u8$/i.test(mediaPath(value)); }
function isHttpMedia(value) { return isHttpUrl(value) && /\.(?:m3u8|mp4)$/i.test(mediaPath(value)); }
function isVerificationDocument(doc) { return doc.select("#challenge-running, #challenge-form, .cf-turnstile, #captcha, form[action*=captcha]").size() > 0 || /Just a moment|请完成验证|人机验证/.test(String(doc.title())); }
function requestPage(url) {
    var response = okhttpHelper.client.newCall(OkhttpUtils.get(String(url), makeHeaders())).execute();
    try { var body = response.body(); return { status: response.code(), doc: Jsoup.parse(body == null ? "" : String(body.string()), String(url)) }; }
    finally { response.close(); }
}
function requireSuccessfulPage(page) { if (page.status < 200 || page.status >= 300) { throw new ParserException("MiFun 请求失败：HTTP " + page.status, null); } }
function getDoc(url) { var page = requestPage(url); requireSuccessfulPage(page); if (isVerificationDocument(page.doc)) { throw new ParserException("MiFun 网页需要验证，请在网页完成验证后重试", null); } return page.doc; }
function getText(url, headers) {
    var response = okhttpHelper.client.newCall(OkhttpUtils.get(String(url), headers || makeHeaders())).execute();
    try { if (!response.isSuccessful() || response.body() == null) { throw new ParserException("MiFun 解析接口请求失败：HTTP " + response.code(), null); } return String(response.body().string()); }
    finally { response.close(); }
}
