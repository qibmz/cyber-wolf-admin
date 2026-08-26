# CLAUDE.md

## Project

Ant Design Pro — React enterprise boilerplate on Umi Max v4, antd v6, ProComponents v3.

## Commands

`npm run dev`（**本地联调**：`MOCK=none` + proxy → `http://localhost:3001`）, `npm run start:test`（proxy → 测试后端）, `npm start`（dev+mock，旧 Pro mock，不用于对接 backend）, `npm run build`（utoopack；同域 `/api`）, `npm run build:test` / `npm run build:prod`（直连远程后端）, `npm run lint` (Biome+tsc), `npm run test` (Vitest), `npx antd lint ./src` (antd-specific checks).

Other: `npm run openapi`（本机 `http://localhost:3001/docs-json`）, `npm run openapi:remote`（测试后端 swagger）, `npm run biome` (auto-fix), `npm run tsc` (type-check only).

## Critical Rules

- **Never edit `src/services/cyber-wolf/`** — OpenAPI 生成，改接口后重新 `npm run openapi`
- **Never edit `src/services/ant-design-pro/`** — 旧模板生成物，业务勿再依赖
- **Biome only** — no ESLint, no Prettier. Both `npm run lint` and `npx antd lint ./src` must pass before commit
- **Always `npx antd info <Component>` before writing antd code** — don't guess APIs from memory
- **Conventional commits** required (commitlint enforced)
- **TypeScript strict** · **Node ≥ 22** · **`package-lock.json`** (not yarn/pnpm；勿提交 `pnpm-lock.yaml` / `yarn.lock`)
- **`.umi` dir is auto-generated** — delete `src/.umi` and restart if dev server acts up

## Backend

| 环境 | 地址 |
| --- | --- |
| 本地 | `http://localhost:3001` |
| 测试 | `https://cyber-wolf-backend-dev.qibmz.com` |
| 正式 | `https://cyber-wolf-backend.qibmz.com` |

本地联调：

1. 启动 **cyber-wolf-backend**（默认 `APP_PORT=3001`）
2. 本仓库执行 `npm run dev`
3. 浏览器打开 `http://localhost:8000/user/login`
4. 种子账号示例：`admin@example.com` / `secret`（以 backend seed 为准）

不启本机 backend 时可 `npm run start:test`，代理到测试域。代理见 `config/proxy.ts`（`/api/`）。Token 存 `localStorage`（`token` / `refreshToken` / `tokenExpires`）。

Vercel（[Environment Variables](https://vercel.com/docs/environment-variables)）：同一变量名 `API_SERVER`，按环境勾选即可，构建时自动注入，代码只需读 `process.env.API_SERVER`。

| Environment | `API_SERVER` |
| --- | --- |
| Preview（非 production 分支，含 `develop`） | `https://cyber-wolf-backend-dev.qibmz.com` |
| Production（production 分支，通常 `main`） | `https://cyber-wolf-backend.qibmz.com` |

也可用 `vercel env add API_SERVER preview` / `production`。仓库 `.env.example` 仅作说明；不要指望用 `.env.production` 区分 Preview/Production（两者构建都是 production）。后端需 CORS 放行对应前端域名。

## Architecture Essentials

**Config**: `config/config.ts` (defineConfig), `config/routes.ts` (declarative routes). Route `name` 用英文 → `menu.xxx` i18n key；`access` field gates visibility.

**Convention files** (`src/`): `app.tsx` (runtime config + `getInitialState`), `access.ts` (permissions), `global.tsx` (side effects), `loading.tsx`, `typings.d.ts`.

**Auth**: `getInitialState()` → `GET /api/v1/auth/me`；登录 `POST /api/v1/auth/email/login`。`access.ts`: `canAdmin = currentUser.access === 'admin'`（由 `mapUserToCurrentUser` 映射 role）。401 → `clearAuth` + 跳转 `/user/login`。

**State**: `useModel('filename')` for global hooks (`src/models/`). `useModel('@@initialState')` for currentUser/settings. ProTable `request` prop for most data loading.

**Styling priority**: Tailwind CSS v4 (layout) → antd-style v4 / `createStyles` (theme tokens) → CSS Modules → Less (legacy only).

**Request**: built-in `request` from `@umijs/max`，在 `src/requestErrorConfig.ts` 注入 Bearer、解包 `{ code, msg, data }`。Auth 工具：`src/utils/auth.ts`。

**i18n**: locales in `src/locales/`. `useIntl().formatMessage({ id, defaultMessage })`.

**Mock**: `mock/` 为旧 Pro 模板；对接 backend 时请用 `npm run dev`（`MOCK=none`）。

**Cloudflare Worker**: `cloudflare-worker/` — separate Hono app, own `package.json`, not an npm workspace.

## AI Skills

This project ships with two built-in Claude Code Skills (`.claude/skills/`). If you already have these skills in your project, no installation is needed — just run them directly. To update to the latest skill definitions, run `npx skills add ant-design/ant-design-pro`.

### `/pro-upgrade` — Project Upgrade

Run `/pro-upgrade` in Claude Code to auto-upgrade the project to the latest Ant Design Pro version. It diffs the latest template against this project and merges framework changes while preserving business code. Works for any version gap (v5→v6, v6.x→latest, etc.).

### `/antd` — Ant Design CLI

Run `/antd` in Claude Code for any antd-related work. It provides access to `@ant-design/cli` with offline metadata for antd v3/v4/v5/v6. Key commands:

- `npx antd info <Component>` — look up props/API before writing code (mandatory)
- `npx antd lint ./src` — check for deprecated or problematic usage (must pass before commit)
- `npx antd demo <Component> <demo>` — get working code examples
- `npx antd migrate <from> <to>` — migration checklist between major versions

## Page Co-location

Each page dir: `index.tsx`, optional `service.ts`, `_mock.ts`, `data.d.ts`, style files. Keep page-specific code with the page.

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---