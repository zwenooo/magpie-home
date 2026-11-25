# codez

把 [CodeZ](https://codezsy.com) 加成 magpie 的供应商，用 API 密钥登录。

- 模型列表来自每把密钥自己的 `/v1/models`：一把密钥属于 CodeZ 的一个分组，
  只列这个分组能用的模型。多把密钥（比如 gpt 分组、国模分组、gemini 分组）
  都登录在同一个 CodeZ 供应商下，请求会发给列着这个模型的那把。
- 每个模型走哪个接口（和 zwenooo/magpie fork 的 CodeZ 预设一样）：
  - GPT、Codex、o 系列走 Responses。CodeZ 原生支持，它的模型列表里却只标了
    `openai`（Chat）；
  - Claude 走 Messages；
  - 其他模型走 Chat completions。
  
  CodeZ 列表里标出的其他接口写进 `also`：客户端用那些接口发来的请求原样转发，
  不做翻译。
- 用量：CodeZ 不通过 API 公开密钥的额度（`quota_details_hidden`），所以只检查
  密钥是否可用。余额去 codezsy.com 看。

## 安装

在 magpie 的插件页添加，或者：

```sh
magpie plugin add github:zwenooo/magpie-plugins#codez-v0.1.0
magpie plugin login codez        # 粘贴 API 密钥；每把密钥登录一次
```

密钥在 <https://codezsy.com/console/token>。

## 和手动加的 CodeZ 供应商并存

如果 magpie 里已经有一个 id 为 `codez` 的供应商（fork 的 CodeZ 预设，或者手动
加的中转站），插件的供应商会叫 `codez-plugin`，两者互不影响。把旧的删掉之后，
插件的供应商就叫 `codez`，模型名仍是 `codez/<模型>`，原来按这个名字挑的模型
还能对上。

## 注意

- 模型的上下文长度和价格 CodeZ 的列表里没有，插件不填（显示为未知）。
- 一个供应商超过 24 个模型、又没有挑选时，magpie 只先放出前 24 个。用
  `magpie provider models codez +<模型>` 或在供应商页里挑。

## 开发

```sh
bun test
magpie plugin add <本文件夹>
```
