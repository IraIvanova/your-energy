# Your Energy

Vite + TypeScript starter for `your-energy`. The app uses native browser APIs
and does not use a UI framework.

The static-first layout follows
[vanilla-app-template](https://github.com/yuliialiubenka/vanilla-app-template):
HTML is composed with build-time `<load>` includes, CSS is collected in one
stylesheet, and TypeScript only adds behavior to existing elements.

[Figma design](https://www.figma.com/design/xWKOAKNSpTwXbTEsDl2e5M/YourEnergy--Copy-?node-id=2-186)

## Setup

Use Node.js 22.13 or later. If you use nvm, run `nvm use` first.

```sh
npm ci
npm run dev
```

## Commands

| Command             | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `npm run build`     | Create the production build                     |
| `npm run preview`   | Preview the production build                    |
| `npm run format`    | Format files with Prettier                      |
| `npm run lint`      | Check JavaScript and TypeScript                 |
| `npm run typecheck` | Check TypeScript types                          |
| `npm run lint:fix`  | Apply automatic lint fixes                      |
| `npm test`          | Check assets, static HTML, and folder structure |
| `npm run check`     | Check formatting, lint, types, tests, and build |

## Shared code

```text
src/
  index.html              HTML entry point with build-time includes
  main.ts                 Fonts and behavior initialization
  components/
    AppShell/             AppShell.ts, AppShell.html, AppShell.css
    Button/               Button.ts, Button.html, Button.css
    Icon/                 Icon.ts, Icon.html, Icon.css
    SearchField/          SearchField.ts, SearchField.html, SearchField.css
  pages/
    FavoritesPage/        FavoritesPage.ts, FavoritesPage.html, FavoritesPage.css
    HomePage/             HomePage.ts, HomePage.html, HomePage.css
  images/                 Named image/icon exports and source files
  services/api.ts         fetchJson and ApiError
  styles/
    index.css             CSS entry point, imports, and global styles
    tokens.css            Colors, typography, spacing, responsive sizes
    design-system.css     Shared themes, surfaces, and utilities
```

Keep each page and component's TypeScript, HTML, and CSS together in its own
folder. Vite's root is `src`; production files go to `dist`. Include HTML
partials using paths relative to `src` (without a leading `./`), including
inside other partials:

```html
<load src="pages/HomePage/HomePage.html" />
<load
  src="components/Button/Button.html"
  type="submit"
  variant="solid"
  label="Search"
/>
```

The include plugin expands these tags before the browser receives the HTML.
Static arguments in partials use `{=$label}` syntax. For `Icon`, provide
`src-url` and `label` (use an empty label for decorative icons). For
`SearchField`, provide a unique `id`, `label`, and `placeholder`.

Add component/page CSS imports to `src/styles/index.css`. TypeScript should
attach event listeners to existing markup, not import HTML as strings or build
the app with DOM factories. Components and pages without custom behavior keep an
empty TypeScript module (`export {}`), ready for future interactions.
`initSearchFields` binds clear buttons to static search fields; it emits a
native `input` event and restores focus when clearing.

Both pages exist in the delivered HTML. A small hash-change handler toggles
their `hidden` attributes and the navigation's `aria-current`; it never rebuilds
the shell or page content. The Home page is visible without JavaScript. Existing
`#/` and `#/favorites` links (including direct links, refreshes, and browser
back/forward) remain supported. Unknown hashes show Home.

Keep global rules, design tokens, and reusable utilities shared; component and
page styles belong beside their HTML and TypeScript files. Use BEM-style CSS
names and preserve the 768px and 1200px breakpoints. Photos are full-resolution
sources; resize them for delivery when implementing screens. SVGs keep their
original colors and dimensions.

Set `type="button"` for non-submit buttons and `type="submit"` for form
submission. Give icon-only buttons accessible names. Handle and display errors
from `fetchJson`.

## Commits

Hooks install with `npm ci`; run `npm run prepare` if they need reinstalling.
Pre-commit checks staged formatting and lint without rewriting files.

Use Conventional Commits with a title of at most 100 characters:

```text
feat(header): add mobile menu
fix: correct favorites storage
docs: explain local setup
```

Run `npm run check` before opening a PR. GitHub Actions runs the same checks.

## Deployment

Enable **Settings → Pages → Source → GitHub Actions**. Pushes to `main` deploy
through the Pages workflow.

The app uses hash routes and the `/your-energy/` base path. Import assets from
`src/images` in HTML or use the named exports in TypeScript when needed. Public
files remain in the top-level `public` folder: use `%BASE_URL%` in HTML and
`import.meta.env.BASE_URL` in TypeScript for their URLs.

## Team workflow

Clone this repository, install dependencies, and create a branch for your task.
Open a pull request into `main` when your work is ready. Run `npm run check`
before you open the pull request. Ask a teammate to review it before merging.

## Sources

The project base was prepared by Andrii Makarov in
[fp-group-1-energy](https://github.com/makandriival/fp-group-1-energy). This
setup uses
[source commit 9c8d7a1](https://github.com/makandriival/fp-group-1-energy/commit/9c8d7a1a518985d6dedf911ef822a4713b71a730).
The HTML layout follows
[vanilla-app-template](https://github.com/yuliialiubenka/vanilla-app-template).
