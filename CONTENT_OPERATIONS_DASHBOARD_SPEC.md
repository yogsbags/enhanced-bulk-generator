# Content Operations Dashboard: Frontend Architecture Specification

**Project:** PL Capital AI Content Engine Frontend
**Purpose:** Human-in-the-loop workflow management for automated content production
**Target:** 1,800 articles/year with quality control at every stage
**Tech Stack:** Next.js 14, Sanity Studio, TypeScript, Tailwind CSS

---

## Executive Summary

This document specifies a **Content Operations Dashboard** that enables content teams to:
1. Manage the 7-stage AI content workflow with approval gates
2. Review and approve content at each critical stage
3. Monitor performance metrics and optimize strategy
4. Collaborate across teams (SEO, Content, Editorial, Publishing)

**Key Principle:** Automation for speed + Human oversight for quality

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Workflow Stages & Approval Gates](#2-workflow-stages--approval-gates)
3. [Dashboard Navigation & Information Architecture](#3-dashboard-navigation--information-architecture)
4. [Stage-by-Stage UI Specifications](#4-stage-by-stage-ui-specifications)
5. [Component Library](#5-component-library)
6. [Data Flow & API Integration](#6-data-flow--api-integration)
7. [User Roles & Permissions](#7-user-roles--permissions)
8. [Performance Monitoring & Analytics](#8-performance-monitoring--analytics)
9. [Technical Implementation](#9-technical-implementation)
10. [Deployment & Scaling](#10-deployment--scaling)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Operations Dashboard                  │
│                         (Next.js 14 App)                         │
│                      http://localhost:3001                       │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ API Calls
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  Enhanced-    │       │    Sanity     │       │   WordPress   │
│  Bulk-        │       │     CMS       │       │   REST API    │
│  Generator    │◄─────►│  (Port 3333)  │◄─────►│  (Port 8080)  │
│  (Backend)    │       │               │       │               │
└───────────────┘       └───────────────┘       └───────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│  CSV Files    │       │  Sanity       │
│  (data/)      │       │  Documents    │
│  - research-  │       │  - topics     │
│    gaps.csv   │       │  - content    │
│  - topics.csv │       │  - published  │
│  - content.csv│       │               │
└───────────────┘       └───────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand or React Query
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table (React Table v8)
- **Charts:** Recharts or Tremor
- **Rich Text Editor:** Tiptap or Lexical
- **Markdown Preview:** react-markdown

**Backend Integration:**
- **Sanity Client:** @sanity/client for CMS operations
- **WordPress API:** WordPress REST API client
- **CSV Operations:** Papa Parse for CSV parsing
- **AI API:** Direct calls to Groq/OpenAI/Gemini

**Deployment:**
- **Hosting:** Vercel or self-hosted (Docker)
- **Database:** Sanity CMS (primary), PostgreSQL (optional for analytics)
- **Authentication:** NextAuth.js with role-based access

---

## 2. Workflow Stages & Approval Gates

### 2.1 Complete Workflow with Approval Gates

```
┌──────────────────────────────────────────────────────────────────┐
│                        STAGE 1: SEO RESEARCH                     │
│  AI analyzes competitors → Identifies 100 content gaps           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              🚦 APPROVAL GATE 1: Review Research Gaps            │
│  Human reviews 100 gaps → Approves top 50 → Rejects rest        │
│  Actions: Approve, Reject, Edit Priority, Bulk Actions          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    STAGE 2: TOPIC GENERATION                     │
│  AI generates 150 strategic topics from 50 approved gaps         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              🚦 APPROVAL GATE 2: Review Generated Topics         │
│  Human reviews 150 topics → Approves 50-100 for research        │
│  Actions: Approve, Reject, Edit Topic, Assign to Cluster        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   STAGE 3: DEEP TOPIC RESEARCH                   │
│  AI researches top 10 competitors per approved topic             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│           🚦 APPROVAL GATE 3: Review Topic Research              │
│  Human reviews research quality → Approves topics for content    │
│  Actions: Approve, Request Re-Research, Add Manual Insights      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    STAGE 4: CONTENT CREATION                     │
│  AI generates 3,000-5,000 word articles with E-E-A-T            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│           🚦 APPROVAL GATE 4: Review Generated Content           │
│  Human reviews content quality → Approves or requests edits      │
│  Actions: Approve, Edit Content, Regenerate, Reject              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    STAGE 5: SEO OPTIMIZATION                     │
│  AI adds meta tags, schema markup, internal links               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│           🚦 APPROVAL GATE 5: Review SEO Metadata                │
│  Human reviews SEO elements → Final approval for publishing      │
│  Actions: Approve for Publishing, Edit SEO, Request Changes      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    STAGE 6: PUBLICATION                          │
│  Publish to WordPress + Sanity + Next.js frontend               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  STAGE 7: PERFORMANCE TRACKING                   │
│  Monitor rankings, traffic, conversions → Optimize              │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Approval Gate Details

| Approval Gate | Decision Makers | Approval Criteria | Time Commitment |
|---------------|----------------|-------------------|-----------------|
| **Gate 1: Research Gaps** | SEO Lead, Content Strategist | Priority score ≥90, aligns with strategy | 30 min per 100 gaps |
| **Gate 2: Topic Selection** | Content Team Lead, Editors | Clear angle, matches pillar clusters | 45 min per 150 topics |
| **Gate 3: Topic Research** | Senior Editor, Subject Matter Expert | Research quality, competitor analysis depth | 1 hour per 50 topics |
| **Gate 4: Content Quality** | Senior Editor, Compliance Team | Quality score ≥90%, E-E-A-T compliance | 2-3 hours per 50 articles |
| **Gate 5: SEO Metadata** | SEO Lead, Content Lead | SEO score ≥80/100, schema valid | 45 min per 50 articles |

---

## 3. Dashboard Navigation & Information Architecture

### 3.1 Main Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  │  📊 Workflow  │  📝 Content  │  🎯 Pillars  │   │
│               │               │             │              │  👤 │
└─────────────────────────────────────────────────────────────────┘
```

**Top-Level Menu:**
1. **🏠 Dashboard** - Overview, metrics, quick actions
2. **📊 Workflow** - Stage-by-stage pipeline view
3. **📝 Content** - All content library (drafts, published)
4. **🎯 Pillars & Clusters** - Topical map management
5. **📈 Analytics** - Performance tracking
6. **⚙️ Settings** - Configuration, integrations, team

### 3.2 Dashboard Home (Landing Page)

**Layout:** 3-column grid with widgets

```
┌─────────────────────────────────────────────────────────────────┐
│                     Content Operations Dashboard                 │
│                           Welcome back, Sarah                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ 🚦 Pending       │  │ 📊 This Month    │  │ 🎯 Goal      │ │
│  │ Approvals: 23    │  │ Published: 47/50 │  │ Progress     │ │
│  │                  │  │ Approved: 68     │  │ 94% ████████ │ │
│  │ [Review Now]     │  │ In Progress: 112 │  │ 1800/yr goal │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Workflow Pipeline Status                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Stage 1: Research        █████░░░░░  23 items pending    │  │
│  │ Stage 2: Topics          ████░░░░░░  15 items pending    │  │
│  │ Stage 3: Deep Research   ████████░░  45 items in progress│  │
│  │ Stage 4: Content         ██░░░░░░░░   8 items pending    │  │
│  │ Stage 5: SEO             ███████░░░  32 items pending    │  │
│  │ Stage 6: Publishing      ██████████  Ready to publish    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Recent Activity (Live Feed)                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ 🤖 AI generated 15 topics from "HNI Tax Planning"        │  │
│  │ ✅ @john approved 12 topics for research                 │  │
│  │ 📝 Content created: "MTF Complete Guide"                 │  │
│  │ 🚀 Published: "F&O Trading with ₹2L Capital"            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Quick Actions │  │ Top Pillars   │  │ Recent Wins   │        │
│  │              │  │              │  │              │        │
│  │ • Review     │  │ 1. MTF       │  │ Ranked #1:   │        │
│  │   Research   │  │    (190 art) │  │ 12 keywords  │        │
│  │ • Approve    │  │ 2. F&O       │  │              │        │
│  │   Topics     │  │    (240 art) │  │ Traffic↑23%  │        │
│  │ • Publish    │  │ 3. Estate    │  │ this week    │        │
│  │   Content    │  │    (300 art) │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Stage-by-Stage UI Specifications

### 4.1 Stage 1: Research Gap Review

**Page Route:** `/workflow/research-gaps`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 1: Research Gap Review                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 Summary: 100 gaps identified | 23 pending review      │   │
│  │ Status: ⏳ Awaiting Approval                             │   │
│  │                                                          │   │
│  │ [Auto-Approve Score ≥90] [Bulk Approve Selected]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🔍 Filters:                                                     │
│  [All] [Pending] [Approved] [Rejected]                          │
│  Priority: [All ▼] Pillar: [All ▼] Client Segment: [All ▼]     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Research Gaps Table                    │  │
│  ├────┬─────────────────────────┬──────┬────────┬──────────┤  │
│  │ ☐  │ Gap Title               │Score │ Pillar │ Action   │  │
│  ├────┼─────────────────────────┼──────┼────────┼──────────┤  │
│  │ ☐  │ MTF Interest Cost       │ 95   │ MTF    │ [View]   │  │
│  │    │ Calculator              │ ⭐⭐⭐│        │ [Approve]│  │
│  │    │ Target: Mass Affluent   │      │        │ [Reject] │  │
│  ├────┼─────────────────────────┼──────┼────────┼──────────┤  │
│  │ ☐  │ F&O Tax ITR-3 Filing    │ 92   │ F&O    │ [View]   │  │
│  │    │ Target: Mass Affluent   │ ⭐⭐⭐│        │ [Approve]│  │
│  │    │                         │      │        │ [Reject] │  │
│  ├────┼─────────────────────────┼──────┼────────┼──────────┤  │
│  │ ☐  │ Estate Planning Trust   │ 88   │ Estate │ [View]   │  │
│  │    │ Target: HNI/UHNI        │ ⭐⭐ │        │ [Approve]│  │
│  │    │                         │      │        │ [Reject] │  │
│  └────┴─────────────────────────┴──────┴────────┴──────────┘  │
│                                                                  │
│  Showing 1-25 of 100 | [< Prev] [1] [2] [3] [4] [Next >]       │
└─────────────────────────────────────────────────────────────────┘
```

**Clicking [View] opens a detail modal:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Gap Detail: MTF Interest Cost Calculator                 [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gap ID: GAP-001                                                │
│  Priority Score: 95/100 ⭐⭐⭐                                   │
│  Pillar: Margin Trading Facility (MTF)                          │
│  Client Segment: Mass Affluent (₹50L-₹2Cr AUM)                 │
│  Keyword: "MTF interest calculator India"                       │
│  Search Volume: 1,800/month | Difficulty: 28/100                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AI Research Summary:                                      │  │
│  │ • 95% of competitors lack MTF calculators                │  │
│  │ • m.Stock, Kotak, HDFC Sky, Dhan have different rates    │  │
│  │ • Gap: No comparison tool exists for ₹50K-₹5L capital    │  │
│  │ • Revenue Impact: Direct MTF interest income driver      │  │
│  │                                                          │  │
│  │ Competitor Analysis:                                      │  │
│  │ 1. Zerodha: No MTF calculator                            │  │
│  │ 2. Groww: Basic margin info only                         │  │
│  │ 3. ET Money: No coverage                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Strategic Notes (editable):                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PRIMARY REVENUE DRIVER - prioritize in Month 1           │  │
│  │ Link to broker comparison articles                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Decision:                                                       │
│  [✅ Approve for Topic Generation] [❌ Reject] [📝 Edit]        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Sortable/filterable table
- Inline approve/reject buttons
- Bulk selection with checkboxes
- Auto-approve feature (score ≥90)
- Detail view with AI research summary
- Editable notes field
- Export to CSV option

---

### 4.2 Stage 2: Topic Review & Approval

**Page Route:** `/workflow/topics`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 2: Topic Review & Cluster Assignment           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 150 topics generated | 23 pending review                     │
│                                                                  │
│  [Assign to Pillar Clusters] [Approve Selected (15)]            │
│                                                                  │
│  🎯 Cluster View:                                                │
│  [List View] [Pillar Cluster View] [Kanban Board]               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Pillar Cluster: MTF (Pillar 1)              │  │
│  │               Target: 190 articles total                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Primary Clusters (80 articles):                         │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ MTF Mechanics & Setup (15 articles)             │    │  │
│  │  │ • How MTF Works: 4X-5X Leverage [APPROVED]      │    │  │
│  │  │ • MTF vs Regular Equity Trading [PENDING]       │    │  │
│  │  │ • MTF Eligibility Criteria [PENDING]            │    │  │
│  │  │ [+ Add Topic to This Cluster]                   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ MTF Interest Cost Analysis (12 articles)        │    │  │
│  │  │ • MTF Interest Rate Comparison [APPROVED]       │    │  │
│  │  │ • MTF Interest Calculator [PENDING] ⭐          │    │  │
│  │  │ [+ Add Topic to This Cluster]                   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                          │  │
│  │  Secondary Clusters (60 articles):                       │  │
│  │  • MTF vs leverage products (10 articles)                │  │
│  │  • MTF tax implications (8 articles)                     │  │
│  │  [Expand to view topics]                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Unassigned Topics (23)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ☐ "MTF Square-Off Rules: Auto-Liquidation Triggers"     │  │
│  │   → Suggested Cluster: MTF Mechanics & Setup             │  │
│  │   [Approve & Assign] [Reject] [Change Cluster ▼]        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ☐ "F&O Loss Carry-Forward: 8-Year Rule Explained"       │  │
│  │   → Suggested Cluster: F&O Tax Planning                  │  │
│  │   [Approve & Assign] [Reject] [Change Cluster ▼]        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Topic Detail Modal:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Topic: MTF Interest Calculator for ₹50K-₹5L Capital      [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Topic ID: TOPIC-042                                            │
│  Generated from Gap: GAP-001 (MTF Interest Cost Calculator)     │
│  Suggested Pillar: MTF > Primary Cluster > Interest Analysis    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Proposed Article Title (editable):                       │  │
│  │ "MTF Interest Calculator: Daily Cost for ₹50K, ₹1L,     │  │
│  │  ₹2L, ₹5L Positions"                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Target Keywords:                                                │
│  • Primary: "MTF interest calculator" (380/mo, 22 difficulty)   │
│  • Secondary: "margin trading facility cost", "MTF charges"     │
│                                                                  │
│  Content Angle (AI-suggested):                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Compare interest costs across 4 brokers                │  │
│  │ • Interactive calculator for different capital sizes     │  │
│  │ • Break-even analysis by holding period                  │  │
│  │ • Show examples: 7 days, 15 days, 30 days               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Strategic Priority: ⭐⭐⭐ High (Revenue Driver)                │
│  Estimated Word Count: 3,000-3,500 words                        │
│  Estimated Ranking Time: 30-60 days                             │
│                                                                  │
│  Assign to Cluster:                                              │
│  [MTF > Primary > Interest Cost Analysis ▼]                     │
│                                                                  │
│  [✅ Approve for Research] [❌ Reject] [📝 Edit Details]        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Cluster-based organization
- Drag-and-drop topic assignment
- AI-suggested cluster placement
- Visual progress bars (articles per cluster)
- Kanban board view option
- Bulk approval by cluster

---

### 4.3 Stage 3: Deep Research Review

**Page Route:** `/workflow/research`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 3: Deep Topic Research Review                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 45 topics researched | 8 pending final approval              │
│                                                                  │
│  [Approve All with Quality ≥85%] [Request Re-Research]          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Research Quality Dashboard                 │  │
│  ├────┬──────────────────────┬─────────┬──────────┬─────────┤  │
│  │ ☐  │ Topic                │ Quality │ Sources  │ Action  │  │
│  ├────┼──────────────────────┼─────────┼──────────┼─────────┤  │
│  │ ☐  │ MTF Interest Calc    │ 92% ⭐  │ 12 sites │ [View]  │  │
│  │    │ Status: Ready        │         │ analyzed │ [✅]    │  │
│  ├────┼──────────────────────┼─────────┼──────────┼─────────┤  │
│  │ ☐  │ F&O ITR-3 Filing     │ 88% ⭐  │ 10 sites │ [View]  │  │
│  │    │ Status: Ready        │         │ analyzed │ [✅]    │  │
│  ├────┼──────────────────────┼─────────┼──────────┼─────────┤  │
│  │ ☐  │ Estate Trust Setup   │ 78% ⚠   │ 8 sites  │ [View]  │  │
│  │    │ Status: Needs Review │         │ analyzed │ [🔄]    │  │
│  └────┴──────────────────────┴─────────┴──────────┴─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Research Detail View:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Research: MTF Interest Calculator                         [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Quality Score: 92/100 ⭐⭐⭐                                    │
│  Sources Analyzed: 12 competitors                               │
│  Research Depth: Comprehensive ✅                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Competitor Content Analysis                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │ Top 10 Ranking URLs:                                     │  │
│  │ 1. zerodha.com/charges (Word Count: 1,200, No calc)     │  │
│  │ 2. kotak.com/mtf (Word Count: 800, Basic info only)     │  │
│  │ 3. groww.in/blog/mtf (Word Count: 1,500, No examples)   │  │
│  │ ... [Show All]                                           │  │
│  │                                                          │  │
│  │ Content Gaps Identified:                                 │  │
│  │ ✅ No interactive calculator found                       │  │
│  │ ✅ Missing: Multi-broker comparison                      │  │
│  │ ✅ Missing: Capital-specific examples (₹50K-₹5L)        │  │
│  │ ✅ Missing: Break-even analysis                          │  │
│  │                                                          │  │
│  │ Our Superiority Strategy:                                │  │
│  │ • Build interactive calculator (unique)                  │  │
│  │ • Compare 4 brokers side-by-side                         │  │
│  │ • Add 12 worked examples                                 │  │
│  │ • Include risk warnings (SEBI compliance)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             SEO Intent Analysis                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Search Intent: Informational + Tool/Calculator           │  │
│  │ User Questions (People Also Ask):                        │  │
│  │ • "How is MTF interest calculated?"                      │  │
│  │ • "Which broker has lowest MTF interest rate?"           │  │
│  │ • "MTF interest charged daily or monthly?"               │  │
│  │ • "How to minimize MTF interest cost?"                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Manual Notes (add your insights):                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Add notes about regulatory requirements, compliance,    │  │
│  │  or specific angles to emphasize...]                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [✅ Approve for Content Creation] [🔄 Re-Research] [❌ Reject]│
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Quality score visualization
- Competitor analysis summary
- Content gap highlighting
- Search intent breakdown
- Manual notes field for SME input
- Re-research option for low quality

---

### 4.4 Stage 4: Content Review & Editing

**Page Route:** `/workflow/content`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 4: Content Review & Approval                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 45 articles created | 8 pending editorial review             │
│                                                                  │
│  [Approve All with Score ≥90%] [Assign to Editor]               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Content Quality Dashboard                    │  │
│  ├────┬──────────────────┬────────┬────────┬──────┬────────┤  │
│  │ ☐  │ Article          │Quality │E-E-A-T │Words │Action  │  │
│  ├────┼──────────────────┼────────┼────────┼──────┼────────┤  │
│  │ ☐  │ MTF Interest     │ 94% ⭐ │ 88%    │3,420 │[Edit]  │  │
│  │    │ Calculator       │        │ ✅     │      │[✅]    │  │
│  │    │ Status: Ready    │        │        │      │[🔄]    │  │
│  ├────┼──────────────────┼────────┼────────┼──────┼────────┤  │
│  │ ☐  │ F&O ITR-3        │ 91% ⭐ │ 85%    │3,180 │[Edit]  │  │
│  │    │ Filing Guide     │        │ ✅     │      │[✅]    │  │
│  │    │ Status: Ready    │        │        │      │[🔄]    │  │
│  └────┴──────────────────┴────────┴────────┴──────┴────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Content Editor View (Split Screen):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Article: MTF Interest Calculator Guide                   [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Preview] [Edit Mode] [AI Suggestions] [Comments]              │
│                                                                  │
│  Quality Score: 94/100 ⭐⭐⭐                                    │
│  E-E-A-T Score: 88/100 ✅                                       │
│  Word Count: 3,420 words ✅ (Target: 3,000-4,000)               │
│  Readability: Grade 8 ✅                                         │
│  SEO Score: Pending (Stage 5)                                   │
│                                                                  │
│  ┌─────────────────┬──────────────────────────────────────┐    │
│  │ Editor Panel    │ Preview Panel                        │    │
│  ├─────────────────┼──────────────────────────────────────┤    │
│  │                 │                                      │    │
│  │ # MTF Interest  │ # MTF Interest Calculator: Daily     │    │
│  │ Calculator...   │   Cost for ₹50K, ₹1L, ₹2L, ₹5L...  │    │
│  │                 │                                      │    │
│  │ Margin Trading  │ Margin Trading Facility (MTF) allows│    │
│  │ Facility allows │ retail traders to leverage...       │    │
│  │ ...             │                                      │    │
│  │                 │ [Interactive Calculator Widget]      │    │
│  │ [Calculator     │                                      │    │
│  │  component]     │ ## Interest Rate Comparison          │    │
│  │                 │                                      │    │
│  │ ## Interest     │ | Broker | Rate  | ₹1L MTF Cost |   │    │
│  │ Rate Comparison │ |--------|-------|---------------|   │    │
│  │                 │ | m.Stock| 6.99% | ₹19/day      |   │    │
│  │ | Broker | Rate │ | Kotak  | 9.69% | ₹27/day      |   │    │
│  │ ...             │                                      │    │
│  │                 │ ...                                  │    │
│  │ [Formatting     │                                      │    │
│  │  Toolbar]       │ [Scroll to see full article]        │    │
│  │ B I U H1 H2 H3  │                                      │    │
│  │ List Table Link │                                      │    │
│  │                 │                                      │    │
│  └─────────────────┴──────────────────────────────────────┘    │
│                                                                  │
│  📊 Content Quality Analysis:                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✅ Experience signals: Personal calculator examples      │  │
│  │ ✅ Expertise signals: SEBI regulations cited             │  │
│  │ ✅ Authority signals: Broker data verified               │  │
│  │ ⚠  Trust signals: Add author bio, last updated date      │  │
│  │                                                          │  │
│  │ ✅ Compliance Check:                                     │  │
│  │    • SEBI disclosure present                             │  │
│  │    • Risk warnings included                              │  │
│  │    • No investment advice language                       │  │
│  │                                                          │  │
│  │ 💬 AI Suggestions (3):                                   │  │
│  │ 1. Add FAQ section for "MTF interest calculation"       │  │
│  │ 2. Include visual flowchart for interest accrual        │  │
│  │ 3. Link to "MTF Risk Management" article (internal)     │  │
│  │    [Apply All] [Review Individual]                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💬 Comments (2):                                                │
│  • @sarah: "Add specific example for ₹2L capital" - Resolved   │
│  • @john: "Verify Kotak interest rate - seems outdated"        │
│    [Reply]                                                       │
│                                                                  │
│  Actions:                                                        │
│  [💾 Save Draft] [✅ Approve for SEO] [🔄 Regenerate Section]  │
│  [👤 Assign to SME] [❌ Reject]                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Side-by-side editor + preview
- Rich text editor (Tiptap/Lexical)
- Real-time quality scoring
- AI-powered suggestions
- Commenting/collaboration
- E-E-A-T compliance checker
- Version history
- Regenerate specific sections

---

### 4.5 Stage 5: SEO Metadata Review

**Page Route:** `/workflow/seo`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 5: SEO Optimization Review                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 32 articles optimized | 12 pending final SEO approval        │
│                                                                  │
│  [Approve All with SEO Score ≥80] [Bulk Edit Meta Tags]         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                SEO Quality Dashboard                      │  │
│  ├────┬──────────────┬─────────┬────────┬──────────┬───────┤  │
│  │ ☐  │ Article      │SEO Score│Keywords│Int.Links│Action │  │
│  ├────┼──────────────┼─────────┼────────┼──────────┼───────┤  │
│  │ ☐  │ MTF Interest │ 92/100  │ 3/3 ✅ │ 12 links │[View] │  │
│  │    │ Calculator   │ ⭐⭐⭐   │        │ ✅       │[✅]   │  │
│  ├────┼──────────────┼─────────┼────────┼──────────┼───────┤  │
│  │ ☐  │ F&O ITR-3    │ 88/100  │ 3/3 ✅ │ 10 links │[View] │  │
│  │    │ Filing       │ ⭐⭐⭐   │        │ ✅       │[✅]   │  │
│  └────┴──────────────┴─────────┴────────┴──────────┴───────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**SEO Detail View:**

```
┌─────────────────────────────────────────────────────────────────┐
│  SEO Review: MTF Interest Calculator                      [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Overall SEO Score: 92/100 ⭐⭐⭐                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Meta Tags (editable)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Title Tag (58 chars): ✅                                 │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ MTF Interest Calculator India: ₹50K-₹5L Cost 2025  │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │ Preview: MTF Interest Calculator India: ₹50K-₹5L...     │  │
│  │                                                          │  │
│  │ Meta Description (156 chars): ✅                         │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Calculate MTF interest costs across m.Stock,       │  │  │
│  │ │ Kotak, HDFC Sky, Dhan. Compare rates for ₹50K-₹5L │  │  │
│  │ │ capital with examples. SEBI compliance guide.      │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ URL Slug: ✅                                             │  │
│  │ /mtf-interest-calculator-india                           │  │
│  │                                                          │  │
│  │ Focus Keyword: "MTF interest calculator" ✅              │  │
│  │ Density: 1.2% (optimal) | Found in: Title, H1, H2, URL  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Schema Markup (auto-generated)                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ✅ Article schema (JSON-LD)                              │  │
│  │ ✅ FAQPage schema (5 questions)                          │  │
│  │ ✅ HowTo schema (calculator steps)                       │  │
│  │ ⚠  BreadcrumbList (verify hierarchy)                     │  │
│  │                                                          │  │
│  │ [Preview Schema] [Edit JSON-LD] [Validate]              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Internal Linking (12 links)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Pillar Link: ✅ "Complete Guide to MTF in India"         │  │
│  │                                                          │  │
│  │ Related Cluster Links:                                   │  │
│  │ ✅ "MTF Risk Management 2X vs 5X Leverage"               │  │
│  │ ✅ "MTF Broker Comparison: Best Rates"                   │  │
│  │ ✅ "How MTF Works: 4X-5X Leverage Explained"             │  │
│  │                                                          │  │
│  │ Cross-Cluster Links:                                     │  │
│  │ ✅ "F&O Tax Planning ITR-3" (Tax cluster)                │  │
│  │ ✅ "Intraday vs MTF Leverage" (Intraday cluster)         │  │
│  │                                                          │  │
│  │ [Add More Links] [Check for Broken Links]               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             On-Page SEO Checklist                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ✅ H1 tag includes focus keyword                          │  │
│  │ ✅ H2/H3 tags optimized for LSI keywords                  │  │
│  │ ✅ Images have descriptive alt text (8/8)                 │  │
│  │ ✅ First paragraph includes focus keyword                 │  │
│  │ ✅ Table of contents added                                │  │
│  │ ✅ FAQ section added (targets PAA)                        │  │
│  │ ⚠  Meta image for social sharing (add OG image)          │  │
│  │ ✅ Readability score: Grade 8 (target audience)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [✅ Approve for Publishing] [📝 Edit SEO] [❌ Reject]          │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Live meta tag preview (Google SERP simulation)
- Schema markup editor with validation
- Internal linking suggestions (AI-powered)
- SEO checklist with real-time scoring
- Keyword density analyzer
- Competing SERP preview

---

### 4.6 Stage 6: Publishing Queue

**Page Route:** `/workflow/publish`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow > Stage 6: Publishing Queue                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Ready to Publish: 15 articles | Scheduled: 23 articles       │
│                                                                  │
│  [🚀 Publish Selected Now] [📅 Schedule Publishing]              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Publishing Strategy                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Publishing Rate: 4 articles/day (aligned with 1800/yr)   │  │
│  │ Optimal Times: Mon-Fri 9AM, 2PM (IST)                    │  │
│  │ Pillar Priority: MTF → F&O → Estate Planning             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Tabs: [Ready Now (15)] [Scheduled (23)] [Published (147)]      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Ready to Publish Queue                       │  │
│  ├────┬─────────────────┬────────┬──────────┬─────────┬────┤  │
│  │ ☐  │ Article         │Pillar  │Platforms │Schedule │Act │  │
│  ├────┼─────────────────┼────────┼──────────┼─────────┼────┤  │
│  │ ☐  │ MTF Interest    │ MTF    │ WP+San+  │ Now     │[🚀]│  │
│  │    │ Calculator      │ Pillar │ Next.js  │         │    │  │
│  │    │ (Priority ⭐⭐⭐)│        │ ✅✅✅   │         │    │  │
│  ├────┼─────────────────┼────────┼──────────┼─────────┼────┤  │
│  │ ☐  │ F&O ITR-3       │ F&O    │ WP+San+  │ Today   │[📅]│  │
│  │    │ Filing Guide    │ Pillar │ Next.js  │ 2:00 PM │    │  │
│  │    │ (Priority ⭐⭐) │        │ ✅✅✅   │         │    │  │
│  └────┴─────────────────┴────────┴──────────┴─────────┴────┘  │
│                                                                  │
│  [Select All] [Publish to WordPress] [Publish to Sanity]        │
│  [Publish to All Platforms]                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Publishing Confirmation Modal:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Publish Article: MTF Interest Calculator                 [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You are about to publish to 3 platforms:                       │
│                                                                  │
│  ✅ WordPress (http://localhost:8080)                           │
│     Status: Draft → Publish                                     │
│     Category: /wealth-insights/trading/mtf/                     │
│     Author: PL Capital Editorial Team                           │
│                                                                  │
│  ✅ Sanity CMS (Project: plcapital-content)                     │
│     Dataset: production                                          │
│     Document Type: post                                         │
│     Slug: mtf-interest-calculator-india                         │
│                                                                  │
│  ✅ Next.js Frontend (http://localhost:3001)                    │
│     Public URL: /posts/mtf-interest-calculator-india            │
│     Build: Triggered automatically via webhook                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Publishing Options:                                       │  │
│  │ ☐ Send to social media (Twitter, LinkedIn)              │  │
│  │ ☐ Add to newsletter queue                                │  │
│  │ ☐ Notify team on Slack                                   │  │
│  │ ☑ Index on Google Search Console                        │  │
│  │ ☑ Generate XML sitemap entry                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Publish Schedule:                                               │
│  ⦿ Publish Immediately                                           │
│  ○ Schedule for: [Date Picker] [Time Picker]                    │
│                                                                  │
│  [🚀 Confirm & Publish] [Cancel]                                │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Multi-platform publishing (WordPress + Sanity + Next.js)
- Scheduling calendar
- Bulk publishing
- Publishing strategy recommendations
- Automatic social sharing
- GSC indexing integration

---

## 5. Component Library

### 5.1 Reusable UI Components

**Core Components:**

1. **DataTable Component** (`components/ui/DataTable.tsx`)
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowSelect?: (rows: T[]) => void;
  onRowClick?: (row: T) => void;
  filters?: Filter[];
  pagination?: boolean;
  bulkActions?: BulkAction[];
}

// Features:
// - Sortable columns
// - Multi-select checkboxes
// - Inline action buttons
// - Customizable filters
// - Export to CSV
// - Pagination controls
```

2. **ApprovalButton Component** (`components/workflow/ApprovalButton.tsx`)
```typescript
interface ApprovalButtonProps {
  status: 'pending' | 'approved' | 'rejected';
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

// Variants:
// - ✅ Approve (green)
// - ❌ Reject (red)
// - 🔄 Re-process (orange)
// - 📝 Edit (blue)
```

3. **QualityScoreBadge Component** (`components/metrics/QualityScoreBadge.tsx`)
```typescript
interface QualityScoreBadgeProps {
  score: number; // 0-100
  type: 'quality' | 'eeat' | 'seo' | 'research';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Color coding:
// 90-100: Green (⭐⭐⭐ Excellent)
// 80-89:  Blue  (⭐⭐ Good)
// 70-79:  Yellow (⭐ Fair)
// 0-69:   Red   (⚠ Needs Work)
```

4. **DetailModal Component** (`components/ui/DetailModal.tsx`)
```typescript
interface DetailModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Features:
// - Close on overlay click
// - ESC key to close
// - Footer action buttons
// - Responsive sizing
// - Scroll handling
```

5. **WorkflowStageIndicator Component** (`components/workflow/StageIndicator.tsx`)
```typescript
interface StageIndicatorProps {
  currentStage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stageStatus: {
    [key: number]: {
      completed: number;
      total: number;
      status: 'idle' | 'active' | 'completed';
    };
  };
}

// Visual:
// Stage 1 ━━━━ Stage 2 ━━━━ Stage 3 ... Stage 7
//   ✅           🔵           ⏸              ⚪
```

6. **PillarClusterTree Component** (`components/content/PillarClusterTree.tsx`)
```typescript
interface PillarClusterTreeProps {
  pillar: {
    id: string;
    name: string;
    primaryClusters: Cluster[];
    secondaryClusters: Cluster[];
    supportingContent: Content[];
  };
  onTopicClick: (topicId: string) => void;
  expandable?: boolean;
}

// Features:
// - Collapsible tree structure
// - Progress bars per cluster
// - Color-coded by status
// - Drag-and-drop topic assignment
```

7. **RichTextEditor Component** (`components/content/RichTextEditor.tsx`)
```typescript
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => Promise<void>;
  format: 'markdown' | 'html';
  toolbar?: ToolbarConfig;
  aiSuggestions?: boolean;
}

// Using: Tiptap or Lexical
// Features:
// - Markdown support
// - AI-powered suggestions
// - Version history
// - Collaborative editing (future)
```

8. **SEOMetaEditor Component** (`components/seo/SEOMetaEditor.tsx`)
```typescript
interface SEOMetaEditorProps {
  title: string;
  description: string;
  slug: string;
  focusKeyword: string;
  onChange: (field: string, value: string) => void;
  onValidate: () => ValidationResult;
}

// Features:
// - Character count (with limits)
// - SERP preview simulation
// - Keyword density checker
// - Auto-suggestions
```

### 5.2 Layout Components

**Navigation Components:**

1. **TopNavBar** - Logo, main menu, user profile
2. **SidebarNav** - Workflow stages, quick links
3. **BreadcrumbNav** - Page hierarchy navigation

**Dashboard Widgets:**

1. **MetricCard** - KPI display (published count, pending approvals, etc.)
2. **ProgressBar** - Visual progress indicator
3. **ActivityFeed** - Real-time updates stream
4. **QuickActionPanel** - Frequently used actions

---

## 6. Data Flow & API Integration

### 6.1 Backend API Architecture

**Enhanced-Bulk-Generator Backend:**

```typescript
// Base URL: http://localhost:4000/api (example)

// Stage 1: Research API
GET    /api/research/gaps                    // Get all research gaps
POST   /api/research/gaps                    // Trigger new research
PATCH  /api/research/gaps/:id/approve        // Approve/reject gap
GET    /api/research/gaps/:id                // Get gap details

// Stage 2: Topic API
GET    /api/topics                           // Get all generated topics
POST   /api/topics                           // Generate topics from approved gaps
PATCH  /api/topics/:id/approve               // Approve/reject topic
PATCH  /api/topics/:id/cluster               // Assign to pillar cluster
GET    /api/topics/:id                       // Get topic details

// Stage 3: Deep Research API
GET    /api/research/deep                    // Get all deep research
POST   /api/research/deep/:topicId           // Trigger deep research for topic
PATCH  /api/research/deep/:id/approve        // Approve/reject research
GET    /api/research/deep/:id                // Get research details

// Stage 4: Content API
GET    /api/content                          // Get all created content
POST   /api/content/:topicId                 // Generate content from topic
PATCH  /api/content/:id                      // Update content (manual edits)
PATCH  /api/content/:id/approve              // Approve/reject content
POST   /api/content/:id/regenerate           // Regenerate section

// Stage 5: SEO API
GET    /api/seo                              // Get all SEO-optimized content
POST   /api/seo/:contentId                   // Optimize content for SEO
PATCH  /api/seo/:id/metadata                 // Update SEO metadata
PATCH  /api/seo/:id/approve                  // Approve for publishing
GET    /api/seo/:id/preview                  // SERP preview

// Stage 6: Publishing API
POST   /api/publish/:contentId               // Publish to platforms
GET    /api/publish/queue                    // Get publishing queue
POST   /api/publish/schedule                 // Schedule publish
DELETE /api/publish/:id                      // Cancel scheduled publish

// Stage 7: Analytics API
GET    /api/analytics/overview               // Dashboard metrics
GET    /api/analytics/content/:id            // Content performance
GET    /api/analytics/pillars                // Pillar performance
```

### 6.2 Sanity CMS Integration

**Sanity Client Setup:**

```typescript
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN // For write operations
});

// GROQ Queries for Dashboard

// Get all topics
const topics = await sanityClient.fetch(`
  *[_type == "topic"] | order(createdAt desc) {
    _id,
    title,
    slug,
    pillarCluster,
    approvalStatus,
    createdAt
  }
`);

// Get content by status
const pendingContent = await sanityClient.fetch(`
  *[_type == "post" && approvalStatus == "pending"] {
    _id,
    title,
    slug,
    qualityScore,
    eeatScore,
    wordCount,
    createdAt
  }
`);

// Get pillar cluster overview
const pillarStats = await sanityClient.fetch(`
  *[_type == "pillarCluster"] {
    _id,
    name,
    targetArticles,
    "publishedCount": count(*[_type == "post" &&
                             references(^._id) &&
                             approvalStatus == "published"]),
    "draftCount": count(*[_type == "post" &&
                         references(^._id) &&
                         approvalStatus == "draft"])
  }
`);

// Mutations (Create/Update)
await sanityClient.create({
  _type: 'post',
  title: 'Article Title',
  slug: { _type: 'slug', current: 'article-slug' },
  body: portableTextContent,
  approvalStatus: 'pending'
});

await sanityClient.patch(documentId)
  .set({ approvalStatus: 'approved' })
  .commit();
```

### 6.3 WordPress REST API Integration

**WordPress Client:**

```typescript
const wpClient = {
  baseUrl: process.env.NEXT_PUBLIC_WP_BASE_URL,
  auth: {
    username: process.env.WP_USERNAME,
    password: process.env.WP_APPLICATION_PASSWORD
  }
};

// Get WordPress posts
const getPosts = async () => {
  const response = await fetch(`${wpClient.baseUrl}/wp-json/wp/v2/posts`, {
    headers: {
      'Authorization': `Basic ${btoa(
        `${wpClient.auth.username}:${wpClient.auth.password}`
      )}`
    }
  });
  return response.json();
};

// Publish to WordPress
const publishPost = async (content) => {
  const response = await fetch(`${wpClient.baseUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(
        `${wpClient.auth.username}:${wpClient.auth.password}`
      )}`
    },
    body: JSON.stringify({
      title: content.title,
      content: content.htmlBody,
      status: 'publish',
      slug: content.slug
    })
  });
  return response.json();
};
```

### 6.4 State Management Strategy

**Using Zustand for Global State:**

```typescript
// stores/workflow-store.ts
import create from 'zustand';

interface WorkflowState {
  currentStage: number;
  pendingApprovals: {
    researchGaps: number;
    topics: number;
    research: number;
    content: number;
    seo: number;
  };
  filters: {
    pillar?: string;
    status?: string;
    priority?: string;
  };

  // Actions
  setCurrentStage: (stage: number) => void;
  refreshPendingCounts: () => Promise<void>;
  updateFilters: (filters: Partial<typeof filters>) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentStage: 1,
  pendingApprovals: {
    researchGaps: 0,
    topics: 0,
    research: 0,
    content: 0,
    seo: 0
  },
  filters: {},

  setCurrentStage: (stage) => set({ currentStage: stage }),

  refreshPendingCounts: async () => {
    // Fetch from backend API
    const counts = await fetch('/api/workflow/pending-counts').then(r => r.json());
    set({ pendingApprovals: counts });
  },

  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  }))
}));
```

**React Query for Data Fetching:**

```typescript
// hooks/use-research-gaps.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useResearchGaps = (filters?: Filters) => {
  return useQuery({
    queryKey: ['research-gaps', filters],
    queryFn: async () => {
      const response = await fetch('/api/research/gaps?' + new URLSearchParams(filters));
      return response.json();
    }
  });
};

export const useApproveGap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gapId, approved }: { gapId: string; approved: boolean }) => {
      const response = await fetch(`/api/research/gaps/${gapId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ approved })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-gaps'] });
    }
  });
};
```

---

## 7. User Roles & Permissions

### 7.1 Role Definitions

**Role-Based Access Control (RBAC):**

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | All stages, all actions, settings |
| **SEO Lead** | SEO strategy & research oversight | Stages 1-3, 5-6, Analytics |
| **Content Strategist** | Content planning & topic selection | Stages 1-3 |
| **Senior Editor** | Content quality & approval | Stages 3-5 |
| **Junior Editor** | Content review & suggestions | Stage 4 (read + comment only) |
| **Compliance Officer** | Regulatory compliance checking | Stage 4 (read + compliance flags) |
| **Publisher** | Multi-platform publishing | Stages 5-6 |
| **Analyst** | Performance monitoring | Stage 7, Analytics (read-only) |

### 7.2 Permission Matrix

**Stage-by-Stage Permissions:**

```typescript
const PERMISSIONS = {
  // Stage 1: Research Gap Review
  'research.view': ['Admin', 'SEO Lead', 'Content Strategist'],
  'research.approve': ['Admin', 'SEO Lead'],
  'research.reject': ['Admin', 'SEO Lead'],
  'research.edit': ['Admin'],

  // Stage 2: Topic Review
  'topics.view': ['Admin', 'SEO Lead', 'Content Strategist', 'Senior Editor'],
  'topics.approve': ['Admin', 'SEO Lead', 'Content Strategist'],
  'topics.cluster-assign': ['Admin', 'SEO Lead', 'Content Strategist'],
  'topics.edit': ['Admin', 'Content Strategist'],

  // Stage 3: Deep Research
  'deep-research.view': ['Admin', 'SEO Lead', 'Content Strategist', 'Senior Editor'],
  'deep-research.approve': ['Admin', 'SEO Lead', 'Senior Editor'],
  'deep-research.re-research': ['Admin', 'SEO Lead'],

  // Stage 4: Content Review
  'content.view': ['Admin', 'Senior Editor', 'Junior Editor', 'Compliance Officer'],
  'content.edit': ['Admin', 'Senior Editor'],
  'content.approve': ['Admin', 'Senior Editor'],
  'content.comment': ['Admin', 'Senior Editor', 'Junior Editor'],
  'content.regenerate': ['Admin', 'Senior Editor'],

  // Stage 5: SEO Optimization
  'seo.view': ['Admin', 'SEO Lead', 'Senior Editor', 'Publisher'],
  'seo.edit-metadata': ['Admin', 'SEO Lead'],
  'seo.approve': ['Admin', 'SEO Lead'],

  // Stage 6: Publishing
  'publish.view': ['Admin', 'Publisher', 'SEO Lead'],
  'publish.execute': ['Admin', 'Publisher'],
  'publish.schedule': ['Admin', 'Publisher'],

  // Analytics
  'analytics.view': ['Admin', 'SEO Lead', 'Content Strategist', 'Analyst'],
  'analytics.export': ['Admin', 'Analyst'],

  // Settings
  'settings.edit': ['Admin']
};
```

### 7.3 Authentication Flow

**NextAuth.js Setup:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against database
        const user = await validateUser(credentials.email, credentials.password);
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role // 'Admin', 'SEO Lead', etc.
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Permission Check Hook:**

```typescript
// hooks/use-permission.ts
import { useSession } from 'next-auth/react';

export const usePermission = (permission: string) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const hasPermission = PERMISSIONS[permission]?.includes(userRole) || false;

  return { hasPermission, role: userRole };
};

// Usage in component
const ApproveButton = ({ gapId }) => {
  const { hasPermission } = usePermission('research.approve');
  const approveMutation = useApproveGap();

  if (!hasPermission) return null;

  return (
    <button onClick={() => approveMutation.mutate({ gapId, approved: true })}>
      ✅ Approve
    </button>
  );
};
```

---

## 8. Performance Monitoring & Analytics

### 8.1 Dashboard Analytics Overview

**Page Route:** `/analytics`

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Analytics & Performance                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 📊 Total     │  │ 🚀 Published │  │ 📈 Avg. CTR  │         │
│  │ Content      │  │ This Month   │  │ from Google  │         │
│  │ 1,247        │  │ 47 / 50      │  │ 3.8%         │         │
│  │ articles     │  │ 94% goal     │  │ ↑ 12% MoM    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Content Performance by Pillar                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  Pillar 1: MTF (190 articles)                           │  │
│  │  Published: 45 │ Avg. Position: 12.3 │ Traffic: 12.5K  │  │
│  │  [████████████████░░░░░░] 75% complete                  │  │
│  │                                                          │  │
│  │  Pillar 2: F&O (240 articles)                           │  │
│  │  Published: 68 │ Avg. Position: 18.7 │ Traffic: 8.2K   │  │
│  │  [████████████░░░░░░░░░░░] 60% complete                 │  │
│  │                                                          │  │
│  │  Pillar 3: Estate Planning (300 articles)               │  │
│  │  Published: 23 │ Avg. Position: 24.1 │ Traffic: 3.1K   │  │
│  │  [████░░░░░░░░░░░░░░░░░░░] 25% complete                 │  │
│  │                                                          │  │
│  │  [View All Pillars →]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Top Performing Content (Last 30 Days)        │  │
│  ├────┬──────────────────┬─────────┬──────────┬───────────┤  │
│  │ #  │ Article          │ Traffic │ Position │ Conv. Rate│  │
│  ├────┼──────────────────┼─────────┼──────────┼───────────┤  │
│  │ 1  │ MTF Interest     │ 2,340   │ Pos 3    │ 4.2%      │  │
│  │    │ Calculator       │ visitors│ ↑2       │           │  │
│  ├────┼──────────────────┼─────────┼──────────┼───────────┤  │
│  │ 2  │ F&O Tax ITR-3    │ 1,890   │ Pos 5    │ 3.8%      │  │
│  │    │ Filing Guide     │ visitors│ ↑3       │           │  │
│  ├────┼──────────────────┼─────────┼──────────┼───────────┤  │
│  │ 3  │ Estate Planning  │ 1,650   │ Pos 7    │ 5.1%      │  │
│  │    │ Trust Setup      │ visitors│ ↑1       │           │  │
│  └────┴──────────────────┴─────────┴──────────┴───────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Traffic Trend (Last 6 Months)                │  │
│  │                                                          │  │
│  │   50K ┤                                           ╭─     │  │
│  │       │                                       ╭───╯      │  │
│  │   40K ┤                                   ╭───╯          │  │
│  │       │                               ╭───╯              │  │
│  │   30K ┤                           ╭───╯                  │  │
│  │       │                       ╭───╯                      │  │
│  │   20K ┤                   ╭───╯                          │  │
│  │       │               ╭───╯                              │  │
│  │   10K ┤           ╭───╯                                  │  │
│  │       │       ╭───╯                                      │  │
│  │    0K └───────┴───────┴───────┴───────┴───────┴────────  │  │
│  │       Oct    Nov    Dec    Jan    Feb    Mar    Apr     │  │
│  │                                                          │  │
│  │  Goal: 1M/month by Dec 2026 (Current: 47.5K/month)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Key Performance Indicators (KPIs)

**Content Production Metrics:**

1. **Content Velocity**
   - Articles per week/month
   - Time from research → publication
   - Bottleneck identification (slowest stage)

2. **Approval Efficiency**
   - Approval rate per stage (%)
   - Rejection reasons breakdown
   - Average approval time

3. **Content Quality**
   - Average quality score (90%+ target)
   - Average E-E-A-T score (85%+ target)
   - Average word count vs. target

**SEO Performance Metrics:**

1. **Ranking Performance**
   - Average SERP position
   - Featured snippet wins
   - Top 3 rankings count
   - Top 10 rankings count

2. **Traffic Metrics**
   - Organic sessions
   - Pageviews
   - Avg. session duration
   - Bounce rate

3. **Conversion Metrics**
   - Lead generation rate
   - CTA click-through rate
   - Email signups
   - Account openings

### 8.3 Integration with Google Services

**Google Search Console Integration:**

```typescript
// lib/google-search-console.ts
import { google } from 'googleapis';

const getSearchConsoleData = async (siteUrl: string, startDate: string, endDate: string) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page', 'query'],
      rowLimit: 1000
    }
  });

  return response.data.rows;
};
```

**Google Analytics 4 Integration:**

```typescript
// lib/google-analytics.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const getGA4Report = async (propertyId: string, startDate: string, endDate: string) => {
  const [response] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ]
  });

  return response.rows;
};
```

---

## 9. Technical Implementation

### 9.1 Project Setup

**Initialize Next.js 14 Project:**

```bash
# Create Next.js app
npx create-next-app@latest content-ops-dashboard --typescript --tailwind --app

