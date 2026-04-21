# Calendar App

A simple month-view calendar built with pure HTML, CSS, and JavaScript — no framework, no build step. Open `index.html` directly in any browser.

## Features

- Month grid view with previous/next navigation and "Today" shortcut
- Add, edit, and delete events via a modal dialog
- Events persist in `localStorage` (no backend required)
- Color picker per event
- Responsive layout — works on desktop and mobile
- Dark mode via `prefers-color-scheme`
- Keyboard accessible — focus trap in modal, Escape to close

## Getting Started

```bash
git clone https://github.com/wsw112012-del/calendar-app-demo.git
cd calendar-app-demo
```

Then open `index.html` in your browser. No install or server needed.

## Project Structure

```
├── index.html        # App shell and modal markup
├── styles.css        # Layout, theming, responsive styles
├── app.js            # All logic — render, CRUD, localStorage, validation
└── tasks/
    └── todo.md       # Development checklist and acceptance criteria
```

## Event Data Model

Events are stored in `localStorage` under the key `calEvents` as a JSON array:

```json
{
  "id": "string",
  "title": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM or null",
  "endTime": "HH:MM or null",
  "description": "string or null",
  "color": "#hex"
}
```

## Validation Rules

- Title is required
- Date is required
- End time must be after start time (when both are set)
