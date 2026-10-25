// @key heyanle.ggl.v2
// @label GiriGiriLove 新版
// @versionName 1.6
// @versionCode 8
// @libVersion 15
// @cover https://ani.girigirilove.com/brand/icon.png

var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;

var GGL_HOST = "https://ani.girigirilove.com";
// Declared by the formal site's client-EH5oUj5z.js, independently of Beta.
var GGL_API_HOST = "https://m3u8.girigirilove.com";
var GGL_IMAGE_HOST = "https://jpg.girigirilove.net";
var GGL_HOST_UNSET = "\u0000ggl-host-unset";
var GGL_ID_PREFIX = "ggl-v2:";
var GGL_CATEGORIES = [
    { label: "日番", id: 2 },
    { label: "美番", id: 3 },
    { label: "剧场版", id: 21 },
    { label: "真人番剧", id: 20 },
    { label: "BD副音轨", id: 24 },
    { label: "演唱会及其他", id: 26 }
];

function PreferenceComponent_getPreference() {
    var result = new ArrayList();
    // Existing HostV2 remains readable until the user saves the new Host field.
    result.add(new SourcePreference.Edit("网页", "Host", String(preferenceHelper.get("HostV2", GGL_HOST))));
    result.add(new SourcePreference.Edit("API 网页", "ApiHost", GGL_API_HOST));
    return result;
}

function PageComponent_getMainTabs() {
    var result = new ArrayList();
    for (var i = 0; i < GGL_CATEGORIES.length; i++) {
        result.add(new MainTab(GGL_CATEGORIES[i].label, MainTab.MAIN_TAB_WITH_COVER));
    }
    return result;
}

function PageComponent_getSubTabs(mainTab) { return new ArrayList(); }

function PageComponent_getContent(mainTab, subTab, key) {
    for (var i = 0; i < GGL_CATEGORIES.length; i++) {
        if (String(mainTab.label) == GGL_CATEGORIES[i].label) {
            return gglList(GGL_CATEGORIES[i].id, "", gglOffset(key), 20);
        }
    }
    throw new ParserException("GiriGiriLove 分类无效，请重新打开首页", null);
}

function SearchComponent_search(key, keyword) {
    var query = gglText(keyword);
    if (query.length == 0) { return new Pair(null, new ArrayList()); }
    return gglList(null, query, gglOffset(key), 24);
}

function gglList(typeId, keyword, offset, limit) {
    // Formal Browse/Search pages use offset paging and the API's original order.
    var query = {
        offset: offset, limit: limit, vod_weekday: "", vod_letter: "", vod_tag: "",
        vod_name: keyword, vod_blurb: "", vod_area: "", vod_year: "", orderby: "",
        vod_class: "", vod_lang: "", vod_version: "", vod_state: "", user_id: ""
    };
    if (typeId != null) { query.type_id = typeId; }
    var data = gglApi("Vod/get_list", query);
    if (!gglObject(data) || !gglArray(data.rows) || !gglNonnegativeInteger(data.total)) {
        throw new ParserException("GiriGiriLove 列表格式发生变化，请稍后重试", null);
    }
    if (data.offset != null && Number(data.offset) != offset) {
        throw new ParserException("GiriGiriLove 分页响应不匹配，请重新加载", null);
    }
    var result = new ArrayList();
    for (var i = 0; i < data.rows.length; i++) {
        var item = data.rows[i];
        if (!gglObject(item) || !gglPositiveId(item.vod_id) ||
                typeof item.vod_name != "string" || gglPlain(item.vod_name).length == 0) {
            throw new ParserException("GiriGiriLove 列表缺少作品信息，请稍后重试", null);
        }
        var id = String(item.vod_id);
        result.add(makeCartoonCover({
            id: GGL_ID_PREFIX + id, source: source.key, url: gglDetailUrl(id),
            title: gglPlain(item.vod_name), intro: gglPlain(item.vod_remarks) || gglPlain(item.vod_year),
            cover: gglImage(item.vod_pic || item.vod_pic_thumb)
        }));
    }
    var total = Number(data.total);
    if (data.rows.length == 0 && offset < total) {
        throw new ParserException("GiriGiriLove 列表尚未完整返回，请稍后重试", null);
    }
    var next = offset + data.rows.length;
    return new Pair(data.rows.length > 0 && next < total && next <= 2147483647 ? next : null, result);
}

function DetailedComponent_getDetailed(summary) {
    var id = gglWorkId(summary.id);
    var item = gglDetail(id);
    var parsed = gglPlaySources(item);
    var lines = new ArrayList();
    for (var i = 0; i < parsed.length; i++) {
        var line = parsed[i];
        var episodes = new ArrayList();
        for (var j = 0; j < line.episodes.length; j++) {
            var episode = line.episodes[j];
            episodes.add(new Episode(gglEpisodeId(id, line, episode), episode.label, j));
        }
        lines.add(new PlayLine(gglLineId(line), line.label, episodes));
    }
    return new Pair(makeCartoon({
        id: GGL_ID_PREFIX + id, source: source.key, url: gglDetailUrl(id),
        title: gglPlain(item.vod_name), cover: gglImage(item.vod_pic || item.vod_pic_thumb),
        intro: gglPlain(item.vod_remarks), description: gglPlain(item.vod_content || item.vod_blurb),
        genre: gglPlain(item.vod_class),
        status: Number(item.vod_isend) == 1 ? Cartoon.STATUS_COMPLETED : Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    }), lines);
}

