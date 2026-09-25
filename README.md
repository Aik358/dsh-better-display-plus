# dsh-better-display-plus

[English](./README.en.md)

这是 [dsh-better-display](https://github.com/aa2246740/dsh-better-display)（作者 aa2246740）的**独立维护分支**。
它与作者仓库各自演进：作者的发布不再影响你的运行，作者的更新由你**按需拉取**。

```sh
# 安装（本仓库，跟默认分支最新提交）
dsh plugin --profile web add github:Aik358/dsh-better-display-plus

# 本地目录 / tarball
dsh plugin --profile web add ./dsh-better-display-plus

# 卸载
dsh plugin --profile web remove dsh-better-display
```

PATH 上要有官方 `dsh`（没有就用 `npx @deepseek-ai/dsh`）和 **pnpm**。`dsh plugin add` 会在 `$DSH_HOME/profiles/web` 里跑 pnpm。仓库已提交编译好的 `lib/`，git 安装不用 `prepare`，也不用改 profile 的 `allowBuilds`。

然后重启这个 Host，再刷新页面。`dsh plugin add` 只写 profile，不会热挂正在跑的进程。

## 与作者仓库的关系

| 远端 | 作用 |
| --- | --- |
| `origin` | 本仓库 `Aik358/dsh-better-display-plus` —— 你的正式来源 |
| `upstream` | 作者仓库 `aa2246740/dsh-better-display` —— **只读**，按需择取 |

拉作者的更新（先看再决定，不影响你的主线）：

```sh
git fetch upstream
git log --oneline HEAD..upstream/main    # 作者有什么是你还没有的
git cherry-pick <sha>                    # 只取你想要的某一个提交
git merge upstream/main                  # 或整体合并
```

**运行时 id 不能改**：它始终是 `dsh-better-display`（写在 `lib/client.js` 的 `__ModuleLoader__.load`、`cordis.patch.yml` 与 profile 依赖键里）。
npm 作用域名 `@aik358/dsh-better-display-plus` **只是包元数据**；profile 侧无需改动，也不要求重启宿主。改掉运行时 id 会让宿主把本插件当作另一个插件，已存设置项会失联。

## 这一支比作者多了什么

- **跨宿主世代的图标解析层**：`src/client/icons.ts` 在运行期按候选名解析图标并带内联兜底字形，同一份产物在 0.1.5 / 0.1.6 / 0.1.7 三线宿主上都能渲染（0.1.7 把 `Icon<Glyph>Outline<px>` 整批改名为 `Icon<Glyph>Regular`，尺寸改为 prop）。
- **0.1.7 客户端契约适配**：`argsRaw` 改为结构化读取（preparing 阶段的工具调用没有该字段）、`producer` 取代 `provenance`、块标签类型新增 `codeLabel`/`wrapLabel`/`unwrapLabel`/`noExitCode`、回合尾部不再带 `ttftMs`/`tokensPerSecond`。
- **阅读页本地修整**：折叠断点、模型回答不进折叠、代码解释器结果按终端渲染、吸顶车道分区、嵌套轨道几何统一、待交互座位兼容层。

面向 DeepSeek Harness **0.1.7-rc.1**（同时兼容 0.1.5-rc.2 / 0.1.6-alpha 两代）。只改展示，不改 Agent 执行、SDK 或模型凭据。Node.js `^22.19.0 || >=24`。

给 DeepSeek Harness 加一个 **阅读** 页签：执行时能看到步骤、思考和进度；整轮成功结束后把过程收起来，留下最终回答。原版「对话 / 轨迹」、输入框、模型选择、工具和审批都还在。阅读列保留宿主 ChatView 的 `data-chat-flow` 钩子。

最终回答里的 mcp-app 代码块会在阅读视图里挂成交互卡片，跑在 `<iframe sandbox="allow-scripts allow-forms">` 里，没有 `allow-same-origin`。卡片可以通过 JSON-RPC 把下一轮 prompt 填进输入框。技能包在 [skills/generative-mcpapps/](skills/generative-mcpapps/)。设置里的 **Better Display** 可把产物改为右侧栏预览（默认仍用系统应用）、打开半透明毛玻璃（默认关）、设置过程自动折叠开关（默认开），并检测该技能是否已装进宿主技能目录。

`dsh.bundle` 是开机捕获的。不要再往 profile 的 `cordis.patch.yml` 手写同一条 insert，会重复挂载。

## 开发

```sh
npm test
npm run typecheck
```

宿主升级后的第一步：解包新版宿主的真实 `.d.ts`，用 `tsconfig.probe017.json` 这类探针对 `src` 做全量类型检查，穷举不兼容点再动手——只比对 `SessionStandardProps` 这类会话契约名不可靠，节点内部字段的增删改名对 tsc 不可见。

## 许可

展示与 Markdown 部分来自 DeepSeek Harness（MIT）。动效参考 [Transitions.dev](https://transitions.dev/)。本仓库代码 [MIT](LICENSE)。上游作者：aa2246740；本分支的修改同样以 MIT 发布。
