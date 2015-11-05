# MZ-FIS Frontend Framework

该框架基于 [FIS3](http://fis.baidu.com/) ，可用于 PHP Smarty 国际化场景

## 目录规范

![目录规范](./struct.png)

## 安装方法

`sudo npm install -g mz-fis`

## 补丁细节

### 1、fis3-command-release 

* 支持 weinre 参数调试
* livereload 默认使用局域网 ip 而非 127.0.0.1

### 2、fis-spriter-csssprites

* 支持 与 relative-hook 同时使用 


## 更新日志

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