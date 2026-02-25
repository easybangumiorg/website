# 纯纯看番 JS 源扩展 - 实体类参考

## 目录

1. [基础类](#1-基础类)
2. [偏好设置类](#2-偏好设置类)
3. [内容实体类](#3-内容实体类)
4. [页面组件类](#4-页面组件类)
5. [播放相关类](#5-播放相关类)

---

## 1. 基础类

### ArrayList\<T\>

```javascript
var list = new ArrayList();
list.add(item);           // 添加元素
list.addAll(otherList);   // 添加另一个列表
list.size();              // 获取大小
list.get(index);          // 获取元素
```

### Pair\<K, V\>

```javascript
var pair = new Pair(first, second);
pair.first;    // 第一个值
pair.second;   // 第二个值
```

**常用场景：**
- `PageComponent_getContent` 返回 `Pair<nextKey, ArrayList<CartoonCover>>`
- `SearchComponent_search` 返回 `Pair<nextKey, ArrayList<CartoonCover>>`
- `DetailedComponent_getDetailed` 返回 `Pair<Cartoon, ArrayList<PlayLine>>`

### HashMap\<K, V\>

```javascript
var map = new HashMap();
map.put(key, value);        // 存入
map.get(key);               // 获取
map.containsKey(key);       // 检查是否存在
map.remove(key);            // 删除
map.clear();                // 清空
map.size();                 // 大小
map.isEmpty();              // 是否空
```

**常用场景：** `subTabTemp` 用于缓存子标签内容

---

## 2. 偏好设置类

### SourcePreference.Edit

文本输入框。

```javascript
var edit = new SourcePreference.Edit(
    "网页地址",      // label: 显示标签
    "Host",         // key: 存储键
    "https://..."   // default_: 默认值
);
```

### SourcePreference.Switch

开关。

```javascript
var sw = new SourcePreference.Switch(
    "启用高清",    // label
    "EnableHd",   // key
    true          // default_: 默认值 (boolean)
);
```

### SourcePreference.Selection

选择器。

```javascript
var sel = new SourcePreference.Selection(
    "画质选择",                  // label
    "Quality",                  // key
    "1080P",                    // default_
    ["1080P", "720P", "480P"]   // options
);
```

---

## 3. 内容实体类

### CartoonCoverImpl

封面项，用于列表展示。

**构造函数：**
```javascript
var cover = new CartoonCoverImpl(id, source_key, url, title, intro, cover);
```

**推荐使用工厂函数：**
```javascript
var cover = makeCartoonCover({
    id: "unique-id",
    url: "https://example.com/detail/1",
    title: "番剧标题",
    intro: "简介文字",
    cover: "https://example.com/cover.jpg"
    // source 会自动注入，无需指定
});
```

**属性：**
- `id`: string - 唯一标识
- `source_key`: string - 源标识
- `url`: string - 详情页 URL
- `title`: string - 标题
- `intro`: string - 简介
- `cover`: string - 封面图 URL

### CartoonImpl

详情项，包含完整信息。

**构造函数：**
```javascript
var cartoon = new CartoonImpl(
    id, source_key, url, title, genreList, cover,
    intro, description, updateStrategy, isUpdate, status
);
```

**推荐使用工厂函数：**
```javascript
var cartoon = makeCartoon({
    id: "unique-id",
    url: "https://example.com/detail/1",
    title: "番剧标题",
    genreList: genreList,  // ArrayList<String>
    cover: "https://example.com/cover.jpg",
    intro: "短简介",
    description: "详细描述",
    updateStrategy: Cartoon.UPDATE_STRATEGY_ALWAYS,
    isUpdate: false,
    status: Cartoon.STATUS_UNKNOWN
});
```

**属性：**
- `id`: string
- `source_key`: string
- `url`: string
- `title`: string
- `genre`: string - 类型（拼接字符串）
- `coverUrl`: string
- `intro`: string
- `description`: string
- `updateStrategy`: number
- `isUpdate`: boolean
- `status`: number

**状态常量：**
```javascript
Cartoon.STATUS_UNKNOWN = 0
Cartoon.STATUS_ONGOING = 1
Cartoon.STATUS_FINISHED = 2
```

**更新策略常量：**
```javascript
Cartoon.UPDATE_STRATEGY_ALWAYS = 0
Cartoon.UPDATE_STRATEGY_ONCE = 1
```

---

## 4. 页面组件类

### MainTab

主标签页。

**常量：**
```javascript
MainTab.MAIN_TAB_WITH_COVER = 0  // 带封面的单页
MainTab.MAIN_TAB_GROUP = 1       // 分组标签（包含子标签）
```

**构造函数：**
```javascript
var tab = new MainTab("番剧", MainTab.MAIN_TAB_WITH_COVER);
```

**属性：**
- `label`: string - 标签名称
- `type`: number - 类型

### SubTab

子标签页（用于分组标签）。

**构造函数：**
```javascript
var subTab = new SubTab("周一", true, extKey);
```

**属性：**
- `label`: string - 子标签名称
- `active`: boolean - 是否默认激活
- `ext`: number - 扩展数据（通常用作缓存键）

### Episode

剧集。

**构造函数：**
```javascript
var episode = new Episode("ep-1", "第 1 集", 0);
```

**属性：**
- `id`: string - 剧集 ID
- `label`: string - 剧集显示名称
- `order`: number - 排序序号

### PlayLine

播放线路。

**构造函数：**
```javascript
var playLine = new PlayLine("line-1", "线路 1", episodeList);
```

**属性：**
- `id`: string - 线路 ID
- `label`: string - 线路名称
- `episode`: ArrayList\<Episode\> - 剧集列表

---

## 5. 播放相关类

### PlayerInfo

播放信息。

**常量：**
```javascript
PlayerInfo.DECODE_TYPE_OTHER = 0  // 普通视频
PlayerInfo.DECODE_TYPE_HLS = 1    // HLS 流 (m3u8)
```

**构造函数：**
```javascript
var info = new PlayerInfo(type, url);
```

**属性：**
- `type`: number - 解码类型
- `url`: string - 播放地址

**示例：**
```javascript
// MP4 视频
var info = new PlayerInfo(PlayerInfo.DECODE_TYPE_OTHER, "https://.../video.mp4");

// HLS 流
var info = new PlayerInfo(PlayerInfo.DECODE_TYPE_HLS, "https://.../video.m3u8");
```

---

## 6. CartoonSummary 接口

用于详情和播放组件的输入参数。

```javascript
interface CartoonSummary {
    id: string;
    source: string;
}
```

**在实际使用中：**
```javascript
function DetailedComponent_getDetailed(summary) {
    // summary.id: 番剧 ID
    // summary.source: 源标识
    ...
}
```
