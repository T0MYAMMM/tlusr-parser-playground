# tlusr-parser-web

## 1. Project Overview

`tlusr-parser-web` is the Next.js 15 developer frontend for the Tlusr Parser. It serves as an interactive playground, visualizer, and documentation hub for analyzing how the Python engine interprets raw HTML.

## 2. Key Features

- **Interactive Playground:** Paste raw HTML and observe the parsing pipeline's structured output in real-time, with a history sidebar to revisit prior runs.
- **Pipeline Visualizer:** Employs React Flow (`@xyflow/react`) to graph the cascading extraction strategy and LLM decisions at each stage.
- **Diff Viewer:** Side-by-side regression comparison between a baseline and a candidate parser output (`/diff`). Currently a stub UI wired to the `diff` package.
- **Code Editor Integration:** Utilizes `@monaco-editor/react` for syntax highlighting and comfortable input handling.
- **Docs Hub:** Renders technical documentation using `next-mdx-remote` and `shiki` for elegant code formatting.

## 3. Architecture & API Workflows

The web app includes a proxy API route (`/api/parse`) that shields the frontend from direct backend configuration.

- **Upstream Proxy:** If the `PARSER_API_URL` environment variable is set, the endpoint forwards requests to the FastAPI backend.
- **Graceful Mock Fallback:** If no backend is configured, it falls back to a deterministic, in-process mock (`mockParse`). This ensures the UI is always functional for testing and development without any infrastructure.

## 4. Technology Stack

| Category           | Libraries                                               |
|--------------------|---------------------------------------------------------|
| Framework          | Next.js 15 (Turbopack), React 18                        |
| Styling            | Tailwind CSS, Framer Motion, Radix UI Primitives        |
| Code Editor        | `@monaco-editor/react`                                  |
| Pipeline Graph     | `@xyflow/react` (React Flow)                            |
| State Management   | Zustand                                                 |
| Schema Validation  | Zod                                                     |
| Docs Rendering     | `next-mdx-remote`, `rehype-pretty-code`, `shiki`        |
| Diff               | `diff`                                                  |

## 5. Development Setup & Installation

Ensure you have Node.js >= 18 installed.

```bash
# Navigate to the web directory
cd web

# Install dependencies
npm install

# Start the development server (uses Turbopack)
npm run dev
```

The application will be available at `http://localhost:3000`.

## 6. Configuration

Configure the upstream connection via a `.env.local` file:

```bash
# Copy the example and fill in values
cp .env.example .env.local
```

```env
# Optional: point to a running Python FastAPI backend that wraps tlusr_parser.
# If omitted, the app uses in-process mock data — no backend needed.
PARSER_API_URL=http://localhost:8000
```

## 7. Available Scripts

| Script              | Description                                    |
|---------------------|------------------------------------------------|
| `npm run dev`       | Start development server with Turbopack        |
| `npm run build`     | Production build                               |
| `npm run start`     | Start production server                        |
| `npm run typecheck` | TypeScript type-check without emitting files   |
| `npm run lint`      | ESLint checks                                  |
| `npm run format`    | Prettier formatting across all source files    |

## 8. Contribution Guidelines

Before submitting a pull request:

1. Run `npm run typecheck` to ensure TypeScript constraints are met.
2. Run `npm run lint` to catch ESLint violations.
3. Run `npm run format` to apply Prettier formatting.

---
Part of the **[Tlusr platform](https://github.com/T0MYAMMM/tlusr-platform)**. Standards: [STANDARDS.md](https://github.com/T0MYAMMM/tlusr-platform/blob/main/STANDARDS.md) · Architecture: [ARCHITECTURE.md](https://github.com/T0MYAMMM/tlusr-platform/blob/main/ARCHITECTURE.md) · Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md) · Agents: [AGENTS.md](./AGENTS.md)
