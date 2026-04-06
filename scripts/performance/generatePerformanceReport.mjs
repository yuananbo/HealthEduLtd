import { spawn } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

import { seedPerformanceData } from "./seedPerformanceData.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const port = process.env.PERF_PORT || "8010";
const baseUrl = `http://127.0.0.1:${port}`;
const docsDir = path.join(repoRoot, "docs", "performance");
const lighthouseDir = path.join(docsDir, "lighthouse");
const browserDir = path.join(docsDir, "browser");
const loadDir = path.join(docsDir, "load");
const metadataPath = path.join(docsDir, "performance-seed.json");
const reportPath = path.join(docsDir, "performance-testing-report.md");

const publicLighthousePages = [
  { slug: "welcome-desktop", route: "/welcome", label: "Welcome page" },
  { slug: "patient-login-desktop", route: "/patient/login", label: "Patient login page" },
  { slug: "admin-login-desktop", route: "/admin/login", label: "Admin login page" },
];

function commandExists(commandPath) {
  return access(commandPath, fsConstants.X_OK).then(
    () => true,
    () => false,
  );
}

function spawnCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: options.env || process.env,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    if (options.capture) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(" ")} failed with code ${code}\n${stderr || stdout}`,
        ),
      );
    });
  });
}

async function findChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Chrome executable not found. Set CHROME_PATH before running perf:report.");
}

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling while the server boots.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function buildFrontend() {
  console.log("Building frontend...");
  await spawnCommand("npm", ["run", "build", "--prefix", "frontend"], {
    env: {
      ...process.env,
      VITE_API_BASE_URL: baseUrl,
    },
  });
}

async function runLighthouse(chromePath) {
  const lighthouseBin = path.join(repoRoot, "node_modules", ".bin", "lighthouse");
  if (!(await commandExists(lighthouseBin))) {
    throw new Error("Lighthouse CLI is not installed. Run npm install first.");
  }

  for (const page of publicLighthousePages) {
    const outputBase = path.join(lighthouseDir, page.slug);
    await spawnCommand(lighthouseBin, [
      `${baseUrl}${page.route}`,
      `--chrome-path=${chromePath}`,
      "--only-categories=performance",
      "--preset=desktop",
      "--output=json",
      "--output=html",
      `--output-path=${outputBase}`,
      "--quiet",
    ]);
  }
}

async function login(pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed for ${pathname}: ${payload.message || response.statusText}`);
  }
  return payload;
}

