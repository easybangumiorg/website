---
lang: zh-CN
title: 关于分布式纯纯看番
editLink: false
lastUpdated: false
contributors: false
sidebar: false
---

# 关于分布式纯纯看番

分布式纯纯看番是一组**通用的API接口**用于浏览和管理本地番剧，任何人都可以基于此接口实现流媒体服务器，并且部署在私域用于个人家庭番剧的管理。

我们在官网提供了一套简便的连接[页面](/zh/webapp)用于测试分布式纯纯看番的部署情况，同样我们也提供了一套基于Express（node.js）的分布式[后端](https://github.com/easybangumiorg/)，可通过插件进行扩展。

## 连接

在这个[页面](/zh/webapp)连接即可，地址填写分布式服务器地址，密钥当服务器需要密钥时可以填写。

::: warning 注意

由于一些刻意的设计，官网所提供的连接页面只支持localhost或者https连接

:::

## 声明

此[页面](/zh/webapp)仅供链接分布式纯纯看番使用，任何内容均与纯纯看番无关，纯纯看番仅提供相应的接口规范和标准程序实现，并不存储且分发相应的内容。

## 构建

分布式纯纯看番示例代码正处于快速开发阶段，代码存在大量的问题亟待解决，在完成第一个版本后将会对其进行优化。

## 工程服务器

[http://localhost:8080/zh/webapp?path=http%3A%2F%2Flocalhost%3A2383&secret=wdif32q3wf123rfh](/zh/webapp?path=http%3A%2F%2Flocalhost%3A2383&secret=wdif32q3wf123rfh)
