# GEMINI Analysis Report

## Project Overview

**Project Name:** Enhanced Bulk Generator
**Purpose:** An N8N-style AI workflow engine designed for high-volume, high-quality content generation to achieve "content domination" in the Indian WealthTech niche (targeting 1M monthly visitors).
**Core Logic:** It automates the entire content lifecycle: Competitor Research -> Topic Strategy -> Content Creation -> SEO Optimization -> Publication.
**Key Technology:**
*   **AI Models:** Groq (primary, using `groq/compound`), OpenAI (`gpt-oss-20b`/`120b` for browser search capabilities), and Llama 3.1 (fallback).
*   **Data Management:** CSV-based state management (`data/*.csv`) acting as the database for the workflow.
*   **Orchestration:** Custom Node.js orchestrator (`core/workflow-orchestrator.js`) that manages stages and approval gates.

## Directory Structure & Key Files

*   **`main.js`**: The central CLI entry point.
*   **`core/`**:
    *   `workflow-orchestrator.js`: Manages the progression through stages (Research -> Topics -> Content...).
    *   `csv-data-manager.js`: Handles reading/writing to the CSV "database".
*   **`research/`**:
    *   `master-seo-researcher.js`: Stage 1 - Finds content gaps and analyzes competitors.
    *   `topic-generator.js`: Stage 2 - Generates strategic topics (Quick Wins, Authority Builders).
*   **`data/`**: Contains the state of the system in CSV files (`research-gaps.csv`, `generated-topics.csv`, `created-content.csv`).
*   **`config/`**: JSON configuration for competitors, templates, and settings.
*   **`scripts/`**: Utility scripts (e.g., cron jobs, deployment scripts).

## Workflow Stages

1.  **Research:** Identifies content gaps using competitor analysis (Output: `data/research-gaps.csv`).
2.  **Topics:** Generates specific topic ideas based on research (Output: `data/generated-topics.csv`).
3.  **Deep Research:** (Planned) Detailed analysis of top competitors for approved topics.
4.  **Content:** (Planned) Writing the actual articles.
5.  **SEO:** (Planned) Optimization of metadata and schema.
6.  **Publication:** (Planned) Pushing to WordPress/Sanity.

## Usage Guide

### Setup
1.  **Install:** `npm install`
2.  **Env:** Set `GROQ_API_KEY` and `OPENAI_API_KEY`.
3.  **Init:** `node main.js init` (Initializes CSV files).

### Common Commands
*   **Run Research:** `node main.js research` (Runs Stage 1 & 2).
*   **Check Status:** `node main.js status` or `node main.js monitor`.
*   **Auto-Approve:** `node main.js research --auto-approve` (Skips manual CSV editing for high-score items).
*   **Full Workflow:** `node main.js full` (Runs all available stages).

### Data Flow
The system relies on "Approval Gates".
1.  AI generates data into a CSV (e.g., `research-gaps.csv`).
2.  User (or Auto-Approve logic) marks items as `Yes` in the `approval_status` column.
3.  The next stage reads only the `Yes` items to proceed.

## Development Context
*   **Style:** Node.js, CommonJS.
*   **State:** strictly CSV-based in `data/`.
*   **Goal:** The user is likely working on implementing the "Planned" stages (Content, SEO, Publication) or refining the Research stages.
