// CodeZ (codezsy.com) as a provider in magpie, signed in with an API key.
//
// CodeZ is a new-api relay at https://api.codezsy.com. One key reaches the
// models of its group: GET /v1/models lists them, each with the APIs CodeZ
// says it serves it on (supported_endpoint_types: "openai" is chat
// completions, "openai-response" the Responses API, "anthropic" Messages).
//
// Which API a model is asked on, as the zwenooo/magpie fork's CodeZ preset
// did: an OpenAI model (gpt-…, codex…, o1…) on Responses, which CodeZ
// serves natively (and turns a chat request for one into), though its list
// says only "openai" for them; a Claude model on Messages; every other on
// chat completions. The other APIs a model is served on go in `also`, so a
// client's request on one of them is relayed as it was sent.

export const ID = "codez"
export const BASE = "https://api.codezsy.com/v1"
export const SITE = "https://codezsy.com"
export const KEYS = "https://codezsy.com/console/token"

const CHAT = "@ai-sdk/openai-compatible"
const RESPONSES = "@ai-sdk/openai"
const MESSAGES = "@ai-sdk/anthropic"

// the AI SDK package of each API CodeZ names
const BY_TYPE = { openai: CHAT, "openai-response": RESPONSES, anthropic: MESSAGES }

function last(id) {
  return id.slice(id.lastIndexOf("/") + 1).toLowerCase()
}

// openAIModel is magpie's (internal/provider/provider.go openAIModel).
export function openAIModel(id) {
  const m = last(id)
  return m.startsWith("gpt-") || m.startsWith("codex") || (m.length > 1 && m[0] === "o" && m[1] >= "0" && m[1] <= "9")
}

export function claudeModel(id) {
  return last(id).startsWith("claude")
}

// apisOf is the API a model is asked on, then the others it is served on.
export function apisOf(id, types) {
  const own = openAIModel(id) ? RESPONSES : claudeModel(id) ? MESSAGES : CHAT
  const also = [CHAT]
  for (const t of Array.isArray(types) ? types : []) {
    const npm = BY_TYPE[t]
    if (npm && !also.includes(npm)) also.push(npm)
  }
  return { npm: own, also: also.filter((x) => x !== own) }
}

// Image input for the families known to read images; any other model is
// sent text only, so it is never sent what it can't read.
export function readsImages(id) {
  const m = last(id)
  return claudeModel(id) || openAIModel(id) || m.startsWith("gemini")
}

// row is a model as OpenCode's provider list has it, the shape magpie's
// plugin host reads from a models hook. Its name is its id, as CodeZ's
// console shows it.
export function row(id, types) {
  const { npm, also } = apisOf(id, types)
  const image = readsImages(id)
  return {
    id,
    name: id,
    api: { id, url: BASE, npm },
    status: "active",
    headers: {},
    options: {},
    limit: { context: 0, output: 0 },
    capabilities: {
      temperature: true,
      reasoning: true,
      attachment: image,
      toolcall: true,
      input: { text: true, image },
      output: { text: true },
    },
    variants: {},
    ...(also.length ? { also } : {}),
  }
}

// rowsOf is the model list of CodeZ's /v1/models answer, null when the
// answer is no list.
export function rowsOf(body) {
  if (!Array.isArray(body?.data)) return null
  const out = {}
  for (const m of body.data) {
    if (typeof m?.id !== "string" || !m.id) return null
    out[m.id] = row(m.id, m.supported_endpoint_types)
  }
  return out
}

function listModels(fetchImpl, key, signal) {
  return fetchImpl(`${BASE}/models`, {
    headers: { authorization: `Bearer ${key}`, accept: "application/json" },
    signal: signal ?? AbortSignal.timeout(15000),
    redirect: "error",
  })
}

const refused = (status) => `CodeZ refused this key (HTTP ${status}): check it at ${KEYS}, then sign in again`

export function createPlugin({ fetchImpl = globalThis.fetch } = {}) {
  return {
    config: async (cfg) => {
      cfg.provider ??= {}
      // ??= keeps a provider the user set up in plugins.json
      cfg.provider[ID] ??= { name: "CodeZ", npm: CHAT, api: BASE, models: {} }
    },

    auth: {
      provider: ID,
      methods: [{ type: "api", label: "CodeZ API key", placeholder: "sk-…" }],
      // magpie puts the key on each request in the way its API takes it
      // (Authorization: Bearer, or x-api-key on Messages); CodeZ takes both
      async loader(getAuth) {
        const auth = await getAuth()
        if (auth?.type !== "api" || !auth.key) return {}
        return { baseURL: BASE, apiKey: auth.key }
      },
      // CodeZ hides a key's quota from its API (quota_details_hidden), so
      // this only checks the key and says where its balance is
      async usage(getAuth) {
        const auth = await getAuth()
        if (auth?.type !== "api" || !auth.key) return {}
        let res
        try {
          res = await listModels(fetchImpl, auth.key)
        } catch (e) {
          return { error: `CodeZ unreachable: ${e?.cause?.code || e?.message || "network error"}`, windows: [] }
        }
        if (res.status === 401 || res.status === 403) return { error: refused(res.status), signIn: "expired", windows: [] }
        if (!res.ok) return { error: `CodeZ answered HTTP ${res.status}`, windows: [] }
        return { plan: `Pay as you go · balance at ${SITE}`, windows: [] }
      },
    },

    provider: {
      id: ID,
      // each key's own models: a key belongs to one group
      async models(provider, { auth, signal } = {}) {
        if (auth?.type !== "api" || !auth.key) return provider.models
        let res
        try {
          res = await listModels(fetchImpl, auth.key, signal)
        } catch {
          return provider.models // unreachable: the list it had stays
        }
        if (res.status === 401 || res.status === 403) throw Object.assign(new Error(refused(res.status)), { signIn: "expired" })
        if (!res.ok) return provider.models
        let body
        try {
          body = await res.json()
        } catch {
          throw new Error("CodeZ sent no model list")
        }
        const rows = rowsOf(body)
        if (!rows) throw new Error("CodeZ sent no model list")
        return rows
      },
    },
  }
}
