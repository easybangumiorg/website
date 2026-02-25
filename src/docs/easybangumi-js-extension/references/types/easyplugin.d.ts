// ===== 全局变量与类声明 =====
declare class ArrayList<T = any> {
    add(element: T): boolean;
    addAll(elements: T[]): boolean;
    size(): number;
}

declare class Pair<K, V> {
    constructor(first: K, second: V);

    first: K;
    second: V;
}

declare namespace Package {
    namespace com {
        namespace heyanle {
            namespace easybangumi4 {
                let _: any;
            }
        }
    }
    namespace kotlin {
        let _: any;
    }
    namespace java {
        let _: any;
    }
    namespace org {
        namespace jsoup {
            let _: any;
        }
    }
    namespace okhttp3 {
        let _: any;
    }
}

declare function importPackage(pkg: any): void;

// ===== JS源全局实用工具与帮助函数声明 =====
declare namespace JSLogUtils {
    function i(tag: string, msg: string): void;
    function e(tag: string, msg: string): void;
    function w(tag: string, msg: string): void;
    function d(tag: string, msg: string): void;
    function v(tag: string, msg: string): void;
    function wtf(tag: string, msg: string): void;
}

declare let Log: typeof JSLogUtils;

declare namespace Base64Utils {
    function encodeUrl(data: string): string;
    function decodeUrl(data: string): string;
    function encode(data: string): string;
    function decode(data: string): string;
    function getMD5(data: string): string;
}

declare namespace DeviceUtil {
    let isMiui: boolean;
    let miuiMajorVersion: number;
    function isMiuiOptimizationDisabled(): boolean;
    let isSamsung: boolean;
    let invalidDefaultBrowsers: string[];
    function getSystemProperty(key: string): string;
}

declare namespace SourceUtils {
    function urlParser(rootUrl: string, url: string): string;
}

declare let JSSourceUtils: typeof SourceUtils;

declare namespace CaptchaHelper {
    /**
     * 打开一个对话框请求用户输入验证码
     * @param image 验证码图片，可以是以下类型
     * - [String] (mapped to a [Uri])
     * - [Uri] ("android.resource", "content", "file", "http", and "https" schemes only)
     * - [HttpUrl]
     * - [File]
     * - [DrawableRes]
     * - [Drawable]
     * - [Bitmap]
     * - [ByteArray]
     * - [ByteBuffer]
     * @param text 对话框提示文字
     * @param title 对话框标题
     * @param hint 用户输入框提示
     * @param onFinish 用户输入完毕确认后回调
     */
    function start(
        image: string,
        text: string | null,
        title: string | null,
        hint: string | null,
        onFinish: (result: string) => void,
    ): void;
}

declare namespace NetworkHelper {
    let randomUA: string;
    let cookieManager: AndroidCookieJar;
    let defaultLinuxUA: string;
    let defaultAndroidUA: string;
}

declare class AndroidCookieJar {
    // AndroidCookieJar 接口，由上层包装
}

declare namespace OkhttpHelper {
    let client: OkHttpClient;
    let cloudflareClient: OkHttpClient;
    let cloudflareWebViewClient: OkHttpClient;
}

declare class OkHttpClient {
    // OkHttpClient 接口，由上层包装
}

declare namespace OkhttpUtils {
    function get(url: string): Request;
    function post(url: string, body: RequestBody): Request;
}

declare namespace Request {
    function Builder(): RequestBuilder;
}

declare class RequestBuilder {
    url(url: string): RequestBuilder;
    header(name: string, value: string): RequestBuilder;
    get(): Request;
    post(body: RequestBody): Request;
    build(): Request;
}

declare class RequestBody {
    static create(mediaType: string, content: string): RequestBody;
}

declare class Response {
    body(): ResponseBody;
    code(): number;
    message(): string;
}

declare class ResponseBody {
    string(): string;
    bytes(): ArrayBuffer;
}

declare class Call {
    execute(): Response;
    enqueue(callback: Callback): void;
    cancel(): void;
}

declare interface Callback {
    onResponse(call: Call, response: Response): void;
    onFailure(call: Call, e: Error): void;
}

declare namespace PreferenceHelper {
    function get(tag: string, default_: string): string;
    function put(tag: string, value: string): void;
    function map(): Map<string, string>;
}

declare namespace StringHelper {
    /**
     * 展示纯纯看番样式对话框通知
     */
    function moeDialog(text: string, title: string | null): void;

    /**
     * 展示纯纯看番样式站内通知
     */
    function moeSnackBar(text: string): void;

    /**
     * 弹 toast
     */
    function toast(text: string): void;
}

declare namespace WebViewHelperV2 {
    class RenderedStrategy {
        url: string;
        reg: string;
        encode: string;
        user_agent: string;
        header: Map<string, string> | null;
        action_js: string | null;
        needBlob: boolean;
        timeout: number;

        constructor(
            url: string,
            reg: string,
            encode: string,
            user_agent: string,
            header: Map<string, string> | null,
            action_js: string | null,
            needBlob: boolean,
            timeout: number,
        );
    }

    interface RenderedResult {
        // 策略
        strategy: RenderedStrategy;
        // 网址
        url: string;
        // 是否超时
        isTimeout: boolean;
        // 网页源码
        content: string;
        // 拦截资源
        interceptResource: string;
    }

    function renderHtml(strategy: RenderedStrategy): RenderedResult | null;

    function getGlobalWebView(): WebView;

