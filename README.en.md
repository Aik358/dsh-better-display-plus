# dsh-better-display-plus

[中文](./README.md)

An **independently maintained branch** of [dsh-better-display](https://github.com/aa2246740/dsh-better-display) (author: aa2246740).
It evolves on its own: the author's releases cannot affect your install, and you pull their updates **when you choose**.

```sh
# install (this repo, tracks the default branch tip)
dsh plugin --profile web add github:Aik358/dsh-better-display-plus

# local checkout / tarball
dsh plugin --profile web add ./dsh-better-display-plus

# uninstall
dsh plugin --profile web remove dsh-better-display
```

You need official `dsh` (or `npx @deepseek-ai/dsh`) and **pnpm** on PATH. `dsh plugin add` runs pnpm in `$DSH_HOME/profiles/web`. This repo commits built `lib/`, so a git install needs no `prepare` and no profile `allowBuilds` entry.

Then restart that Host and reload the page. `dsh plugin add` writes the profile; it does not hot-load a running process.

## Relationship to the author's repository

| remote | role |
| --- | --- |
| `origin` | this repo, `Aik358/dsh-better-display-plus` — your source of truth |
| `upstream` | the author's repo, `aa2246740/dsh-better-display` — **read-only**, taken from selectively |

Pull the author's work without perturbing your line:

```sh
git fetch upstream
git log --oneline HEAD..upstream/main    # what they have that you do not
git cherry-pick <sha>                    # take one commit
git merge upstream/main                  # or merge the lot
```

**The runtime id must not change**: it stays `dsh-better-display` (it lives in `lib/client.js`'s `__ModuleLoader__.load`, in `cordis.patch.yml`, and in the profile dependency key).
The npm scope `@aik358/dsh-better-display` is **metadata only**: the profile needs no edit and no Host restart. Renaming the runtime id would make the Host treat this as a different plugin and orphan your saved settings.

## What this branch adds over the author's

- **A host-generation-tolerant icon layer**: `src/client/icons.ts` resolves icons at runtime by candidate name with an inline fallback glyph, so one bundle renders on the 0.1.5 / 0.1.6 / 0.1.7 host lines (0.1.7 renamed the whole `Icon<Glyph>Outline<px>` set to `Icon<Glyph>Regular` and moved size to a prop).
- **0.1.7 client-contract adaptation**: `argsRaw` is read structurally (a preparing tool call carries none), `producer` replaces `provenance`, the block label types gained `codeLabel`/`wrapLabel`/`unwrapLabel`/`noExitCode`, and the turn tail no longer carries `ttftMs`/`tokensPerSecond`.
- **Local reader fixes**: fold stops, model replies kept out of the fold, code-interpreter output rendered as a terminal, sticky lane bands, one rail geometry for nested lanes, and a pending-interaction seat shim.

Targets DeepSeek Harness **0.1.7-rc.1** (while staying compatible with the 0.1.5-rc.2 / 0.1.6-alpha lines). Display only; it does not change Agent execution, the SDK, or credentials. Node.js `^22.19.0 || >=24`.

Adds a **阅读** tab to DeepSeek Harness: while a turn runs you see steps, thinking, and progress; after a successful turn those collapse and the final answer stays. Native Chat / Trajectory, the composer, model picker, tools, and approvals stay. The reading column keeps ChatView's `data-chat-flow` hook.

An mcp-app fence in the final answer mounts as an interactive card in the reading view, inside `<iframe sandbox="allow-scripts allow-forms">` without `allow-same-origin`. The card can fill the next prompt via JSON-RPC. The skill pack is [skills/generative-mcpapps/](skills/generative-mcpapps/). Settings → **Better Display** can preview deliverables in the right Sidebar (system app stays the default), turn on translucent frosted glass (off by default), toggle process auto-folding (on by default), and report whether that skill is installed in a harness skill root.

`dsh.bundle` is captured at Host boot. Do not also insert the same row by hand in the profile `cordis.patch.yml`, or it will mount twice.

## Development

```sh
npm test
npm run typecheck
```

After a host upgrade, start by unpacking the new host's real `.d.ts` and typechecking `src` against it with a probe like `tsconfig.probe017.json` — enumerate the incompatibilities before touching code. Comparing session-contract names such as `SessionStandardProps` is not enough: field additions, renames and removals inside nodes are invisible to tsc.

## License

Display and Markdown parts come from DeepSeek Harness (MIT). Motion is informed by [Transitions.dev](https://transitions.dev/). This repository's code is [MIT](LICENSE). Upstream author: aa2246740; this branch's changes ship under MIT as well.