cd content-ops-dashboard

# Install dependencies
npm install @tanstack/react-query zustand
npm install @sanity/client next-auth
npm install @headlessui/react @heroicons/react
npm install react-hook-form zod
npm install recharts date-fns
npm install @tiptap/react @tiptap/starter-kit
npm install papaparse

# Install dev dependencies
npm install -D @types/papaparse
```

**Project Structure:**

```
content-ops-dashboard/
├── app/
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with nav
│   │   ├── page.tsx                # Dashboard home
│   │   ├── workflow/
│   │   │   ├── research-gaps/
│   │   │   │   └── page.tsx
│   │   │   ├── topics/
│   │   │   │   └── page.tsx
│   │   │   ├── research/
│   │   │   │   └── page.tsx
│   │   │   ├── content/
│   │   │   │   └── page.tsx
│   │   │   ├── seo/
│   │   │   │   └── page.tsx
│   │   │   └── publish/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── pillars/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── research/
│   │   │   └── gaps/
│   │   │       └── route.ts
│   │   ├── topics/
│   │   │   └── route.ts
│   │   └── ...
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── DataTable.tsx
│   │   ├── DetailModal.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   ├── workflow/
│   │   ├── ApprovalButton.tsx
│   │   ├── StageIndicator.tsx
│   │   └── ...
│   ├── content/
│   │   ├── RichTextEditor.tsx
│   │   ├── PillarClusterTree.tsx
│   │   └── ...
│   └── seo/
│       ├── SEOMetaEditor.tsx
│       ├── SERPPreview.tsx
│       └── ...
├── lib/
│   ├── sanity.ts                   # Sanity client
│   ├── wordpress.ts                # WordPress API client
│   ├── google-analytics.ts
│   ├── google-search-console.ts
│   └── utils.ts
├── hooks/
│   ├── use-research-gaps.ts
│   ├── use-topics.ts
│   ├── use-permission.ts
│   └── ...
├── stores/
│   └── workflow-store.ts
├── types/
│   └── index.ts
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### 9.2 Environment Variables

