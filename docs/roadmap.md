# fork 的去留与迁出计划

这份文件记录对 zwenooo/magpie fork 去留的讨论、已经做出的决定和还没
回答的问题。讨论还在继续：每次有新结论，就在对应小节更新，并在最后的
「讨论记录」里按日期追加一行。

记在 magpie-home 仓库里（`D:\code\magpie-home\docs\roadmap.md`），而不是 Claude
的记忆或 Claude Docs 里，是因为这台电脑上每个 ReClaude 账号都是一个独立的
Claude 账号，记忆和 Docs 都按账号隔开，换个账号就看不到；仓库里的文件每个
账号都能读到。fork 仓库（`D:\code\magpie`）不再改动，连这份记录也不放在
那里（2026-11-24 用户："我们自己的fork版本magpie仓库还去管他干嘛？"）。

## 方向（2026-11-24）

- **回归官方 magpie。** magpie 本体只用 upstream 的代码，不改原版代码。
- **所有扩展功能都做成插件**，维护在
  [zwenooo/magpie-plugins](https://github.com/zwenooo/magpie-home)
  （公开仓库，MIT；拆仓库后改名为 magpie-home，见切换记录第 24 步）。fork 不再加新功能。
- 第三方供应商、第三方工具的代码（ReClaude、CodeZ 等）只出现在插件里。
- 讨论完就开始动手；迁出一项一项来，每一步都要能用。

## 插件和仓库

2026-11-25 起每个插件一个仓库（用户问"为啥不能分两个仓库？"，选了每个插件一个仓库）：

- [zwenooo/magpie-recode](https://github.com/zwenooo/magpie-recode)（显示名 ReCode，0.3.0 前叫
  `magpie-reclaude`），本地 `D:\code\magpie-recode`，安装 `github:zwenooo/magpie-recode`；
- [zwenooo/magpie-codez](https://github.com/zwenooo/magpie-codez)，本地
  `D:\code\magpie-codez`，安装 `github:zwenooo/magpie-codez`；
- 本仓库 [zwenooo/magpie-home](https://github.com/zwenooo/magpie-home)（本地
  `D:\code\magpie-home`，原名 `magpie-plugins`）留着 skill（`skills/`）、这份
  roadmap 和总的说明，不放插件代码。

**插件市场**（2026-11-25）：magpie 插件页的列表是 `magpie-community/plugins` 的
`registry.json`（upstream `internal/plugin/market.go`，每 6 小时拉一次），条目只认
npm 包名；不带 `"community": true` 的条目只在搜索时出现，显示在发布者名下。CodeZ
发到了 npm（`magpie-plugin-codez`，账号 `zwn2027`，2FA 只有安全密钥），登记 PR 是
[magpie-community/plugins#1546](https://github.com/magpie-community/plugins/pull/1546)，
当天被 yetone 关闭、没合并（"日后会出相关合作方案"）。不在市场里 npm 包和 GitHub
地址没区别，npm 停在 0.2.0 不再发（每次要网页登录、令牌约两小时过期、再用安全密钥
批准）；暂存的 0.3.0、0.3.1 没批准。安装和更新都走 `github:zwenooo/magpie-codez`。注册 npm 时网页
注册页拦了 DMIT 的出口 IP，命令行建账号已被 npm 关掉，用户换网络注册的。ReClaude
不登记：`kind` 不合适，还会改 `library.json`、建 junction，审核大概率不过。

包在各自仓库的根目录，所以 magpie（bun 装 `github:owner/repo#ref`，只能装根目录的
包）可以直接装，不用再拼提交。不带 `#…` 安装时跟着 `main`，magpie 按提交号提示
更新（upstream `internal/plugin/gitrev.go`）。发布：改 `package.json` 的 version、
提交、`git tag v<版本>`、推送。

拆分前（2026-11-24 到 11-25）这两个插件在本仓库的 `packages/` 下，用
`scripts/release.mjs` 打 `<名字>-v<版本>` 这样的 tag（tag 指向一个只含该插件、
插件在根目录的提交）。拆分用 `git subtree split -P packages/<名字>`，历史一并带过去。
旧 tag 保留，脚本和 `packages/` 已删。

## fork 功能的去向

功能清单见 fork 仓库的 [FORK.md](https://github.com/zwenooo/magpie/blob/main/FORK.md)（本地 `D:\code\magpie\FORK.md`）。

| fork 功能 | 去向 | 状态 |
| --- | --- | --- |
| Cursor BYOK（普通 Cursor 用 magpie 的模型） | 改用社区的 Cursor 桥接插件，见下文 | 待试用 |
| 自己的发布和应用内更新 | 回归官方版后用官方的更新 | fork 退役时去掉 |
| CodeZ 预设 | 插件 [magpie-codez](https://github.com/zwenooo/magpie-codez)，见下文 | 已装，三把密钥在一个供应商下 |
| 默认关闭合作推广 | 不用插件：upstream 有开关，见下文 | 已查明 |
| Sessions：导入其他账号的 Claude 历史 | ReClaude 插件建 junction 后，upstream 的 Sessions 自己就会读，见下文 | 已实测（沙箱） |
| Sessions：续接 Claude Desktop 的会话、把对话交给任意 agent 继续 | handoff 用 skill `session-handoff`；续接缺口提了 upstream issue #7694；Desktop 转换不做，见「Sessions」 | 已完成 |
| Library 配置跟随、ReClaude 账号作为 `claude#rec-<id>` | 插件 [magpie-recode](https://github.com/zwenooo/magpie-recode)（原 magpie-reclaude）：junction 加直接改 `library.json` 的勾选、再同步一次，见下文 | 已装（官方版上） |
| （新）换 rec 账号后接着聊旧对话 | magpie-reclaude 0.2 的 `shareSessions`：所有账号共用 `~/.rec-sessions` | 已开启 |
| 8 个 upstream 代码修复（FORK.md「Fixes inside upstream code」） | 不改原版代码，回归时一起放弃，见下文 | 已决定 |

## Cursor BYOK 与 Cursor 桥接插件

插件：[kingchen95272025/magpie-agent-cursor-bridge-enhanced](https://github.com/kingchen95272025/magpie-agent-cursor-bridge-enhanced)
（MIT，2026-11-24 看的是 0.2.37）。

注意区分：插件市场里叫 "Cursor" 的插件（`@magpie-community/opencode-cursor-auth`）
方向相反，是把 Cursor 订阅当成供应商。upstream 自带的 Cursor Private
Inference（`internal/agent/cursorlocal.go`）只支持 Cursor 的一个特殊版本，
普通 Cursor 用不了。

**和 fork 是同一件事**：都基于 leookun/cursor-byok 的原生核心，都在本机起
TLS 代理，接管 Cursor 的请求，转发到 magpie 网关。插件通过 upstream 正式支持的
agent 插件扩展点（package.json 里的 `magpie.agent`）接入 magpie，在插件页
就能安装。

**插件比 fork 强的地方**

- 兼容 Cursor 3.29 以上：新版 Cursor 用 `data_binary`（原始 protobuf 字节）
  发送 BidiAppend。fork 的后端遇到它直接报协议错误
  （`native/cursor-backend/server/src/api/cursor/bidi.rs` 的 `decode`），
  表现是对话 30 秒后显示 "Connection stalled"。插件 0.2.3 已修复，并实测到
  Cursor 3.31.17。fork 的 Cursor 后端最后一次更新是 2026-11-06。
- 功能更多：后台多任务子代理接管、Cursor CLI（`cursor-agent`）、控制台、
  分层自检、数据库清理和轻量模式。
- 维护活跃，支持 macOS、Windows 和 Linux。

**风险和注意事项**

- 需要信任作者：Windows 上它把自签 CA 装进「本机受信任的根证书」
  （首次需要管理员确认），然后对 Cursor 的 HTTPS 流量做中间人代理，用的是
  作者预编译的二进制。`integrity.json` 和二进制来自同一个仓库，只能防文件
  损坏，防不了作者本人。fork 只把证书放在当前用户的证书库。
- 后台常驻，不归 magpie 管：通过开机启动项或 HKCU Run 注册表项常驻，magpie
  退出后它仍在运行。
- `bridge.db` 保存完整的对话内容；轻量模式不写盘。
- 作者规模小：一个人维护，12 个 star。

**稳一点的用法**：安装时固定到某个 tag（`github:...#v0.2.37`）；或者把它
fork 到自己的 GitHub，用仓库里的 `source.patch` 和构建脚本自己编二进制。

**下一步**：在一台机器上装它，试用常用的 Cursor 场景几天，确认可以替代。

## CodeZ

CodeZ 是 fork 自己加的预设（`internal/provider/fork_presets.go`，普通中转站
类型），upstream 里没有。决定（2026-11-24）：不改原版代码，在自己的插件仓库里
做一个供应商插件，装上就能把 CodeZ 配成供应商。

fork 里 CodeZ 的行为，插件要做到：

- API 走 `https://api.codezsy.com`，网站和密钥管理在 `https://codezsy.com`。
- 模型列表来自用户的密钥（问 CodeZ 的 `/models`），不写死。
- GPT、Codex、o 系列模型优先走 Responses API，其他模型走 Chat，Claude 走
  Messages（fork 的 `forkResponsesFirst`）。

**已实现**：插件 `packages/codez`（0.1.0，tag `codez-v0.1.0`）。

- 扩展点是供应商插件（OpenCode 插件）：`config` 声明 `cfg.provider.codez`，
  `auth` 提供"填 API 密钥"，`provider.models` 用每把密钥问 `/v1/models`。模板是
  社区的 River 插件（`magpie-community/plugins` 的 `packages/river`）。
- 按模型选接口：模型钩子返回的每个模型带 `api: {url, npm}`，magpie 按 npm 定接口
  （upstream `internal/provider/plugins.go` 的 `pluginProtocol`）：
  `@ai-sdk/openai` → Responses，`@ai-sdk/anthropic` → Messages，其他 → Chat。
  `also` 写这个模型还能走的其他接口，客户端用那些接口发来的请求原样转发。
  地址三种都是 `https://api.codezsy.com/v1`。
- 选法和 fork 一样：GPT、Codex、o 系列（upstream 的 `openAIModel` 规则）走
  Responses，Claude 走 Messages，其他走 Chat。CodeZ 的 `/v1/models` 带
  `supported_endpoint_types`（`openai` = Chat，`openai-response`，`anthropic`，
  `gemini`），用来填 `also`。但 GPT 模型在里面只标了 `openai`，所以 GPT 不按它来。
- 2026-11-25 用户三把密钥的 `/v1/models`：`codez` 23 个（Claude 和 GPT），
  `codez-2`（国模）6 个，`cz-gemini` 5 个。`/api/usage/token` 返回 404，
  `/v1/dashboard/billing/subscription` 的 `quota_details_hidden: true`，读不到
  额度，所以用量钩子只检查密钥。
- 沙箱实测（upstream `e6f4af3f9`，`magpie serve` 换端口，用户的真实密钥，测完
  已从沙箱删除）：
  - 第一把密钥登录后 23 个模型；`codez/gpt-5.6-luna` 走 Chat 入口，日志是
    `chat→responses 200`；`codez/claude-haiku-4-5-20251001` 走 Messages 入口，
    `anthropic→anthropic 200`。
  - 再登录国模那把：供应商有 29 个模型；网关刷新前，`codez/deepseek-v4-flash`
    被发给了第一把密钥，CodeZ 拒绝（"无可用计费分组"）；刷新后（约一分钟）发给
    第二把，`chat→chat 200`。终端里登录新密钥后，正在运行的 magpie 要过一会才
    知道。
  - 超过 24 个模型又没挑选时，magpie 只放出前 24 个（magpie 自己的规则）。
- 和现有供应商并存：magpie 里已有 id 为 `codez` 的供应商时，插件的叫
  `codez-plugin`（`PluginID`：撞上预设或用户自己的供应商 id 就加 `-plugin`）。
  在 fork 上 `codez` 是预设，所以总是 `codez-plugin`。换到官方版后，fork 留下的
  三个 CodeZ 供应商（`codez`、`codez-2`、`cz-gemini`，地址都写在
  `providers.json` 里）仍能当普通中转站用；在插件里登录三把密钥、删掉这三个
  以后，插件的供应商就叫 `codez`，`codez/<模型>` 这些名字还能对上。
- 还没装到正在用的 magpie。fork 上装会多出一套 `codez-plugin/…` 模型，没有必要；
  换官方版时再装。
- 0.2.0（2026-11-25）：登录时选地址，每个账号各记各的（存在账号的 metadata
  里，loader、模型列表、密钥检查都用它）。预置 `api.codezsy.com`（默认）、
  `api-s.codezsy.com`（多节点中转）、`api.zwenooo.link`、`api-s.zwenooo.link`，
  也可以自填。同一把密钥在这四个地址上都列出同样 23 个模型，是同一个 CodeZ。
  选项来自插件登录方式的 `prompts`（select，加一个 `when` 条件的 text），
  没写 `authorize` 时 magpie 自己问密钥，并把全部答案存进账号的 metadata
  （upstream `host.js` 的 `apiKey`）；loader 给的 baseURL 优先于模型行里的地址
  （`plugins.go` 的 `pluginRequestBase`）。命令行和窗口都会问。沙箱里试过预置和
  自填两种。0.2.0 之前登录的账号没有记地址，照旧走 `api.codezsy.com`。
- 0.3.0（同日）：按用户要求，预置改成 `api-cfmax.codezsy.com`（CF 优选节点）、
  `codezsy.com`（主站）、`api-s.codezsy.com`（多节点中转，不过 CF），每个带说明：
  命令行显示在选项后面，窗口里是按钮的 `title`（悬停提示，`app.js` 的
  `renderPluginAsk`）。magpie 不给插件放"感叹号"图标，要的话得改 magpie 本身。
  说明里写了前两个经过 Cloudflare 的 100 秒限制（运维文档里画布接口因此改走
  `api.codezsy.com`）。
- 0.3.1（同日）：账号行（用量钩子的 `plan`）改成"地址 · 各系列模型数"，例如
  `api.codezsy.com · Claude 12 · GPT 11`，不同分组的密钥能分开。用户想要中转那种
  编辑窗口（"添加另一个密钥"、端点、区域）：插件供应商一律用订阅账号的窗口
  （`app.js` 的"Add another {name} account"），插件没有字段能换成密钥布局，要改得
  动 magpie；用户明确不提 PR。路由本身已按模型选密钥（`AccountsFor`：列表里没有
  该模型的账号排后），窗口里"额度用完换下一个"只是通用说明。

## 合作推广

upstream 有现成的开关，不需要插件（2026-11-24 查明）：

- 环境变量 `MAGPIE_PARTNERS=off` 关掉合作推广列表，添加供应商和插件页都不
  再显示（upstream `internal/provider/partners.go` 的 `partnersSource`）。
  在 Windows 上设成用户环境变量，重启 magpie 后生效。
- 合作推广的统计和其他使用统计一起发送，只在 Settings 里"使用统计"开着时
  才发（`settings.NoUsageStats`，upstream `internal/stats/stats.go`）。列表
  关掉后没有展示和点击，也就没有可统计的。
- 和 fork 的差别：fork 还会把已经添加过的合作方供应商改显示成普通中转站
  （`forkUnsponsoredPartner`）。官方版关掉列表后，已加的这类供应商怎么显示，
  回归后再看一眼。

## Sessions

fork 的三项 Sessions 功能（FORK.md）：导入其他账号的 Claude 历史（只读）、
续接 Claude Desktop 的会话并转进 Claude Code 或 Codex、把任意对话交给任意
agent 继续（handoff）。决定（2026-11-24）：都做成插件，不改原版代码。

- **导入其他账号的历史**：upstream 的 Sessions 会读家目录下每个以 `claude`
  或 `.claude` 开头、带 `projects/` 的文件夹，也会往下看一层，例如
  `~/.claude-profiles/work`（upstream `internal/appdir/claude_homes.go` 的
  `ClaudeHomes`）。ReClaude 插件为每个账号建 `~/.claude-rec-<id>` junction
  之后，这些账号的会话会直接出现，不用另做插件。2026-11-24 实测：在 upstream
  `e6f4af3f9` 上，`appdir.ClaudeHomesIn` 会列出带 `projects/` 的
  `~/.claude-rec-<id>` junction（Windows 上 `DirStat` 就是 `os.Stat`，会跟随
  junction）。不在家目录下的其他文件夹（比如从别的电脑拷来的）再看。
- **Claude Desktop 续接、handoff**：2026-11-25 分析完，见下面「Sessions 的
  分析（第 4 步）」。

### Sessions 的分析（第 4 步，2026-11-25）

fork 在 Sessions 上做的（FORK.md）和 upstream `e6f4af3f9` 已有的：

| fork 的功能 | fork 代码 | upstream 已有 | 还缺 |
| --- | --- | --- | --- |
| 导入别的文件夹的 Claude 历史（只读） | `sources.go` 513 行 + 页面 | 读家目录下每个 `.claude*` 文件夹，及其下一层（`appdir.ClaudeHomesIn`） | 不缺，见下 |
| 导入的会话、别的配置文件夹的会话原地续接 | `resumeOf` 等钩子 | `claude --resume <id>`，不带 `CLAUDE_CONFIG_DIR`（`sessions.go` 的 `resumeCommand`） | 别的配置文件夹里的会话续接时找不到 |
| Claude Desktop 的会话转进 Claude Code / Codex | `carry_convert.go` +72 行 | 只有 Claude Code ↔ Codex 互转（`convertsTo`） | Desktop → Claude Code / Codex |
| handoff：任意对话交给任意 agent（压缩记录 + 提示词） | `handoff.go` 862 行 + 菜单 + 命令行 | `magpie-sessions` MCP（`/mcp/magpie/sessions`，`search_sessions`、`read_session`），`magpie sessions show/search` | 固定的提示词和压缩规则 |

upstream 给插件的扩展点（`internal/plugin/page.go`）：

- 插件页面可以整个替换内置的 Sessions 页（`Replaceable`），但会话行上没有插件能加
  的菜单（`ActionMenus` 只有 provider、agent），面板也放不进 Sessions 页
  （`PanelSlots`：agents、usage、settings、provider）。
- 页面能被授权读的只有用量和供应商列表（`PageReads`），读不到会话。
- 插件的宿主部分（`main`）能读文件、跑命令，可以给自己的页面提供一个本地服务
  （`magpie.page.service`）。
- 插件工具：作为 MCP 工具给所有 agent。

逐项结论：

（用户 2026-11-25 选了：handoff 做 skill；只提续接那个 issue。）

1. **导入别的文件夹**：不用插件。
   - ReClaude 账号：`reclaude` 插件的 junction。
   - 别的电脑拷来的：放到 `~/.claude-imports/<名字>/`（里面是 `projects/`）。
     2026-11-25 在 upstream 上实测：`ClaudeHomesIn` 读到
     `.claude-imports\pc2`、`pc3`；`claudeDirAgents` 不把 `.claude-imports` 当成
     Library 的行（它顶层没有 settings.json、`.credentials.json`、projects）。
   - 和 fork 的差别：fork 保证从不写导入的来源（不能删除、移动）。upstream 把它们
     当普通会话，Sessions 页上的删除、移动会动到拷贝本身。
2. **别的配置文件夹里的会话原地续接**：upstream 的续接命令没有
   `CLAUDE_CONFIG_DIR`，`~/.claude-work` 这类文件夹（也包括 rec 账号的
   junction）里的会话，从 Sessions 页续接会找不到。这是 upstream 的缺口，对所有
   用多个 Claude 配置文件夹的人都一样，适合给 upstream 提 issue，不适合做插件
   （插件改不了续接命令）。在那之前：rec 账号的会话用 ReClaude 打开对应账号再
   `/resume`，或者把会话文件复制到当前账号（见「实现时的备忘」）。
3. **Claude Desktop → Claude Code / Codex**：upstream 没有。可选：
   - 给 upstream 提 issue（或 PR：fork 的改动只有 +72 行，`convertsTo` 加
     `claude-desktop`）；
   - 插件：自己的页面 + 宿主里的服务，列出 Desktop 的会话、一键转换（把 fork 的
     转换移植成 JS）。工作量中等，还要跟着 Desktop 的文件格式变；
   - 不做精确转换，用第 4 条的 handoff 接着做。
4. **handoff**：upstream 的 `magpie-sessions` MCP 已经能让任意 agent 搜到并分段读
   任意会话。fork 多出来的是：固定的提示词（把引用当材料而不是指令、已做的不
   重做、以现在的文件为准、先说明进度再继续）和按规则压缩的记录。最省事的做法
   是在 Library 里加一个 skill，把这些规则写进去，让 agent 用 `read_session` 读；
   不用写插件代码，每个 agent 都能用。前提是在 Library → MCP 里把
   `magpie-sessions` 给需要的 agent（`magpie mcp sessions`）。如果以后觉得分段读
   太慢，再考虑做一个插件工具，返回 fork 那样的压缩记录（移植 `handoff.go`）。

## upstream 代码修复

FORK.md「Fixes inside upstream code」里的 8 处修复，都是改原版代码。决定
（2026-11-24）：不改原版代码，回归官方版时一起放弃。

- 只影响测试的 4 处（JSON 填充在 `-race` 下的速度、`httpServer` 和 `nextBeat`
  两个测试接缝、`GOTMPDIR`）：放弃没有影响。
- 用户能看到的 4 处，回归后会重新出现：
  - Anthropic 流里，空文本块的开始事件晚于下一个块的开始事件；
  - pf-serve 超时时丢了原因；
  - Claude Code 用 `/model` 选了 magpie 没列出的模型时，显示"未连接"；
  - 连到 magpie 的地址是手写的时，显示的来源不对，关掉 Claude Code 时
    magpie 专用的模型名没被清掉。

  需要的话可以给 upstream 提 issue，不阻塞回归。

## ReClaude 与配置跟随

**问题**：每换一个新的 ReClaude 账号，Claude 都说找不到 ops-mcp，要手动告诉它
用 `http://127.0.0.1:3425/mcp/magpie/hub`。

**原因**（2026-11-24 查明）

- magpie 把 hub、skill 和说明写进各个账号的那一步是 Library 同步。它只在
  magpie 启动时自动跑一次，另外就是在 Library 页点同步的时候，没有东西在盯
  新账号。upstream 也是这样。
- ReClaude 新建账号时先写 `.credentials.json`，大约 3 分钟后才开第一个会话。
  Claude Code 只在会话开始时读一次 MCP 列表，所以开会话前没同步过的账号，
  那次会话就没有 hub。
- 例子：账号 57658 在 22:33 建立，`library-follow.json` 最后一次写入是当天
  06:01，所以 magpie 一直没接管它。它现在那条裸 `/hub` 地址，是用户在别的
  会话里说"用这个"之后，Claude 手动加的。其他账号用的是
  `/hub/claude%23rec-<id>`。

**fork 里写过的修复已放弃**（2026-11-24）：`fork_follow_new.go` 每 10 秒检查
一次新账号并同步，测试通过，但和"扩展功能都用插件"的方向不符，没有提交。
在插件做好之前，换新账号后在 Library 页点一次同步，再开 Claude 会话。

**fork 在这块剩下的代码**（与 upstream `feb0d8d7f` 比较，`47c46b302` 之后）

- 跨电脑同步本身（sync、备份、davsync）已经全是 upstream 的，fork 没有改。
- 剩下的只有配置跟随，约 1,400 行：`profile_follow.go`（一个配置文件夹自动
  拿到它所属 agent 的勾选）、`fork_claude_homes.go`（ReClaude 账号和手动加的
  Claude 文件夹作为 `claude#` 行）、`fork_claude_dirs.go`（手动加的文件夹和
  旧记录迁移），加上 upstream 文件里的几处钩子和几个为 Windows 调过的测试。
  回归时整块删掉，不必等插件做好。

**ReClaude 插件的做法**（magpie 核心不用改）

upstream 现成能用的：

- 家目录下任何名为 `.claude-<名字>`、装着 Claude Code 文件的文件夹，都会
  成为 `claude#<名字>` 行。链接和 junction 也算（`dirent.IsFolder` 会跟随
  链接，见 `internal/agent/claude_dirs.go`）。`~/.claude-rec-57658` 指向
  `~/.rec/claude/accounts/57658/config`，就会得到 `claude#rec-57658`，和
  fork 现在用的行名一模一样，现有勾选不用迁移。
- `magpie library` 命令行可以改勾选：`mcp agents <name> <a,b…>`、
  `skill agents <name> <a,b…>`、`instructions agents <a,b…>`，还有
  `magpie library sync`。

**已实现**：`zwenooo/magpie-plugins` 的 `packages/reclaude`，现在是 0.1.2
（tag `reclaude-v0.1.2`）。**只装在官方版上**：在 fork 上它什么都不做（见下面
「在 fork 上装过一次」）。和原先设想的不同，
它不用自己常驻：

- 插件有 `main`，magpie 的插件宿主会加载它，插件函数里起一个每 5 秒一次的检查。
  宿主是 magpie 的子进程，随 magpie 启动（读供应商时；最迟 1 分钟后
  `KeepPluginsListed` 也会起），magpie 退出它就退出，不用启动项或注册表。
- 宿主会调用插件文件导出的每一个函数，所以 `index.js` 只导出插件函数，其他
  放在 `follow.js`。
- 只在工作目录里有 `library.json` 时才启动（宿主的工作目录就是 magpie 的
  配置文件夹）；别的插件扫描时加载它不会启动。计时器 `unref`，不拖住别的进程。
- magpie 命令行：默认用启动宿主的那个 magpie（父进程）旁边的 `magpie.com`，
  找不到再用 PATH。这台电脑有两份 magpie：正在跑的是 `D:\Programs\magpie`，
  PATH 里是 `%LOCALAPPDATA%\Programs\magpie`，所以不能只看 PATH。
- 终端里运行 `magpie plugin …` 也会临时起宿主，插件在里面也会跑，可能做到一半
  被结束（沙箱里遇到过，留下了锁）。所以每一步都可以重做，并用系统临时目录下的
  锁文件夹保证同一时刻只有一个在做；锁里记着进程号，进程不在了立刻接管。
- 账号行完全跟着 `claude` 行：`claude` 勾了的给账号行勾上，没勾的取消。
  `claude#rec-<数字>` 的账号文件夹和 junction 都没了，就从勾选里去掉。
- 环境里有 `CLAUDE_CONFIG_DIR` 时不工作：在 ReClaude 会话的终端里运行的 magpie
  会把该账号当成 `claude` 行，抄的勾选就错了（0.1.1 起）。
- **0.1.0 → 0.1.1 的改动（真机上发现的）**：0.1.0 用 `magpie library mcp|skill
  agents …` 一项一项改。真机上每条 magpie 命令要 30 秒到 3 分钟（每条都把所有
  agent 看一遍，包括 WSL 里的；只读的 `library mcp show` 也要 45 秒；沙箱关了
  WSL，所以是 0.4 秒），57658 要补 44 项，新账号也一样，要等几十分钟。magpie
  自己写 `library.json` 也只有进程内的锁，GUI 和命令行之间没有跨进程锁，所以
  0.1.1 改为插件直接改 `library.json` 里的勾选列表（只动 `agents`，写临时文件，
  换过去前确认文件没被改过），然后只跑一次 `magpie library sync`。欠着的同步
  记在临时目录的 `magpie-reclaude.lock.sync-owed`，被中途结束的进程留下的同步
  由下一次检查补上。GUI 的 HTTP 接口（有批量的 `servers/agents-some`）插件
  调不到：网关端口上没有 `/api/library`。

沙箱实测（upstream `e6f4af3f9`，假的 HOME、APPDATA，`noWSLAgents`，
`magpie serve` 换端口）：

- junction `~/.claude-rec-111` 成为 `claude#rec-111` 行，勾选后写进
  `<账号>/config/.claude.json`；hub 开着时写的是
  `/mcp/magpie/hub/claude%23rec-111`，和 fork 现在的一样；说明写进
  `<账号>/config/CLAUDE.md`。
- 没有 junction 的账号，`magpie library mcp agents … claude#rec-222` 报
  unknown agent，所以一定先建 junction。
- 每次命令行约 0.4 秒，`library sync` 约 0.4 秒。
- 新账号先建文件夹、几秒后写 `.credentials.json`：写入后 1 秒 `.claude.json`
  里就有 hub，7 秒内 MCP 和说明的勾选都跟上。删掉账号：junction 删掉，勾选里
  去掉。在 `claude` 行取消勾选：账号行也取消。
- ~~fork 上也能装~~：读代码时以为 fork 会按同一个文件夹去重，真机上不是，见下。

**在 fork 上装过一次（2026-11-25 08:53–09:17），已撤下并清理**

- fork 没有把 junction 和它自己的账号行当成同一个文件夹：junction 先占了
  `claude#rec-<id>`，fork 自己的行被改名成 `claude#rec-<id>-2`，每个账号成了
  两行；fork 还把 `library-follow.json` 里的跟随记录也改名成了 `-2`。各账号
  `.claude.json` 里的 hub 地址没有被写坏（都还是 `claude%23rec-<id>`）。
- 0.1.0 每条命令的超时是 120 秒，真机上几条命令被插件自己杀掉了。
- 09:07:23 插件条目从 `plugins.json` 里没了，不是 Claude 删的（可能是用户在
  插件页删的）。
- 清理：删掉 13 个 junction；`library.json` 里所有勾选去掉 `-2`（585 处），
  `applied` 里删掉 13 个 `-2` 记录；`library-follow.json` 的跟随记录改回
  `claude#rec-<id>`。之后 fork 自己 `library sync`："every agent already has
  it"，没有 `-2`，13 个账号（包括 57658）的勾选都和 `claude` 行一致。清理前的
  两个文件存在本会话 scratchpad 的 `undo-091730/`，装插件前的存在 `before/`。
- 结果：57658 现在由 fork 自己跟随，最初"新账号没有 ops-mcp"的问题对 57658 已
  解决。之后再出现新账号，在 fork 上仍是老办法：Library 页点一次同步。
- 0.1.2 起插件先跑 `magpie --version`，版本号里有 `-vb.`（fork）就什么都不做，
  只记一行日志。

原先的设想（留作对照）：插件带一个小后台程序，做三件事：

1. 盯 `~/.rec/claude/accounts/*/config`，每出现一个新账号，就建一个
   `~/.claude-rec-<id>` junction 指过去。账号删掉时删 junction。
2. 跟随：把 `claude` 行的 MCP、skill、说明的勾选，用 `magpie library
   … agents` 命令抄给每个 `claude#rec-*` 行。
3. 运行 `magpie library sync`。

插件只能声明东西，不能在 magpie 里跑后台任务，所以这个后台程序自己常驻。
Cursor 桥接插件也是这么做的：Windows 上用启动文件夹或 HKCU Run 注册表项。

实现时要注意：

- 读勾选：`magpie library mcp show <name>` 输出 JSON，里面有 agents。skill 和
  说明的勾选没有单独读取的命令，要么读 `magpie library` 的总览输出，要么直接读
  `~/.config/magpie/library.json`。两者都不是稳定接口，magpie 升级后要回归测试。
- 改勾选：`… agents <列表>` 是整张表替换，要先读出当前列表、加上新行再写回，
  否则会冲掉别的勾选。
- 时机：要赶在新账号第一次开会话之前同步完，几秒检查一次就够。
- 项目级的东西命令行改不到（见下面「项目级的 MCP 设置」）。用户的 Library 里
  一个项目都没有（2026-11-24 查过 `library.json`），所以现在不受影响。
- 以后要和 Vaultwarden 结合，所以跟随的逻辑放在自己的插件里（2026-11-24）。

### 项目级的 MCP 设置

magpie 的 Library 有一页「Projects」：把某个项目文件夹加进去之后，可以只给
这个项目多加 skill 或 MCP，或者只在这个项目里关掉某个 MCP server。

Claude Code 的设计是：只在某个项目里关掉一个 server，这个设置不写在项目
文件夹里，而是写在**当前账号配置文件夹**的 `.claude.json` 里，在
`projects["D:/code/某项目"]` 下面。magpie 的 hub 条目在项目级也是这么存的。

所以每个 rec 账号都有自己的一份 `.claude.json`，各自记着"某项目关了哪些
server"。fork 的跟随会把 Claude Code 主文件夹的这些项目级记录也抄进每个
rec 账号（`syncFollowersClaudeLocal`）。插件只用命令行的话，抄不到这一层。

这只对在 Projects 页加过项目、并且在项目里单独关过 server 的情况有影响。用户
现在一个项目都没有，所以插件先不管这一层。

## 密钥同步与 Vaultwarden

ops-mcp 的解密私钥 `OPS_MCP_AGE_KEY` 放在 Library 里 ops-mcp 的环境变量中，
随 magpie 的同步加密上传。**这是 upstream 原有的功能**，回到官方版后照样能用。
决定（2026-11-24）：保持和 upstream 一样，不改。

- upstream 的同步会带上 Library 里 MCP server 的环境变量和请求头。名字像密钥的
  （名字里含 auth、key、token、secret、cookie、session 或 password，不分大小写，
  见 `internal/provider/keep_secrets.go` 的 `secretHeader`），只在同步设置打开
  "带上密钥"时才一起传，否则清空（`internal/backup/backup.go` 的
  `WithoutSecrets(Secret)`）。
- 整个同步文件用同步密码加密，服务器上看不到明文。
- 对方电脑上没收到的密钥，保留本机原来的值（`KeepSecrets`，#1821）。
- `OPS_MCP_AGE_KEY` 名字里有 "KEY"，所以按密钥处理。

**Vaultwarden：先搁置**（2026-11-24）。密钥和账号密码 Vaultwarden 都能管，
用户以后再来完善，要和配置跟随结合。到时候要注意：

- `magpie library mcp set <name> env=K=V` 把密钥放在命令行参数里，运行时
  其他进程能在进程列表里看到。优先找不经过命令行参数的写法，或者由 MCP 程序
  启动时自己去 Vaultwarden 取。
- magpie 自己也会同步名字像密钥的环境变量。和 Vaultwarden 同时用时，要定好
  谁是唯一来源，免得互相覆盖。

## 待做（按这个顺序）

1. **插件仓库的发布脚本**：完成。`scripts/release.mjs` 打的 tag 能从 GitHub
   装上（2026-11-25 实测）。
2. **ReClaude 插件**：写好了（0.1.2），沙箱实测通过。不能装在 fork 上，换官方版
   时（第 6 步）再装。到时要确认：
   - 换一个新的 rec 账号，第一次会话就有 hub。真机上 magpie 每条命令要几十秒
     到几分钟（fork 上量的；官方版要再量），ReClaude 新建账号到第一次开会话
     大约 3 分钟，要看来不来得及；
   - 57658 的 `.claude.json` 里那条手加的裸 `/hub` 条目，magpie 当作用户的值
     保留着（其他账号是 `/hub/claude%23rec-<id>`）。能用，要不要换由用户定。
3. **CodeZ 供应商插件**：完成（0.1.0），见「CodeZ」。换官方版时装上，三把密钥
   各登录一次，再删掉 fork 留下的三个 CodeZ 供应商。
4. **Claude Desktop 续接和 handoff**：完成（2026-11-25，用户按建议定）。
   - 导入：不用插件（rec 账号靠 reclaude；拷贝放 `~/.claude-imports/<名字>/`）。
   - 续接别的配置文件夹的会话：提了 upstream issue
     [yetone/magpie#7694](https://github.com/yetone/magpie/issues/7694)。
   - handoff：skill `skills/session-handoff`，在 Library 里从
     `https://github.com/zwenooo/magpie-home` 安装；要用的 agent 还要在
     Library → MCP 里加上 Magpie Sessions（MCP 市场里有）。2026-11-25 在 fork 上
     试过 `search_sessions`：刚问时"Still indexing"，约一分钟后能搜到三个 agent
     的会话。upstream 的 Library 扫描（`ProbeSkills`）能从仓库里找到这个 skill。
   - Desktop → Claude Code / Codex 转换：不做，用 handoff 代替。
5. **Cursor 桥接插件**：2026-11-25 已装（v0.2.37）并连接，见下面「切换记录」。
   剩下：用户在 Cursor 里实际用几天，确认能替代。
6. **换成官方 magpie**：2026-11-25 已换（用户："你帮我做吧，首先得安装最新版的
   官方的magpie吧"），见下面「切换记录」。原先的计划：
   - 先换 magpie，再装 reclaude（它在 fork 上什么都不做；换完以后 fork 的
     `library-follow.json` 留着也没关系，官方版不读它）；
   - 设用户环境变量 `MAGPIE_PARTNERS=off`；
   - 换 magpie 要重启它，会打断正在走网关的会话，挑没在用的时候。

用户说过"讨论完就开始动手"。2026-11-24 用户说"按照这个，开始吧"，第 1、2 步
已做完；reclaude 在 fork 上装过一次出了冲突，已撤下并清理，要等换官方版时再装。
第 3、4 步也已完成（2026-11-25）。第 6 步提前做了：已在用官方 magpie 0.1.4777，
reclaude 和 Cursor 桥接已装上。剩下的见「切换记录」最后的"还没做"。

## 实现时的备忘

- **当前装的 magpie**：2026-11-25 起是官方 `0.1.4777`（会自己更新），装在
  `D:\Programs\magpie`。之前是 fork `0.1.4728-vb.0.0.3`。
  在这个会话的终端里运行它的命令时，要去掉 `CLAUDE_CONFIG_DIR`
  （`env -u CLAUDE_CONFIG_DIR …`），否则它把当前 rec 账号当成 Claude Code。
  上一版 vb.0.0.2 在 `D:\Programs\magpie\magpie-rollback-4728-2-l2p5v1w6`，
  需要回滚时放回去即可。
- **magpie 的日志**：`%LOCALAPPDATA%\magpie\logs\app.log`，插件的输出以
  `plugin: [reclaude]` 开头。
- **只有一份 magpie**：`%LOCALAPPDATA%\Programs` 是指向 `D:\Programs` 的符号
  链接（`dir` 在里面一层只显示 `<DIR>`，看不出来；要 `Get-Item` 看 LinkType）。
  所以 `%LOCALAPPDATA%\Programs\magpie` 就是 `D:\Programs\magpie`。之前以为有
  两份是错的；2026-11-25 切换时因此把它改名了一次，马上改回来了。Cursor 桥接
  插件找的 `%LOCALAPPDATA%\Programs\magpie\magpie.exe` 就是这一份。
- **沙箱**：本会话 scratchpad 里的 `upstream` 是 upstream 的临时 worktree
  （`git worktree list` 能看到，用完 `git worktree remove`），`bin\magpie.exe`
  是从它编出来的。沙箱里跑 magpie 要设 `USERPROFILE`、`HOME`、`APPDATA`、
  `LOCALAPPDATA`，去掉 `CLAUDE_CONFIG_DIR`，在沙箱的 `settings.json` 里写
  `{"noWSLAgents":true}`（否则会读写 WSL 里真实的 agent），`serve` 时设
  `MAGPIE_ADDR` 换端口，`MAGPIE_BUN` 指向已有的 magpie-bun。
- **Sessions 命令行**：`magpie sessions` 读的是网关记下的用量，不直接扫会话
  文件，不能用来验证 Sessions 页读没读到某个文件夹。
- **账号 57658 的 hub 条目**：它的 `.claude.json` 里有一条用户手动加的
  `magpie` 条目（裸 `/hub` 地址），不是 magpie 写的。插件跟随后，magpie 可能
  因为"不覆盖用户自己写的值"而保留它。裸 `/hub` 能用，但和其他账号的
  `/hub/claude%23rec-<id>` 不一样，到时看要不要手动删掉。
- **现有 12 个跟随中的账号**（`library-follow.json`）：`claude#rec-48142`、
  54086、54687、54956、55452、55795、55960、55964、55989、56156、57460、
  57545。57460 的 `.claude.json` 里还有一条旧的 `ops-mcp`（stdio，指向
  `D:\code\codex-x\ops-mcp\server.py`，那是 10 月的旧副本），清理时顺手处理。
- **agent 插件扩展点**：upstream 的 agent 插件（`internal/agentplug`）能声明
  Library 往哪写（说明文件、MCP 文件、skills 文件夹），但一个插件只加一个
  agent，不适合数量会变的 rec 账号。所以 ReClaude 走 junction。
- **对话记录跨账号**：这台电脑上每个 ReClaude 账号的 Claude Code 对话存在
  `~/.rec/claude/accounts/<id>/config/projects/<项目>/`。要在别的账号继续某段
  对话，把那段对话的 `<会话id>.jsonl` 和同名文件夹复制到当前账号的同一个
  项目目录下，再 `/resume`。2026-11-24 就这样把 57545 的 `75bf822f` 复制到了
  57658。

## 待回答的问题

（目前没有。2026-11-24 的问题都已回答，见讨论记录。）

## 其他已知情况

- fork 的 `internal/library` 在 Windows 上有 5 个测试失败，在 `47c46b302` 上
  不带任何改动也一样失败：`TestNativeClaudePlugins`，以及 4 个 Pi 包相关的
  测试（`TestPiPackageFromGitUpdatesInPlace`、`TestPluginUpdateFetchesPastALookup`、
  `TestProjectPluginPiPackage`、`TestPiExtensionOnlyPackageIsAPlugin`）。
  fork 要退役了，不再开 issue。
- 2026-11-24 推送：magpie `47c46b302`（删掉 MCP 程序和密钥目录、仓库更新
  这两个功能）；magpie-agent-toolkit `c0acfcc`（删掉 `mcp/ops-mcp`），
  连同此前的 `a020522` 和 `79bc06e`；ops-mcp 的 `main` 和 `v1.0.0`。

## 讨论记录

- 2026-11-24：查明新 ReClaude 账号没有 hub 的原因，写了修复（未提交）。
  定下原则：第三方的东西做成插件。看了 Cursor 桥接插件，发现它和 fork 的
  Cursor BYOK 是同一件事，且兼容新版 Cursor，fork 的不兼容。定下方向：
  fork 不再加新功能，逐步迁出，最后切回官方 magpie 加插件。
- 2026-11-24：用户的目标：最后只用 upstream 的主体代码，自己只维护插件仓库。
  查明 fork 在 MCP/skill 同步这块只剩配置跟随。upstream 的 `~/.claude-<名字>`
  行加一个 junction，就能得到同名的 `claude#rec-<id>`。
- 2026-11-24：决定配置跟随放在插件里做，不提 PR 给 upstream，回归时直接删掉
  相关代码。用户以后想把它和 Vaultwarden 结合起来。
- 2026-11-24：Vaultwarden 先搁置。确认 upstream 本身就有密钥同步；密钥同步
  保持和 upstream 一样，不改。
- 2026-11-24：用户逐条回答：
  1. 扩展功能一律做成插件，Sessions 也一样。
  2. 新建公开仓库 zwenooo/magpie-plugins，所有插件放在这里。
  3. 放弃 fork 里写好的新账号检查修复。
  4. 讨论完就开始动手。
  5. 合作推广：查 upstream 源码，结果是有 `MAGPIE_PARTNERS=off`。
  6. CodeZ 是 fork 加的，做成供应商插件，不改原版代码。
  7. 项目级 MCP 设置的问题，已在上面解释；用户没有项目，暂不影响。

  另外确认：upstream 的 Sessions 会读 `~/.claude*` 文件夹，junction 后应能看到
  rec 账号的会话。8 处 upstream 代码修复回归时放弃。
- 2026-11-24：开始第 1、2 步。发现插件可以直接在 magpie 的插件宿主里跑，
  ReClaude 不用另带常驻程序。写好 `reclaude` 0.1.0 和发布脚本，沙箱实测通过，
  Sessions 也能读到 junction 里的会话。推送和装到真机等用户确认。
- 2026-11-24：用户不想再动 fork 仓库。这份记录从 fork 的
  `docs/fork-roadmap.md` 挪到插件仓库的 `docs/roadmap.md`，fork 里没提交的
  FORK.md 改动和这份文件都撤掉，fork 仓库保持 `47c46b302` 的样子。
- 2026-11-24：推送 reclaude 0.1.0 并从 GitHub 装到正在用的 magpie。真机上
  magpie 每条命令 30 秒到 3 分钟，一项一项改太慢，改为直接改 `library.json`
  再同步一次，发布 0.1.1 并换上。13 个账号都跟上了 `claude` 行。
- 2026-11-25：reclaude 在 fork 上和 fork 自己的账号行冲突（每个账号多出一个
  `-2` 行），撤下插件、删掉 junction、清理了 `library.json` 和
  `library-follow.json`，fork 恢复正常，57658 也由 fork 跟随上了。插件 0.1.2
  在 fork 上不运行。reclaude 等换官方版时再装。
- 2026-11-25：CodeZ 插件 0.1.0 完成，按模型选 Responses / Messages / Chat，
  多把密钥挂在同一个供应商下。沙箱里用真实密钥实测通过。
- 2026-11-25：第 4 步分析完。upstream 已有 Claude Desktop 会话的读取、
  Claude Code ↔ Codex 互转、`magpie-sessions` MCP；缺的是别的配置文件夹的续接
  （`CLAUDE_CONFIG_DIR`）和 Desktop → Claude Code / Codex 的转换。别的电脑的拷贝
  放 `~/.claude-imports/<名字>/` 即可（实测）。
- 2026-11-25：用户定：handoff 做 Library skill（`skills/session-handoff`），
  提续接的 upstream issue（#7694），Desktop 转换不做。第 4 步完成。
- 2026-11-25：换成官方 magpie 0.1.4777，装上 reclaude 和 Cursor 桥接，见「切换
  记录」。发现 `%LOCALAPPDATA%\Programs` 是 `D:\Programs` 的链接，只有一份 magpie。
- 2026-11-25：Cursor 起初不通：先把 Cursor 从 3.14.27 升到 3.31.15，真正的原因是
  fork 断开时恢复的 `cursor.general.disableHttp1SSE: true`，删掉后通了。
- 2026-11-25：收尾：删旧 CA；57658 改走 hub；CodeZ 换成插件（三把密钥一个供应商）；
  关掉 Cursor 自动更新。
- 2026-11-25：handoff skill 和 Magpie Sessions 装进 Library；两个插件拆成独立仓库
  `zwenooo/magpie-reclaude`、`zwenooo/magpie-codez`，已装的换成新地址。
- 2026-11-25：reclaude 0.2 共享会话：所有 rec 账号共用 `~/.rec-sessions`，记忆也随之
  共用并按行合并。
- 2026-11-25：`zwenooo/magpie-plugins` 改名 `zwenooo/magpie-home`。
- 2026-11-25：fork 退役：GitHub 上 `zwenooo/magpie` 归档，本地仓库和 28 个 worktree
  打成 bundle 备份后删掉（切换记录第 25 步）。
- 2026-11-25：用户确定不回滚 fork，回滚用的 exe、配置备份和 fork 残留都清掉
  （切换记录第 26 步）。
- 2026-11-25：CodeZ 上架：发到 npm（`magpie-plugin-codez` 0.1.2），提登记 PR #1546；
  ReClaude 不上架，见「插件和仓库」。
- 2026-11-25：reclaude 改名 ReCode（0.3.0，`zwenooo/magpie-recode`，带 recode.cat 的 logo），
  已装的换成新地址（切换记录第 27 步）。
- 2026-11-25：CodeZ 登记 PR #1546 被关闭（没合并，维护者说以后出合作方案）；npm 停在
  0.2.0 不再发，安装走 GitHub。
- 2026-11-25：关闭 upstream issue #7694（续接别的配置文件夹里的会话），原因是不再需要：
  ReCode 的共享会话让所有账号在同一个文件夹里 `/resume`。关闭时 Gaoshou101、joei4cm 各贴了
  修复分支（未提 PR），评论里说明了可以拿去用、需要时重开。

## 切换记录（2026-11-25 10:50–11:00）

做了什么，按顺序：

1. 下载官方 `v0.1.4777` 的 `magpie-windows-amd64.exe`，SHA256 和 release 的
   `SHA256SUMS` 一致（`d3d5b9cf…02e2`），`gh attestation verify … -R
   yetone/magpie-releases` 通过。下载在 `D:\Downloads-magpie-official`。
2. 备份 Cursor 的 `settings.json`（fork 接管时：代理 `127.0.0.1:5532`、HTTP/2 关、
   系统证书开）。
3. fork 是托盘程序，关闭信号只会隐藏窗口；GUI 的接口不走 TCP，没法从外面让它
   正常退出，所以 `taskkill /F /T` 结束了它和子进程（插件宿主、Cursor 后端、它
   启动的 MCP 服务）。
4. 用 fork 的 `magpie cursor-byok default` 按它的记录把 Cursor 设置恢复成接管前的
   样子（运行中的 fork 持有锁时这条命令会被拒绝，要先结束 fork）。
5. 完整备份 `~/.config/magpie`（8300 个文件，1.69 GB）。
6. fork 的 exe 移到 `D:\Programs\magpie\magpie-rollback-fork-4728-vb3\`，官方 exe
   放成 `D:\Programs\magpie\magpie.exe`。用户 PATH 里的
   `%LOCALAPPDATA%\Programs\magpie` 换成 `D:\Programs\magpie`（同一个文件夹）。
   设用户环境变量 `MAGPIE_PARTNERS=off`。
7. 用 `explorer.exe` 启动官方版，让它拿到登录环境，而不是 Claude 会话里的
   `CLAUDE_CONFIG_DIR` 和 ReClaude 代理（日志里代理是系统的 7890，对）。
8. 检查：9 个供应商都在（包括 3 个 `preset: codez` 的，官方版忽略不认识的预设，
   地址照用），网关 30 个模型。
9. 装 `reclaude-v0.1.2`：13 个 junction，13 个 `claude#rec-<id>` 行，勾选全部跟
   `claude` 行一致，没有 `-2`，一次 `library sync` 35 秒。12 个账号的 hub 是
   `/hub/claude%23rec-<id>`；57658 有手加的 `magpie` 条目，官方版说
   "has an MCP server called magpie of its own, so it keeps each server's own
   entry"，即这个账号不走 hub，每个 server 单独写，也能用。
10. 装 Cursor 桥接 `v0.2.37`（插件页同款 `magpie plugin add`），装进来的文件和
    审过的 tag 一致（只有 `.bun-tag` 不同）。在包目录 `node install.js setup`：
    用户点了 UAC，CA（`Cursor BYOK Local CA`，2036-11-24 到期）进了本机根证书；
    自启是启动文件夹的 `local.magpie.cursor-bridge.vbs`。
11. `magpie cursor-bridge rex2/claude-opus-5-5` 连接（默认模型，Cursor 里可以换；
    fork 没有留下 Cursor 的模型选择）。状态 connected，Cursor 代理
    `127.0.0.1:5604`（引擎 `cursor-magpie-bridge`），控制台 `127.0.0.1:3580`。

Cursor 起初不能用（用户："好像cursor不太行哦"），两个原因，都已解决：

12. **Cursor 版本太旧**：用户的 Cursor 是 3.14.27（装在 `D:\sf\cursor`，8 月起没
    更新，大概是因为 fork 的后端不支持 3.29+）。桥接只支持 3.28.x–3.31.17。
    3.31.17 官方渠道下不到；Cursor 官方接口
    `https://cursor.com/api/download?platform=win32-x64-user&releaseTrack=stable`
    给的是 3.31.15（`latest` 通道是 3.32.4，超出范围）。下载
    `CursorUserSetup-x64-3.31.15.exe`（Anysphere 签名有效，SHA256 `541387…7ac1`，
    在 `D:\Downloads-cursor`），用户关掉 Cursor 后静默原地安装
    （`/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /MERGETASKS=!runcode
    /DIR=d:\sf\cursor`），退出码 0。
13. **`cursor.general.disableHttp1SSE: true`**（真正的原因，升级后仍然超时）：
    这一项开着、HTTP/2 又关着时，Cursor 用 `RunPoll` 收 agent 的回复，不听
    `RunSSE`；桥接引擎发给 Cursor 的"要上下文"那条消息没人收，Cursor 只发心跳
    （日志里每 5 秒一条 `action="none"`），60 秒后 "request context timed
    out"。fork 的后端知道这件事（`native/cursor-backend/server/src/local_app/
    settings.rs` 的 `SSE_OFF_KEY`）：连接时拿掉它，断开时恢复成用户原来的
    `true`。桥接插件不管这一项。所以第 4 步断开 fork 时它被恢复成了 `true`。
    删掉这一行后，桥接发现设置文件被改，自己暂停并还原了代理（"Cursor 代理设置
    由其他程序改动"），`magpie cursor-bridge default` 再连接即可。之后的请求：
    上下文 0.24 秒拿到，11 秒后 `Run ended outcome=Completed`。
    以后不要在 Cursor 里再打开这一项。改 Cursor 的 `settings.json` 会让桥接暂停，
    改完要断开重连。

14. **`rex2/claude-opus-5-5` 不通**（用户："claude-opus-5-5似乎还是不行"）：和桥接
    无关。`rex2` 供应商指向 `127.0.0.1:8788`（一个包装本机 Claude 命令行的适配器，
    报错里自称 "CLI adapter"），那里没有程序监听，magpie 报 502 "connection
    refused"。rex2 上次被用是 11-09，日志看不出它什么时候停的。用户换了别的模型，
    11:51 的对话正常完成。要用 rex2，得先把那个适配器启动起来。

桥接找 Cursor 用的是 `%LOCALAPPDATA%\Programs\cursor`（= `D:\Programs\cursor`），
那是一个残留文件夹（没有 Cursor.exe，有个空的 `patches`）。所以控制台读不到
Cursor 版本，转发不受影响。真正的 Cursor 在 `D:\sf\cursor`。

回滚（2026-11-25 已不可用：用户确定不回滚，回滚用的 exe 和配置备份已删，见第 26 步；
下面留作记录）：

- 退出官方 magpie，把 `D:\Programs\magpie\magpie-rollback-fork-4728-vb3\magpie.exe`
  放回 `D:\Programs\magpie\magpie.exe`；配置要回到切换前，用
  `D:\Backups\magpie-switch-20261125-105127\config-magpie` 覆盖
  `~/.config/magpie`。Cursor 的设置在同一个备份文件夹的 `cursor-settings.json`。
- 回到 fork 前要先 `magpie plugin rm` 掉 reclaude（fork 上它什么都不做，但
  junction 会让 fork 出现 `-2` 行，要删掉 `~/.claude-rec-*`），以及
  `magpie cursor-bridge default` 断开桥接。

切换后的收尾（2026-11-25 11:50–12:05，用户逐项选定）：

15. **旧证书**：删了本机根证书里的 `4697CEDF…`（8 月）、`293CA69A…`（9 月），
    当前用户根证书里 fork 的 `482117B9…`（Magpie Cursor Local CA）。只留桥接在用的
    `0F20A7D3…`（和 `data/ca/ca.crt` 的指纹对过）。用户点了 UAC。
16. **57658**：删掉手加的 `magpie` 条目（裸 `/hub`），`magpie library sync` 后只剩
    `/hub/claude%23rec-57658`，和其他账号一样。原文件备份在切换备份文件夹的
    `57658-claude.json`。
17. **CodeZ 换成插件**：装 `codez-v0.1.0`，三把密钥各 `magpie plugin login codez`
    一次（34 个模型），`magpie provider rm` 掉 `codez`、`codez-2`、`cz-gemini`
    （迁移前备份在切换备份文件夹的 `before-codez/`），插件的供应商随即从
    `codez-plugin` 变成 `codez`。挑回原来的 13 个模型（`magpie provider models
    codez …`），原来 `*: 1000000` 的 7 个模型用 `magpie provider set codez
    context.<模型>=1m` 设回。Codex 的 `codez/gpt-6.2-astra` 名字没变；4 个
    `auto/gemini-…` 自动组接上了 `codez/gemini-…`。每把密钥各一个短请求：
    deepseek（国模）、gemini 通；GPT 从 Chat 入口第一次 502 "CodeZ has no
    endpoint configured"（31 秒），十几秒后再试 2 秒通（chat→responses），从
    Responses 入口一直通。应是改名后网关的插件模型信息还没刷新的那一会儿。
    删 `cz-gemini` 时 magpie 把 Cursor 桥接的模型（当时是 `auto/gemini-4-argon`）
    改回了默认，已重新设回。`rex2` 在迁移前已经不在 `providers.json` 里（用户自己
    删的）。
18. **Cursor 自动更新**：`settings.json` 加 `update.mode: none`。先
    `magpie cursor-bridge default` 断开、改设置、再
    `magpie cursor-bridge auto/gemini-4-argon` 连接，状态 connected。
19. 删掉了 fork 仓库里登记的临时 upstream worktree（`git worktree remove`）。
21. **插件拆成独立仓库**（用户："行吧，按照你的建议来"）：见「插件和仓库」。
    reclaude 0.1.3、codez 0.1.1（只改了仓库地址、LICENSE 和说明）。已装的两个插件
    `magpie plugin rm` 旧地址、`add` 新地址：codez 的三把密钥、34 个模型、13 个
    挑选和上下文都还在，请求正常；13 个 junction 和跟随都还在。换之前的配置备份在
    切换备份文件夹的 `before-repo-split/`。
23. **共享会话**（用户："我经常换rec账号……只能让ai帮我找到对话，然后fork session到B账号
    来重新打开"；选了方案一，并说 ReClaude 不会删旧账号文件夹）：reclaude 0.2.0 加
    `shareSessions`：每个账号的 `projects/`、`file-history/` 换成指向
    `~/.rec-sessions/` 的 junction，任何账号 `/resume` 都能看到所有账号的对话。新账号在
    第一次会话前接上；已有账号等 10 分钟没写入再合并（文件在同一个盘里移动）。magpie
    的 Sessions 按会话 id 去重（`claudeFiles`），不会重复。动手前把 13 个账号的
    `projects`、`file-history` 备份到切换备份文件夹的 `rec-sessions-before-share/`
    （3309 个文件，841.7 MB，和源文件数一致）。用 `magpie plugin options
    github:zwenooo/magpie-reclaude '{"shareSessions":true}'` 打开。
    第一轮 11 个账号合并了；冲突全是项目记忆（`projects/<项目>/memory/`，共享
    `projects` 也就共享了记忆）：0.2.0 只留最新的 `MEMORY.md`，28 个记忆文件被放进
    `conflicts/`。0.2.1 改为 `MEMORY.md` 按行合并、同名不同内容的笔记另存
    `<名字>.from-<账号>.md` 并加索引行，启动时把放进 `conflicts/` 的 28 个补回，
    `conflicts/` 清空。验证：48142 原本没有 magpie 项目的会话，现在能看到 57545 的
    `75bf822f`。56156、57658 的 `projects` 当时有会话在写，空闲后会自动合并。
    0.2.2：空的 `projects/`（ReClaude 新建账号时可能先建一个空文件夹）不再等 10 分钟，
    马上接上。沙箱（官方 magpie，`shareSessions` 开）里新建账号 555：2 秒内 Library 行、
    `/hub/claude%23rec-555`、`projects`、`file-history` 都好了，并能看到 333 原有的会话。
    新账号全自动，前提是 magpie 开着；magpie 没开时开过会话的账号，之后空闲 10 分钟再合并。
24. **本仓库改名 magpie-home**（用户："那这个仓库名有点误导我了"，选了 magpie-home）：
    拆仓库后这里只剩 skill 和记录，`magpie-plugins` 读起来像插件仓库。GitHub 上
    `gh repo rename`，本地文件夹改成 `D:\code\magpie-home`，remote 改成新地址；
    Library 里 session-handoff 的来源（`library.json` 的 `source.repo` 和
    `seenSkills` 的键）改成 `zwenooo/magpie-home`，再 `magpie library sync`；
    两个插件 README 的"原先在"链接指向新地址。上面第 20、21 步按当时的名字记，没改。
    旧地址 GitHub 会转过来，旧 tag 也还在。
22. **两个插件换地址后又被移除了**（用户："怎么插件我看到已安装里，没有codez"）：
    reclaude 在 12:20–12:22 之间、codez 在 12:22:33 从 `plugins.json` 里没了，
    包也被删了。magpie 只有用户移除时才删插件（`provider.RemovePlugin` →
    `plugin.Remove`），而 `plugin.Remove` 先按地址找，找不到就**按包名**找
    （`indexOf`）。新旧地址是同一个包名，所以在还显示着旧地址条目
    （`…magpie-plugins#codez-v0.1.0`）的插件页上点移除，删掉的是新装的。
    移除时 codez 的模型挑选被存进 `providers.json` 的 `pluginLeft`，三把密钥
    留在 `plugin-auth.json`；重新 `magpie plugin add github:zwenooo/magpie-codez`
    和 `…/magpie-reclaude` 后，挑选（13 个）、上下文、登录、跟随、桥接的模型都
    回来了。以后在终端改了插件，先刷新（或重开）magpie 的插件页再操作。
20. **handoff**（用户："你来做"）：官方版的命令行装不了 skill，只能在 Library 页面装。
    所以在 v0.1.4777 的源码里，往 `internal/library` 加了一个一次性的文件，调用
    页面背后的同一套函数：`InstallServer("magpie-sessions", …)` 和
    `InstallSkills("https://github.com/zwenooo/magpie-plugins",
    ["skills/session-handoff"], …)`。注意：Library 每次读 `library.json` 都会用
    `selfExe`（当前程序）改写 magpie 自带 MCP 的命令，所以先把 `selfExe` 固定成
    `D:\Programs\magpie\magpie.exe`，再做一次只读检查确认没写文件。勾选照搬已有
    skill 的 20 个 agent。结果：两者都在 Library 里，skill 的来源记为
    `zwenooo/magpie-plugins`（会自动更新），`magpie-artifacts` 的命令没变。临时
    源码和程序已删。
25. **删掉 fork 源码仓库**（用户："其实我更像直接把这个fork的magpie版本给删了"，选了
    "先打 bundle 再全删"）：GitHub 上的 `zwenooo/magpie` 已归档（只读，仍公开）。删除前
    完整备份到 `D:\Backups\magpie-fork-final-20261125\`：`magpie-fork-all.bundle`
    （`git bundle --all`，331 MB，verify 通过：35 个分支、1738 个 tag、1 个 stash，
    stash 说明在 `stash-list.txt`）；`patches\` 里是两个 worktree 没提交的改动：
    `magpie-mcp-repo-optin` 的 diff（`mcp-program-source.test.cjs`）、
    `magpie-sync-b332ef7ef` 的未跟踪文件 tar。本地删掉了 `D:\code\magpie`（主仓库）和它的
    28 个 worktree（`D:\code\.worktrees\magpie-*` 24 个、`D:\code\magpie\.claude\worktrees\`
    4 个），D 盘多出 10.25 GB。删前确认过里面没有 junction / 符号链接；占用目录的是
    一个开在 `D:\code\magpie` 的 Claude Code 窗口（用户关掉）和一个 11-24 起卡住的
    `gh auth token`（结束掉）。没动的：`.worktrees` 里的 `ops-mcp-*`、`toolkit-*`，
    `magpie-home`、`magpie-reclaude`、`magpie-codez`、`magpie-agent-toolkit`、
    `magpie-sync`，`D:\Backups`，`D:\Programs\magpie`（含回滚用的 fork exe），Claude Code
    的会话记录。配置里还留着对 `D:\code\magpie` 的引用，都是 Claude Code 自己的记录
    （`.claude.json` 的 `projects` 和 `githubRepoPaths`，主配置和 6 个 rec 账号），无害，
    没改；magpie 和 Codex 的配置里没有。要找回某个分支：
    `git clone D:\Backups\magpie-fork-final-20261125\magpie-fork-all.bundle magpie-fork`，
    再 `git checkout <分支>`（bundle 里的分支在 `origin/` 下）。
26. **清掉回滚用的东西和 fork 残留**（用户确定不回滚："清理了吧"）：删了
    `D:\Programs\magpie` 里 13 个 `magpie-rollback-*`（fork 的 0.1.4562、4728 自更新
    留下的副本，加上第 6 步的 `magpie-rollback-fork-4728-vb3`）；切换备份文件夹里的
    `config-magpie`、`before-codez`、`cursor-settings*.json`、`57658-claude.json`；
    `~/.config/magpie/cursor-backend/`、`library-follow.json`；Cursor 的残留文件夹
    `D:\Programs\cursor`。D 盘多出 3.58 GB，C 盘 0.47 GB。切换备份文件夹里和回滚无关的
    `rec-sessions-before-share`（第 23 步）、`before-repo-split`、`library-before-*.json`
    留着。另外从 `.claude.json`（主配置和 48142、54086、54687、55795、57545、57658）
    删掉了 `projects["D:/code/magpie"]` 和 `githubRepoPaths["zwenooo/magpie"]` 里的
    这个路径。
27. **reclaude 改名 ReCode**（用户："名字改成recode相关的"，logo 用
    `https://www.recode.cat/logo/logo-single.svg`）：0.3.0，包名 `magpie-plugin-recode`，
    `package.json` 的 `magpie.name` 是 ReCode、`magpie.icon` 是这个 logo，加了
    `magpie.summary`；日志前缀 `[recode]`。GitHub 仓库 `gh repo rename` 成
    `zwenooo/magpie-recode`（旧地址会转过来），本地文件夹改成 `D:\code\magpie-recode`。
    junction、账号行、共享文件夹、锁文件夹的名字都没改，换装不动磁盘上的东西。已装的：
    `magpie plugin rm github:zwenooo/magpie-reclaude`、`add github:zwenooo/magpie-recode`、
    `plugin options … '{"shareSessions":true}'`（选项跟着地址，要重设）；之后 13 个
    junction 和 13 个账号的共享 `projects` 都在。按第 22 步的教训，改完要刷新插件页再操作。

还没做：

- 用户在 Cursor 里日常用几天（第 5 步的试用）。
- 想升级 Cursor 时：先看桥接的实测范围（README 第一段），再手动装那个版本。
