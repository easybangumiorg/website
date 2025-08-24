# 插件实用工具

JS 插件本身的 API 请看二次开发文档

本文档主要介绍纯纯看番提供给 JS 插件的几个工具

## Inject

工具分为注入对象和静态对象，所有注入 JavaScript 运行环境的工具都带有 Inject 前缀，可在开头使用变量暂存方便使用：

```JavaScript
// 注入对象
var networkHelper = Inject_NetworkHelper;
var preferenceHelper = Inject_PreferenceHelper;
var webViewHelperV2 = Inject_WebViewHelperV2;
var okhttpHelper = Inject_OkhttpHelper;
var stringHelper = Inject_StringHelper;

// 静态对象
SourceUtils;
OkhttpUtils;
DeviceUtil;
Base64Utils;
Log;
```

::: tip
后续文档将直接使用变量名（小写开头），省略 Inject 步骤
而对于静态对象，使用大写字母开头，例如 SourceUtils
:::



## PreferenceHelper

数据持久化存储，可以存取自定义数据与获取番源配置制定的配置：

```kotlin
interface PreferenceHelper {

    /**
     * 获取所有存储的键值对（无序）
     */
    fun map(): Map<String, String>
    
    fun get(key: String, def: String): String

    fun put(key: String, value: String)

}
```

## OkhttpHelper 和 OkhttpUtils


::: tip
使用 OkhttpUtils 获取 Request，在使用 OkhttpHelper 获取 client 在发起请求
:::



```kotlin
interface OkhttpHelper {

    // 普通 client
    val client: OkHttpClient
    // 尝试使用后台WebView 过 cloudFlare 验证的 client
    val cloudflareClient: OkHttpClient
    // 尝试使用前台 WebView 过 cloudFlare 验证的 client
    val cloudflareWebViewClient: OkHttpClient

}
```

```kotlin
object OkhttpUtils {

    fun get(url: String): Request

    fun get(url: String, headerMap: Map<String, String>): Request

    fun post(url: String): Request 

    fun postFormBody(
        url: String,
        formBody: Map<String, Any> = emptyMap(),
        headerMap: Map<String, Any> = emptyMap()
    ): Request 


    fun postFormBody(
        url: String,
        formBody: Map<String, Any> = emptyMap(),
    ): Request 

}
```

示例：
```JavaScript
function getDoc(url) {
    var u = SourceUtils.urlParser(getRootUrl(), url);
    // 发起请求
    var req = okhttpHelper.cloudflareWebViewClient.newCall(
        OkhttpUtils.get(u)
    );
    
    var string = req.execute().body().string();
    Log.i("XXX", "getDoc: " + string);
    // 使用 Jsoup 解析 html
    var doc = Jsoup.parse(string);
    return doc;
}
```

## Jsoup 

因为 Rhino 引擎支持直接调用 Jvm 对象，因此可直接使用环境中的 Jsoup 工具，具体 api 可参考官网：

