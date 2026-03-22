# Performance Testing Report

## Objective
This report evaluates system responsiveness for key public pages and public-facing backend routes in the HealthEduLtd application. The goal is to provide evidence of page load behavior, API responsiveness, and stability under different load levels.

## Test Environment
- Date: 2026-03-22T19:26:08.368Z
- Repository branch: feature/performance-testing-report
- Execution mode: local desktop run
- Frontend build: `frontend/dist`
- Backend server: `node backend/server.js`
- Test port: `8010`

## Tools Used
- Lighthouse desktop preset for page-level responsiveness
- autocannon for HTTP load testing
- Local Node.js script automation via `npm run perf:report`

## Performance Expectations
- Public pages should achieve a Lighthouse performance score of at least 70 in the local desktop baseline.
- First Contentful Paint and Largest Contentful Paint should remain at or below 2.5 seconds for the tested public pages.
- Total Blocking Time should remain at 0 ms and CLS should remain at 0 on the tested public pages.
- Public routes and login endpoints should keep average latency below 50 ms during the tested load scenarios.
- Load scenarios should complete with zero transport errors and zero timeouts.

## Page Load Results
| Page | Route | Score | FCP | LCP | Speed Index | TBT | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Welcome page | `/welcome` | 84 | 1.8 s | 1.8 s | 1.8 s | 0 ms | 0 |
| Patient login page | `/patient/login` | 82 | 1.7 s | 2.0 s | 1.7 s | 0 ms | 0 |
| Admin login page | `/admin/login` | 85 | 1.7 s | 1.7 s | 1.7 s | 0 ms | 0 |

Artifacts:
- JSON reports: `docs/performance/lighthouse/*.report.json`
- HTML reports: `docs/performance/lighthouse/*.report.html`

## Load Test Results
| Scenario | Connections | Avg latency (ms) | P90 (ms) | P99 (ms) | Avg req/s | Total requests | Errors | Timeouts | Non-2xx |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GET /welcome with 1 connection | 1 | 0.02 | 0 | 0 | 3377.9 | 37149 | 0 | 0 | 0 |
| GET /welcome with 10 connections | 10 | 1.13 | 1 | 2 | 6754.4 | 67537 | 0 | 0 | 0 |
| GET /welcome with 25 connections | 25 | 2.90 | 4 | 6 | 7299.8 | 80299 | 0 | 0 | 0 |
| GET /api-docs/ with 10 connections | 10 | 0.93 | 1 | 3 | 7404.2 | 74044 | 0 | 0 | 0 |
| GET /api-docs/ with 25 connections | 25 | 2.92 | 4 | 9 | 7295.2 | 72944 | 0 | 0 | 0 |
| POST /api/v1/patient/login invalid credentials with 10 connections | 10 | 2.11 | 3 | 7 | 3813.8 | 41952 | 0 | 0 | 41952 |
| POST /api/v1/patient/login invalid credentials with 25 connections | 25 | 6.19 | 7 | 28 | 3741.7 | 37407 | 0 | 0 | 37407 |
| POST /api/admin/login invalid credentials with 10 connections | 10 | 2.18 | 3 | 6 | 3705.0 | 37044 | 0 | 0 | 37044 |

Artifacts:
- JSON load outputs: `docs/performance/load/*.json`

## Analysis
- The tested public pages remained visually stable, with CLS equal to 0 on all Lighthouse runs.
- All three tested pages stayed within the 2.5 second expectation for FCP and LCP.
- Total Blocking Time stayed at 0 ms across the tested public pages, which suggests that the pages are not suffering from obvious main-thread blocking during initial render.
- The Lighthouse scores ranged from 82 to 85, which clears the local baseline target of 70. In this run, all measured public pages also cleared the stronger informal target of 80.
- Static routes such as `/welcome` and `/api-docs/` stayed highly responsive even at 25 concurrent connections, with average latency staying at or below 2.92 ms and zero transport errors.
- Invalid login requests were slower than static content, as expected, because they still exercise validation and database-backed auth logic. Even so, the average latency stayed between 2.11 ms and 6.19 ms in the tested scenarios, with zero transport errors and zero timeouts.
- The login endpoint scenarios report non-2xx responses because invalid credentials were intentionally used. Those responses are expected application-level failures, not performance failures.

## Conclusion
- Public page expectation met: **Yes**
- Load responsiveness expectation met: **Yes**

Based on the recorded Lighthouse and autocannon results, the application meets the predefined local performance expectations for the tested pages and routes. The system remained responsive under the tested loads, produced no transport-level failures, and kept render-time metrics within the chosen baseline targets.
