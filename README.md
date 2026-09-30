# Builder.io Gen 1 SDK + Next.js App Router

A minimal reference for using the Builder.io **Gen 1** SDK (`@builder.io/react`) with the Next.js **App Router**, including section models, SSG/ISR and visual editor preview.

## Getting started

1. Copy your Public API Key (Builder → Account settings) into `.env`:
   ```
   NEXT_PUBLIC_BUILDER_KEY=<your key>
   ```
2. `npm install && npm run dev`
3. Open http://localhost:3000

## What's in here

| File | Purpose |
| --- | --- |
| `app/[[...page]]/page.tsx` | Catch-all route. Renders the `page` model plus the `announcement-bar`, `header` and `footer` section models. SSG via `generateStaticParams`, refreshed with ISR (`revalidate = 60`). |
| `app/docs/page.tsx` | A coded (non-Builder) page with a `sidebar` section model embedded in it. |
| `components/builder.tsx` | Client component wrappers around `BuilderComponent`. |

## Builder setup

Create these in Builder (Models → + Create Model):

| Model | Type | Preview URL |
| --- | --- | --- |
| `page` | Page | `http://localhost:3000` |
| `announcement-bar` | Section | `http://localhost:3000/` |
| `header` | Section | `http://localhost:3000/` |
| `footer` | Section | `http://localhost:3000/` |
| `sidebar` | Section | `http://localhost:3000/docs` |

A section model's preview URL must be a page that actually renders that section. Model names must match the `model` props in the code exactly.

## Compare against your implementation (visual editor issues)

If the visual editor isn't showing the blue hover outline, or sidebar edits don't update live in the iframe, the editor and the `BuilderComponent` on the page usually aren't connected. Check these first:

1. **`BuilderComponent` renders in a client component.** See `"use client"` at the top of `components/builder.tsx`. The editor talks to the component in the browser; if it only renders on the server, or a wrapper never hydrates, there are no overlays or live updates.
2. **`builder.init()` runs on the client, with the right key.** See `components/builder.tsx` (it is also called on the server in the pages). The key must belong to the space you are editing in.
3. **`prerender: false` on `builder.get()`.** See `app/[[...page]]/page.tsx` and `app/docs/page.tsx`. This returns JSON for `BuilderComponent` to render instead of pre-rendered HTML the editor can't attach to.
4. **The `model` prop matches the model name exactly.** e.g. `model="sidebar"` in `app/docs/page.tsx`. A missing or misspelled `model` is a common cause of edits not appearing live.
5. **Render `BuilderComponent` while previewing, even with no content.** See `useIsPreviewing` in `RenderBuilderContent` and `RenderBuilderSection`. Otherwise an empty or unpublished entry renders nothing (or a 404) inside the iframe and can't be edited.
6. **The preview URL loads a page that renders that model.** For section models, use a host page (e.g. `/docs` for `sidebar`).

Also worth checking in your app (not configured in this repo):

- **Query parameters.** Builder adds `builder.*` params to the preview URL. Middleware, redirects (trailing slash, i18n) or rewrites that drop them break the connection.
- **Duplicate or mixed SDKs.** Make sure there is a single copy of `@builder.io/react` / `@builder.io/sdk`, and that Gen 1 and Gen 2 SDKs aren't mixed.
- **Iframe headers.** `X-Frame-Options` or a CSP `frame-ancestors` that blocks builder.io typically gives a blank iframe.
- **Custom rendering.** Content rendered without `BuilderComponent` gets no editor overlays.

## Caching

Pages are statically generated at build time and refreshed in the background at most once every 60 seconds (ISR), so published changes appear on the live site within about a minute. Editor previews don't depend on this: Builder injects draft content into the page in the browser.