    function openWebPage(
        onCheck: (webView: WebView) => void,
        onStop: (webView: WebView) => void,
    ): void;

    function openWevPage(
        webView: WebView,
        onCheck: (webView: WebView) => void,
        onStop: (webView: WebView) => void,
    ): void;
}

// ===== JS源 - 注入的特殊模块声明 =====
declare let Inject_CaptchaHelper: typeof CaptchaHelper;
declare let Inject_NetworkHelper: typeof NetworkHelper;
declare let Inject_OkhttpHelper: typeof OkhttpHelper;
declare let Inject_PreferenceHelper: typeof PreferenceHelper;
declare let Inject_StringHelper: typeof StringHelper;

declare namespace Inject_WebViewHelperV2 {
    let renderHtmlFromJs: typeof WebViewHelperV2.renderHtml;
}
declare namespace Inject_Source {
    let key: string;
}

// ===== JS源 - 实体与实体创建函数声明 =====
declare namespace SourcePreference {
    class BasePreference {
        label: string;
        key: string;
    }

    class Edit extends BasePreference {
        default_: string;
        constructor(label: string, key: string, default_: string);
    }

    class Switch extends BasePreference {
        default_: boolean;
        constructor(label: string, key: string, default_: boolean);
    }

    class Selection extends BasePreference {
        default_: string;
        options: string[];
        constructor(
            label: string,
            key: string,
            default_: string,
            options: string[],
        );
    }
}

declare class CartoonCoverImpl {
    id: string;
    source_key: string;
    url: string;
    title: string;
    intro: string;
    cover: string;

    constructor(
        id: string,
        source_key: string,
        url: string,
        title: string,
        intro: string,
        cover: string,
    );
}

declare class CartoonImpl {
    id: string;
    source_key: string;
    url: string;
    title: string;
    genre: string;
    coverUrl: string;
    intro: string;
    description: string;
    updateStrategy: number;
    isUpdate: boolean;
    status: number;

    constructor(
        id: string,
        source_key: string,
        url: string,
        title: string,
        genreList: string[],
        cover: string,
        intro: string,
        description: string,
        updateStrategy: number,
        isUpdate: boolean,
        status: number,
    );
}

declare function makeCartoonCover(info: {
    id: string;
    url: string;
    title: string;
    intro: string;
    cover: string;
}): CartoonCoverImpl;

declare function makeCartoon(info: {
    id: string;
    url: string;
    title: string;
    genreList: string[];
    cover: string;
    intro: string;
    description: string;
    updateStrategy: number;
    isUpdate: boolean;
    status: number;
}): CartoonImpl;

declare class MainTab {
    static MAIN_TAB_WITH_COVER: number;
    static MAIN_TAB_GROUP: number;

    constructor(label: string, type: number);

    label: string;
    type: number;
}

declare class SubTab {
    constructor(label: string, active: boolean, ext: number);

    label: string;
    active: boolean;
    ext: number;
}

declare class PlayLine {
    constructor(id: string, label: string, episodes: Episode[]);

    id: string;
    label: string;
    episode: ArrayList<Episode>;
}

declare namespace Cartoon {
    let STATUS_UNKNOWN: number;
    let UPDATE_STRATEGY_ALWAYS: number;
}

declare class Episode {
    constructor(id: string, label: string, order: number);

    id: string;
    label: string;
    order: number;
}

declare interface CartoonSummary {
    id: string;
    source: string;
}

declare class PlayerInfo {
    static DECODE_TYPE_OTHER: number;
    static DECODE_TYPE_HLS: number;

    constructor(type: number, url: string);

    type: number;
    url: string;
}

// ===== JS 源 - WebProxy 相关 =====
declare class WebView {
    // WebView 接口，由 WebViewProxyKtWrapper 包装
}

declare namespace WebProxyProvider {
    function getWebProxy(): WebViewProxy;
}

declare class WebViewProxy {
    loadUrl(
        url: string,
        userAgent?: string | null,
        headers?: Map<string, string> | null,
        interceptResRegex?: string | null,
        needBlob?: boolean,
    ): void;

    waitingForPageLoaded(timeout?: number): boolean;

    waitingForResourceLoaded(
        resourceRegex: string,
        sticky?: boolean,
        timeout?: number,
    ): string | null;

    href(url: string, cleanLoaded?: boolean): void;

    getContent(timeout?: number): string | null;

    getContentWithIframe(timeout?: number): string | null;

    waitingForBlobText(
        urlRegex?: string | null,
        textRegex?: string | null,
        sticky?: boolean,
        timeout?: number,
    ): Pair<string | null, string | null> | null;

    executeJavaScript(script: string, delay?: number): string | null;

    delay(delay: number): void;

    close(): void;

    addToWindow(show: boolean): void;
}

declare let Inject_WebProxyProvider: typeof WebProxyProvider;

// ===== JS 源 - 异常类 =====
declare class ParserException {
    constructor(message: string);
}

// ===== JS 源 - 其他工具 =====
declare class URLEncoder {
    static encode(str: string, charset: string): string;
}

declare class StringBuilder {
    constructor();
    append(str: string): StringBuilder;
    toString(): string;
}

declare class HashMap<K, V> {
    put(key: K, value: V): V | null;
    get(key: K): V | null;
    containsKey(key: K): boolean;
    remove(key: K): V | null;
    clear(): void;
    size(): number;
    isEmpty(): boolean;
}

declare let System: {
    currentTimeMillis(): number;
};
