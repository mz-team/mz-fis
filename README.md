# MZ-FIS Frontend Framework
[![Build Status](https://travis-ci.org/mz-team/mz-fis.svg?branch=master)](https://travis-ci.org/mz-team/mz-fis)

该框架基于 [FIS3](http://fis.baidu.com/) ，可用于 PHP Smarty 国际化场景

## 目录规范

![目录规范](./struct.png)

## 安装方法

`sudo npm install -g mz-fis`

## 补丁细节

### 1、fis-spriter-csssprites

* 支持 与 relative-hook 同时使用 



## 更新日志

### 0.5.6
* 兼容 https cdn 域名配置

### 0.5.5
* 增加 cloneObjectOrdered 排序，确保每次的 map.json 映射表键值排序不会变动

### 0.5.4
* 增加 mz-parser-partial 插件，以支持 i18n 架构中的 ssi 特性

### 0.5.3
* 与 fis3 内核同步，兼容 node 4、5、6 版本
* 增加 `livereload-iprule` 与 `weinre-iprule` 配置，使用方法[参考这里](https://github.com/mz-team/mz-command-release/blob/master/lib/weinre.js#L14)
* 新增 mz-command-release 便于定制化 release 操作

### 0.4.8
* 可以指定不需要压缩的 png 图片，命名格式为 *.hd.png

### 0.4.7
* fis 已经增加对 poster 属性资源定位的支持，移除该重写补丁

### 0.4.6
* 增加对 .flv类型文件 的支持

### 0.4.5
* 解决 video 标签 poster 属性不能资源定位的问题

### 0.4.3
* 增加 mz-postprocessor-href-locate 插件，以支持 \*.tpl 中的 a 标签的 href 资源定位特性

### 0.4.1 - 0.4.2
* [bugfix] fis-conf.js 必要性检测修复为只限定 mz release 命令

### 0.4.0
* 增加 fis-conf.js 文件必要性检测，没有配置文件的项目无法使用 mz 命令
* 增加 autoImportCustomScss 配置，是否开启自动引用同一目录下同名 .custom.scss 文件的特性
* 增加 autoImportParentScss 配置，开启之后会自动 import 父级目录下与父级目录同名的 scss 文件，以便自动引用同一栏目下的父级样式
* 增加 globalVarScss 配置，项目中所有 scss 文件会自动 import 全局 _var.scss 文件，以便复用全局的 @mixin 与变量

### 0.3.6
* 增加 mp4、webm 二进制类型

### 0.3.5 
* mz server clean 命令兼容 fis 3.2.4
* 增加 fis3-server-php 依赖