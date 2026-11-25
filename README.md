# magpie-plugins

zwenooo 自己用的 [magpie](https://github.com/yetone/magpie) 插件。magpie
本体只用官方版，所有扩展功能都以插件形式维护在这里。

背景、迁移计划和每一步的记录见 [docs/roadmap.md](docs/roadmap.md)。

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

## 发布

改好、提交之后，先把 `packages/<名字>/package.json` 的 version 提上去并提交，
然后：

```sh
node scripts/release.mjs <名字>          # 只在本地打 tag
node scripts/release.mjs <名字> --push   # 同时推送当前分支和这个 tag
```

脚本用 HEAD 里的 `packages/<名字>` 做一个单独的提交（父提交是这个插件的上一个
版本），打上 `<名字>-v<版本>`。这个提交不在任何分支上，靠 tag 留着。

## 插件

| 插件 | 作用 | 状态 |
| --- | --- | --- |
| [reclaude](packages/reclaude) | ReClaude 的每个账号成为 Library 的 `claude#rec-<id>` 行，跟随 Claude Code 的 MCP、skill 和说明 | 0.1.0 |

计划中：CodeZ 供应商，以及 fork 里 Sessions 的几个功能。详见 [docs/roadmap.md](docs/roadmap.md)。

## 许可

MIT
