# Stage 4 / Long Workflow Timeouts (Company vs Home)

## Why it times out at work but not at home

- **Stage 4 (content creation)** takes about **5–7 minutes**. With streaming, the app would keep **one HTTP connection open** for the whole run.
- **Corporate networks** often use a **proxy or firewall** that closes long-lived HTTP connections after **1–5 minutes** (e.g. 60s, 120s, 300s). Your **browser or device** then sees a timeout.
- **Home / personal networks** usually don’t have that proxy, so a single long request would complete there.

So the failure was from the **company proxy/firewall**, not from the device or the app logic.

## Deployment: Railway (and “works from anywhere”)

This app is deployed on **Railway.app** (auto-deploy from GitHub). Railway runs the app as a **long-running Node service**, not per-request serverless. That matters because:

- The app uses **polling mode** on Railway (and locally): the server **starts the workflow in the background** and **returns immediately** with a `jobId`. No long-held connection.
- The UI **polls** `GET /api/workflow/status?jobId=...` every few seconds. Each request is short, so **corporate proxies don’t kill it**.
- So the app is designed to work from **any environment and any device** (company laptop, home, phone, etc.) when using the Railway URL or local dev.

Polling is used whenever the server is **not** true serverless (Vercel/Netlify/Lambda). On Railway and local, polling is always used.

## What the app does (polling mode)

1. **Execute** and **Run stage** send `usePolling: true`.
2. The server starts the workflow in the background and returns `{ jobId }` right away.
3. The UI polls `GET /api/workflow/status?jobId=...` every few seconds and updates logs/stages.
4. Short requests avoid proxy timeouts, so Stage 4 can run 5–7 minutes and still complete from company networks.

## If you still see timeouts

1. **Confirm you’re on Railway or local**
   Polling is used on Railway and local. If you’re on a different host that sets `VERCEL`/`NETLIFY`/`AWS_LAMBDA_FUNCTION_NAME`, the server may fall back to streaming (one long request), which can timeout behind corporate proxies.

2. **Ask IT**
   If you must use a URL behind a strict proxy, ask IT to allowlist the app’s host or raise the proxy timeout for it.

3. **Use personal network**
   As a fallback, run Stage 4 / full workflow from home or mobile hotspot.

## Summary

| Environment / Deployment | Mode    | Result                        |
| ------------------------ | ------- | ----------------------------- |
| Railway (production)     | Polling | Works from any device/network |
| Local dev                | Polling | Works from any device/network |
| Company network          | Polling | Works (short requests only)   |
| Home / personal network  | Polling | Works                         |

The fix is **polling mode**: the server returns immediately and the UI refreshes via short status requests, so the app works from anywhere.
