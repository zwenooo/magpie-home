import { describe, expect, test } from "bun:test"
import { apisOf, BASE, createPlugin, openAIModel, readsImages, rowsOf } from "./codez.js"
import * as entry from "./index.js"

// Entries as CodeZ's /v1/models answered on 2026-11-25, one per key group.
const LIST = {
  object: "list",
  data: [
    { id: "claude-opus-5-5", object: "model", owned_by: "custom", created: 1, supported_endpoint_types: ["anthropic", "openai"] },
    { id: "gpt-6.2-sol", object: "model", owned_by: "custom", created: 1, supported_endpoint_types: ["openai", "openai-alpha-search"] },
    { id: "codex-auto-review", object: "model", owned_by: "custom", created: 1, supported_endpoint_types: ["openai", "openai-alpha-search"] },
    { id: "deepseek-v4-pro", object: "model", owned_by: "custom", created: 1, supported_endpoint_types: ["openai", "openai-alpha-search"] },
    { id: "gemini-4-neon", object: "model", owned_by: "custom", created: 1, supported_endpoint_types: ["openai", "openai-response", "anthropic", "gemini", "openai-alpha-search"] },
  ],
}

describe("which API each model is asked on", () => {
  test("GPT, Codex and o-series on Responses, Claude on Messages, the rest on chat", () => {
    expect(apisOf("gpt-6.2-sol", ["openai"])).toEqual({ npm: "@ai-sdk/openai", also: ["@ai-sdk/openai-compatible"] })
    expect(apisOf("codex-auto-review", ["openai"]).npm).toBe("@ai-sdk/openai")
    expect(apisOf("o4-mini", []).npm).toBe("@ai-sdk/openai")
    expect(apisOf("claude-opus-5-5", ["anthropic", "openai"])).toEqual({ npm: "@ai-sdk/anthropic", also: ["@ai-sdk/openai-compatible"] })
    expect(apisOf("deepseek-v4-pro", ["openai", "openai-alpha-search"])).toEqual({ npm: "@ai-sdk/openai-compatible", also: [] })
    expect(apisOf("gemini-4-neon", ["openai", "openai-response", "anthropic", "gemini"])).toEqual({
      npm: "@ai-sdk/openai-compatible",
      also: ["@ai-sdk/openai", "@ai-sdk/anthropic"],
    })
    // not OpenAI's: an o that isn't followed by a digit
    expect(openAIModel("omni-1")).toBe(false)
    expect(readsImages("glm-5.2")).toBe(false)
    expect(readsImages("gemini-4-neon")).toBe(true)
  })

  test("rows carry the API, the base and the others, as magpie's host reads them", () => {
    const rows = rowsOf(LIST)
    expect(Object.keys(rows)).toEqual(LIST.data.map((m) => m.id))
    expect(rows["gpt-6.2-sol"].api).toEqual({ id: "gpt-6.2-sol", url: BASE, npm: "@ai-sdk/openai" })
    expect(rows["gpt-6.2-sol"].also).toEqual(["@ai-sdk/openai-compatible"])
    expect(rows["deepseek-v4-pro"].also).toBeUndefined()
    expect(rows["deepseek-v4-pro"].capabilities.input).toEqual({ text: true, image: false })
    expect(rows["claude-opus-5-5"].capabilities.input).toEqual({ text: true, image: true })
    expect(rowsOf({ data: [{ id: "" }] })).toBe(null)
    expect(rowsOf({ error: "x" })).toBe(null)
  })
})

function fakeFetch(answer) {
  const seen = []
  const f = async (url, init) => {
    seen.push({ url, auth: init?.headers?.authorization })
    return typeof answer === "function" ? answer() : answer
  }
  return { f, seen }
}

const json = (status, body) => new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

describe("the plugin's hooks", () => {
  test("the entry exports only the plugin function", () => {
    expect(Object.keys(entry)).toEqual(["CodeZ"])
  })

  test("config declares the provider and keeps the user's own", async () => {
    const p = createPlugin()
    const cfg = {}
    await p.config(cfg)
    expect(cfg.provider.codez).toEqual({ name: "CodeZ", npm: "@ai-sdk/openai-compatible", api: BASE, models: {} })
    const own = { provider: { codez: { name: "mine" } } }
    await p.config(own)
    expect(own.provider.codez).toEqual({ name: "mine" })
  })

  test("each key lists its own models", async () => {
    const { f, seen } = fakeFetch(() => json(200, LIST))
    const p = createPlugin({ fetchImpl: f })
    const got = await p.provider.models({ models: { old: {} } }, { auth: { type: "api", key: "sk-one" } })
    expect(Object.keys(got)).toHaveLength(5)
    expect(seen).toEqual([{ url: `${BASE}/models`, auth: "Bearer sk-one" }])
  })

  test("a refused key marks the account; a failure keeps the list it had", async () => {
    const was = { models: { old: {} } }
    const auth = { auth: { type: "api", key: "sk-x" } }
    await expect(createPlugin({ fetchImpl: fakeFetch(() => json(401, { error: "bad" })).f }).provider.models(was, auth)).rejects.toMatchObject({ signIn: "expired" })
    expect(await createPlugin({ fetchImpl: fakeFetch(() => json(502, "bad gateway")).f }).provider.models(was, auth)).toBe(was.models)
    expect(
      await createPlugin({
        fetchImpl: async () => {
          throw new Error("down")
        },
      }).provider.models(was, auth),
    ).toBe(was.models)
    await expect(createPlugin({ fetchImpl: fakeFetch(() => json(200, { nope: 1 })).f }).provider.models(was, auth)).rejects.toThrow("no model list")
    // not signed in: nothing asked
    const none = fakeFetch(() => json(200, LIST))
    expect(await createPlugin({ fetchImpl: none.f }).provider.models(was, {})).toBe(was.models)
    expect(none.seen).toEqual([])
  })

  test("the loader hands magpie the base and the key; usage checks the key", async () => {
    const p = createPlugin({ fetchImpl: fakeFetch(() => json(403, {})).f })
    expect(await p.auth.loader(async () => ({ type: "api", key: "sk-k" }))).toEqual({ baseURL: BASE, apiKey: "sk-k" })
    expect(await p.auth.loader(async () => undefined)).toEqual({})
    expect(await p.auth.usage(async () => ({ type: "api", key: "sk-k" }))).toMatchObject({ signIn: "expired" })
    const ok = createPlugin({ fetchImpl: fakeFetch(() => json(200, LIST)).f })
    expect((await ok.auth.usage(async () => ({ type: "api", key: "sk-k" }))).plan).toContain("codezsy.com")
  })
})