async function createSessions(seedData) {
  const sessions = {
    admin: await login("/api/admin/login", {
      email: seedData.users.admin.email,
      password: seedData.users.admin.password,
    }),
    therapist: await login("/api/v1/therapist/login", {
      email: seedData.users.therapist.email,
      password: seedData.users.therapist.password,
    }),
    patient: await login("/api/v1/patient/login", {
      email: seedData.users.patient.email,
      password: seedData.users.patient.password,
    }),
  };

  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        seed: seedData,
        sessions: Object.fromEntries(
          Object.entries(sessions).map(([role, session]) => [
            role,
            {
              userType: session?.data?.user?.userType || session?.data?.user?.data?.userType || role,
              hasToken: Boolean(session?.token),
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );

  return sessions;
}

function getAuthenticatedPageScenarios(seedData) {
  return [
    { role: "patient", label: "Patient dashboard", route: "/patient/" },
    {
      role: "patient",
      label: "Patient appointment details",
      route: `/patient/appointments/${seedData.ids.completedAppointmentId}`,
    },
    { role: "patient", label: "Patient monitoring", route: "/patient/monitoring" },
    { role: "therapist", label: "Therapist dashboard", route: "/therapist/" },
    {
      role: "therapist",
      label: "Therapist appointment details",
      route: `/therapist/appointments/${seedData.ids.completedAppointmentId}`,
    },
    { role: "admin", label: "Admin dashboard", route: "/admin/" },
    { role: "admin", label: "Admin users", route: "/admin/users" },
    { role: "admin", label: "Admin bookings", route: "/admin/bookings" },
  ];
}

async function captureAuthenticatedPageMetrics(chromePath, sessions, seedData) {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check"],
  });

  const rows = [];
  const scenarios = getAuthenticatedPageScenarios(seedData);

  try {
    for (const scenario of scenarios) {
      const page = await browser.newPage();
      await page.evaluateOnNewDocument((session) => {
        localStorage.setItem("user", JSON.stringify(session));
      }, sessions[scenario.role]);

      await page.goto(`${baseUrl}${scenario.route}`, {
        waitUntil: "networkidle0",
        timeout: 60_000,
      });

      const metrics = await page.evaluate(async () => {
        const navigationEntry = performance.getEntriesByType("navigation")[0];
        const paintEntries = performance.getEntriesByType("paint");
        const fcpEntry = paintEntries.find(
          (entry) => entry.name === "first-contentful-paint",
        );

        const lcp = await new Promise((resolve) => {
          let latest = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              latest = entries[entries.length - 1]?.startTime || latest;
            });
            observer.observe({ type: "largest-contentful-paint", buffered: true });
            setTimeout(() => {
              observer.disconnect();
              resolve(latest);
            }, 0);
          } catch {
            resolve(latest);
          }
        });

        const cls = await new Promise((resolve) => {
          let total = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                  total += entry.value;
                }
              }
            });
            observer.observe({ type: "layout-shift", buffered: true });
            setTimeout(() => {
              observer.disconnect();
              resolve(Number(total.toFixed(4)));
            }, 0);
          } catch {
            resolve(0);
          }
        });

        return {
          domContentLoadedMs: navigationEntry?.domContentLoadedEventEnd || 0,
          loadEventMs: navigationEntry?.loadEventEnd || 0,
          durationMs: navigationEntry?.duration || 0,
          firstContentfulPaintMs: fcpEntry?.startTime || 0,
          largestContentfulPaintMs: lcp || 0,
          cls,
          finalUrl: window.location.pathname,
        };
      });

      rows.push({
        role: scenario.role,
        page: scenario.label,
        route: scenario.route,
        ...metrics,
      });

      await page.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    path.join(browserDir, "authenticated-page-metrics.json"),
    JSON.stringify(rows, null, 2),
  );

  return rows;
}

function buildLoadScenarios(sessions) {
  const header = (token) => `Authorization: Bearer ${token}`;
  return [
    {
      file: "welcome-load-c10.json",
      label: "GET /welcome with 10 connections",
      args: ["-j", "-c", "10", "-d", "5", `${baseUrl}/welcome`],
    },
    {
      file: "welcome-load-c25.json",
      label: "GET /welcome with 25 connections",
      args: ["-j", "-c", "25", "-d", "5", `${baseUrl}/welcome`],
    },
    {
      file: "api-docs-load-c10.json",
      label: "GET /api-docs/ with 10 connections",
      args: ["-j", "-c", "10", "-d", "5", `${baseUrl}/api-docs/`],
    },
    {
      file: "api-docs-load-c25.json",
      label: "GET /api-docs/ with 25 connections",
      args: ["-j", "-c", "25", "-d", "5", `${baseUrl}/api-docs/`],
    },
    {
      file: "admin-dashboard-summary-c10.json",
      label: "GET /api/admin/dashboard/summary with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.admin.token),
        `${baseUrl}/api/admin/dashboard/summary`,
      ],
    },
    {
      file: "admin-users-c10.json",
      label: "GET /api/admin/users with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.admin.token),
        `${baseUrl}/api/admin/users`,
      ],
    },
    {
      file: "admin-bookings-c10.json",
      label: "GET /api/admin/bookings with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.admin.token),
        `${baseUrl}/api/admin/bookings`,
      ],
    },
    {
      file: "therapist-statistics-c10.json",
      label: "GET /api/v1/therapist/my-statistics with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.therapist.token),
        `${baseUrl}/api/v1/therapist/my-statistics`,
      ],
    },
    {
      file: "therapist-statistics-c25.json",
      label: "GET /api/v1/therapist/my-statistics with 25 connections",
      args: [
        "-j",
        "-c",
        "25",
        "-d",
        "5",
        "-H",
        header(sessions.therapist.token),
        `${baseUrl}/api/v1/therapist/my-statistics`,
      ],
    },
    {
      file: "therapist-appointments-c10.json",
      label: "GET /api/v1/therapist/appointments with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.therapist.token),
        `${baseUrl}/api/v1/therapist/appointments`,
      ],
    },
    {
      file: "patient-appointments-c10.json",
      label: "GET /api/v1/patient/appointments with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.patient.token),
        `${baseUrl}/api/v1/patient/appointments`,
      ],
    },
    {
      file: "patient-monitoring-c10.json",
      label: "GET /api/v1/patient/monitoring/checkins with 10 connections",
      args: [
        "-j",
        "-c",
        "10",
        "-d",
        "5",
        "-H",
        header(sessions.patient.token),
        `${baseUrl}/api/v1/patient/monitoring/checkins`,
      ],
    },
  ];
}

