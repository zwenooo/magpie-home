# fork 的去留与迁出计划

这份文件记录对 zwenooo/magpie fork 去留的讨论、已经做出的决定和还没
回答的问题。讨论还在继续：每次有新结论，就在对应小节更新，并在最后的
「讨论记录」里按日期追加一行。

记在插件仓库里（`D:\code\magpie-plugins\docs\roadmap.md`），而不是 Claude
的记忆或 Claude Docs 里，是因为这台电脑上每个 ReClaude 账号都是一个独立的
Claude 账号，记忆和 Docs 都按账号隔开，换个账号就看不到；仓库里的文件每个
账号都能读到。fork 仓库（`D:\code\magpie`）不再改动，连这份记录也不放在
那里（2026-11-24 用户："我们自己的fork版本magpie仓库还去管他干嘛？"）。

## 方向（2026-11-24）

- **回归官方 magpie。** magpie 本体只用 upstream 的代码，不改原版代码。
- **所有扩展功能都做成插件**，维护在
  [zwenooo/magpie-plugins](https://github.com/zwenooo/magpie-plugins)
  （公开仓库，MIT）。fork 不再加新功能。
- 第三方供应商、第三方工具的代码（ReClaude、CodeZ 等）只出现在插件里。
- 讨论完就开始动手；迁出一项一项来，每一步都要能用。

## 插件仓库 zwenooo/magpie-plugins

- 本地在 `D:\code\magpie-plugins`，2026-11-24 建立（`62035ea`）。
- 每个插件是 `packages/<名字>/` 下的一个独立包。
- 安装：magpie 通过 bun 安装 `github:owner/repo#<ref>`，只能装仓库根目录的
  包，不支持子目录。所以每个插件按版本单独打 tag `<名字>-v<版本>`，tag 指向
  一个只含该插件、且插件在根目录的提交，用 `scripts/release.mjs` 生成
  （`git commit-tree`，父提交是该插件的上一个版本）。插件页填
  `github:zwenooo/magpie-plugins#<名字>-v<版本>`。开发时也可以直接装本地
  文件夹。
- 2026-11-24 实测：magpie 自带的 bun（1.4.5）能把这样的 tag 当根目录的包装上
  （用本地 `git+file:` 试的；本机另装的 bun 1.2.21 装 `git+file:` 会崩）。
  upstream 的 `IsGit` 接受 `github:…#<tag>`，更新检查也按 tag 指向的提交比较
  （`internal/plugin/gitrev.go`）。从 GitHub 装还没试，要先推送 tag。
- 2026-11-25 已推送 `reclaude-v0.1.0`、`reclaude-v0.1.1`，在正在用的 magpie
  上用 `magpie plugin add github:zwenooo/magpie-plugins#reclaude-v0.1.1` 从
  GitHub 装上过（能装）。后来因为和 fork 冲突撤下了，见「ReClaude 与配置跟随」。

## fork 功能的去向

功能清单见 fork 仓库的 [FORK.md](https://github.com/zwenooo/magpie/blob/main/FORK.md)（本地 `D:\code\magpie\FORK.md`）。

| fork 功能 | 去向 | 状态 |
| --- | --- | --- |
| Cursor BYOK（普通 Cursor 用 magpie 的模型） | 改用社区的 Cursor 桥接插件，见下文 | 待试用 |
| 自己的发布和应用内更新 | 回归官方版后用官方的更新 | fork 退役时去掉 |
| CodeZ 预设 | 自己仓库里做一个供应商插件，装上就能把 CodeZ 配成供应商，见下文 | 待做 |
| 默认关闭合作推广 | 不用插件：upstream 有开关，见下文 | 已查明 |
| Sessions：导入其他账号的 Claude 历史 | ReClaude 插件建 junction 后，upstream 的 Sessions 自己就会读，见下文 | 已实测（沙箱） |
| Sessions：续接 Claude Desktop 的会话、把对话交给任意 agent 继续 | 做成插件；能用哪个插件扩展点还没查 | 待分析 |
| Library 配置跟随、ReClaude 账号作为 `claude#rec-<id>` | 插件 `reclaude`：junction 加直接改 `library.json` 的勾选、再同步一次，见下文 | 写好了；不能装在 fork 上，换官方版时再装 |
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

可用的 upstream 扩展点是供应商插件（OpenCode 插件）：`config` 钩子声明
`cfg.provider[id]`（含 `api` 地址），`auth` 钩子提供"填 API 密钥"的登录方式，
见 upstream 的 `docs/subsystems/provider-plugins.md`。还没查清的：插件怎样让
magpie 自动拉取模型列表，以及怎样按模型选 Responses 或 Chat。实现时先找一个
现成的密钥类社区插件当模板。

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
- **Claude Desktop 续接、handoff**：还没查能用哪个插件扩展点。插件页面
  （`magpie.page`）跑在沙箱 iframe 里，能读的东西有限（`plugin.PageReads`）。
  可能需要像 Cursor 桥接插件那样带一个自己的后台程序或命令行工具。下一步：
  分析。

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
3. **CodeZ 供应商插件**，见「CodeZ」。
4. **分析 Claude Desktop 续接和 handoff** 能用哪个插件扩展点。
5. **用户试用 Cursor 桥接插件**，见「Cursor BYOK 与 Cursor 桥接插件」。
6. **都能用之后，换成官方 magpie**：
   - 先换 magpie，再装 reclaude（它在 fork 上什么都不做；换完以后 fork 的
     `library-follow.json` 留着也没关系，官方版不读它）；
   - 设用户环境变量 `MAGPIE_PARTNERS=off`；
   - 换 magpie 要重启它，会打断正在走网关的会话，挑没在用的时候。

用户说过"讨论完就开始动手"。2026-11-24 用户说"按照这个，开始吧"，第 1、2 步
已做完；reclaude 在 fork 上装过一次出了冲突，已撤下并清理，要等换官方版时再装。
下一步是第 3 步 CodeZ 插件。

## 实现时的备忘

- **当前装的 magpie**：fork 版 `0.1.4728-vb.0.0.3`，装在 `D:\Programs\magpie`。
  在这个会话的终端里运行它的命令时，要去掉 `CLAUDE_CONFIG_DIR`
  （`env -u CLAUDE_CONFIG_DIR …`），否则它把当前 rec 账号当成 Claude Code。
  上一版 vb.0.0.2 在 `D:\Programs\magpie\magpie-rollback-4728-2-l2p5v1w6`，
  需要回滚时放回去即可。
- **magpie 的日志**：`%LOCALAPPDATA%\magpie\logs\app.log`，插件的输出以
  `plugin: [reclaude]` 开头。
- **Cursor 桥接插件的安装位置假设**：它的 README 说 Windows 上 magpie 要在默认
  位置 `%LOCALAPPDATA%\Programs\magpie`。正在跑的 magpie 在
  `D:\Programs\magpie`；默认位置也有一份同版本的（PATH 里是它），两者都不是
  链接。试用时要确认它找的是哪一份。
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
