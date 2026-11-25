# magpie-plugins

zwenooo 自己用的 [magpie](https://github.com/yetone/magpie) 插件。magpie
本体只用官方版，所有扩展功能都以插件形式维护在这里。

背景和迁移计划见 zwenooo/magpie 的
[docs/fork-roadmap.md](https://github.com/zwenooo/magpie/blob/main/docs/fork-roadmap.md)。

## 目录

每个插件是 `packages/<名字>/` 下的一个独立包，有自己的 `package.json`。

## 安装

magpie 通过 bun 安装 `github:owner/repo#<tag>`，只能装仓库根目录的包，
不支持子目录。所以每个插件按版本单独打 tag：`<名字>-v<版本>`。这个 tag 指向
一个只含该插件、且插件位于根目录的提交。在 magpie 的 Plugins 页添加：

```text
github:zwenooo/magpie-plugins#<名字>-v<版本>
```

开发时也可以直接装本地文件夹：`magpie plugin add <本仓库>/packages/<名字>`。

## 插件

| 插件 | 作用 | 状态 |
| --- | --- | --- |
| （待添加） | | |

计划中：CodeZ 供应商、ReClaude 账号跟随 Claude Code 的 Library，以及 fork 里
Sessions 的几个功能。详见上面的 roadmap。

## 许可

MIT
