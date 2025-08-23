# JS 插件示例

::: danger 警告
纯纯看番插件格式与技术可能在不远的将来发生改变，这篇教程仅供参考
:::

如果想直接看代码示例可直接跳转到 [社区 JS 源](https://github.com/easybangumiorg/CommunityJsExtensionEasyBangumi/tree/main/extensions)仓库。



## 环境

* 开发语言： JavaScript
* 开发软件：我们推荐使用 VisualStudio Code

::: tip
纯纯看番使用 Rhino 为 js 加载引擎。不支持许多 js 新特性，例如 let、function 类型、async 函数等  
但好处是可以直接操作 java 对象。
:::

新建一个 bangumi.js 文件

## 输入元数据

元数据位于脚本文件开头，以注释的形式引入，具体格式：

```JavaScript
// @key heyanle.bangumi
// @label Bangumi
// @versionName 1.0
// @versionCode 1
// @libVersion 12
// @cover https://bgm.clbug.com/img/favicon.ico
```
|名称| 含义 |
|---|---|
|key|番源唯一标识，一般为 作者.番源|
|label|番源名称，支持中文|
|versionName|版本名称，支持中文，只做展示用|
versionCode|版本号，数值类型，用于判断是否有新版本|
|libVersion|库版本，与纯纯看番版本引擎对应，用于引导用户升级纯纯看番或升级番源|
|cover|展示图标，一般为 url  |

### 实体


#### CartoonSummary

确定一部番剧的最小单位，一般作为获取番剧数据的参数

```Kotlin
data class CartoonSummary(
    var id: String,              // 标识，由源自己支持，用于区分番剧
    var source: String,
)
```



#### CartoonCover

番剧封面，一般在首页和搜索中展示

```Kotlin
interface CartoonCover : Serializable {
    var id: String              // 标识，由源自己支持，用于区分番剧
    var source: String          // 番剧 key，对应元数据中的 key
    var url: String             // 番剧网页
    var title: String           // 番剧名称
    var coverUrl: String?       // 番剧封面 url，在封面版中展示
    var intro: String?          // 番剧副标题，在文字版中作为副标题展示
}

```

在 JavaScript 插件中，可调用 `makeCartoonCover` 函数快速构建：

```JavaScript
// 纯纯看番会自动获取 source 参数，不用额外传入
var cover = makeCartoonCover({
    id: id,
    title: title,
    url: url,
    intro: intro,
    cover: cover,
});

```

#### Cartoon

```Kotlin
interface Cartoon : Serializable {

    var id: String              // 标识，由源自己支持，用于区分番剧
    var source: String
    var url: String
    var title: String
    var genre: String?          // 标签，为 "xx, xx"
    var coverUrl: String?
    var intro: String?
    var description: String?
    var updateStrategy: Int     
    var isUpdate: Boolean       // 是否更新，在追番页显示角标
    var status: Int             // 暂时没有效果

    companion object {
        const val STATUS_UNKNOWN = 0               // 未知
        const val STATUS_ONGOING = 1               // 连载中
        const val STATUS_COMPLETED = 2             // 已完结

        /**
         * 无论严格还是不严格都会更新
         */
        const val UPDATE_STRATEGY_ALWAYS = 0

        /**
         * 只有严格更新时才会更新，一般用于已完结
         */
        const val UPDATE_STRATEGY_ONLY_STRICT = 1

        /**
         * 不更新，一般用于剧场版或年代久远不可能更新的番剧
         */
        const val UPDATE_STRATEGY_NEVER = 2
    }

    fun getGenres(): List<String>? {
        if (genre.isNullOrBlank()) return null
        return genre?.split(",")?.map { it.trim() }?.filterNot { it.isBlank() }?.distinct()
    }

}
```


在 JavaScript 插件中，可调用 `makeCartoon` 函数快速构建：

```JavaScript
// 纯纯看番会自动获取 source 参数，不用额外传入
var cartoon = makeCartoon({
    id: id,
    url: url,
    title: title,
    cover: cover,
    intro: "",
    description: desc,
    genre: ["xx", "xx"],
    updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS,     // 可选 默认 ALWAYS
});
```


#### PlayLine

```Kotlin
class PlayLine(
    val id: String,     // 源自己维护和判断
    val label: String,  // 播放源封面
    val episode: ArrayList<Episode>, 
)
```

#### Episode

```Kotlin
open class Episode(
    val id: String, // 源自己维护和判断
    val label: String,
    val order: Int, // 第几集，用来排序，都一致就按照 PlayLine 中顺序
)
```

#### PlayerInfo

```Kotlin
class PlayerInfo(
    val decodeType: Int = DECODE_TYPE_OTHER,
    val uri: String = "",

) {

    // 播放请求 header
    var header: Map<String, String>? = null
    
    companion object {
        // 这里跟 exoplayer 对应的类型需要对应

        const val DECODE_TYPE_DASH = 0
        const val DECODE_TYPE_HLS = 2
        const val DECODE_TYPE_OTHER = 4
    }
}
```

### 首页



纯纯看番的首页为二级结构，分为一级 Tab（MainTab）和二级 Tab（SubTab），同时支持封面版和文字版首页：

| <img src="/images/guide/extension-js/2.jpg" width="400"/> | <img src="/images/guide/extension-js/1.jpg" width="400"/>   |
|:---------------------------------:|:----------------------------------:|


::: tip
一级 Tab 不支持异步获取，需要快速返回。而二级 Tab 支持异步操作
:::

::: tip
以下代码只是作为演示，实际上在函数中需要使用纯纯看番提供的各种工具从网络获取数据。可参考社区 JS 仓库插件代码
:::

```JavaScript
/**
 * 获取一级 Tab，暂不支持异步操作，需要快速返回
 */
function PageComponent_getMainTabs() {
    var res = new ArrayList();
    res.add(new MainTab("带二级 Tab", MainTab.MAIN_TAB_GROUP, "ext 对象，会透传给后续函数对象"));
    res.add(new MainTab("封面版", MainTab.MAIN_TAB_WITH_COVER));
    res.add(new MainTab("文字版", MainTab.MAIN_TAB_WITHOUT_COVER));
    return res;
}

/**
 * 获取二级 Tab，支持异步操作，可以发起网络请求
 * @param mainTab 当前的一级 Tab，只会传入 MainTab.MAIN_TAB_GROUP 的一级 Tab
 */
function PageComponent_getSubTabs(mainTab) {
    var res = new ArrayList();
    if (mainTab.label == "带二级 Tab") {
        // SubTab 第二个参数代表是否为封面版
        res.add(new SubTab("封面版", true, "ext 对象，会透传给后续函数对象"));
        res.add(new SubTab("文字版", false, "ext 对象，会透传给后续函数对象"));
    }
    return res;
}


/**
 * 获取首页番剧，分页加载，支持异步操作，可以发起网络请求
 * @param mainTab
 * @param subTab
 * @param key 页码，从 0 开始
 * @return Pair<Int?, List<CartoonCover>> 下一页页码（为空代表当前最后一页）
 */
function PageComponent_getContent(mainTab, subTab, key) {
    // 透传对象，为 getMainTab 函数返回对象第三个参赛，可能为空
    var mainExt = mainTab.ext;
    var subExt = subTab.ext;
    var cartoonList = new ArrayList();
    var nextKey = null;
    if (mainTab.label == "带二级 Tab") {
        if (subTab.label == "封面版") {
            cartoonList.add(makeCartoonCover({
                id: "番剧id",
                title: "番剧名称",
                url: "番剧网址",
                intro: "番剧简介",
                cover: "封面 url",
            }))
             // ...
        } else if (subTab.label == "文字版") {
            cartoonList.add(makeCartoonCover({
                id: "番剧id",
                title: "番剧名称",
                url: "番剧网址",
                intro: "番剧简介",
                cover: "封面 url",
            }))
        }
         // ...
    }
    return new Pair(nextKey, cartoonList);
}
```



::: tip
特别的，如果需要隐藏一级 Tab 行，可在 getMainTabs 函数直接返回 NonLabelMainTab  
如果 Type 为 MainTab.MAIN_TAB_GROUP 则会只有二级 Tab，适用于需要异步 Tab 的形态  
次数因为没有 一级 Tab 区分，因此 getSubTabs 的 mainTab 参数将没有意义  

```JavaScript
function PageComponent_getMainTabs() {
    return new NonLabelMainTab(MainTab.MAIN_TAB_GROUP, "ext 透传")
}

function PageComponent_getSubTabs(mainTab) {
    var res = new ArrayList();
    res.add(new SubTab("封面版", true, "ext 对象，会透传给后续函数对象"));
    res.add(new SubTab("文字版", false, "ext 对象，会透传给后续函数对象"));
    return res;
}
```
:::


### 搜索


```JavaScript

/**
 * 根据关键字搜索番剧
 * @param page 页码，从 1 开始，后续为返回值的第一个分量
 * @param keyword 搜索关键字
 * @return Pair<Int?, List<CartoonCover>> 首个分量为空代表当前是最后一页
 */
function SearchComponent_search(page, keyword) {
    var res = new ArrayList();
    // ... 获取 ArrayList<CartoonCover>
    if (res.size() == 0) {
        return new Pair(null, new ArrayList());
    }
    return new Pair(page + 1, res);
}
```

### 详情和播放列表

```JavaScript

/**
 * 获取播放线路和详细信息
 * @param summary 番剧摘要 CartoonSummary，id 为首页或搜索中返回的 CartoonCover 的数据
 * @return Pair<Cartoon, List<PlayLine>>
 */
function DetailedComponent_getDetailed(summary) {
    // 伪代码
    var cartoon = getDetailed(summary);
    var playLineList = getPlaylineList(summary);
    return new Pair(cartoon, playLineList);
}
```

| <img src="/images/guide/extension-js/3.jpg" width="400"/> | <img src="/images/guide/extension-js/4.jpg" width="400"/>   |
|:---------------------------------:|:----------------------------------:|

### 获取播放地址


```JavaScript
/**
 * 获取播放地址
 * @param summary 番剧摘要 CartoonSummary，id 为首页或搜索中返回的 CartoonCover 的数据
 * @param playLine 播放列表  getDetailed 返回
 * @param episode 当前集  getDetailed 返回
 * @return PlayerInfo 支持 m3u8 以及 普通 mp4，支持添加自定义请求 Header
 */
function PlayComponent_getPlayInfo(summary, playLine, episode) {
    return new PlayerInfo(
        type, res
    )
}
```

### 番源配置

纯纯看番支持番源自定义自己的配置页，支持输入配置，选择配置和开关配置

| <img src="/images/guide/extension-js/5.jpg" width="400"/> | 
|:---------------------------------:|

```JavaScript
function PreferenceComponent_getPreference() {
    var res = new ArrayList();
    // label key default
    var host = new SourcePreference.Edit("网页", "Host", "https://www.xxx.tv");
    var playerUrl = new SourcePreference.Edit("播放器网页正则", "PlayerReg", "https://xxx?.*");
    var timeout = new SourcePreference.Edit("超时时间", "Timeout", "20000");
    // label key default
    // 会存入 "true" "false"
    var isCookie = new SourcePreference.Switch("是否保存 cookie", true);
    var proxyLine = new ArrayList();
    proxyLine.add("国内线路");
    proxyLine.add("日本线路")
    // label key default selection
    var proxy = new SourcePreference.Selection("选择线路", "urlLine", "国内线路", proxyLine);
    res.add(host);
    res.add(playerUrl);
    res.add(timeout);
    res.add(isCookie);
    res.add(proxy);
    return res;
}
```

可通过 PreferenceHelper 工具获取配置：

```JavaScript
var preferenceHelper = Inject_PreferenceHelper;

// key default
// 只支持 String
var host = preferenceHelper.get("host", "https://www.xxx.tv");
var isCookie = preferenceHelper.get("cookie", "true") == "true";
```


