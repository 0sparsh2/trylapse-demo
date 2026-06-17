<div align="center">

# TryLapse

**Pre-launch readiness, observed.**

*Send AI personas through your product before your users do.*

</div>

---

![TryLapse Command Center — readiness score 73/100, situation report, recent runs, stat cards](https://github.com/0sparsh2/trylapse-demo/releases/download/v1.0/dashboard.png)

<details>
<summary>▶ Watch the 45-second demo (MP4)</summary>

<video src="https://github.com/0sparsh2/trylapse-demo/releases/download/v1.0/trylapse-demo.mp4" controls autoplay loop muted playsinline width="100%"></video>

</details>

---

## What is TryLapse?

TryLapse is a pre-launch rehearsal tool. Before you promote a build, TryLapse sends synthetic AI personas through your product's critical user journeys — login, checkout, onboarding, export — and tells you exactly what broke, what worked, and whether you're ready to ship.

Every finding is backed by a screenshot, a DOM snapshot, and the network event that triggered it. Nothing is invented. If the agent can't show you evidence, it doesn't file the issue.

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
   evidence: screenshot + DOM snapshot saved

✓  Readiness score: 78/100 · Amber band
✓  Run complete · 8m 24s · $0.034 agent cost
```

---

## What the Demo Shows

The video above is a 45-second walkthrough of TryLapse rendered in React via [Remotion](https://remotion.dev). Every UI element is a faithful replica of the real dashboard — not a design mockup.

| Scene | What you see |
|---|---|
| **Hero** | Brand and tagline |
| **The Problem** | Three real failure modes that reach production without systematic pre-launch checks |
| **Command Center** | The dashboard: readiness gauge at 78/100, AI situation report, stat cards, sparkline, recent runs |
| **Running a Rehearsal** | 4 persona agents streaming log output in real time; a P0 surfaces in the mobile-user checkout flow |
| **Run Results** | Blocker list with evidence, highlights with persona quotes, 8-axis dimension scores |
| **CTA** | Ship with confidence |

---

## How It Works

TryLapse runs a five-phase pipeline against your staging URL:

1. **Crawler** — Playwright-powered deep crawl. Builds a route graph, identifies auth-gated routes, detects hub pages.
2. **Workflow detection** — Pattern-matches the crawl output to discover journeys you may not have explicitly defined.
3. **Journey runner** — Executes each journey end-to-end. Captures screenshots, DOM snapshots, network events, and Web Vitals at every step.
4. **Persona agents** — Each agent re-runs the journeys through the lens of a specific user archetype (device, viewport, auth state, behavioral bias). Agents file issues with severity and evidence; they also capture delights.
5. **Synthesizer** — Deduplicates findings, computes the 8-axis readiness score, writes the scorecard.

---

## The 8-Axis Readiness Score

| Axis | What it checks |
|---|---|
| Auth & Security | Login, SSO, session handling, token expiry |
| Core Flows | The product's primary value-delivering journeys |
| Performance | LCP, CLS, FID across personas and viewports |
| Accessibility | WCAG AA compliance, keyboard paths, screen reader |
| Error Handling | Network errors, invalid input, edge states |
| Conversion | Friction in signup, checkout, activation |
| Onboarding | First-run experience, time-to-value |
| Integration | Third-party deps, webhooks, export/import |

A **P0 in any dimension pulls the band to Amber or Red regardless of the composite score.** A silent checkout failure is not acceptable at any readiness level.

---

## Evidence, Not Assertions

Every issue includes:
- A screenshot from the moment of failure
- The DOM element path and the action taken
- The persona, journey, and step number
- The observed vs. expected outcome
- Network request/response if a form submission was involved

If an agent cannot produce this evidence, it does not file the issue.

---

## Severity Levels

| Severity | Meaning |
|---|---|
| **P0** | Journey completely blocked. Fix before any promotion. |
| **P1** | Journey completes with significant defect — data loss risk, major a11y gap. Fix before launch. |
| **P2** | Non-blocking but noticeable. Fix in the next sprint. |
| **P3** | Observation or low-priority improvement. Track in backlog. |

---

## Status

**TryLapse is currently in private development.** The source code is in a private repository. Public access and launch are coming soon.

If you're interested in early access or want to talk about integrating pre-launch rehearsal into your shipping workflow, reach out at [trylapse.dev](https://trylapse.dev).

---

## What Running It Looks Like

When you do run it, the interface is a simple config file:

```yaml
# my-app.yaml
run:
  name: "my-saas"
  target_url: "https://staging.my-app.com"

personas:
  - id: power-user
    description: "Experienced user, fast, keyboard-driven"
    viewport: { width: 1440, height: 900 }

  - id: mobile-user
    description: "iOS Safari, thumb navigation, slow 3G"
    viewport: { width: 390, height: 844 }
    network: slow3g

journeys:
  - id: checkout
    description: "Add item to cart, complete purchase"
    start_url: "/products"
```

Then a single command:

```bash
rehearse run -c my-app.yaml -o artifacts
```

Output: a readiness score, a blocker list with evidence, and a dashboard at `localhost:8765`.

---

## Honest About What It Is

**TryLapse is:**
- A working CLI you can run today against a staging URL
- An AI-powered exploration tool that catches issues manual testing misses
- Evidence-bound — every finding is anchored to observable artifacts
- A pre-deploy gate, not a post-deploy monitor

**TryLapse is not:**
- A replacement for human QA — it catches a different class of issue, not all issues
- A guarantee your product is bug-free — it is a readiness signal, not a certification
- Magic — it works best on products with stable staging environments
- Perfectly accurate — agents can misinterpret UI elements; reports should be reviewed before filing tickets

The right mental model: a teammate who runs through your product before every release, files detailed bug reports, and gives you a confidence score. Faster than a human, works at 3am, costs $0.03 per run. Occasionally misreads a disabled button as a blocker. Needs human review before acting on findings.

---

<div align="center">

*Built by the TryLapse team.*

</div>
