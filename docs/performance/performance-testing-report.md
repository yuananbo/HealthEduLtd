# Performance Testing Report

## Objective
This report evaluates system responsiveness for public pages, authenticated dashboard and detail pages, and protected APIs in the HealthEduLtd application. The goal is to show how the system behaves for real user flows, not only anonymous landing pages.

## Test Environment
- Date: 2026-04-06T02:55:34.137Z
- Repository branch: feature/performance-testing-report
- Execution mode: local desktop run
- Frontend build: `frontend/dist`
- Backend server: `node backend/server.js`
- Test port: `8010`
- Seeded performance users and data: `docs/performance/performance-seed.json`

## Tools Used
- Lighthouse desktop preset for public page responsiveness
- Chrome automation via `puppeteer-core` for authenticated page navigation metrics
- autocannon for HTTP load testing on public and protected routes
- Local Node.js script automation via `npm run perf:report`

## Performance Expectations
- Public pages should achieve a Lighthouse performance score of at least 70 in the local desktop baseline.
- Public pages should keep FCP and LCP at or below 2.5 seconds.
- Authenticated dashboard and detail pages should keep total navigation duration below 4 seconds in the local desktop baseline.
- Authenticated dashboard and detail pages should keep FCP below 2.5 seconds, LCP below 3 seconds, and CLS below 0.1.
- Protected APIs should keep average latency below 100 ms in the tested load scenarios.
- Load scenarios should complete with zero transport errors and zero timeouts.

## Seeded Business Scenarios
The automated script seeds three dedicated performance-test users and related records so that business pages always have stable data to render:
- One admin account with access to dashboard, users, and bookings views
- One therapist account with appointments and dashboard statistics
- One patient account with appointments, health history, medications, and daily check-ins
- Three appointments across completed, accepted, and pending states
- Successful payments and three daily check-ins to support dashboard and detail screens

## Public Page Lighthouse Results
| Page | Route | Score | FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Welcome page | `/welcome` | 85 | 1.7 s | 1.7 s | 1.7 s | 0 ms | 0 |
| Patient login page | `/patient/login` | 81 | 1.8 s | 2.1 s | 1.8 s | 0 ms | 0 |
| Admin login page | `/admin/login` | 84 | 1.7 s | 1.7 s | 1.7 s | 0 ms | 0 |

Artifacts:
- JSON reports: `docs/performance/lighthouse/*.report.json`
- HTML reports: `docs/performance/lighthouse/*.report.html`

## Authenticated Page Navigation Results
| Role | Page | Route | DCL (ms) | Load (ms) | Duration (ms) | FCP (ms) | LCP (ms) | CLS |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| patient | Patient dashboard | `/patient/` | 71.40 | 71.80 | 71.80 | 140.00 | 488.00 | 0.0000 |
| patient | Patient appointment details | `/patient/appointments/69c049073a172dba1f50d3bb` | 44.10 | 44.30 | 44.30 | 104.00 | 136.00 | 0.0224 |
| patient | Patient monitoring | `/patient/monitoring` | 50.20 | 50.30 | 50.30 | 124.00 | 124.00 | 0.0000 |
| therapist | Therapist dashboard | `/therapist/` | 42.40 | 42.60 | 42.60 | 112.00 | 112.00 | 0.2311 |
| therapist | Therapist appointment details | `/therapist/appointments/69c049073a172dba1f50d3bb` | 53.80 | 54.10 | 54.10 | 116.00 | 148.00 | 0.0000 |
| admin | Admin dashboard | `/admin/` | 43.40 | 43.70 | 43.70 | 112.00 | 112.00 | 0.0000 |
| admin | Admin users | `/admin/users` | 50.10 | 50.30 | 50.30 | 104.00 | 120.00 | 0.0000 |
| admin | Admin bookings | `/admin/bookings` | 43.40 | 43.60 | 43.60 | 100.00 | 116.00 | 0.0000 |

Artifacts:
- Browser metrics: `docs/performance/browser/authenticated-page-metrics.json`

## Load Test Results
| Scenario | Connections | Avg latency (ms) | P90 (ms) | P99 (ms) | Avg req/s | Total requests | Errors | Timeouts | Non-2xx |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GET /welcome with 10 connections | 10 | 0.25 | 1 | 3 | 10791.2 | 53953 | 0 | 0 | 0 |
| GET /welcome with 25 connections | 25 | 1.52 | 2 | 6 | 11743.2 | 58713 | 0 | 0 | 0 |
| GET /api-docs/ with 10 connections | 10 | 0.28 | 1 | 3 | 10969.2 | 54839 | 0 | 0 | 0 |
| GET /api-docs/ with 25 connections | 25 | 1.84 | 3 | 9 | 10647.2 | 53240 | 0 | 0 | 0 |
| GET /api/admin/dashboard/summary with 10 connections | 10 | 8.24 | 12 | 39 | 1142.8 | 5714 | 0 | 0 | 0 |
| GET /api/admin/users with 10 connections | 10 | 5.37 | 8 | 15 | 1699.0 | 8495 | 0 | 0 | 0 |
| GET /api/admin/bookings with 10 connections | 10 | 5.47 | 8 | 13 | 1672.4 | 8362 | 0 | 0 | 0 |
| GET /api/v1/therapist/my-statistics with 10 connections | 10 | 11.73 | 16 | 25 | 815.8 | 4079 | 0 | 0 | 0 |
| GET /api/v1/therapist/my-statistics with 25 connections | 25 | 33.07 | 44 | 81 | 742.6 | 3713 | 0 | 0 | 0 |
| GET /api/v1/therapist/appointments with 10 connections | 10 | 10.74 | 15 | 25 | 889.6 | 4448 | 0 | 0 | 0 |
| GET /api/v1/patient/appointments with 10 connections | 10 | 13.04 | 18 | 30 | 737.2 | 3686 | 0 | 0 | 0 |
| GET /api/v1/patient/monitoring/checkins with 10 connections | 10 | 6.91 | 10 | 18 | 1348.4 | 6742 | 0 | 0 | 0 |

Artifacts:
- JSON load outputs: `docs/performance/load/*.json`

## Analysis
- Public Lighthouse scores ranged from 81 to 85, so the tested anonymous pages cleared the local baseline target of 70.
- Authenticated dashboard and detail pages remained within the local navigation target, with the slowest page finishing in 71.80 ms and the highest authenticated-page LCP measured at 488.00 ms.
- Static public routes remained extremely responsive under load, and protected APIs also stayed within the 100 ms average latency target.
- The slowest average latency across all tested routes was 33.07 ms, while the slowest protected API average latency was 33.07 ms.
- Admin, therapist, and patient business APIs all returned transport-stable results during the tested load windows, with zero errors and zero timeouts.
- The authenticated pages in this report cover actual working flows: therapist dashboard and appointment details, patient dashboard and monitoring, and admin dashboard, users, and bookings.
- Most authenticated pages were responsive, but Therapist dashboard (CLS 0.2311) exceeded the CLS target.

## Conclusion
- Public page expectation met: **Yes**
- Authenticated page expectation met: **No**
- API/load expectation met: **Yes**

Based on the recorded Lighthouse runs, authenticated Chrome metrics, and autocannon load results, the application meets the predefined local performance expectations for public pages and protected APIs. The authenticated business-page set is mostly responsive, with one remaining CLS issue that should be optimized on the therapist dashboard.
