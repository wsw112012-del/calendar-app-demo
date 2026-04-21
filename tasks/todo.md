# Calendar App — Todo Checklist

## Phase 1: HTML (`index.html`)

- [x] **H1** Document shell — `<!DOCTYPE html>`, charset, viewport meta, description meta, theme-color meta, inline SVG favicon, title, links to `styles.css` and `app.js`
  - AC: Page loads with no console errors; calendar icon appears in browser tab; mobile browser chrome uses accent color
- [x] **H2** Header bar — prev/next/today buttons + month label `<h1 id="month-label">`
  - AC: All four elements have correct `id`s; icon buttons have `aria-label`
- [x] **H3** Day-of-week header row — 7 static spans (Sun–Sat), `aria-hidden="true"`
  - AC: Exactly 7 children in correct order
- [x] **H4** Calendar grid container — `<main id="cal-grid" role="grid">`
  - AC: `id`, `role`, and `aria-label` attributes present
- [x] **H5** FAB add-event button — fixed `+` button, `id="btn-add-event"`, `aria-label`
  - AC: Button is focusable and has accessible label
- [x] **H6** Modal dialog — overlay, box, form with all fields (title, date, start, end, description, color), error spans, cancel/delete/save buttons
  - AC: All `id`/`for` pairs match; error spans have `role="alert"`; Delete starts hidden; overlay has `aria-modal="true"`

## Phase 2: Styles (`styles.css`)

- [x] **C1** CSS custom properties on `:root` — colors, spacing, sizes
  - AC: Changing `--color-accent` visually updates nav buttons and FAB
- [x] **C2** Reset + base typography — box-sizing, system-ui font, no external fetches
  - AC: No horizontal scroll at 320px
- [x] **C3** Header flexbox layout — centered label, consistent button padding + hover
  - AC: Label stays centered regardless of button widths
- [x] **C4** Day-of-week row — 7-column CSS grid, aligns with calendar grid
  - AC: Columns align pixel-perfectly with `.day-cell` columns
- [x] **C5** Calendar grid — `display:grid; repeat(7,1fr)`, border-via-gap technique
  - AC: 6-row months render without clipping; cells fill full width
- [x] **C6** Day cell styles — today highlight (circle), outside-month dimming, hover
  - AC: Today's number shown in accent-colored circle; other-month cells visually muted
- [x] **C7** Event chips — colored bg (inline), text truncation, `cursor:pointer`
  - AC: Long titles truncate with ellipsis
- [x] **C8** Modal overlay + box — fixed overlay, centered box, `min()` width, scrollable
  - AC: Modal never exceeds viewport; overlay click area works
- [x] **C9** Form layout — stacked labels/inputs, field-error style, action buttons row
  - AC: Inputs are touch-friendly (≥44px height); errors shown in red
- [x] **C10** FAB — fixed bottom-right, round, accent color, shadow, `z-index`
  - AC: Visible above grid on all viewports
- [x] **C11** Responsive `@media (max-width: 600px)` — smaller cells, chips hidden, count badge shown
  - AC: No horizontal scroll at 375px; count badges replace chips on mobile
- [x] **C12** Dark mode — `@media (prefers-color-scheme: dark)` overrides all color custom properties
  - AC: OS-level dark mode switches the entire UI; no JS required
- [x] **C13** Empty-state hint — `#empty-hint` spans full grid width, muted text, no pointer events
  - AC: Hint appears when current month has no events; disappears after first event is saved

## Phase 3: JavaScript (`app.js`)

- [x] **J1** Utilities — `generateId`, `today`, `toDateString`, `parseDate`, `getDaysInMonth`, `getFirstDayOfWeek`, `isSameDay`, `compareTime`
  - AC: `getDaysInMonth(2024,2)=29`; `getFirstDayOfWeek(2026,4)=3`; `compareTime('10:00','09:59')>0`
- [x] **J2** localStorage helpers — `loadEvents()` (try/catch, returns `[]`), `saveEvents()`
  - AC: `loadEvents()` never throws; data round-trips through JSON correctly
- [x] **J3** State + DOM refs — `state` object, `refs` cache, one `getElementById` per element
  - AC: No `getElementById` outside the `refs` block
- [x] **J4** `renderCalendar()` — month label, 35/42 cells, chips, count badges, today/outside classes
  - AC: April 2026 shows today on 22nd; Feb 2024 has 29 days; events appear on correct cells