function PlayComponent_getPlayInfo(summary, playLine, episode) {
    var id = gglWorkId(summary.id);
    var lineId = gglText(playLine.id);
    var episodeId = gglText(episode.id);
    if (lineId.indexOf(GGL_ID_PREFIX) != 0 || episodeId.indexOf(GGL_ID_PREFIX) != 0) {
        throw new ParserException("GiriGiriLove 已改版，请刷新详情后重新选集", null);
    }
    // Bind refreshed API media to this work, line and episode label/position.
    // Neither a historical browser request nor a saved CDN URL selects media.
    var lines = gglPlaySources(gglDetail(id));
    var media = "";
    for (var i = 0; i < lines.length; i++) {
        if (gglLineId(lines[i]) != lineId) { continue; }
        for (var j = 0; j < lines[i].episodes.length; j++) {
            if (gglEpisodeId(id, lines[i], lines[i].episodes[j]) == episodeId) {
                media = gglMedia(lines[i].episodes[j].url);
                break;
            }
        }
        break;
    }
    if (!media) { throw new ParserException("GiriGiriLove 所选线路或集数已变化，请刷新详情后重试", null); }
    var path = String(new URI(media).getPath() || "").toLowerCase();
    var type = /\.m3u8$/.test(path) ? PlayerInfo.DECODE_TYPE_HLS :
        (/\.mpd$/.test(path) ? PlayerInfo.DECODE_TYPE_DASH : PlayerInfo.DECODE_TYPE_OTHER);
    var info = new PlayerInfo(type, media);
    info.header = gglHeaders(false);
    return info;
}

function gglDetail(id) {
    var item = gglApi("Vod/get_detail", { vod_id: id, user_id: "" });
    if (!gglObject(item) || String(item.vod_id) != id) {
        throw new ParserException("GiriGiriLove 详情格式发生变化，请稍后重试", null);
    }
    if (typeof item.vod_name != "string" || !gglPlain(item.vod_name)) {
        throw new ParserException("GiriGiriLove 详情缺少作品标题，请稍后重试", null);
    }
    return item;
}

function gglPlaySources(item) {
    var from = item.vod_play_from;
    var urls = item.vod_play_url;
    if (from == null && urls == null) { return []; }
    if (typeof from != "string" || typeof urls != "string") {
        throw new ParserException("GiriGiriLove 选集格式发生变化，请稍后重试", null);
    }
    var names = from.split("$$$");
    var groups = urls.split("$$$");
    if (names.length != groups.length) {
        throw new ParserException("GiriGiriLove 线路与选集不匹配，请稍后重试", null);
    }
    var result = [];
    for (var i = 0; i < names.length; i++) {
        var name = gglPlain(names[i]);
        if (!name || !gglText(groups[i])) { continue; }
        var rawEpisodes = groups[i].split("#");
        var episodes = [];
        for (var j = 0; j < rawEpisodes.length; j++) {
            var raw = gglText(rawEpisodes[j]);
            if (!raw) { continue; }
            var separator = raw.indexOf("$");
            var label = gglPlain(separator < 0 ? raw : raw.substring(0, separator));
            var url = gglText(separator < 0 ? raw : raw.substring(separator + 1));
            if (label && url) { episodes.push({ index: j, label: label, url: url }); }
        }
        if (episodes.length > 0) { result.push({ index: i, label: name, episodes: episodes }); }
    }
    return result;
}

function gglLineId(line) { return GGL_ID_PREFIX + line.index + ":" + encodeURIComponent(line.label); }
function gglEpisodeId(id, line, episode) {
    return GGL_ID_PREFIX + id + ":" + line.index + ":" + episode.index + ":" + encodeURIComponent(episode.label);
}

function gglWorkId(value) {
    var match = /^ggl-v2:([1-9]\d*)$/.exec(gglText(value));
    if (match == null) {
        // Old GV pages now return a Vite shell without an official ID redirect.
        // Do not guess a numeric database/one-based episode migration.
        throw new ParserException("GiriGiriLove 已改版，旧收藏请重新搜索并关联作品", null);
    }
    return match[1];
}

