# Style examples

Before and after. Each pair is a structure or readability change. Product symbols, labels, and domain rules are not examples.

## One-line signature

Defaults that wrap the parameter list move into the body. Callers that omit them still get the same values.

```js
const canWatchRecursive = (
  platform = process.platform,
  version = process.versions.node,
) => {
  if (platform === 'win32' || platform === 'darwin') return true;
  if (platform !== 'linux') return false;
  const [major, minor] = `${version}`.split('.').map(Number);
  return major > 19 || (major === 19 && minor >= 1);
};
```

```js
const canWatchRecursive = (platform, version) => {
  const host = platform ?? process.platform;
  const node = version ?? process.versions.node;
  if (host === 'win32' || host === 'darwin') return true;
  if (host !== 'linux') return false;
  const [major, minor] = `${node}`.split('.').map(Number);
  return major > 19 || (major === 19 && minor >= 1);
};
```

## Block body when it is not one line

A wrapped expression body becomes named steps. A block that is only `return expr` is not the goal: `arrow-body-style` unwraps it.

```js
const IGNORED_SUFFIXES = ['.lock', '~', '.swp', '.swo'];

const ignoredName = (name) =>
  IGNORED_SUFFIXES.some((suffix) => name.endsWith(suffix)) ||
  name.startsWith('.#') ||
  name === '.DS_Store';
```

```js
const IGNORED_SUFFIXES = ['.lock', '~', '.swp', '.swo'];

const ignoredName = (name) => {
  const suffix = IGNORED_SUFFIXES.some((item) => name.endsWith(item));
  const backup = name.startsWith('.#');
  const store = name === '.DS_Store';
  return suffix || backup || store;
};
```

## Named fields, then one object

Each field is a local. The object is one line, and shorthand matches the field name.

```js
const commitRowFields = (entry) => {
  const { add, del } = countLabel(entry);
  return {
    sha: entry.shortSha ?? '',
    refs: trimVisible(refsText(entry), REFS_MAX),
    add,
    del,
    date: shortAge(entry.date),
  };
};
```

```js
const commitRowFields = (entry) => {
  const { add, del } = countLabel(entry);
  const sha = entry.shortSha ?? '';
  const refs = trimVisible(refsText(entry), REFS_MAX);
  const date = shortAge(entry.date);
  return { sha, refs, add, del, date };
};
```

Same shape for a record read from disk:

```js
const readCache = (file) => {
  const data = readJson(file);
  if (!isHashObject(data)) {
    return { checkedAt: 0, compatible: '', major: '', skipped: '' };
  }
  return {
    checkedAt: parseInt(data.checkedAt, 10) || 0,
    compatible: asText(data.compatible),
    major: asText(data.major) || asText(data.latest),
    skipped: asText(data.skipped) || asText(data.handled),
  };
};
```

```js
const readCache = (file) => {
  const data = readJson(file);
  if (!isHashObject(data)) {
    return { checkedAt: 0, compatible: '', major: '', skipped: '' };
  }
  const checkedAt = parseInt(data.checkedAt, 10) || 0;
  const compatible = asText(data.compatible);
  const latest = asText(data.latest);
  const major = asText(data.major) || latest;
  const handled = asText(data.handled);
  const skipped = asText(data.skipped) || handled;
  return { checkedAt, compatible, major, skipped };
};
```

## Membership list, not a chain of comparisons

```js
const modifiedKey = (base, modText) => {
  const arrow =
    base === 'left' || base === 'right' || base === 'up' || base === 'down';
  const end = base === 'home' || base === 'end';
  if (!arrow && !end) return base;
  const mod = parseInt(modText, 10);
  const bits = Number.isFinite(mod) ? mod - 1 : 0;
  const ctrl = (bits & 4) !== 0;
  const shift = (bits & 1) !== 0;
  if (ctrl && shift && arrow) return `ctrl-shift-${base}`;
  if (ctrl && arrow) return `ctrl-${base}`;
  if (shift) return `shift-${base}`;
  return base;
};
```

```js
const ARROW_KEYS = ['left', 'right', 'up', 'down'];
const EDGE_KEYS = ['home', 'end'];

const modifiedKey = (base, modText) => {
  const arrow = ARROW_KEYS.includes(base);
  const end = EDGE_KEYS.includes(base);
  if (!arrow && !end) return base;
  const mod = parseInt(modText, 10);
  const bits = Number.isFinite(mod) ? mod - 1 : 0;
  const ctrl = (bits & 4) !== 0;
  const shift = (bits & 1) !== 0;
  if (ctrl && shift && arrow) return `ctrl-shift-${base}`;
  if (ctrl && arrow) return `ctrl-${base}`;
  if (shift) return `shift-${base}`;
  return base;
};
```

## Fixed list is an array

A module-level `Set` that is never mutated is a membership list. The check is `GIT_NAMES.includes(gitName)`.

