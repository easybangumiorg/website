# 插件示例

以[Bangumi API](https://bangumi.github.io/api/)为例开发一个纯纯看番插件项目，由于纯纯看番的插件系统比较灵活，这里仅通过Bangumi API实现番剧的推荐、查找、信息展示。

在一切开始之前，建议使用[自己构建](/zh/guide/contribution/noumenon.md)的纯纯看番，这样就可以在Android Studio中对本体和插件进行调试。

::: warning 注意
这篇教程并不涉及番剧的解析、播放等操作
:::

## 初始化项目

### 修改 Package Name

打开Android Studio创建一个空白项目（No Activity）

::: tip
**名称**（Name）和**包名**（Package Name）可以任取，但是请尽量不要使用默认。

这里的包名使用的是`org.easybangumi.extension.zh.bangumiapi`
:::

![create-extension-settings](/images/guide/extension/create-extension-settings.png)

等待Gradle Sync的完成，如果Gradle Sync没有正常开始，请手动进行。

采用默认的Android视图，这是项目结构：

![create-path](/images/guide/extension/create-path.png)

### 修改 settings.gradle.kts

打开`settings.gradle.kts`文件，在`dependencyResolutionManagement`中添加snapshot源。

```kts{6-7}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://s01.oss.sonatype.org/content/repositories/snapshots/") }
        maven { url = uri("https://jitpack.io") }
    }
}
```

### 修改 gradle.build.kts

打开`gradle.build.kts`文件，后面带有`Module :app`的那个，在`dependencies`中添加插件化库，然后执行Gradle Sync。

```kts {2}
dependencies {
    compileOnly("io.github.easybangumiorg:extension-api:1.2-SNAPSHOT")

    implementation("androidx.core:core-ktx:1.9.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.8.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
```

::: tip
一般情况下，仅需要添加以上第二行代码即可，其余的依赖如果不需要使用可以删除
:::

::: warning
在本例程中，假如删除了其他依赖项，你需要把两个Test（AndroidTest和Test）和res下的xml与values也删除
:::

### 修改 AndroidManifest.xml

在这一步开始之前，请务必确保已经执行了Gradle Sync。

打开`AndroidManifest.xml`，修改整个文件，以下给出一个文件示例，高亮的行是需要根据实际情况修改的。

```xml{6-7,12,20}
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-feature android:name="easybangumi.extension" android:required="true" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="EasyBangumi: 番组计划API"
        android:supportsRtl="true">
        <!--readme-->
        <meta-data
            android:name="easybangumi.extension.readme"
            android:value="纯纯看番扩展，番组计划" />
        <!--libVersion-->
        <meta-data
            android:name="easybangumi.extension.lib.version"
            android:value="1" />
        <!--source-->
        <meta-data
            android:name="easybangumi.extension.source"
            android:value="org.easybangumi.extension.zh.bangumiapi.Factory"/>
        <!--为了让本体能找到需要加-->
        <activity android:name="com.heyanle.extension_api.NoneActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.ANSWER" />
                <data android:host="com.heyanle.easybangumi"
                    android:scheme="source"/>
            </intent-filter>
        </activity>
    </application>
    <queries>
        <package android:name="com.heyanle.easybangumi" />
    </queries>
</manifest>
```

第六行设置的是插件的应用图标，这里采用默认的应用图片，实际使用中应该自己指定一张图标。第七行设置的是插件的应用名称，推荐以`EasyBangumi:`开头方便用户进行搜索。这两行设置的内容对应你在应用管理中看到的部分。

第十二行设置的是插件在纯纯看番内显示的摘要信息，目前没有使用但不推荐随意设置。

第二十行设置的是插件的入口点，这里设置的入口点是`org.easybangumi.extension.zh.bangumiapi.Factory`，于是之后需要在对应的这个位置创建入口类`Factory`。

## 插件化框架

### 插件图标

下载番组计划的LOGO，将LOGO文件移动到drawable下，如果希望应用程序的LOGO也是自定义的话可以修改`AndroidManifest.xml`。

假如logo文件是`icon.png`，那么就将第六行修改为`@drawable/icon`。

::: warning
如果使用JPEG图片的话可能会导致一些不可意料的问题，推荐使用的图片格式有PNG和WebP。
:::

### 创建番剧源类 BangumiApiSource

在`org.easybangumi.extension.zh.bangumiapi`的主文件夹下创建一个名为`BangumiApiSource`的类，以下给出一个模板写法。

```kotlin
package org.easybangumi.extension.zh.bangumiapi

import com.heyanle.bangumi_source_api.api.component.Component
import com.heyanle.extension_api.ExtensionIconSource
import com.heyanle.extension_api.ExtensionSource

class BangumiApiSource : ExtensionSource(), ExtensionIconSource  {
    override fun getIconResourcesId(): Int {
        return R.drawable.icon
    }

    override val describe: String?
        get() = null
    override val label: String
        get() = "番组计划"
    override val version: String
        get() = "1.0"
    override val versionCode: Int
        get() = 1
    override val sourceKey: String
        get() = "bangumiapi"

    override fun components(): List<Component> {
        return listOf(

        )
    }
}
```

之前所有的内容都是定义插件本身的，从这一步开始定义这个插件中唯一的番剧源`BangumiApiSource`，由于谷歌资源系统的限制，之前复制两份的LOGO需要使用另外一个，也就是`R.drawable.icon`。之后需要定义番剧源的五个属性：

- `describe`定义的是番剧源的描述，不是必填项目
- `label`定义的是番剧源在纯纯看番中显示的名称
- `version`定义的是番剧源在纯纯看番中显示的版本号
- `versionCode`定义的是番剧源的版本代码，推荐的做法是从1开始每个版本加一
- `sourceKey`定义的是番剧源数据在纯纯看番本地数据库中使用的hash因素，应该是每个番剧源唯一的

::: warning
`sourceKey`非常重要，假如你修改了这个值将会导致用户之前追的番剧无法找到对应的番剧源更新，一个合理的建议是使用小写英文字母以及下划线和减号来构成`sourceKey`
:::

最后的`components()`函数返回了这个番源所有支持的功能模块，此时并没有编写任何的模块，返回一个空列表。

### 创建插件入口点 SourceFactory

在`org.easybangumi.extension.zh.bangumiapi`的主文件夹下创建一个名为`Factory`的类，在类中引入`com.heyanle.bangumi_source_api.api.SourceFactory`，让创建的`Factory`类实现`SourceFactory`。

以下是一个基本示例：

```kotlin
package org.easybangumi.extension.zh.bangumiapi

import com.heyanle.bangumi_source_api.api.SourceFactory

class Factory: SourceFactory {
    override fun create() = listOf(BangumiApiSource())
}
```

在做完这一步后，你可以尝试编译整个项目并且在你的安卓设备上运行，如果一切都设置正确，那么在纯纯看番软件内就可以看到你编写的插件了，但是在这时编写的插件并没有实现功能，还需要接下来的教程。
