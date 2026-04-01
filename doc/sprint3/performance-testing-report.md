# Performance Testing Report

## Objective
This report evaluates system responsiveness for public pages, authenticated dashboard and detail pages, and protected APIs in the HealthEduLtd application. The goal is to show how the system behaves for real user flows, not only anonymous landing pages.

## Test Environment
- Date: 2026-03-22T20:07:35.762Z
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
| Welcome page | `/welcome` | 84 | 1.7 s | 1.7 s | 1.7 s | 0 ms | 0 |
| Patient login page | `/patient/login` | 81 | 1.8 s | 2.1 s | 1.8 s | 0 ms | 0 |
| Admin login page | `/admin/login` | 84 | 1.8 s | 1.8 s | 1.8 s | 0 ms | 0 |

Artifacts:
- JSON reports: `docs/performance/lighthouse/*.report.json`
- HTML reports: `docs/performance/lighthouse/*.report.html`

## Authenticated Page Navigation Results
| Role | Page | Route | DCL (ms) | Load (ms) | Duration (ms) | FCP (ms) | LCP (ms) | CLS |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| patient | Patient dashboard | `/patient/` | 164.50 | 165.00 | 165.00 | 272.00 | 272.00 | 0.0000 |
| patient | Patient appointment details | `/patient/appointments/69c049073a172dba1f50d3bb` | 80.60 | 80.90 | 80.90 | 172.00 | 272.00 | 0.0224 |
| patient | Patient monitoring | `/patient/monitoring` | 75.10 | 75.60 | 75.60 | 168.00 | 168.00 | 0.0000 |
| therapist | Therapist dashboard | `/therapist/` | 78.20 | 78.60 | 78.60 | 196.00 | 196.00 | 0.2311 |
| therapist | Therapist appointment details | `/therapist/appointments/69c049073a172dba1f50d3bb` | 89.50 | 89.80 | 89.80 | 172.00 | 340.00 | 0.0000 |
| admin | Admin dashboard | `/admin/` | 114.90 | 115.20 | 115.20 | 204.00 | 204.00 | 0.0038 |
| admin | Admin users | `/admin/users` | 81.50 | 81.70 | 81.70 | 200.00 | 220.00 | 0.0000 |
| admin | Admin bookings | `/admin/bookings` | 76.60 | 77.00 | 77.00 | 156.00 | 208.00 | 0.0000 |

Artifacts:
- Browser metrics: `docs/performance/browser/authenticated-page-metrics.json`

## Load Test Results
| Scenario | Connections | Avg latency (ms) | P90 (ms) | P99 (ms) | Avg req/s | Total requests | Errors | Timeouts | Non-2xx |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GET /welcome with 10 connections | 10 | 1.98 | 3 | 10 | 3973.0 | 19862 | 0 | 0 | 0 |
| GET /welcome with 25 connections | 25 | 4.74 | 5 | 49 | 4735.6 | 23679 | 0 | 0 | 0 |
| GET /api-docs/ with 10 connections | 10 | 1.59 | 2 | 8 | 4784.4 | 23916 | 0 | 0 | 0 |
| GET /api-docs/ with 25 connections | 25 | 4.37 | 6 | 48 | 5115.6 | 25572 | 0 | 0 | 0 |
| GET /api/admin/dashboard/summary with 10 connections | 10 | 14.57 | 21 | 66 | 661.6 | 3308 | 0 | 0 | 0 |
| GET /api/admin/users with 10 connections | 10 | 11.89 | 16 | 60 | 802.4 | 4012 | 0 | 0 | 0 |
| GET /api/admin/bookings with 10 connections | 10 | 15.33 | 22 | 65 | 634.4 | 3172 | 0 | 0 | 0 |
| GET /api/v1/therapist/my-statistics with 10 connections | 10 | 28.30 | 37 | 90 | 348.8 | 1744 | 0 | 0 | 0 |
| GET /api/v1/therapist/my-statistics with 25 connections | 25 | 68.43 | 112 | 133 | 361.4 | 1807 | 0 | 0 | 0 |
| GET /api/v1/therapist/appointments with 10 connections | 10 | 23.79 | 29 | 93 | 411.0 | 2055 | 0 | 0 | 0 |
| GET /api/v1/patient/appointments with 10 connections | 10 | 28.68 | 40 | 93 | 342.0 | 1710 | 0 | 0 | 0 |
| GET /api/v1/patient/monitoring/checkins with 10 connections | 10 | 12.73 | 17 | 67 | 755.4 | 3777 | 0 | 0 | 0 |

Artifacts:
- JSON load outputs: `docs/performance/load/*.json`

## Analysis
- Public Lighthouse scores ranged from 81 to 84, so the tested anonymous pages cleared the local baseline target of 70.
- Authenticated dashboard and detail pages remained within the local navigation target, with the slowest page finishing in 165.00 ms and the highest authenticated-page LCP measured at 340.00 ms.
- Static public routes remained extremely responsive under load, and protected APIs also stayed within the 100 ms average latency target.
- The slowest average latency across all tested routes was 68.43 ms, while the slowest protected API average latency was 68.43 ms.
- Admin, therapist, and patient business APIs all returned transport-stable results during the tested load windows, with zero errors and zero timeouts.
- The authenticated pages in this report cover actual working flows: therapist dashboard and appointment details, patient dashboard and monitoring, and admin dashboard, users, and bookings.
- Most authenticated pages were responsive, but Therapist dashboard (CLS 0.2311) exceeded the CLS target.

## Conclusion
- Public page expectation met: **Yes**
- Authenticated page expectation met: **No**
- API/load expectation met: **Yes**

Based on the recorded Lighthouse runs, authenticated Chrome metrics, and autocannon load results, the application meets the predefined local performance expectations for public pages and protected APIs. The authenticated business-page set is mostly responsive, with one remaining CLS issue that should be optimized on the therapist dashboard.
