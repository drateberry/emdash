---
"emdash": minor
"@emdash-cms/admin": minor
---

Adds opt-in `contentRoutes` integration option and a sibling `getEntryUrl(collection, slug)` helper. Together they make each collection's admin-configured `urlPattern` the source of truth for routing in both directions:

- `contentRoutes` injects a catch-all Astro route that resolves incoming paths against `urlPattern` (via the existing `resolveEmDashPath`) and renders the configured entrypoint component with `{ entry, collection, params }` as props. File-based pages in `src/pages/` always take priority, so enabling the option is non-breaking.
- `getEntryUrl` is the inverse: given a collection slug and entry slug, returns the URL that `urlPattern` would serve. Use it in templates so internal links, RSS feeds, and redirects follow `urlPattern` instead of hardcoding strings like `/blog/`.
- When `urlPattern` is unset, both `getEntryUrl` and `resolveEmDashPath` fall back to `/<collection>/{slug}` — the same default the admin's `contentUrl()` helper uses for preview links. This keeps entry → URL and URL → entry behavior aligned whether the user sets an explicit pattern or leaves it blank.
- Fixes a related admin bug: clearing the URL Pattern field on an existing Content Type now actually clears the stored value. Previously the admin sent `undefined` (PATCH "leave unchanged") for an empty input, so the last-saved pattern stuck; it now sends `null` so the registry writes through a clear. `UpdateCollectionInput.urlPattern` is widened to `string | null` on both admin and core types to match.

```ts
// astro.config.mjs
emdash({
  contentRoutes: { entrypoint: "./src/layouts/EmDashEntry.astro" },
})

// anywhere in a template
import { getEntryUrl } from "emdash";
const href = await getEntryUrl("posts", post.id);
```