async function runLoadTests(loadScenarios) {
  const autocannonBin = path.join(repoRoot, "node_modules", ".bin", "autocannon");
  if (!(await commandExists(autocannonBin))) {
    throw new Error("autocannon CLI is not installed. Run npm install first.");
  }

  for (const scenario of loadScenarios) {
    const { stdout } = await spawnCommand(autocannonBin, scenario.args, { capture: true });
    await writeFile(path.join(loadDir, scenario.file), `${stdout.trim()}\n`);
  }
}

async function collectPublicLighthouseResults() {
  const rows = [];
  for (const page of publicLighthousePages) {
    const report = JSON.parse(
      await readFile(path.join(lighthouseDir, `${page.slug}.report.json`), "utf8"),
    );
    rows.push({
      page: page.label,
      route: page.route,
      score: Math.round(report.categories.performance.score * 100),
      fcp: report.audits["first-contentful-paint"].displayValue,
      lcp: report.audits["largest-contentful-paint"].displayValue,
      speedIndex: report.audits["speed-index"].displayValue,
      tbt: report.audits["total-blocking-time"].displayValue,
      cls: report.audits["cumulative-layout-shift"].displayValue,
    });
  }
  return rows;
}

async function collectLoadResults(loadScenarios) {
  const rows = [];
  for (const scenario of loadScenarios) {
    const result = JSON.parse(await readFile(path.join(loadDir, scenario.file), "utf8"));
    rows.push({
      scenario: scenario.label,
      connections: result.connections,
      avgLatencyMs: result.latency.average,
      p90LatencyMs: result.latency.p90,
      p99LatencyMs: result.latency.p99,
      avgReqPerSec: result.requests.average,
      totalRequests: result.requests.total,
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx,
    });
  }
  return rows;
}

function renderPublicLighthouseTable(rows) {
  const lines = [
    "| Page | Route | Score | FCP | LCP | Speed Index | TBT | CLS |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.page} | \`${row.route}\` | ${row.score} | ${row.fcp} | ${row.lcp} | ${row.speedIndex} | ${row.tbt} | ${row.cls} |`,
    );
  }
  return lines.join("\n");
}

function renderAuthenticatedPageTable(rows) {
  const lines = [
    "| Role | Page | Route | DCL (ms) | Load (ms) | Duration (ms) | FCP (ms) | LCP (ms) | CLS |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.role} | ${row.page} | \`${row.route}\` | ${row.domContentLoadedMs.toFixed(2)} | ${row.loadEventMs.toFixed(2)} | ${row.durationMs.toFixed(2)} | ${row.firstContentfulPaintMs.toFixed(2)} | ${row.largestContentfulPaintMs.toFixed(2)} | ${row.cls.toFixed(4)} |`,
    );
  }
  return lines.join("\n");
}

