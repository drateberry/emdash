---
"emdash": minor
---

Adds opt-in `contentRoutes` integration option. When set, EmDash injects a catch-all Astro route that resolves request paths against each collection's `urlPattern` (via `resolveEmDashPath`) and renders the configured entrypoint component with `{ entry, collection, params }` as props. File-based pages in `src/pages/` always take priority, so enabling the option is non-breaking for existing sites.

```ts
emdash({
  contentRoutes: { entrypoint: "./src/layouts/EmDashEntry.astro" },
})
```