- [x] **J5** Navigation handlers — prev/next wrap across year boundary; today resets state
  - AC: Jan→prev = Dec prior year; Today always returns to current month
- [x] **J6** `openModal` / `closeModal` — add mode (blank + date), edit mode (populated + Delete shown), focus on title
  - AC: Opening in edit mode pre-fills all fields; closing clears `state.editing`
- [x] **J7** `validateForm()` — title required, date required, end > start if both set
  - AC: Shows correct error message for each failure; no error on valid data
- [x] **J8** Form submit handler — build event object, upsert into `state.events`, `saveEvents`, `renderCalendar`
  - AC: New events persist after page reload; edits update existing chip in place
- [x] **J9** Delete handler — filter event, `saveEvents`, `closeModal`, `renderCalendar`
  - AC: Deleted event gone after reload
- [x] **J10** Click delegation — grid click opens add modal; chip click opens edit modal (stops propagation)
  - AC: Clicking blank cell ≠ clicking chip; both open correct modal mode
- [x] **J11** Focus trap + Escape — Tab/Shift+Tab cycles within modal; Escape closes
  - AC: Focus never leaves open modal; Escape works anywhere
- [x] **J12** Initial `renderCalendar()` call at end of `DOMContentLoaded`
  - AC: Page shows current month grid immediately on load
- [x] **J13** Empty-state hint injection — appended to grid when no events exist in the current month
  - AC: Hint text visible on fresh load; auto-removed after saving the first event for the month

## Acceptance Criteria Summary

| # | Criterion |
|---|-----------|
| 1 | Opens from `file://` with no console errors |
| 2 | Shows current month; today's cell highlighted |
| 3 | Prev/Next navigation wraps correctly across year boundaries |
| 4 | "Today" button returns to current month from any position |
| 5 | Clicking day cell opens add-event modal with date pre-filled |
| 6 | Saving event shows chip on grid and persists to localStorage |
| 7 | Reloading page restores all events |
| 8 | Validation: empty title → error; end ≤ start → error |
| 9 | Clicking chip opens edit modal with all fields populated |
| 10 | Saving edit updates chip; deleting removes it (both persist) |
| 11 | Escape / overlay click closes modal |
| 12 | 375px viewport: no scroll, count badges shown |
| 13 | Tab/Shift+Tab cycles within open modal (focus trap) |
| 14 | OS dark mode switches entire UI automatically |
| 15 | Empty-state hint shown when month has no events |
| 16 | Calendar icon visible in browser tab |

---

## Review

Four files created from scratch — no framework, no build step, works from `file://`:

**`index.html`** — Semantic HTML5 shell with sticky header (prev/next/today nav + month label), static 7-column day-of-week row, `<main id="cal-grid">` grid target, fixed FAB `+` button, and fully-formed modal dialog. Includes inline SVG favicon (data URI), `theme-color` meta for mobile browser chrome, and `description` meta. All form fields have matching `id`/`for` pairs; error spans carry `role="alert"`; Delete button starts hidden and is revealed only in edit mode.

**`styles.css`** — Custom properties on `:root` drive the entire color scheme and sizing. A `@media (prefers-color-scheme: dark)` block overrides all color variables for automatic dark mode — zero JS required. Calendar grid uses `display:grid; repeat(7,1fr)` with a `1px` gap over a border-colored background (cell borders without extra markup). Today's date number gets an accent-colored circle. Event chips truncate with `text-overflow: ellipsis`. Modal centered via `position:fixed; inset:0`. `#empty-hint` spans the full grid width with muted hint text. Responsive breakpoint at 600px shrinks cells, hides chips, shows count badges.

**`app.js`** — Entire logic inside a single `DOMContentLoaded` callback. State is one plain object `{today, year, month, events, editing}`. DOM refs cached once in a `refs` object. Pure date/time utilities defined first. `renderCalendar()` is the sole DOM-writing function — builds 35 or 42 cell descriptors, re-renders chips, count badges, and empty-state hint. CRUD handled by submit handler (upsert), delete handler, and focus-trap + Escape keydown listener. Events persist to `localStorage` as JSON under key `calEvents`.

**What changed (polish pass):** Added inline SVG favicon and meta tags to `index.html`; added dark mode color overrides and `#empty-hint` style to `styles.css`; added empty-state hint rendering logic to `renderCalendar()` in `app.js`.