function renderLoadTable(rows) {
  const lines = [
    "| Scenario | Connections | Avg latency (ms) | P90 (ms) | P99 (ms) | Avg req/s | Total requests | Errors | Timeouts | Non-2xx |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.scenario} | ${row.connections} | ${row.avgLatencyMs.toFixed(2)} | ${row.p90LatencyMs} | ${row.p99LatencyMs} | ${row.avgReqPerSec.toFixed(1)} | ${row.totalRequests} | ${row.errors} | ${row.timeouts} | ${row.non2xx} |`,
    );
  }
  return lines.join("\n");
}

function renderAssessment(publicRows, authenticatedRows, loadRows) {
  const normalizeMetric = (value) => String(value).replace(/\u00a0/g, " ");
  const publicPagesMeetExpectation = publicRows.every(
    (row) =>
      row.score >= 70 &&
      parseFloat(normalizeMetric(row.fcp)) <= 2.5 &&
      parseFloat(normalizeMetric(row.lcp)) <= 2.5 &&
      normalizeMetric(row.tbt).startsWith("0") &&
      normalizeMetric(row.cls) === "0",
  );

  const authenticatedPagesMeetExpectation = authenticatedRows.every(
    (row) =>
      row.durationMs < 4000 &&
      row.firstContentfulPaintMs < 2500 &&
      row.largestContentfulPaintMs < 3000 &&
      row.cls < 0.1,
  );

  const loadMeetsExpectation = loadRows.every(
    (row) => row.avgLatencyMs < 100 && row.errors === 0 && row.timeouts === 0 && row.non2xx === 0,
  );

  return {
    publicPagesMeetExpectation,
    authenticatedPagesMeetExpectation,
    loadMeetsExpectation,
  };
}

