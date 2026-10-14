// @key heyanle.ggl.beta
// @label GiriGiriLove Beta
// @versionName 1.0
// @versionCode 1
// @libVersion 15
// @cover https://beta.girigirilove.com/brand/icon.png

var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var okhttpHelper = Inject_OkhttpHelper;

var DEFAULT_HOST = "https://beta.girigirilove.com";
// The beta site's public client uses this separate API origin.
var DEFAULT_API_HOST = "https://m3u8.girigirilove.com";
var IMAGE_HOST = "https://jpg.girigirilove.net";
var HOME_PAGE_SIZE = 20;
var SEARCH_PAGE_SIZE = 24;
var CATEGORIES = [
    { label: "日番", id: 2 },
    { label: "美番", id: 3 },
    { label: "剧场版", id: 21 },
    { label: "真人番剧", id: 20 },
    { label: "BD副音轨", id: 24 },
    { label: "演唱会及其他", id: 26 }
];

function PreferenceComponent_getPreference() {
    var result = new ArrayList();
    result.add(new SourcePreference.Edit("网页", "Host", DEFAULT_HOST));
    result.add(new SourcePreference.Edit("API 网页", "ApiHost", DEFAULT_API_HOST));
    return result;
}

function PageComponent_getMainTabs() {
    var result = new ArrayList();
    for (var i = 0; i < CATEGORIES.length; i++) {
        result.add(new MainTab(CATEGORIES[i].label, MainTab.MAIN_TAB_WITH_COVER));
    }
    return result;
}

function PageComponent_getSubTabs(mainTab) {
    return new ArrayList();
}

function PageComponent_getContent(mainTab, subTab, key) {
    var typeId = null;
    for (var i = 0; i < CATEGORIES.length; i++) {
        if (String(mainTab.label) == CATEGORIES[i].label) {
            typeId = CATEGORIES[i].id;
            break;
        }
    }
    if (typeId == null) {
        throw new ParserException("未知番剧分类", null);
    }
    return getVodList(typeId, "", pageIndex(key), HOME_PAGE_SIZE);
}

function SearchComponent_search(key, keyword) {
    var text = trimText(keyword);
    if (text.length == 0) {
        return new Pair(null, new ArrayList());
    }
    return getVodList(null, text, pageIndex(key), SEARCH_PAGE_SIZE);
}

function getVodList(typeId, keyword, page, limit) {
    var offset = page * limit;
    // Match the public beta client, including its native ordering and offset paging.
    var query = {
        offset: offset,
        limit: limit,
        vod_weekday: "",
        vod_letter: "",
        vod_tag: "",
        vod_name: keyword,
        vod_blurb: "",
        vod_area: "",
        vod_year: "",
        orderby: "",
        vod_class: "",
        vod_lang: "",
        vod_version: "",
        vod_state: "",
        user_id: ""
    };
    if (typeId != null) {
        query.type_id = typeId;
    }
    var data = requestApi("Vod/get_list", query);
    if (data == null || !isArray(data.rows)) {
        throw new ParserException("番剧列表格式发生变化", null);
    }
    var result = new ArrayList();
    var seen = {};
    for (var i = 0; i < data.rows.length; i++) {
        var item = data.rows[i];
        if (item == null || typeof item != "object") {
            continue;
        }
        var id = trimText(item.vod_id);
        var title = plainText(item.vod_name);
        if (!/^\d+$/.test(id) || title.length == 0 || seen[id]) {
            continue;
        }
        seen[id] = true;
        result.add(makeCartoonCover({
            id: id,
            source: source.key,
            url: detailUrl(id),
            title: title,
            intro: plainText(item.vod_remarks) || plainText(item.vod_year),
            cover: imageUrl(item.vod_pic || item.vod_pic_thumb)
        }));
    }
    var total = Number(data.total);
    var next = data.rows.length > 0 && isFinite(total) && offset + data.rows.length < total ? page + 1 : null;
    return new Pair(next, result);
}

