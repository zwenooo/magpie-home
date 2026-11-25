# magpie-home

zwenooo 自己用的 [magpie](https://github.com/yetone/magpie) 扩展的总入口。magpie
本体只用官方版，所有扩展功能都做成插件或 skill。本仓库不放插件代码（插件各有
自己的仓库，见下表），只放 skill、迁移记录和这份说明。

本仓库原名 `zwenooo/magpie-plugins`，2026-11-25 改名（拆仓库后里面已经没有插件，
旧名字容易误会）。GitHub 会把旧地址转到这里。

背景、迁移计划和每一步的记录见 [docs/roadmap.md](docs/roadmap.md)。

## 插件

每个插件一个仓库，包在仓库根目录。在 magpie 的插件页添加，或者
`magpie plugin add <地址>`。不带 `#…` 时跟着 `main`，有新提交 magpie 会提示更新；
要固定版本就加 `#v<版本>`。

| 插件 | 地址 | 作用 |
| --- | --- | --- |
| [reclaude](https://github.com/zwenooo/magpie-reclaude) | `github:zwenooo/magpie-reclaude` | ReClaude 的每个账号成为 Library 的 `claude#rec-<id>` 行，跟随 Claude Code 的 MCP、skill 和说明（只用于官方版 magpie） |
| [codez](https://github.com/zwenooo/magpie-codez) | `github:zwenooo/magpie-codez` | CodeZ 作为供应商，用 API 密钥登录；GPT 走 Responses、Claude 走 Messages、其他走 Chat |

这两个插件原先放在本仓库的 `packages/` 下，2026-11-25 拆成了独立仓库（历史一并
带过去）。本仓库里旧的 tag（`reclaude-v0.1.0`…`reclaude-v0.1.2`、`codez-v0.1.0`）
还在，指向拆分前的版本。

第三方插件：Cursor 桥接用的是
[kingchen95272025/magpie-agent-cursor-bridge-enhanced](https://github.com/kingchen95272025/magpie-agent-cursor-bridge-enhanced)，
不在这里维护。

## Skills

`skills/` 下是给 magpie Library 用的 skill。在 Library 的 Skills 里从 GitHub 安装，
地址填 `https://github.com/zwenooo/magpie-home`，勾选要装的；之后会跟着本仓库自动
更新。

| Skill | 作用 |
| --- | --- |
| [session-handoff](skills/session-handoff/SKILL.md) | 接手另一个会话的工作接着做：用 Magpie Sessions MCP 找到并读完旧会话，按 fork 的 handoff 规则汇报进度、等确认。需要先在 Library → MCP 里加 Magpie Sessions |

## 许可

MIT
