# BuildClub Kito Extension

Kito is a small learning assistant for BuildClub course pages. It floats in the bottom-right corner, keeps the existing lesson review and notes behavior, and now helps learners when they appear stuck.

## Stuck Detector

The content script watches reading behavior on BuildClub pages and creates a stuck context when a learner may need help:

- The learner stays in the same 400px scroll zone for 60 seconds.
- The learner scrolls up and down around the same section at least 4 times in 20 seconds.
- The learner selects more than 20 characters of text.
- The learner pauses near a visible code block.

When triggered, Kito saves the current URL, page title, selected text, nearby section text, nearest heading, code-block state, trigger reason, scroll position, and timestamp. A small help bubble appears above Kito with Explain, Official Docs, Claude Prompt, and Ignore actions. Ignore hides the bubble, snoozes Kito for 10 minutes, and remembers the dismissed section.

When a learner selects a line while Kito is open, Kito now explains that selected line near the cursor immediately. The side panel also has a paste box where learners can paste the exact line they did not understand and get a more detailed explanation tied to official docs.

## Official Docs Finder

The side panel includes an Official Docs tab powered by `src/lib/officialDocs.ts`. It matches tools, commands, frameworks, and concepts in the selected/current section against a local official-docs registry. Results are scored by matched keywords and shown as official documentation cards.

Kito also shows must-read official docs directly inside the floating widget on every page, including the welcome state, lesson summary, and course notes view.

## Notes, Projects, Certificates

Kito saves lesson notes automatically and exports the whole course as a maximum two-page flowchart PDF: page one is the learning flow, page two is compact course notes and project prompts. Lesson review now includes direct project help.

On certificate or course-complete pages, Kito attempts to download the certificate from the visible certificate link, image, or canvas. It then creates a final BuildClub completion card with links to short notes, the certificate, project help, and a written BuildClub member label.

## Learner Feedback

Each side panel view includes a short review form asking, "What problem did you face? We will try to resolve it." Feedback is saved locally in `chrome.storage.local` as `kitoUserReviews` with the current stuck context, page title, URL, timestamp, and status. This keeps the first version backend-free while preserving the data needed to later sync feedback to a support dashboard or API.

No backend or paid API is required. The explanation and Claude prompt helpers in `src/lib/mockAssistant.ts` are intentionally mock logic with comments showing where to replace them with real AI/API behavior later.

## How To Test

1. Open a BuildClub page.
2. Select text longer than 20 characters and confirm the help bubble appears.
3. Wait on the same section for 60 seconds.
4. Scroll up and down repeatedly around one section.
5. Click Official Docs and open a suggested docs link.
6. Open Claude Prompt and click Copy Prompt.
7. Write a problem in the feedback form and click Send Feedback.
8. Select any long line and confirm the near-cursor explanation box appears.
9. Open a certificate/completion page and confirm the final card appears.

Chrome's Side Panel API is designed for persistent extension UI beside the user's browsing journey, which fits the Kito assistant well.
