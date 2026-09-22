# Govt Jobs Study Planner
Mobile-first study dashboard for Indian government job exam preparation.

The default workspace is set up for Rajasthan Patwari preparation and includes:

- Responsive dashboard with desktop sidebar and mobile bottom navigation
- Exam countdown, preparation score, study streak, syllabus progress, and weekly report
- Interactive daily tasks, subject progress sliders, MCQ result history, roadmap, notes, and a Pomodoro timer
- Exam Syllabus Library with State/Central categories, exam search, filters, expandable subjects/topics, topic actions, and planner suggestions
- Rotating Hindi and English motivation, with progress and notes persisted in browser `localStorage`
- A local browser mode that works without an OpenAI API key

The syllabus catalog lives in `web/syllabus-data.js` so verified official subjects and topics can be added independently of the UI. Catalog entries intentionally distinguish planning templates from exams whose official content is still pending verification; no unverified official syllabus claims are included.

## Connect as a ChatGPT App

Start the MCP server:

```sh
npm start
```

In Codespaces, make port `3000` public in the **Ports** panel. The connector URL is:

```text
https://<CODESPACE_NAME>-3000.<GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN>/mcp
```

Use that `/mcp` URL when creating an MCP connector in ChatGPT. The server exposes the existing `create_study_plan` tool and its interactive `ui://widget/study-plan.html` widget resource. No OpenAI API key is required for this version; ChatGPT connects to the public MCP URL directly.

## Local checks

The server provides:

- `GET /health` for a health response and public URL
- `GET /syllabus-data.js` for the structured exam library used by the dashboard
- `POST /mcp` JSON-RPC methods for `initialize`, `tools/list`, `tools/call`, `resources/list`, and `resources/read`

Start it with:

```sh
npm start
```