function gglApi(path, query) {
    var url = gglApiRoot() + "/api.php/" + path;
    var separator = "?";
    for (var key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
            url += separator + URLEncoder.encode(String(key), "UTF-8") + "=" + URLEncoder.encode(String(query[key]), "UTF-8");
            separator = "&";
        }
    }
    var response = okhttpHelper.client.newCall(OkhttpUtils.get(url, gglHeaders(true))).execute();
    try {
        if (!response.isSuccessful()) {
            throw new ParserException("GiriGiriLove 请求失败：HTTP " + response.code() + "，请稍后重试", null);
        }
        var body = response.body();
        var root;
        try { root = JSON.parse(body == null ? "" : String(body.string())); }
        catch (error) { throw new ParserException("GiriGiriLove 未返回有效数据，请稍后重试", null); }
        if (!gglObject(root) || (Number(root.code) != 1 && Number(root.code) != 200)) {
            throw new ParserException("GiriGiriLove 接口暂不可用，请在原网页确认访问状态后重试", null);
        }
        return root.info;
    } finally { response.close(); }
}

function getRootUrl() {
    var value = String(preferenceHelper.get("Host", GGL_HOST_UNSET));
    if (value == GGL_HOST_UNSET) { value = preferenceHelper.get("HostV2", GGL_HOST); }
    return gglNormalizeHost(value, GGL_HOST, "网页");
}

function gglApiRoot() {
    return gglNormalizeHost(preferenceHelper.get("ApiHost", GGL_API_HOST), GGL_API_HOST, "API 网页");
}

function gglNormalizeHost(raw, fallback, label) {
    var value = gglText(raw);
    if (!value) { value = fallback; }
    value = value.split(/[?#]/)[0];
    if (value.indexOf("//") == 0) { value = "https:" + value; }
    else if (/^[^\s/?#:]+:\d+(?:\/|$)/.test(value) || !/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        value = "https://" + value;
    }
    try {
        var uri = new URI(value);
        var scheme = String(uri.getScheme() || "").toLowerCase();
        if ((scheme != "http" && scheme != "https") || uri.getHost() == null ||
                uri.getRawUserInfo() != null || uri.getPort() > 65535 || /\s/.test(value)) {
            throw new Error("invalid host");
        }
        return scheme + "://" + String(uri.getRawAuthority()) + String(uri.getRawPath() || "").replace(/\/+$/, "");
    } catch (error) {
        throw new ParserException("GiriGiriLove " + label + "地址无效，请填写 http 或 https 网址", null);
    }
}

function gglDetailUrl(id) { return getRootUrl() + "/detail/" + id; }

function gglHeaders(api) {
    var result = new HashMap();
    var host = getRootUrl();
    var uri = new URI(host);
    result.put("User-Agent", String(networkHelper.defaultLinuxUA));
    result.put("Referer", host + "/");
    result.put("Origin", uri.getScheme() + "://" + uri.getRawAuthority());
    if (api) { result.put("Accept", "application/json"); }
    return result;
}

function gglImage(value) {
    var url = gglText(value);
    if (!url) { return ""; }
    if (url.indexOf("upload/") == 0) { return GGL_IMAGE_HOST + "/" + url; }
    if (url.indexOf("//") == 0) { return "https:" + url; }
    if (/^https?:\/\//i.test(url)) {
        try {
            var uri = new URI(url);
            var scheme = String(uri.getScheme()).toLowerCase();
            var port = uri.getPort();
            if (String(uri.getHost() || "").toLowerCase() == "ani.girigirilove.com" &&
                    (port < 0 || port == (scheme == "https" ? 443 : 80))) {
                return getRootUrl() + String(uri.getRawPath() || "/") + (uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery());
            }
            return url;
        } catch (error) { return ""; }
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) { return ""; }
    return getRootUrl() + "/" + url.replace(/^\/+/, "");
}

function gglMedia(value) {
    var url = gglText(value);
    if (url.indexOf("//") == 0) { url = "https:" + url; }
    try {
        var uri = new URI(url);
        if (!uri.isAbsolute()) { uri = new URI(gglApiRoot() + "/").resolve(uri); }
        if (!/^https?$/i.test(String(uri.getScheme())) || uri.getHost() == null || uri.getRawUserInfo() != null) {
            throw new Error("invalid media");
        }
        return String(uri);
    } catch (error) { throw new ParserException("GiriGiriLove 未返回可用播放地址，请刷新详情后重试", null); }
}

function gglOffset(key) {
    if (key == null) { return 0; }
    var text = gglText(key);
    if (!/^\d+$/.test(text) || Number(text) > 2147483647) {
        throw new ParserException("GiriGiriLove 分页无效，请重新加载", null);
    }
    return Number(text);
}

function gglText(value) { return value == null ? "" : String(value).replace(/^\s+|\s+$/g, ""); }
function gglPlain(value) {
    var text = gglText(value).replace(/\\r\\n|\\n|\\r/g, " ");
    return text ? String(Jsoup.parse(text).text()).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") : "";
}
function gglArray(value) { return Object.prototype.toString.call(value) == "[object Array]"; }
function gglObject(value) { return Object.prototype.toString.call(value) == "[object Object]"; }
function gglPositiveId(value) { return /^[1-9]\d*$/.test(gglText(value)); }
function gglNonnegativeInteger(value) { return /^\d+$/.test(gglText(value)) && Number(value) <= 2147483647; }
