# UnifyApps — Sales Engagement Platform: Technical Document

## Overview

A React-based sales engagement platform prototype with AI copilot integration across all modules. Built with Vite + React, deployed on GitHub Pages.

**Live URL:** https://nitish-unifyapps.github.io/sales-enablement/  
**Repo:** https://github.com/nitish-unifyapps/sales-enablement

---

## Architecture

- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (App.css)
- **State:** Local React state (useState/useEffect)
- **Data:** In-memory mock data (no backend)
- **Deployment:** GitHub Actions → GitHub Pages

---

## Module 1: Agentic Cadence — Sequences

**File:** `src/pages/Sequences.jsx`

### Features

| Feature | Description |
|---------|-------------|
| Sequence List | Table view with score, prospect counts, engagement metrics, owner |
| Prospects Tab | All prospects across sequences with inline sequence reassignment |
| Flow Builder | Vertical top-to-bottom tree with branching conditions (YES/NO paths) |
| AI Copilot | Context-aware per tab — generates sequences, adds steps via multi-turn chat |
| Step Properties Drawer | Right-side panel with full step configuration on node click |
| Branching Logic | Condition nodes split flow into parallel YES/NO paths |
| Collapsible Copilot | Toggle open/close, persists across tab switches |

### Data Model (Tree Structure)

```json
{
  "id": "start",
  "type": "trigger",
  "title": "Prospect Enters",
  "next": [
    {
      "id": "s1", "type": "auto_email", "title": "Intro Email", "day": 1,
      "next": [
        {
          "id": "c1", "type": "condition", "title": "Email Opened?",
          "branches": [
            { "label": "YES", "color": "#16a34a", "next": [...] },
            { "label": "NO", "color": "#dc2626", "next": [...] }
          ]
        }
      ]
    }
  ]
}
```

### Step Types

| Type | Label | Category |
|------|-------|----------|
| auto_email | Email | Automated |
| manual_email | Manual Email | Manual |
| phone | Call | Manual |
| linkedin_connect | LinkedIn | Automated |
| linkedin_msg | LinkedIn DM | Automated |
| task | Task | Manual |
| ai_branch | AI Branch | Automated |
| condition | Condition | Automated |

### Step Properties (Right Drawer)

- Type, Title, Description, Day
- Condition (engagement-based, reply-based, LinkedIn-based, escalation)
- Send Window, Timezone, Priority
- Template link, A/B Variant
- Max Retries, On Failure behavior

---

## Module 2: Templates

**Files:** `src/pages/Templates.jsx`, `src/pages/TemplateEditor.jsx`

### Features

| Feature | Description |
|---------|-------------|
| Template List | Cards with metrics (open rate, reply rate, meetings, sent count) |
| AI Copilot (List) | Generate templates via chat — intro emails, LinkedIn, breakup, follow-ups |
| Full Editor | 3-column layout: Copilot | Editor | Variable Panel |
| Variable System | 5 categories: Prospect, Account, Sender, Custom, Dynamic/AI |
| Variable Insertion | Click-to-insert at cursor position in subject or body |
| Live Preview | Shows variables replaced with readable labels |
| AI Writing Assistant | Draft, rewrite, shorten, adjust tone, add CTA/P.S. |

### Variable Categories

| Category | Fields |
|----------|--------|
| Prospect | first_name, last_name, email, title, phone, linkedin_url, city |
| Account | company, industry, size, revenue, website, HQ city |
| Sender | name, email, title, phone, company, calendar_link |
| Custom | pain_point, use_case, competitor, achievement, trigger_event |
| Dynamic | personalized_opener, case_study, value_prop, meeting_times |

---

## Module 3: Success Plan

**File:** `src/pages/SuccessPlan.jsx`

### Features

| Feature | Description |
|---------|-------------|
| KPI Performance Cards | Visual cards with progress bars, color-coded by status |
| Metric Rules Engine | Define rules: source + metric + operator + threshold + period |
| Metric Rules Table | Full CRUD — add, edit, view current vs target, Met/Below status |
| Milestones | CRUD with status cycle (pending→partial→done), priority, overdue detection |
| AI Copilot | Check status, suggest improvements, add rules via chat |

### Metric Rule Schema

```json
{
  "name": "Reply Rate",
  "source": "sequence | account",
  "metric": "reply_rate",
  "operator": ">= | <= | > | <",
  "threshold": 40,
  "unit": "% | $ | count | hrs",
  "period": "daily | weekly | monthly | quarterly",
  "current": 34,
  "status": "met | below"
}
```

---

## Module 4: Pipeline Analytics & Reporting

**File:** `src/pages/Pipeline.jsx`

### Views

| View | Description |
|------|-------------|
| Dashboard | 2-column layout with all analytics |
| Kanban Board | Drag-and-drop deal cards between stages |
| Table | Sortable columns, inline stage change, health bars |

### Dashboard Sections