function DetailedComponent_getDetailed(summary) {
    var id = vodId(summary.id);
    var item = getDetail(id);
    var parsed = parsePlaySources(item.vod_play_from, item.vod_play_url);
    var lines = new ArrayList();
    for (var i = 0; i < parsed.length; i++) {
        var line = parsed[i];
        var episodes = new ArrayList();
        for (var j = 0; j < line.episodes.length; j++) {
            var episode = line.episodes[j];
            // Store stable positions, never a CDN hostname or expiring media URL.
            episodes.add(new Episode(String(episode.index), episode.label, j));
        }
        lines.add(new PlayLine(String(line.index), line.label, episodes));
    }
    var description = plainText(item.vod_content || item.vod_blurb);
    var cartoon = makeCartoon({
        id: id,
        source: source.key,
        url: detailUrl(id),
        title: plainText(item.vod_name),
        cover: imageUrl(item.vod_pic || item.vod_pic_thumb),
        intro: plainText(item.vod_remarks),
        description: description,
        genre: plainText(item.vod_class),
        status: Number(item.vod_isend) == 1 ? Cartoon.STATUS_COMPLETED : Cartoon.STATUS_UNKNOWN,
        updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS
    });
    return new Pair(cartoon, lines);
}

function PlayComponent_getPlayInfo(summary, playLine, episode) {
    // Fetch the current official detail response instead of persisting its URLs in IDs.
    var item = getDetail(vodId(summary.id));
    var lines = parsePlaySources(item.vod_play_from, item.vod_play_url);
    var lineIndex = position(playLine.id);
    var episodeIndex = position(episode.id);
    var url = "";
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].index != lineIndex) {
            continue;
        }
        for (var j = 0; j < lines[i].episodes.length; j++) {
            if (lines[i].episodes[j].index == episodeIndex) {
                url = mediaUrl(lines[i].episodes[j].url);
                break;
            }
        }
        break;
    }
    if (url.length == 0) {
        throw new ParserException("所选线路或剧集已不可用，请刷新详情", null);
    }
    var path = String(new URI(url).getPath()).toLowerCase();
    var type = /\.m3u8$/.test(path) ? PlayerInfo.DECODE_TYPE_HLS :
        (/\.mpd$/.test(path) ? PlayerInfo.DECODE_TYPE_DASH : PlayerInfo.DECODE_TYPE_OTHER);
    var info = new PlayerInfo(type, url);
    info.header = makeHeaders(false);
    return info;
}

function getDetail(id) {
    var item = requestApi("Vod/get_detail", { vod_id: id, user_id: "" });
    if (item == null || trimText(item.vod_id) != id) {
        throw new ParserException("番剧详情格式发生变化", null);
    }
    if (plainText(item.vod_name).length == 0) {
        throw new ParserException("番剧详情缺少作品标题，请稍后重试", null);
    }
    return item;
}

function parsePlaySources(from, urls) {
    var names = trimText(from).split("$$$");
    var groups = trimText(urls).split("$$$");
    var result = [];
    for (var i = 0; i < names.length; i++) {
        var name = plainText(names[i]);
        if (name.length == 0 || i >= groups.length || trimText(groups[i]).length == 0) {
            continue;
        }
        var rawEpisodes = groups[i].split("#");
        var episodes = [];
        for (var j = 0; j < rawEpisodes.length; j++) {
            var raw = trimText(rawEpisodes[j]);
            if (raw.length == 0) {
                continue;
            }
            var separator = raw.indexOf("$");
            var label = plainText(separator < 0 ? raw : raw.substring(0, separator));
            var url = trimText(separator < 0 ? raw : raw.substring(separator + 1));
            if (label.length > 0 && url.length > 0) {
                episodes.push({ index: j, label: label, url: url });
            }
        }
        if (episodes.length > 0) {
            result.push({ index: i, label: name, episodes: episodes });
        }
    }
    return result;
}

function requestApi(path, query) {
    var response = okhttpHelper.client.newCall(OkhttpUtils.get(apiUrl(path, query), makeHeaders(true))).execute();
    try {
        if (!response.isSuccessful()) {
            throw new ParserException("GiriGiriLove Beta API 请求失败：HTTP " + response.code(), null);
        }
        var body = response.body();
        if (body == null) {
            throw new ParserException("GiriGiriLove Beta API 返回空内容", null);
        }
        var root;
        try {
            root = JSON.parse(String(body.string()));
        } catch (error) {
            throw new ParserException("GiriGiriLove Beta API 未返回有效 JSON", null);
        }
        if (root == null || (Number(root.code) != 1 && Number(root.code) != 200)) {
            throw new ParserException("GiriGiriLove Beta API：" + plainText(root == null ? "请求失败" : root.msg || "请求失败"), null);
        }
        return root.info;
    } finally {
        response.close();
    }
}

