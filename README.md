# Metarhia Skills

[![ci status](https://github.com/metarhia/metaskills/workflows/Testing%20CI/badge.svg)](https://github.com/metarhia/metaskills/actions?query=workflow%3A%22Testing+CI%22+branch%3Amain)
[![snyk](https://snyk.io/test/github/metarhia/Skills/badge.svg)](https://snyk.io/test/github/metarhia/Skills)
[![npm version](https://badge.fury.io/js/metaskills.svg)](https://badge.fury.io/js/metaskills)
[![npm downloads/month](https://img.shields.io/npm/dm/metaskills.svg)](https://www.npmjs.com/package/metaskills)
[![npm downloads](https://img.shields.io/npm/dt/metaskills.svg)](https://www.npmjs.com/package/metaskills)

Agent skills for the [Metarhia](https://github.com/metarhia) tech stack: reusable instructions for AI assistants and IDEs (Cursor, VS Code, Claude Code, Windsurf, etc.) — code style, patterns, architecture, and domain knowledge.

## Usage

From your project root, link skills into your IDE so it can use them:

```bash
npx metaskills
```

This autodetects installed IDEs and links every skill into their skills
directory, one level deep (`.claude/skills/js-conventions` ->
`node_modules/metaskills/skills/js-conventions`), which is the layout all
supported agents discover. Skills are not copied, and each link is added to
`.gitignore` and `.npmignore`. A skill folder of your own with the same name
is kept and reported as skipped.

**Supported IDEs:**

| IDE         | Command                      | Target dir         |
| ----------- | ---------------------------- | ------------------ |
| Autodetect  | `npx metaskills`             | Autodetect or menu |
| Cursor      | `npx metaskills cursor`      | `.cursor/skills`   |
| Claude      | `npx metaskills claude`      | `.claude/skills`   |
| Windsurf    | `npx metaskills windsurf`    | `.windsurf/skills` |
| VS Code     | `npx metaskills vscode`      | `.github/skills`   |
| Gemini      | `npx metaskills gemini`      | `.gemini/skills`   |
| Antigravity | `npx metaskills antigravity` | `.agents/skills`   |
| All         | `npx metaskills all`         | All of the above   |

Run once after install or after updating the package. Links to removed
skills and the grouped `skills/metaskills` link from versions up to 1.0.4
(which agents did not discover) are removed, and missing links are added.

## Skills

Skills live under `skills/<name>/SKILL.md`:

- `js-conventions` — Metarhia JavaScript/TypeScript style and naming
- `js-data-structures` — JavaScript collections and structural patterns
- `data-structures` — general data-structure guidance for agents
- `metautil-data-structures` — metautil structures (list, queue, deque, trie, …)
- `js-gof` — GoF creational and related patterns in JavaScript
- `error-handling` — error handling conventions
- `npm-publish` — prepare an npm package for release

See the [skills](skills/) directory for the full list.

## Development

Clone the repo and link skills for local testing:

```bash
git clone https://github.com/metarhia/metaskills.git
cd metaskills
npm install
npx metaskills   # autodetect, or npx metaskills cursor, etc.
```

Scripts:

- `npm run lint` — check code style
- `npm run fix` — auto-fix with ESLint and Prettier
- `npm t` — run lint (including code blocks in Markdown), installer tests, and skill checks: frontmatter, size budget, and links
- `npm run evals` — run agent evals from `evals/cases.js` with Claude Code (`claude` CLI, billed to your account): each case links the skills into a temporary project, runs a prompt, and checks which skills were invoked before the first edit and what the written files contain. Pass case names to run a subset; `EVAL_MODEL` (default `sonnet`), `EVAL_RUNS` (default 1), and `EVAL_KEEP=1` to keep the project folders

## License & Contributors

Copyright (c) 2026 [Metarhia contributors](https://github.com/metarhia/metaskills/graphs/contributors).
Metaskills is [MIT licensed](./LICENSE).
Metaskills is a part of [Metarhia](https://github.com/metarhia) technology stack.