1. **Stats Row** — Active Pipeline, Weighted, Closed Won, Win Rate, Avg Deal Size, At Risk
2. **Pipeline Funnel** — Stage conversion with bars and rates (2-col left)
3. **Deal Health Distribution** — Healthy/At Risk/Critical breakdown (2-col left)
4. **Stage Velocity** — Avg days per stage vs expected (2-col right)
5. **Deals Needing Attention** — At-risk deals table (2-col right)
6. **Activity → Revenue Funnel** — Calls→Conversations→Meetings→Pipeline→Closed Won
7. **What's Working** — Top-performing tactics with metrics
8. **Where We're Losing Deals** — Drop-off points with data
9. **Pipeline Attribution** — Breakdown by Sequence, Channel, Rep

### Deal Properties

- name, company, contact, value, stage, owner, closeDate, createdDate
- daysInStage, health (0-100), lastActivity, nextStep
- tags, source, activities count, stakeholders count

### Deal Inspection (click any deal)

- Key metrics: value, days in stage, activities, stakeholders
- Health signals: activity recency, stage aging, stakeholder engagement
- Quick stage-move buttons, delete

---

## Module 5: Forecast Rollup

**File:** `src/pages/ForecastRollup.jsx`

### Layout

| Column | Content |
|--------|---------|
| Left (300px) | Vertical funnel chart + attainment + submit form |
| Right (flex) | Tabbed: Team Rollup \| Deal Inspection |

### Features

- **Clickable metric cards** — filter deals by category (Closed/Commit/Best Case/Pipeline)
- **Vertical funnel** — Pipeline→Best Case→Commit→Closed Won with progress bars
- **Team Rollup tab** — Per-rep: quota, closed, commit, best case, pipeline, attainment bar, gap, submit status
- **Deal Inspection tab** — Filtered deals with 7-day change indicators
- **Drill-down** — Click rep to filter their deals
- **Manager override** — Submit forecast with optional override + notes

---

## Module 6: Scenario Planner

**File:** `src/pages/ScenarioPlanner.jsx`

### Layout

| Column | Content |
|--------|---------|
| Left (280px) | AI Copilot — run simulations via chat |
| Center (380px) | Input panel — sliders and configuration |
| Right (flex) | Results — outcomes, comparison, sensitivity |

### Features

- **Multiple scenarios** — Create, duplicate, remove, compare
- **Input variables** — Win rate per stage (sliders), pipeline amounts, slippage, volatility, ramp factor, net new, deal count
- **Run Simulation** — 10,000 Monte Carlo simulations (simulated)
- **Outcomes** — Bear/Fair/Bull case with probability definitions
- **Simulation Breakdown** — Step-by-step: pipeline→weighted→slippage→ramp→fair value
- **Stage Contribution** — Which stages contribute most to forecast
- **Multi-scenario Comparison Table** — Side-by-side when 2+ scenarios
- **Sensitivity Analysis** — Tornado chart showing variable impact
- **AI Copilot** — Run simulations, create optimistic/conservative scenarios, adjust variables via chat

---

## AI Copilot Integration

Present on every page with context-specific behavior:

| Page | Copilot Capabilities |
|------|---------------------|
| Sequences (Steps) | Generate sequences, add steps (multi-turn), adjust timing |
| Sequences (Prospects) | Add/remove prospects, check stuck, resume paused |
| Sequences (Settings) | Configure send windows, throttles, timezone |
| Templates (List) | Generate email/LinkedIn/call templates |
| Templates (Editor) | Draft, rewrite, shorten, adjust tone, add CTA |
| Success Plan | Check metrics status, suggest improvements, add rules |
| Pipeline | Show at-risk deals, pipeline coverage, move deals |
| Scenario Planner | Run simulations, create optimistic/conservative, adjust variables |

### Copilot Pattern (reused across all pages)

```jsx
// Collapsible sidebar with:
// 1. Header with close button
// 2. Chat message area (scrollable)
// 3. Conversation starters (shown on first load)
// 4. Input + send button
```

---

## File Structure

```
src/
├── App.jsx              # Main app + sidebar navigation
├── App.css              # Global styles
├── main.jsx             # Entry point
└── pages/
    ├── Sequences.jsx        # Sequence builder (tree flow + copilot)
    ├── Templates.jsx        # Template list + copilot
    ├── TemplateEditor.jsx   # Full editor (copilot + editor + variables)
    ├── SuccessPlan.jsx      # KPIs + rules + milestones + copilot
    ├── Pipeline.jsx         # Pipeline analytics + kanban + table + copilot
    ├── ForecastRollup.jsx   # Forecast rollup (2-col + tabs)
    └── ScenarioPlanner.jsx  # Scenario planner + copilot
```

---

## Navigation Structure

```
├── Agentic Cadence (collapsible)
│   ├── Sequences
│   ├── Templates
│   └── Success Plan
├── Pipeline Analytics & Reporting
└── Forecasting (collapsible)
    ├── Forecast Rollup
    └── Scenario Planner
```

---

## Key Design Decisions

1. **AI-first approach** — Every page has a copilot that can perform the same actions as the UI
2. **Tree-based sequence flow** — Supports branching conditions natively (not flat arrays)
3. **Collapsible copilot** — Doesn't obstruct workspace; toggleable per user preference
4. **Inline editing** — Step properties in right drawer, deal stage change inline, prospect reassignment via dropdown
5. **Rules engine for success metrics** — Configurable thresholds with data source linking (sequence or account)
6. **No external dependencies** — Pure React + CSS, no charting library, no drag-drop library