**`.env.local` Configuration:**

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Backend API
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000/api

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=your-dataset
SANITY_TOKEN=skABCD...
SANITY_STUDIO_URL=http://localhost:3333

# WordPress
NEXT_PUBLIC_WP_BASE_URL=http://localhost:8080
WP_USERNAME=your-username
WP_APPLICATION_PASSWORD=xxxx yyyy zzzz wwww

# Google APIs
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GA4_PROPERTY_ID=123456789
GSC_SITE_URL=https://plindia.com

# Feature Flags
NEXT_PUBLIC_ENABLE_LIVE_PUBLISHING=true
NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS=true
```

### 9.3 API Routes Implementation

**Example: Research Gaps API Route**

```typescript
// app/api/research/gaps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query params
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const pillar = searchParams.get('pillar');

  // Fetch from backend or CSV
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const response = await fetch(`${backendUrl}/research/gaps?status=${status}&pillar=${pillar}`);
  const data = await response.json();

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check permission
  if (!session || !['Admin', 'SEO Lead'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { gapId, approved } = body;

  // Update approval status
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const response = await fetch(`${backendUrl}/research/gaps/${gapId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

### 9.4 Responsive Design Considerations

**Mobile-First Approach:**

- Tables convert to card views on mobile (<768px)
- Collapsible sidebar navigation
- Touch-friendly button sizes (min 44x44px)
- Swipeable modals and drawers
- Bottom navigation bar for mobile

**Breakpoints:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px'  // Extra large
    }
  }
}
```

---

## 10. Deployment & Scaling

### 10.1 Deployment Strategy

**Vercel Deployment (Recommended):**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables via Vercel dashboard or CLI
vercel env add NEXTAUTH_SECRET
vercel env add SANITY_TOKEN
vercel env add WP_APPLICATION_PASSWORD
```

**Alternative: Self-Hosted with Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_BACKEND_API_URL=${BACKEND_API_URL}
      - NEXT_PUBLIC_SANITY_PROJECT_ID=${SANITY_PROJECT_ID}
      - SANITY_TOKEN=${SANITY_TOKEN}
      - WP_BASE_URL=${WP_BASE_URL}
      - WP_USERNAME=${WP_USERNAME}
      - WP_APPLICATION_PASSWORD=${WP_APPLICATION_PASSWORD}
    env_file:
      - .env.local
    restart: unless-stopped
```

### 10.2 Performance Optimization

**Server-Side Rendering (SSR) Strategy:**

```typescript
// Use SSR for dashboard home (real-time data)
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const metrics = await fetchDashboardMetrics();

  return <DashboardView metrics={metrics} />;
}

// Use Static Site Generation (SSG) for analytics pages
export async function generateStaticParams() {
  return [
    { pillar: 'mtf' },
    { pillar: 'fno' },
    { pillar: 'estate-planning' }
  ];
}

export default async function PillarAnalyticsPage({ params }) {
  const analytics = await fetchPillarAnalytics(params.pillar);

  return <PillarAnalytics data={analytics} />;
}

export const revalidate = 3600; // Revalidate every hour
```

**Caching Strategy:**

```typescript
// React Query default config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
});

// API route caching
export async function GET(request: NextRequest) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

### 10.3 Monitoring & Logging

**Sentry Integration for Error Tracking:**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

**Logging Service:**

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // Send to external logging service (e.g., Datadog, LogRocket)
  },

  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    Sentry.captureException(error);
  },

  workflow: (stage: string, action: string, data?: any) => {
    console.log(`[WORKFLOW] Stage ${stage} - ${action}`, data);
    // Track workflow events in analytics
  }
};
```

### 10.4 Scaling Considerations

**Horizontal Scaling:**

- Deploy multiple Next.js instances behind a load balancer
- Use Redis for session storage (instead of in-memory)
- Implement job queue for heavy operations (Bull, BullMQ)

**Database Optimization:**

- PostgreSQL for analytics (if needed beyond Sanity)
- Indexes on frequently queried fields
- Connection pooling (PgBouncer)

**CDN for Static Assets:**

- Vercel Edge Network (automatic with Vercel deployment)
- Cloudflare CDN (for self-hosted)
- Cache images and static files at edge locations

**Rate Limiting:**

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

---

## 11. Future Enhancements

### 11.1 Phase 2 Features (Q2 2026)

1. **AI-Powered Content Suggestions**
   - Real-time content optimization hints
   - Automated A/B testing suggestions
   - Competitive intelligence alerts

2. **Collaborative Editing**
   - Real-time multi-user editing (like Google Docs)
   - Comment threads and mentions
   - Version control with rollback

3. **Advanced Analytics**
   - Predictive traffic modeling
   - Content ROI calculator
   - Competitive keyword gap analysis

4. **Workflow Automation**
   - Auto-approval for high-scoring content
   - Scheduled batch publishing
   - Smart content recycling/updating

### 11.2 Integration Roadmap

**Q2 2026:**
- Slack notifications for approvals
- Airtable sync for project management
- Zapier integration for custom workflows

**Q3 2026:**
- Social media auto-posting (Twitter, LinkedIn, Facebook)
- Email newsletter integration (Substack, Mailchimp)
- CRM integration (HubSpot, Salesforce)

**Q4 2026:**
- Mobile app (React Native)
- Voice commands (for approvals via Alexa/Google Home)
- Browser extension (quick content capture)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Approval Gate** | Human review checkpoint in the workflow where content must be approved to proceed |
| **E-E-A-T** | Experience, Expertise, Authority, Trust - Google's content quality signals |
| **Pillar Content** | Comprehensive, long-form content (5,000+ words) targeting high-volume keywords |
| **Content Cluster** | Group of related articles linking to a pillar piece |
| **SERP** | Search Engine Results Page |
| **Portable Text** | Sanity's structured content format (JSON-based blocks) |
| **REST API** | Representational State Transfer Application Programming Interface |
| **SSR** | Server-Side Rendering (Next.js renders page on server) |
| **ISR** | Incremental Static Regeneration (Next.js rebuilds pages on demand) |
| **RBAC** | Role-Based Access Control (permissions system) |

---

## Appendix B: API Endpoint Reference

**Complete API Endpoint List:**

```
# Authentication
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/session

# Stage 1: Research
GET    /api/research/gaps
POST   /api/research/gaps
PATCH  /api/research/gaps/:id/approve
GET    /api/research/gaps/:id

# Stage 2: Topics
GET    /api/topics
POST   /api/topics
PATCH  /api/topics/:id/approve
PATCH  /api/topics/:id/cluster
GET    /api/topics/:id

# Stage 3: Deep Research
GET    /api/research/deep
POST   /api/research/deep/:topicId
PATCH  /api/research/deep/:id/approve
GET    /api/research/deep/:id

# Stage 4: Content
GET    /api/content
POST   /api/content/:topicId
PATCH  /api/content/:id
PATCH  /api/content/:id/approve
POST   /api/content/:id/regenerate
GET    /api/content/:id

# Stage 5: SEO
GET    /api/seo
POST   /api/seo/:contentId
PATCH  /api/seo/:id/metadata
PATCH  /api/seo/:id/approve
GET    /api/seo/:id/preview

# Stage 6: Publishing
POST   /api/publish/:contentId
GET    /api/publish/queue
POST   /api/publish/schedule
DELETE /api/publish/:id

# Analytics
GET    /api/analytics/overview
GET    /api/analytics/content/:id
GET    /api/analytics/pillars
GET    /api/analytics/export

# Workflow
GET    /api/workflow/status
GET    /api/workflow/pending-counts
POST   /api/workflow/bulk-approve

# Settings
GET    /api/settings
PATCH  /api/settings
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Authors:** PL Capital Content Engine Team
**Next Review:** 2026-01-15
