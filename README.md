<div align="center">

<img src="https://raw.githubusercontent.com/trylapse/.github/main/profile/logo.png" alt="TryLapse logo" width="80" height="80" />

# TryLapse — Demo Video

**Pre-launch readiness, observed.**

[![Remotion](https://img.shields.io/badge/Built%20with-Remotion%204.0-7c6fec?style=flat-square&logo=react)](https://remotion.dev)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)
[![TryLapse](https://img.shields.io/badge/Product-trylapse.dev-7c6fec?style=flat-square)](https://trylapse.dev)

*This repository contains the source code for the TryLapse product demo video — a 45-second animated showcase built entirely in React using [Remotion](https://remotion.dev). Clone, render, and adapt it.*

---

[**What is TryLapse?**](#what-is-trylapse) · [**The Problem**](#the-problem) · [**How It Works**](#how-it-works) · [**Watch the Demo**](#watch-the-demo) · [**Run the Demo Locally**](#run-the-demo-locally) · [**Video Architecture**](#video-architecture)

</div>

---

## What is TryLapse?

TryLapse is a **pre-launch rehearsal tool** that sends synthetic AI personas through your product's critical user journeys — before your real users ever touch it.

Instead of finding out that checkout silently fails on iOS Safari *after* launch, TryLapse catches it in minutes, backs it with a screenshot, and tells you exactly which persona encountered it and why it matters.

```
$ rehearse run -c my-app.yaml -o artifacts

→  Crawling 48 pages…
✓  Sitemap built · 48 routes discovered
→  Spawning 4 persona agents
→  [power-user]        Login → Dashboard → Checkout
→  [new-user]          Signup → Onboarding → First action
→  [mobile-user]       iOS Safari · Checkout flow
→  [enterprise-admin]  SSO → Team management → Export

✗  [mobile-user]  Checkout form FAILED · silent submit error
   evidence: screenshot captured · DOM snapshot saved

✓  Readiness score: 78/100 · Amber band
✓  Run complete · 8m 24s · $0.034 agent cost
```

**TryLapse does not modify your product, auto-fix issues, or hallucinate findings.** Every issue in the scorecard is anchored to a screenshot, a DOM snapshot, or a network event. You decide what to fix.

---

## The Problem

Every team has shipped a release they immediately regretted.

The sequence is painfully familiar: you run through the happy path manually, CI passes, you deploy — and within the hour Slack lights up because checkout is broken for mobile users, or onboarding silently stops on step 3 for Enterprise SSO accounts, or the export CSV hangs for large teams.

The root cause is almost never negligence. It is **coverage**. Manual testing can cover one persona at a time. A single engineer can walk through one journey at a time. There are only so many hours before a release window.

The specific failure modes TryLapse catches:

| Failure class | How it typically surfaces without TryLapse |
|---|---|
| Silent form failures (mobile Safari, Firefox) | User complaint, support ticket |
| Journey regression after a dependency update | Sentry error spike 20 min post-deploy |
| Accessibility blocker for screen-reader persona | Accessibility audit weeks later |
| Performance regression under realistic load | Monitoring alert after real traffic hits |
| Onboarding drop-off from copy/tooltip change | Analytics anomaly after 48h |
| SSO edge-case for Enterprise accounts | Customer escalation to sales |

None of these are exotic. They are the normal cost of shipping without a systematic pre-launch check.

---

## How It Works

TryLapse runs a five-phase multi-agent pipeline against your product's staging or preview URL.

```
┌─────────────────────────────────────────────────────────┐
│                    rehearse run -c app.yaml              │
└───────────────────────┬─────────────────────────────────┘
                        │
          ┌─────────────▼─────────────┐
          │   Phase 1: Crawler Agent  │
          │   Sitemap · route graph   │
          │   auth-gated pages · hubs │
          └─────────────┬─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │  Phase 2: Workflow Agent  │
          │  Pattern detection        │
          │  Journey supplementation  │
          └─────────────┬─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │ Phase 3: Journey Runner   │
          │ E2E step execution        │
          │ Screenshots · DOM snaps   │
          └─────────────┬─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │  Phase 4: Persona Agents  │◄── up to N agents in parallel
          │  power-user               │
          │  new-user                 │
          │  mobile-user              │
          │  enterprise-admin         │
          └─────────────┬─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │ Phase 5: Synthesizer      │
          │ Deduplication · scoring   │
          │ Scorecard · readiness     │
          └─────────────┬─────────────┘
                        │
                   ┌────▼────┐
                   │Dashboard│
                   └─────────┘
```

### Phase 1 — Crawler

Playwright-powered deep crawl of your product. Builds a route graph, identifies hub pages, detects authentication-gated routes, and discovers all reachable surfaces. Produces a structured sitemap that downstream agents use as their map of the product.

### Phase 2 — Workflow Detection

Pattern-matches the crawl output against known workflow signatures (checkout flows, onboarding sequences, settings pages, CRUD surfaces). Auto-supplements the journey definitions in your YAML with any flows it discovers that you haven't explicitly specified.

### Phase 3 — Journey Runner

Executes each journey end-to-end using real browser automation. Captures:
- **Screenshots** at every step
- **DOM snapshots** on interaction
- **Network request/response pairs** for form submissions
- **Console errors and warnings**
- **Web Vitals** (LCP, CLS, FID) per journey

All evidence is stored locally in `artifacts/` — nothing is sent to an external service.

### Phase 4 — Persona Agents

Each persona agent re-runs the journeys through the lens of a specific user archetype. Personas carry:
- **Viewport and device context** (desktop, iPhone 14, iPad, slow 3G)
- **Authentication state** (anonymous, free-tier, enterprise SSO)
- **Behavioral biases** (power user who clicks fast, new user who reads everything, accessibility user with screen reader)
- **Domain knowledge** (what this persona expects based on their mental model)

Agents flag issues with a severity level (P0–P3), a dimension label (see scoring below), and the evidence that triggered it. They also capture **delights** — moments where the product genuinely exceeded expectations.

### Phase 5 — Synthesizer

Deduplicates findings across personas, computes the 8-axis readiness score, generates the command-digest headline and bullet points, and writes the final scorecard Markdown. The synthesizer is intentionally conservative: it does not invent issues without evidence and does not assign a score without a derivation.

---

## The 8-Axis Evaluation Rubric

Every run produces scores across eight dimensions. The composite readiness score is derived from these, weighted by issue severity.

| Axis | What it measures |
|---|---|
| **Auth & Security** | Login, SSO, session handling, token expiry, MFA flows |
| **Core Flows** | The product's primary value-delivering journeys |
| **Performance** | LCP, CLS, FID, time-to-interactive across personas and viewports |
| **Accessibility** | WCAG AA compliance, screen-reader navigability, keyboard paths |
| **Error Handling** | How the product behaves when things go wrong — network errors, invalid input, edge states |
| **Conversion** | Friction in signup, checkout, and activation flows |
| **Onboarding** | First-run experience, progressive disclosure, time-to-value |
| **Integration** | Third-party dependencies, webhooks, export/import flows |

A **P0 issue in any dimension pulls the readiness band to Amber or Red regardless of the composite score.** This is intentional — a silent checkout failure is not acceptable at any readiness level.

### Readiness Bands

| Band | Score | Meaning |
|---|---|---|
| 🟢 **Green** | 80–100 | Ready to promote. No P0s. Minor findings documented. |
| 🟡 **Amber** | 65–79 | Fix P0s before promoting. P1s should be tracked. |
| 🔴 **Red** | < 65 | Not ready. Multiple critical flows blocked. |

The band is not determined by the score alone — it is derived from issue severity. A product scoring 90 with an unresolved P0 is still Amber.

---

## Evidence, Not Assertions

TryLapse is designed around a single principle: **every finding must be reproducible by a human with the evidence provided.**

What this means in practice:

- Every issue card includes a screenshot from the exact moment of failure
- Every issue includes the DOM element path, the action taken, and the observed vs. expected outcome
- Every issue includes the persona, the journey, and the step number
- The scorecard links back to the specific evidence artifact for each finding
- If an agent cannot produce evidence, it does not file an issue

This design is deliberate. "The checkout button doesn't work" with no evidence is noise. "The checkout button's `form.submit()` returns `undefined` on iOS Safari 17.4 with no network request emitted, at step 5 of the mobile-user checkout journey, screenshot at `artifacts/runs/20260615-144122/step-5-checkout.png`" is actionable.

---

## What You See in the Dashboard

The TryLapse dashboard ([`Frontend_V1/`](https://github.com/trylapse/trylapse)) is a React + TypeScript UI that visualises every rehearsal run in real time.

### Command Center

The entry point for every run. Shows:
- **Readiness gauge** — live-updating circular score indicator
- **Situation report** — AI-generated headline + 3 bullet summary of what happened
- **Latest run stats** — blockers, highlights, duration, pages crawled
- **6-run trend** — sparkline of readiness over time, so you can see regressions at a glance
- **Quick stats** — time-to-first-scorecard, flake rate, recurring blocker count, agent cost per run
- **Recent runs table** — one row per run, sortable by readiness, date, environment

### Run Detail

Drill into any run:
- **Launch gate verdict** — READY / NOT READY, derived from issue severity, not the score alone
- **Blocker list** — every P0 and P1 with severity, dimension, persona, evidence, and recurrence count
- **Highlight list** — moments of delight captured by agents, with persona quotes
- **8-axis dimension bars** — per-dimension scores with issue counts
- **Step timeline** — every step the agents took, with screenshots

### Compare

Side-by-side diff of two runs. Shows what regressed, what improved, and what is new since the previous rehearsal. When an LLM key is configured, produces a natural-language "What changed" summary.

### Trends

Multi-run readiness trend, flake rate over time, recurring blocker tracking, and agent cost history.

---

## Getting Started

> **Prerequisites:** Python 3.11+, Node.js 18+, Playwright, a staging URL

### 1. Install

```bash
# Clone TryLapse
git clone https://github.com/trylapse/trylapse.git
cd trylapse/launch-rehearsal

# Install Python dependencies
python -m venv .venv && source .venv/bin/activate
pip install -e .
playwright install chromium
```

### 2. Write a config

```yaml
# my-app.yaml
run:
  name: "my-saas"
  target_url: "https://staging.my-app.com"

personas:
  - id: power-user
    description: "Experienced user, uses keyboard shortcuts, expects fast load times"
    viewport: { width: 1440, height: 900 }

  - id: new-user
    description: "First-time user, reads everything, expects clear guidance"
    viewport: { width: 1280, height: 800 }

  - id: mobile-user
    description: "iOS Safari, thumb navigation, slow 3G connection"
    viewport: { width: 390, height: 844 }
    network: slow3g

journeys:
  - id: checkout
    description: "Add item to cart, enter payment details, complete purchase"
    start_url: "/products"
    
  - id: onboarding
    description: "Sign up, complete onboarding wizard, reach first meaningful action"
    start_url: "/signup"
```

### 3. Run a rehearsal

```bash
# Full pipeline
rehearse run -c my-app.yaml -o artifacts

# With LLM-enhanced persona analysis (recommended)
export DEEPSEEK_API_KEY=sk-...
rehearse run -c my-app.yaml -o artifacts --llm

# Launch the dashboard
rehearse serve -o artifacts
# → http://127.0.0.1:8765
```

### 4. Read the scorecard

```bash
cat artifacts/scorecards/<run-id>-scorecard.md
```

Or open the dashboard at `http://127.0.0.1:8765` for the full visual experience.

---

## Configuration Reference

```yaml
run:
  name: string                    # Product name (shown in dashboard)
  target_url: string              # Staging/preview URL to rehearse against
  environment: staging            # staging | prod-canary | local

crawl:
  max_pages: 100                  # Cap on pages crawled (default: 100)
  exclude_patterns:               # URL patterns to skip
    - /admin/*
    - /api/*

auth:                             # Optional — for authenticated flows
  email: "${REHEARSE_EMAIL}"
  password: "${REHEARSE_PASSWORD}"
  login_url: /login

personas:
  - id: string                    # Unique identifier used in evidence paths
    description: string           # Natural-language persona brief for agents
    viewport:
      width: integer
      height: integer
    network: fast | slow3g | offline   # Optional network throttling
    auth: true | false            # Whether this persona should be logged in

journeys:
  - id: string
    description: string           # What this journey should accomplish
    start_url: string             # Relative URL where journey begins
    auth_required: boolean

budgets:
  max_duration_minutes: 15        # Fail if run exceeds this (default: 15)
  max_agent_cost_usd: 0.50        # Fail if LLM cost exceeds this
```

---

## LLM Support

LLM-enhanced analysis is optional but significantly improves issue quality and the situation report. TryLapse supports any OpenAI-compatible endpoint.

| Provider | Speed | Cost | Notes |
|---|---|---|---|
| **DeepSeek direct API** | Fast | Very low | Recommended. Set `DEEPSEEK_API_KEY`. |
| **NVIDIA NIM** | Slower | Free tier available | Set `NVIDIA_NIM_API_KEY`. |
| **OpenAI** | Fast | Standard | Set `OPENAI_API_KEY`. |
| **Any OpenAI-compatible** | Varies | Varies | Set `REHEARSE_LLM_*` env vars. |

Env precedence: `REHEARSE_LLM_*` → `DEEPSEEK_*` → `NVIDIA_*` → `OPENAI_API_KEY`

```bash
# DeepSeek (recommended)
DEEPSEEK_API_KEY=sk-... rehearse run -c app.yaml --llm

# Generic override
REHEARSE_LLM_API_KEY=... \
REHEARSE_LLM_BASE_URL=https://my-endpoint.com/v1 \
REHEARSE_LLM_MODEL=my-model \
rehearse run -c app.yaml --llm
```

---

## Watch the Demo

> **Note:** GitHub READMEs do not support embedded iframes. The video plays directly below — GitHub renders `<video>` tags in Markdown.

> If the video below does not play (it requires the rendered MP4 to be attached to this repo's [releases](../../releases)), you can render it locally with the instructions in the next section.

<video src="https://github.com/trylapse/trylapse-demo/releases/latest/download/trylapse-demo.mp4"
  controls autoplay loop muted playsinline
  style="width:100%;border-radius:12px;border:1px solid #1e2a3a;">
  <p>Your browser does not support the video tag. <a href="https://github.com/trylapse/trylapse-demo/releases/latest/download/trylapse-demo.mp4">Download the demo video</a>.</p>
</video>

### What the Demo Shows

The 45-second video walks through TryLapse end-to-end in six scenes:

| Scene | Duration | What you see |
|---|---|---|
| **Hero** | 3 s | TryLapse brand mark and tagline |
| **The Problem** | 7 s | Three real failure modes that reach production without systematic rehearsal |
| **Command Center** | 12 s | The dashboard: readiness gauge animates to 78/100 (Amber), situation report, stat cards, sparkline trend, recent runs table |
| **Running a Rehearsal** | 9 s | Cursor triggers a run; 4 persona agents stream log output in real time; a P0 blocker surfaces during the mobile-user checkout journey |
| **Run Results** | 10 s | Blocker list with evidence, a 12-point delight capture, 8-axis dimension bars all resolve to their scores |
| **Call to Action** | 7 s | trylapse.dev |

Every UI element in the demo is a faithful React replica of the real TryLapse dashboard — not a mock-up or a design tool export.

---

## Run the Demo Locally

The demo is built with [Remotion](https://remotion.dev) — a framework for creating videos programmatically in React. You need Node.js 18+ and npm.

### Preview (interactive scrubbing, hot reload)

```bash
git clone https://github.com/trylapse/trylapse-demo.git
cd trylapse-demo
npm install
npm run preview
# Opens Remotion Studio in your browser
# Scrub the timeline, inspect each frame, live-edit any scene
```

### Render to MP4

```bash
npm run render
# → out/trylapse-demo.mp4
# 1920×1080, 30 fps, H.264, ~45 seconds
```

### Render a GIF (shareable preview)

```bash
npm run render:gif
# → out/trylapse-demo.gif
# Suitable for sharing on social media or embedding in Notion/Linear
```

### Scripts

| Script | What it does |
|---|---|
| `npm run preview` | Opens Remotion Studio — interactive timeline scrubber, hot reload |
| `npm run render` | Renders full `1920×1080` H.264 MP4 |
| `npm run render:gif` | Renders GIF version |

---

## Video Architecture

The video is a single `TryLapseDemo` Remotion composition (1920×1080, 30 fps, 1365 frames = 45.5 s).

```
src/
├── index.tsx              # registerRoot() entry point
├── Root.tsx               # Composition registration (1365 frames)
├── TryLapseVideo.tsx      # Top-level <Sequence> orchestration with 15-frame crossfades
├── theme.ts               # Design token constants (colors, fonts)
│
├── components/
│   ├── BrowserFrame.tsx   # macOS dark-mode browser chrome (address bar, traffic lights)
│   ├── Cursor.tsx         # Animated mouse cursor with click state
│   ├── AnimatedNumber.tsx # Counting animation (useCurrentFrame interpolation)
│   └── TryLapseLogo.tsx   # The maze labyrinth SVG — computed from arc math, scales cleanly
│
└── scenes/
    ├── HeroScene.tsx       # Logo + tagline spring entrance (90 frames)
    ├── ProblemScene.tsx    # Three pain-point cards → bridge statement (210 frames)
    ├── DashboardScene.tsx  # Full Command Center replica with cursor interaction (360 frames)
    ├── RunScene.tsx        # Agent log stream in real time (270 frames)
    ├── RunDetailScene.tsx  # Blocker list + 8-axis dimension bars (300 frames)
    └── CTAScene.tsx        # Ship with confidence (210 frames)
```

### Scene transitions

Every clip fades out over its last 15 frames. The next clip fades in over its first 15 frames. Remotion `<Sequence from={n}>` components are positioned with a 15-frame overlap — during the overlap period both scenes render simultaneously in an `<AbsoluteFill>`, producing a clean cross-dissolve.

```tsx
// No Series — manual overlap gives true crossfade
<Sequence from={0}   durationInFrames={90}>  <HeroScene />       </Sequence>
<Sequence from={75}  durationInFrames={210}> <ProblemScene />    </Sequence>
<Sequence from={270} durationInFrames={360}> <DashboardScene />  </Sequence>
<Sequence from={615} durationInFrames={270}> <RunScene />        </Sequence>
<Sequence from={870} durationInFrames={300}> <RunDetailScene />  </Sequence>
<Sequence from={1155} durationInFrames={210}><CTAScene />        </Sequence>
```

### The maze logo

`TryLapseLogo` is a pure SVG component — no external asset. It generates every arc path programmatically from concentric ring definitions, so it scales cleanly from 28 px (sidebar icon) to 80 px (hero) without any rasterization.

```tsx
// Arc from clockwise-degrees startDeg to endDeg on circle of radius r
const arc = (r: number, startDeg: number, endDeg: number): string => { ... };

// 6 concentric rings + center dot + radial walls
const rings = [outerRing, ring5, ring4, ring3cross, ring2cross, ring1cross];
const walls = [innerCross, outerMazeWalls];
```

### Adapting this demo for your product

1. **Update brand colors** in `src/theme.ts`
2. **Update the logo** — replace arc definitions in `TryLapseLogo.tsx` with your own SVG paths, or swap the component entirely
3. **Edit scene copy** — all text is inline in each scene component, easy to find and change
4. **Adjust timing** — change `durationInFrames` per scene and recalculate `from` positions with the 15-frame overlap
5. **Add or remove scenes** — each scene is a self-contained React component; add a new `<Sequence>` block and write a new scene component

---

## Design Decisions

### Why Remotion?

Remotion lets us build the demo video in the same language as the product (React + TypeScript). Every UI element in the demo is actual React code — the same component patterns, the same design tokens, the same layout primitives. This means:
- The demo stays in sync with the product design by construction
- Designers and engineers can edit it in familiar tools
- Re-rendering a revised version takes one command, not a screen recording session

### Why no pre-recorded screen capture?

Screen captures require a running backend with seeded data, perfect timing, and no UI flicker. They go stale the moment the UI changes. A Remotion composition renders deterministically from source — same output, every time, in CI if needed.

### Why hard-coded mock data?

The demo uses realistic but synthetic data (readiness scores, persona names, issue titles, log lines). This is intentional:
- The demo works without a running backend
- We control the narrative (show the most illustrative findings, not whatever happened to be in the database)
- There is no risk of accidentally exposing customer data in a public video

---

## Frequently Asked Questions

<details>
<summary><strong>Does TryLapse require access to my source code?</strong></summary>

No. TryLapse runs entirely against your product's URL. It uses browser automation (Playwright) to interact with the rendered UI, exactly as a real user would. It does not require source code, build artifacts, or infrastructure access.

</details>

<details>
<summary><strong>Is my data sent anywhere?</strong></summary>

By default, all artifacts (screenshots, DOM snapshots, run data) are stored locally in your `artifacts/` directory. LLM analysis is opt-in — if you configure a `DEEPSEEK_API_KEY` or similar, the agent's observations are sent to that API endpoint. No data is sent to TryLapse servers.

</details>

<details>
<summary><strong>How is this different from Cypress, Playwright, or Selenium?</strong></summary>

Test frameworks like Cypress and Playwright require you to write test cases that assert specific outcomes. TryLapse is not a test framework — it is an *exploration* tool. It uses AI personas to navigate your product without pre-scripted assertions, finding issues that your written tests do not cover because they were not anticipated. The two are complementary.

</details>

<details>
<summary><strong>How is this different from synthetic monitoring tools (Datadog, Checkly)?</strong></summary>

Production synthetic monitoring is about detecting outages *after* they happen, on the production URL. TryLapse is about preventing issues from reaching production *before* they are promoted, on a staging or preview URL. TryLapse is a pre-deploy gate, not a post-deploy monitor.

</details>

<details>
<summary><strong>What does "evidence-bound" mean exactly?</strong></summary>

Every issue TryLapse files includes a screenshot from the moment of failure, the URL, the DOM element path, the persona, the journey step, and the observed vs. expected outcome. If the agent cannot produce this evidence, it does not file the issue. This prevents the false positives and vague "I couldn't complete this step" reports that plague LLM-based testing tools.

</details>

<details>
<summary><strong>What does a P0 vs P1 vs P2 issue mean?</strong></summary>

| Severity | Definition |
|---|---|
| **P0** | A journey is completely blocked. A real user cannot complete this flow. Fix before any promotion. |
| **P1** | A journey completes but with a significant defect — degraded experience, data loss risk, or major accessibility gap. Should be fixed before launch. |
| **P2** | A noticeable but non-blocking issue — cosmetic regression, confusing UX, minor performance degradation. Fix in the next sprint. |
| **P3** | Observation or low-priority improvement. Track in backlog. |

</details>

<details>
<summary><strong>How long does a rehearsal run take?</strong></summary>

Typical runs on a 40–60 page SaaS product with 4 personas and 3–5 journeys complete in **6–12 minutes**. The target SLA is under 15 minutes — fast enough to run as a deployment check in a CI pipeline.

</details>

<details>
<summary><strong>Can I run TryLapse in CI?</strong></summary>

Yes. `rehearse run` exits with code 0 on Green band and non-zero on Amber or Red. You can use this as a deployment gate in GitHub Actions, CircleCI, or any CI system.

```yaml
# .github/workflows/rehearsal.yml
- name: Run TryLapse rehearsal
  run: rehearse run -c app.yaml -o artifacts --llm
  env:
    DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
    REHEARSE_EMAIL: ${{ secrets.STAGING_EMAIL }}
    REHEARSE_PASSWORD: ${{ secrets.STAGING_PASSWORD }}
```

</details>

---

## Honesty Section

TryLapse is real and actively developed. Here is what it is and what it is not, stated plainly:

**It is:**
- A working CLI tool you can run today against a staging URL
- An AI-powered exploration tool that catches issues manual testing misses
- Evidence-bound — every finding is anchored to observable artifacts
- Honest about uncertainty — agents express confidence levels; low-confidence findings are flagged differently

**It is not:**
- A replacement for human QA — it catches a different class of issue, not all issues
- A guarantee that your product is bug-free — it is a readiness signal, not a certification
- Magic — it works best on products with stable staging environments and deterministic user flows
- Perfectly accurate — AI personas can misinterpret UI elements or miss context that a human would catch immediately

We think the right mental model is: TryLapse is a teammate who runs through your product before every release, files detailed bug reports, and gives you a confidence score. That teammate is faster than a human, works at 3am, costs $0.03 per run, and never forgets to test the iOS Safari checkout path. They also occasionally misread a disabled button as a blocker and need their reports reviewed by a human before filing a ticket. That is an honest description.

---

## Repository Structure

```
trylapse-demo/
├── README.md               # This file
├── package.json            # npm scripts: preview, render, render:gif
├── remotion.config.ts      # Remotion configuration
├── tsconfig.json
└── src/
    ├── index.tsx
    ├── Root.tsx
    ├── TryLapseVideo.tsx
    ├── theme.ts
    ├── components/
    │   ├── BrowserFrame.tsx
    │   ├── Cursor.tsx
    │   ├── AnimatedNumber.tsx
    │   ├── TryLapseLogo.tsx
    │   └── index.ts
    └── scenes/
        ├── HeroScene.tsx
        ├── ProblemScene.tsx
        ├── DashboardScene.tsx
        ├── RunScene.tsx
        ├── RunDetailScene.tsx
        └── CTAScene.tsx
```

---

## License

MIT © [TryLapse](https://github.com/trylapse)

The demo video source code is MIT-licensed. Adapt it, fork it, use it as a template for your own Remotion product demos.

---

<div align="center">

**[trylapse.dev](https://trylapse.dev)**

*Pre-launch readiness, observed.*

</div>