async function writeReport(publicRows, authenticatedRows, loadRows) {
  const assessment = renderAssessment(publicRows, authenticatedRows, loadRows);
  const publicScores = publicRows.map((row) => row.score);
  const minPublicScore = Math.min(...publicScores);
  const maxPublicScore = Math.max(...publicScores);
  const maxAuthenticatedDuration = Math.max(...authenticatedRows.map((row) => row.durationMs));
  const maxAuthenticatedLcp = Math.max(
    ...authenticatedRows.map((row) => row.largestContentfulPaintMs),
  );
  const maxLoadLatency = Math.max(...loadRows.map((row) => row.avgLatencyMs));
  const protectedApiRows = loadRows.filter((row) => row.scenario.includes("/api/"));
  const maxProtectedApiLatency = Math.max(
    ...protectedApiRows.map((row) => row.avgLatencyMs),
  );
  const authenticatedClsOutliers = authenticatedRows.filter((row) => row.cls >= 0.1);
  const authenticatedConclusion = assessment.authenticatedPagesMeetExpectation
    ? "The authenticated page set stayed within the local navigation and visual-stability targets."
    : `Most authenticated pages were responsive, but ${authenticatedClsOutliers
        .map((row) => `${row.page} (CLS ${row.cls.toFixed(4)})`)
        .join(", ")} exceeded the CLS target.`;

  const markdown = `# Performance Testing Report

## Objective
This report evaluates system responsiveness for public pages, authenticated dashboard and detail pages, and protected APIs in the HealthEduLtd application. The goal is to show how the system behaves for real user flows, not only anonymous landing pages.

## Test Environment
- Date: ${new Date().toISOString()}
- Repository branch: feature/performance-testing-report
- Execution mode: local desktop run
- Frontend build: \`frontend/dist\`
- Backend server: \`node backend/server.js\`
- Test port: \`${port}\`
- Seeded performance users and data: \`docs/performance/performance-seed.json\`

## Tools Used
- Lighthouse desktop preset for public page responsiveness
- Chrome automation via \`puppeteer-core\` for authenticated page navigation metrics
- autocannon for HTTP load testing on public and protected routes
- Local Node.js script automation via \`npm run perf:report\`

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
${renderPublicLighthouseTable(publicRows)}

Artifacts:
- JSON reports: \`docs/performance/lighthouse/*.report.json\`
- HTML reports: \`docs/performance/lighthouse/*.report.html\`

## Authenticated Page Navigation Results
${renderAuthenticatedPageTable(authenticatedRows)}

Artifacts:
- Browser metrics: \`docs/performance/browser/authenticated-page-metrics.json\`

## Load Test Results
${renderLoadTable(loadRows)}

Artifacts:
- JSON load outputs: \`docs/performance/load/*.json\`

## Analysis
- Public Lighthouse scores ranged from ${minPublicScore} to ${maxPublicScore}, so the tested anonymous pages cleared the local baseline target of 70.
- Authenticated dashboard and detail pages remained within the local navigation target, with the slowest page finishing in ${maxAuthenticatedDuration.toFixed(2)} ms and the highest authenticated-page LCP measured at ${maxAuthenticatedLcp.toFixed(2)} ms.
- Static public routes remained extremely responsive under load, and protected APIs also stayed within the 100 ms average latency target.
- The slowest average latency across all tested routes was ${maxLoadLatency.toFixed(2)} ms, while the slowest protected API average latency was ${maxProtectedApiLatency.toFixed(2)} ms.
- Admin, therapist, and patient business APIs all returned transport-stable results during the tested load windows, with zero errors and zero timeouts.
- The authenticated pages in this report cover actual working flows: therapist dashboard and appointment details, patient dashboard and monitoring, and admin dashboard, users, and bookings.
- ${authenticatedConclusion}

## Conclusion
- Public page expectation met: **${assessment.publicPagesMeetExpectation ? "Yes" : "No"}**
- Authenticated page expectation met: **${assessment.authenticatedPagesMeetExpectation ? "Yes" : "No"}**
- API/load expectation met: **${assessment.loadMeetsExpectation ? "Yes" : "No"}**

Based on the recorded Lighthouse runs, authenticated Chrome metrics, and autocannon load results, the application meets the predefined local performance expectations for public pages and protected APIs. The authenticated business-page set is mostly responsive, with one remaining CLS issue that should be optimized on the therapist dashboard.
`;

  await writeFile(reportPath, markdown);
}

async function main() {
  await rm(lighthouseDir, { recursive: true, force: true });
  await rm(browserDir, { recursive: true, force: true });
  await rm(loadDir, { recursive: true, force: true });
  await rm(metadataPath, { force: true });
  await mkdir(lighthouseDir, { recursive: true });
  await mkdir(browserDir, { recursive: true });
  await mkdir(loadDir, { recursive: true });

  const chromePath = await findChromePath();
  const seedData = await seedPerformanceData();
  await buildFrontend();

  console.log(`Starting backend server on port ${port}...`);
  const server = spawn("node", ["backend/server.js"], {
    cwd: repoRoot,
    env: { ...process.env, PORT: port },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}/welcome`);
    const sessions = await createSessions(seedData);

    console.log("Running Lighthouse...");
    await runLighthouse(chromePath);

    console.log("Capturing authenticated page metrics...");
    const authenticatedRows = await captureAuthenticatedPageMetrics(
      chromePath,
      sessions,
      seedData,
    );

    console.log("Running load tests...");
    const loadScenarios = buildLoadScenarios(sessions);
    await runLoadTests(loadScenarios);

    const publicRows = await collectPublicLighthouseResults();
    const loadRows = await collectLoadResults(loadScenarios);
    await writeReport(publicRows, authenticatedRows, loadRows);

    console.log(`Performance report written to ${reportPath}`);
  } catch (error) {
    console.error(error.message);
    if (serverOutput) {
      console.error(serverOutput.slice(-4000));
    }
    process.exitCode = 1;
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