```js
const GIT_NAMES = new Set([
  'HEAD',
  'packed-refs',
  'FETCH_HEAD',
  'ORIG_HEAD',
  'refs',
  'logs',
  'rebase-merge',
  'rebase-apply',
]);
```

```js
const GIT_NAMES = [
  'HEAD',
  'packed-refs',
  'FETCH_HEAD',
  'ORIG_HEAD',
  'refs',
  'logs',
  'rebase-merge',
  'rebase-apply',
];
```

A `Set` or `Map` stays when the code adds and deletes entries, or when it needs uniqueness of a computed list.

## Fixed string keys are an object

```js
const TASK_TITLES = new Map([
  [BACKLOG_HEAD, 'debt'],
  [LEGACY_BACKLOG, 'debt'],
  ['Issues', 'debt'],
  ['Bug Reports', 'bugs'],
  ['Bug reports', 'bugs'],
  ['Feature Requests', 'features'],
  ['Feature requests', 'features'],
  ['Technical debt', 'debt'],
  ['Research', 'research'],
  ['Security', 'security'],
  ...TASK_KINDS.map((kind) => [kind.title, kind.id]),
]);

const kindOfTitle = (name) => TASK_TITLES.get(name);
```

```js
const TASK_TITLES = Object.fromEntries([
  [BACKLOG_HEAD, 'debt'],
  [LEGACY_BACKLOG, 'debt'],
  ['Issues', 'debt'],
  ['Bug Reports', 'bugs'],
  ['Bug reports', 'bugs'],
  ['Feature Requests', 'features'],
  ['Feature requests', 'features'],
  ['Technical debt', 'debt'],
  ['Research', 'research'],
  ['Security', 'security'],
  ...TASK_KINDS.map((kind) => [kind.title, kind.id]),
]);

const kindOfTitle = (name) => TASK_TITLES[name];
```

## Lookup instead of an if chain

The chain only selected a color. The table holds that choice. The function reads one entry. Each entry still encodes the current-row case, so the unused color is not computed first.

```js
const pieceFg = (kind, tone) => {
  if (kind === 'add') return THEME.addLineFg;
  if (kind === 'del') return THEME.delLineFg;
  if (tone.current) {
    if (kind === 'hash') return THEME.shaDarkFg;
    if (kind === 'refs') return THEME.shaDarkFg;
    if (kind === 'text' || kind === 'body') return THEME.mutedFg;
    return tone.fgRgb;
  }
  if (kind === 'hash') return THEME.shaFg;
  if (kind === 'author') return THEME.addLineFg;
  if (kind === 'email') return THEME.mutedFg;
  if (kind === 'refs') return THEME.warnFg;
  if (kind === 'text') return tone.nameFg;
  if (kind === 'body') return THEME.mutedFg;
  return tone.fgRgb;
};
```

```js
const PIECE_FG = {
  add: () => THEME.addLineFg,
  del: () => THEME.delLineFg,
  hash: (tone) => (tone.current ? THEME.shaDarkFg : THEME.shaFg),
  refs: (tone) => (tone.current ? THEME.shaDarkFg : THEME.warnFg),
  author: (tone) => (tone.current ? tone.fgRgb : THEME.addLineFg),
  email: (tone) => (tone.current ? tone.fgRgb : THEME.mutedFg),
  text: (tone) => (tone.current ? THEME.mutedFg : tone.nameFg),
  body: () => THEME.mutedFg,
};

const pieceFg = (kind, tone) => {
  const pick = PIECE_FG[kind];
  if (pick) return pick(tone);
  return tone.fgRgb;
};
```

An action list per screen is the same idea: one object maps the key to the list, and the function only chooses the key.

```js
const extraFooterActions = (view) => {
  const { pane } = view;
  if (pane === 'repos') return ['theme'];
  if (pane === 'dashboard') return ['theme', 'pull', 'push'];
  if (pane === 'npm') {
    if (view.npmView) return ['npmVerbose', 'npmStop', 'npmRerun'];
    return ['npmEdit', 'npmNew', 'npmDrop', 'npmLogs'];
  }
  if (pane === 'tasks' || isTaskView(view)) {
    return ['plan', 'import', 'drop', 'check', 'taskNudge'];
  }
  return GIT_FOOTER;
};
```

```js
const FOOTER_EXTRA = {
  repos: ['theme'],
  dashboard: ['theme', 'pull', 'push'],
  npmLog: ['npmVerbose', 'npmStop', 'npmRerun'],
  npm: ['npmEdit', 'npmNew', 'npmDrop', 'npmLogs'],
  tasks: ['plan', 'import', 'drop', 'check', 'taskNudge'],
};

const extraFooterActions = (view) => {
  const { pane } = view;
  if (pane === 'npm' && view.npmView) return FOOTER_EXTRA.npmLog;
  if (pane === 'npm') return FOOTER_EXTRA.npm;
  if (pane === 'tasks' || isTaskView(view)) return FOOTER_EXTRA.tasks;
  return FOOTER_EXTRA[pane] ?? GIT_FOOTER;
};
```

