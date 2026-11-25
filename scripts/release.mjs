#!/usr/bin/env node
// Tags one plugin's release so magpie can install it from GitHub.
//
//   node scripts/release.mjs <name> [--push]
//
// magpie installs a plugin from GitHub with bun (github:owner/repo#ref),
// which takes the package at the repository's root and can't take one in
// a subfolder. So a release is a commit of its own whose tree is
// packages/<name> as committed at HEAD, tagged <name>-v<version>, its
// parent the plugin's last release (so each plugin's releases read as a
// history of their own). It is on no branch; the tag keeps it.
//
// Install it from magpie's Plugins page, or with
//   magpie plugin add github:zwenooo/magpie-plugins#<name>-v<version>

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim()

function versionKey(v) {
  return v.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? x.padStart(8, "0") : x)).join(".")
}

function main() {
  const args = process.argv.slice(2)
  const push = args.includes("--push")
  const name = args.find((a) => !a.startsWith("-"))
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    console.error("usage: node scripts/release.mjs <name> [--push]")
    process.exit(2)
  }
  const root = git("rev-parse", "--show-toplevel")
  process.chdir(root)
  const dir = `packages/${name}`
  const pkgFile = path.join(dir, "package.json")
  if (!fs.existsSync(pkgFile)) throw new Error(`no ${pkgFile}`)
  const dirty = git("status", "--porcelain", "--", dir)
  if (dirty) throw new Error(`${dir} has changes not committed:\n${dirty}`)
  // the version as committed, which is what the release holds
  const pkg = JSON.parse(git("show", `HEAD:${dir}/package.json`))
  if (!pkg.version) throw new Error(`${pkgFile} has no version`)
  const tag = `${name}-v${pkg.version}`
  if (git("tag", "--list", tag)) throw new Error(`${tag} exists already: raise the version in ${pkgFile}`)

  const head = git("rev-parse", "HEAD")
  const tree = git("rev-parse", `HEAD:${dir}`)
  const last = git("tag", "--list", `${name}-v*`)
    .split("\n")
    .filter(Boolean)
    .sort((a, b) => (versionKey(a.slice(name.length + 2)) < versionKey(b.slice(name.length + 2)) ? -1 : 1))
    .pop()
  const parent = last ? ["-p", git("rev-parse", `${last}^{commit}`)] : []
  if (last && git("rev-parse", `${last}^{tree}`) === tree) throw new Error(`${dir} is the same as ${last}`)
  const msg = `${name} ${pkg.version}\n\n${dir} at ${head}`
  const commit = execFileSync("git", ["commit-tree", tree, ...parent, "-m", msg], { encoding: "utf8" }).trim()
  git("tag", tag, commit)
  console.log(`${tag} -> ${commit} (${dir} at ${head.slice(0, 9)}${last ? `, after ${last}` : ""})`)

  if (push) {
    // the source the release came from goes up first, so the tag's
    // "at <commit>" can be looked up
    const branch = git("rev-parse", "--abbrev-ref", "HEAD")
    git("push", "origin", branch)
    git("push", "origin", `refs/tags/${tag}`)
    console.log(`pushed ${branch} and ${tag}`)
  } else {
    console.log(`not pushed: git push origin <branch> && git push origin refs/tags/${tag}`)
  }
  const repo = git("remote", "get-url", "origin").replace(/^.*github\.com[:/]/, "").replace(/\.git$/, "")
  console.log(`install: magpie plugin add github:${repo}#${tag}`)
}

try {
  main()
} catch (e) {
  console.error(String(e?.message ?? e))
  process.exit(1)
}
