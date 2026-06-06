# Catnooish Quest

Catnooish Quest is a hackathon MVP Chrome extension for BuildClub's Claude Code course. A playful Catnooish mascot appears while learners read a lesson, nudges them to build at 90% scroll progress, generates project ideas and build plans, scores submissions, creates a shareable builder card, and offers a mock translation/explanation flow.

## Tech Stack

- WXT
- React + TypeScript
- Tailwind CSS
- Chrome Manifest V3
- Chrome Side Panel API
- Content scripts
- `chrome.storage.local`
- Mock TypeScript AI functions with no backend or paid API

## How To Install

```bash
npm install
```

## How To Run Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Load Unpacked In Chrome

1. Run `npm run build`.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select `.output/chrome-mv3`.
6. Open any webpage and use the Catnooish Quest side panel.

## Demo Flow

1. Open any lesson or webpage.
2. Scroll toward the bottom of the page.
3. At 90% progress, Catnooish asks you to start building.
4. Click Start Building to open the side panel.
5. Review the lesson summary.
6. Choose "I have a plan", "Help me find an idea", or "Show builder examples".
7. Generate a build plan and copy Claude Code prompts.
8. Submit your project details.
9. Get a deterministic mock build score and badge.
10. Copy the generated BuildClub share post.
11. Use the floating Translate button to open a mock translated explanation.

## Future Scope

- Replace mock AI with a real AI API.
- Add BuildClub leaderboard integration.
- Support real project submissions.
- Add multilingual full-page translation.
- Add native social sharing.