## Multiline condition becomes a table

Screens that need no extra state share one function. Screens that do need it are their own functions in the same table.

```js
const headerScreen = (view) => {
  const { pane } = view;
  if (pane === 'agents') return view.agentView ? 'agents log' : 'agents';
  if (
    pane === 'dashboard' ||
    pane === 'repos' ||
    pane === 'branches' ||
    pane === 'npm' ||
    pane === 'packages' ||
    pane === 'tasks'
  ) {
    return pane;
  }
  if (pane === 'commits') {
    return view.commitView === 'full' ? 'commits full' : 'commits brief';
  }
  if (pane === 'files') {
    return isTasksEntry(selectedFile(view)) ? REPO_TASKS_LABEL : '';
  }
  return isTaskView(view) ? REPO_TASKS_LABEL : '';
};
```

```js
const agentsScreen = (view) => {
  const live = view.agentView;
  return live ? 'agents log' : 'agents';
};

const commitsScreen = (view) => {
  const full = view.commitView === 'full';
  return full ? 'commits full' : 'commits brief';
};

const filesScreen = (view) => {
  const tasks = isTasksEntry(selectedFile(view));
  return tasks ? REPO_TASKS_LABEL : '';
};

const paneScreen = (view) => view.pane;

const HEADER_SCREEN = {
  agents: agentsScreen,
  dashboard: paneScreen,
  repos: paneScreen,
  branches: paneScreen,
  npm: paneScreen,
  packages: paneScreen,
  tasks: paneScreen,
  commits: commitsScreen,
  files: filesScreen,
};

const headerScreen = (view) => {
  const pick = HEADER_SCREEN[view.pane];
  if (pick) return pick(view);
  const tasks = isTaskView(view);
  return tasks ? REPO_TASKS_LABEL : '';
};
```

## Call only the taken side

A ternary already runs one call. Statements must keep that. Computing both moves and then keeping one would change the stored order.

```js
moveIssue(delta) {
  if (!this.isOpen() || !delta) return;
  const row = this.rowAt(this.clampedTaskFocus());
  if (!row || row.draft) return;
  this.composer.commitCompose();
  const store = this.ui.review.store;
  const moved = row.quote
    ? store.moveFeedback(row.key, delta)
    : store.moveTask(row.task.id, delta);
  if (!moved) return;
  this.composer.closeCompose();
  this.followRow(row.quote ? { quote: true, key: row.key } : row);
  this.ui.flushReview(true);
}
```

```js
moveIssue(delta) {
  if (!this.isOpen() || !delta) return;
  const row = this.rowAt(this.clampedTaskFocus());
  if (!row || row.draft) return;
  this.composer.commitCompose();
  const store = this.ui.review.store;
  let moved;
  if (row.quote) moved = store.moveFeedback(row.key, delta);
  else moved = store.moveTask(row.task.id, delta);
  if (!moved) return;
  this.composer.closeCompose();
  this.followRow(row.quote ? { quote: true, key: row.key } : row);
  this.ui.flushReview(true);
}
```

## Use the library when the result matches

```js
const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const parseJsonModels = (text) => {
  const plain = stripAnsi(`${text ?? ''}`);
  const start = jsonStart(plain);
  const data = start < 0 ? null : parseJson(plain.slice(start));
  const names = collectJsonIds(data, []);
  return names.length ? uniqueNames(names) : parseNameList(plain);
};
```

```js
const parseJsonModels = (text) => {
  const plain = stripAnsi(`${text ?? ''}`);
  const start = jsonStart(plain);
  const data = start < 0 ? null : jsonParse(plain.slice(start));
  const names = collectJsonIds(data, []);
  return names.length ? uniqueNames(names) : parseNameList(plain);
};
```

`isHashObject` replaces `value && typeof value === 'object' && !Array.isArray(value)` in the same way.

Keep a local helper when the library result differs. A local date stamp uses local time; `nowDate` uses UTC. `existsSync` is synchronous; `exists` is async. A `JSON.parse` inside `try` stays when the `catch` must do something other than return null.

## Initialize every let

A `let` with no initializer is not allowed. If every path assigns before the value is read, bind `const` once. If a path can keep the starting value, initialize `let` to that value and read it on that path.

```js
const proposed = (declared, name, out, vul, resolved) => {
  let change;
  if (declared) change = declaredChange(name, declared, out, vul);
  else change = resolvedChange(name, vul, resolved);
  return change;
};

const readNames = (dir) => {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries;
};
```

```js
const proposed = (declared, name, out, vul, resolved) => {
  const change = declared
    ? declaredChange(name, declared, out, vul)
    : resolvedChange(name, vul, resolved);
  return change;
};

const readNames = (dir) => {
  let entries = null;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    // unreadable directory
  }
  if (!entries) return [];
  return entries;
};
```