[Jsoup](https://jsoup.org/)

## WebViewHelperV2.

使用后台浏览器进行嗅探，适用于动态页面（需要执行网页 js 代码才能获取最终播放地址的情况）

```Kotlin
interface WebViewHelperV2 {

    data class RenderedStrategy(
        // 网址
        val url: String,

        // 回调正则。在检测到特定请求时返回结果。默认为空则在页面加载完成后自动回调（因为ajax等因素可能得到的源码不完整，另外注意超时）
        val callBackRegex: String = "",

        // 编码
        val encoding: String = "utf-8",

        // UA
        val userAgentString: String? = null,

        // 请求头
        val header: Map<String, String>? = null,

        // 在页面加载完成后执行的js代码，可用于主动加载资源，如让视频加载出来以拦截
        val actionJs: String? = null,

        // 是否是拦截 blob 模式
        val isBlockBlob: Boolean = false,

        // 加载超时。当超过超时时间后还没返回数据则会直接返回当前源码
        val timeOut: Long = 8000L,
    )

    data class RenderedResult (

        // 策略
        val strategy: RenderedStrategy,

        // 网址
        val url: String,

        // 是否是超时
        val isTimeout: Boolean,

        // 网页源码
        val content: String,

        // 拦截资源
        val interceptResource: String,
    )

    // 开始嗅探
    suspend fun renderedHtml(strategy: RenderedStrategy): RenderedResult

    // 以下为高级工具，直接打开一个 webview 网页，可以用于过 cf 盾
    fun getGlobalWebView(): WebView


    fun openWebPage(
        onCheck: (WebView) -> Boolean,
        onStop: (WebView) -> Unit,
    )

    fun openWebPage(
        webView: WebView,
        onCheck: (WebView) -> Boolean,
        onStop: (WebView) -> Unit,
    )
```

## StringHelper

```Kotlin
interface StringHelper {

    /**
     * 展示纯纯看番样式对话框通知
     */
    fun moeDialog(text: String, title: String? = null)

    /**
     * 展示纯纯看番样式站内通知
     */
    fun moeSnackBar(string: String)

    /**
     * 弹 toast
     */
    fun toast(string: String)

}
```

## Base64Utils SourceUtils

```Kotlin
object Base64Utils {
    fun encodeUrl(string: String): String {}

    fun decodeUrl(string: String): String {}

    fun encode(string: String): String {}

    fun decode(string: String): String {}

    fun getMD5(text: String): String {}
}
```

```Kotlin
object SourceUtils {
    fun urlParser(rootURL: String, source: String): String {
        return when {
            source.startsWith("http") -> {
                source
            }

            source.startsWith("//") -> {
                "https:$source"
            }

            source.startsWith("/") -> {
                rootURL + source
            }

            else -> {
                "${rootURL}/$source"
            }
        }
    }
}
```


## NetworkHelper

```Kotlin
interface NetworkHelper {
    // 影响 okhttp 和嗅探工具的 WebView
    val cookieManager: AndroidCookieJar
    val defaultLinuxUA: String
    val defaultAndroidUA: String
    val randomUA: String
}

interface AndroidCookieJar {
    // Cookie 可使用 new Cookie.Builder 构建
    fun put(url: String, vararg cookies: Cookie)
    // 会清理纯纯看番所有 Cookie （包括其他插件）
    fun removeAll()
    // 真正存入数据库
    fun flush()
}


```


```Kotlin
class Cookie {
    // ...

    class Builder {
        private var name: String? = null
        private var value: String? = null
        private var expiresAt = MAX_DATE
        private var domain: String? = null
        private var path = "/"
        private var secure = false
        private var httpOnly = false
        private var persistent = false
        private var hostOnly = false

        fun name(name: String) = apply {
            require(name.trim() == name) { "name is not trimmed" }
            this.name = name
        }

        fun value(value: String) = apply {
            require(value.trim() == value) { "value is not trimmed" }
            this.value = value
        }

        fun expiresAt(expiresAt: Long) = apply {
            var expiresAt = expiresAt
            if (expiresAt <= 0L) expiresAt = Long.MIN_VALUE
            if (expiresAt
                > MAX_DATE) expiresAt = MAX_DATE
            this.expiresAt = expiresAt
            this.persistent = true
        }

        /**
         * Set the domain pattern for this cookie. The cookie will match [domain] and all of its
         * subdomains.
         */
        fun domain(domain: String): Builder = domain(domain, false)

        /**
         * Set the host-only domain for this cookie. The cookie will match [domain] but none of
         * its subdomains.
         */
        fun hostOnlyDomain(domain: String): Builder = domain(domain, true)

        private fun domain(domain: String, hostOnly: Boolean) = apply {
            val canonicalDomain = domain.toCanonicalHost()
                ?: throw IllegalArgumentException("unexpected domain: $domain")
            this.domain = canonicalDomain
            this.hostOnly = hostOnly
        }

        fun path(path: String) = apply {
            require(path.startsWith("/")) { "path must start with '/'" }
            this.path = path
        }

        fun secure() = apply {
            this.secure = true
        }

        fun httpOnly() = apply {
            this.httpOnly = true
        }

        fun build(): Cookie {
            return Cookie(
                name ?: throw NullPointerException("builder.name == null"),
                value ?: throw NullPointerException("builder.value == null"),
                expiresAt,
                domain ?: throw NullPointerException("builder.domain == null"),
                path,
                secure,
                httpOnly,
                persistent,
                hostOnly)
        }
    }
}
```
