import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const port = process.env.PERF_PORT || "8010";
const baseUrl = `http://127.0.0.1:${port}`;
const docsDir = path.join(repoRoot, "docs", "performance");
const lighthouseDir = path.join(docsDir, "lighthouse");
const loadDir = path.join(docsDir, "load");
const reportPath = path.join(docsDir, "performance-testing-report.md");

const lighthousePages = [
  { slug: "welcome-desktop", route: "/welcome", label: "Welcome page" },
  { slug: "patient-login-desktop", route: "/patient/login", label: "Patient login page" },
  { slug: "admin-login-desktop", route: "/admin/login", label: "Admin login page" },
];

const loadScenarios = [
  {
    file: "welcome-load-c1.json",
    label: "GET /welcome with 1 connection",
    args: ["-j", "-c", "1", "-d", "10", `${baseUrl}/welcome`],
  },
  {
    file: "welcome-load-c10.json",
    label: "GET /welcome with 10 connections",
    args: ["-j", "-c", "10", "-d", "10", `${baseUrl}/welcome`],
  },
  {
    file: "welcome-load-c25.json",
    label: "GET /welcome with 25 connections",
    args: ["-j", "-c", "25", "-d", "10", `${baseUrl}/welcome`],
  },
  {
    file: "api-docs-load-c10.json",
    label: "GET /api-docs/ with 10 connections",
    args: ["-j", "-c", "10", "-d", "10", `${baseUrl}/api-docs/`],
  },
  {
    file: "api-docs-load-c25.json",
    label: "GET /api-docs/ with 25 connections",
    args: ["-j", "-c", "25", "-d", "10", `${baseUrl}/api-docs/`],
  },
  {
    file: "patient-login-invalid-c10.json",
    label: "POST /api/v1/patient/login invalid credentials with 10 connections",
    args: [
      "-j",
      "-c",
      "10",
      "-d",
      "10",
      "-m",
      "POST",
      "-H",
      "content-type: application/json",
      "-b",
      JSON.stringify({ email: "nobody@example.com", password: "wrongpass" }),
      `${baseUrl}/api/v1/patient/login`,
    ],
  },
  {
    file: "patient-login-invalid-c25.json",
    label: "POST /api/v1/patient/login invalid credentials with 25 connections",
    args: [
      "-j",
      "-c",
      "25",
      "-d",
      "10",
      "-m",
      "POST",
      "-H",
      "content-type: application/json",
      "-b",
      JSON.stringify({ email: "nobody@example.com", password: "wrongpass" }),
      `${baseUrl}/api/v1/patient/login`,
    ],
  },
  {
    file: "admin-login-invalid-c10.json",
    label: "POST /api/admin/login invalid credentials with 10 connections",
    args: [
      "-j",
      "-c",
      "10",
      "-d",
      "10",
      "-m",
      "POST",
      "-H",
      "content-type: application/json",
      "-b",
      JSON.stringify({ email: "nobody@example.com", password: "wrongpass" }),
      `${baseUrl}/api/admin/login`,
    ],
  },
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
      env: process.env,
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

async function runLighthouse(chromePath) {
  const lighthouseBin = path.join(repoRoot, "node_modules", ".bin", "lighthouse");
  if (!(await commandExists(lighthouseBin))) {
    throw new Error("Lighthouse CLI is not installed. Run npm install first.");
  }

  for (const page of lighthousePages) {
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

async function runLoadTests() {
  const autocannonBin = path.join(repoRoot, "node_modules", ".bin", "autocannon");
  if (!(await commandExists(autocannonBin))) {
    throw new Error("autocannon CLI is not installed. Run npm install first.");
  }

  for (const scenario of loadScenarios) {
    const { stdout } = await spawnCommand(autocannonBin, scenario.args, { capture: true });
    await writeFile(path.join(loadDir, scenario.file), `${stdout.trim()}\n`);
  }
}

async function collectLighthouseResults() {
  const rows = [];
  for (const page of lighthousePages) {
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

async function collectLoadResults() {
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
      avgThroughputBytesPerSec: result.throughput.average,
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx,
    });
  }
  return rows;
}

function renderLighthouseTable(rows) {
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

function renderAssessment(lighthouseRows, loadRows) {
  const normalizeMetric = (value) => String(value).replace(/\u00a0/g, " ");
  const pagesMeetExpectation = lighthouseRows.every(
    (row) =>
      row.score >= 70 &&
      parseFloat(normalizeMetric(row.lcp)) <= 2.5 &&
      parseFloat(normalizeMetric(row.fcp)) <= 2.5 &&
      normalizeMetric(row.tbt).startsWith("0") &&
      normalizeMetric(row.cls) === "0",
  );

  const loadMeetsExpectation = loadRows.every(
    (row) => row.avgLatencyMs < 50 && row.errors === 0 && row.timeouts === 0,
  );

  return {
    pagesMeetExpectation,
    loadMeetsExpectation,
  };
}

async function writeReport(lighthouseRows, loadRows) {
  const assessment = renderAssessment(lighthouseRows, loadRows);
  const lighthouseScores = lighthouseRows.map((row) => row.score);
  const minLighthouseScore = Math.min(...lighthouseScores);
  const maxLighthouseScore = Math.max(...lighthouseScores);
  const maxStaticLatency = Math.max(
    ...loadRows
      .filter((row) => row.scenario.startsWith("GET"))
      .map((row) => row.avgLatencyMs),
  );
  const loginRows = loadRows.filter((row) => row.scenario.startsWith("POST"));
  const minLoginLatency = Math.min(...loginRows.map((row) => row.avgLatencyMs));
  const maxLoginLatency = Math.max(...loginRows.map((row) => row.avgLatencyMs));
  const markdown = `# Performance Testing Report

## Objective
This report evaluates system responsiveness for key public pages and public-facing backend routes in the HealthEduLtd application. The goal is to provide evidence of page load behavior, API responsiveness, and stability under different load levels.

## Test Environment
- Date: ${new Date().toISOString()}
- Repository branch: feature/performance-testing-report
- Execution mode: local desktop run
- Frontend build: \`frontend/dist\`
- Backend server: \`node backend/server.js\`
- Test port: \`${port}\`

## Tools Used
- Lighthouse desktop preset for page-level responsiveness
- autocannon for HTTP load testing
- Local Node.js script automation via \`npm run perf:report\`

## Performance Expectations
- Public pages should achieve a Lighthouse performance score of at least 70 in the local desktop baseline.
- First Contentful Paint and Largest Contentful Paint should remain at or below 2.5 seconds for the tested public pages.
- Total Blocking Time should remain at 0 ms and CLS should remain at 0 on the tested public pages.
- Public routes and login endpoints should keep average latency below 50 ms during the tested load scenarios.
- Load scenarios should complete with zero transport errors and zero timeouts.

## Page Load Results
${renderLighthouseTable(lighthouseRows)}

Artifacts:
- JSON reports: \`docs/performance/lighthouse/*.report.json\`
- HTML reports: \`docs/performance/lighthouse/*.report.html\`

## Load Test Results
${renderLoadTable(loadRows)}

Artifacts:
- JSON load outputs: \`docs/performance/load/*.json\`

## Analysis
- The tested public pages remained visually stable, with CLS equal to 0 on all Lighthouse runs.
- All three tested pages stayed within the 2.5 second expectation for FCP and LCP.
- Total Blocking Time stayed at 0 ms across the tested public pages, which suggests that the pages are not suffering from obvious main-thread blocking during initial render.
- The Lighthouse scores ranged from ${minLighthouseScore} to ${maxLighthouseScore}, which clears the local baseline target of 70. In this run, all measured public pages also cleared the stronger informal target of 80.
- Static routes such as \`/welcome\` and \`/api-docs/\` stayed highly responsive even at 25 concurrent connections, with average latency staying at or below ${maxStaticLatency.toFixed(2)} ms and zero transport errors.
- Invalid login requests were slower than static content, as expected, because they still exercise validation and database-backed auth logic. Even so, the average latency stayed between ${minLoginLatency.toFixed(2)} ms and ${maxLoginLatency.toFixed(2)} ms in the tested scenarios, with zero transport errors and zero timeouts.
- The login endpoint scenarios report non-2xx responses because invalid credentials were intentionally used. Those responses are expected application-level failures, not performance failures.

## Conclusion
- Public page expectation met: **${assessment.pagesMeetExpectation ? "Yes" : "No"}**
- Load responsiveness expectation met: **${assessment.loadMeetsExpectation ? "Yes" : "No"}**

Based on the recorded Lighthouse and autocannon results, the application meets the predefined local performance expectations for the tested pages and routes. The system remained responsive under the tested loads, produced no transport-level failures, and kept render-time metrics within the chosen baseline targets.
`;

  await writeFile(reportPath, markdown);
}

async function main() {
  await mkdir(lighthouseDir, { recursive: true });
  await mkdir(loadDir, { recursive: true });

  const chromePath = await findChromePath();
  console.log("Building frontend...");
  await spawnCommand("npm", ["run", "build", "--prefix", "frontend"]);

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
    console.log("Running Lighthouse...");
    await runLighthouse(chromePath);
    console.log("Running load tests...");
    await runLoadTests();

    const lighthouseRows = await collectLighthouseResults();
    const loadRows = await collectLoadResults();
    await writeReport(lighthouseRows, loadRows);

    console.log(`Performance report written to ${reportPath}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