function apiUrl(path, query) {
    var url = getApiRoot() + "/api.php/" + path;
    var separator = "?";
    for (var key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
            url += separator + URLEncoder.encode(String(key), "UTF-8") + "=" + URLEncoder.encode(String(query[key]), "UTF-8");
            separator = "&";
        }
    }
    return url;
}

function makeHeaders(api) {
    var headers = new HashMap();
    var host = getRootUrl();
    var uri = new URI(host);
    headers.put("User-Agent", String(networkHelper.defaultLinuxUA));
    headers.put("Referer", host + "/");
    headers.put("Origin", uri.getScheme() + "://" + uri.getRawAuthority());
    if (api) {
        headers.put("Accept", "application/json");
    }
    return headers;
}

function detailUrl(id) {
    return getRootUrl() + "/detail/" + vodId(id);
}

function getRootUrl() {
    return normalizeHost(preferenceHelper.get("Host", DEFAULT_HOST), DEFAULT_HOST, "网页");
}

function getApiRoot() {
    return normalizeHost(preferenceHelper.get("ApiHost", DEFAULT_API_HOST), DEFAULT_API_HOST, "API 网页");
}

function normalizeHost(raw, fallback, label) {
    var value = trimText(raw);
    if (value.length == 0) {
        value = fallback;
    }
    if (value.indexOf("//") == 0) {
        value = "https:" + value;
    } else if (/^[^\/?#:\s]+:\d+(?:[\/?#]|$)/.test(value) || !/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        value = "https://" + value;
    }
    try {
        var uri = new URI(value);
        var scheme = String(uri.getScheme()).toLowerCase();
        if ((scheme != "https" && scheme != "http") || uri.getHost() == null ||
            uri.getUserInfo() != null || uri.getPort() > 65535 || /\s/.test(value)) {
            throw new Error("invalid host");
        }
        var path = uri.getPath() == null ? "" : String(uri.getPath()).replace(/\/+$/, "");
        return String(new URI(scheme, null, uri.getHost(), uri.getPort(), path, null, null));
    } catch (error) {
        throw new ParserException(label + "设置无效，请使用 http:// 或 https:// 网址", null);
    }
}

function imageUrl(value) {
    var url = trimText(value);
    if (url.length == 0) {
        return "";
    }
    // This image origin is declared separately in the public beta client.
    if (url.indexOf("upload/") == 0) {
        return IMAGE_HOST + "/" + url;
    }
    if (url.indexOf("//") == 0) {
        return "https:" + url;
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    return String(new URI(getRootUrl() + "/").resolve(url));
}

function mediaUrl(value) {
    var url = trimText(value);
    if (url.indexOf("//") == 0) {
        url = "https:" + url;
    }
    try {
        var uri = new URI(url);
        if (!uri.isAbsolute()) {
            uri = new URI(getApiRoot() + "/").resolve(uri);
        }
        var scheme = String(uri.getScheme()).toLowerCase();
        if ((scheme != "http" && scheme != "https") || uri.getHost() == null || uri.getUserInfo() != null) {
            throw new Error("invalid media URL");
        }
        return String(uri);
    } catch (error) {
        throw new ParserException("站点返回了不支持的播放地址", null);
    }
}

function vodId(value) {
    var id = trimText(value);
    if (!/^[1-9]\d*$/.test(id)) {
        throw new ParserException("无效番剧 ID", null);
    }
    return id;
}

function position(value) {
    var text = trimText(value);
    if (!/^\d+$/.test(text)) {
        throw new ParserException("无效线路或剧集 ID", null);
    }
    return Number(text);
}

function pageIndex(key) {
    if (key == null) {
        return 0;
    }
    var number = Number(key);
    if (!isFinite(number) || number < 0 || Math.floor(number) != number) {
        throw new ParserException("无效分页", null);
    }
    return number;
}

function isArray(value) {
    return Object.prototype.toString.call(value) == "[object Array]";
}

function trimText(value) {
    return value == null ? "" : String(value).replace(/^\s+|\s+$/g, "");
}

function plainText(value) {
    var text = trimText(value).replace(/\\r\\n|\\n|\\r/g, " ");
    return text.length == 0 ? "" : String(Jsoup.parse(text).text()).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
}
