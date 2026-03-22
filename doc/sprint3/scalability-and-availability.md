# Scalability & Availability Considerations (HealthEduLtd / MOBIREHAB)

This document describes how the system can grow with more users and data, what is **currently** in the codebase, and **planned** patterns—including **load balancing** we intend to introduce after the current single-instance phase—for caching, deployment, and uptime.

---

## 1. Handling increased users and data

### Current architecture (baseline)

- **Backend**: Single **Node.js + Express** process serving a REST API under `/api/v1`.
- **Database**: **PostgreSQL** via **Sequelize** (`backend/src/config/database.js`). All persistent users, courses, health resources, etc. live in one logical database.
- **Frontend**: **React** static assets; typically served by a separate web server or static host in production.

Under moderate load, the first bottleneck is usually **database I/O** (queries and connections), then **CPU** on the API node for JSON serialization and business logic.

### Scaling the application tier

- **Vertical scaling**: Increase CPU/RAM for the API host. This is the simplest step and fits a **single-instance** deployment.
- **Horizontal scaling**: Run **multiple identical API instances** behind a **reverse proxy or load balancer**. Express handlers are **stateless** if authentication uses **JWT** (or similar) rather than server-stored sessions—suitable for adding nodes without sticky sessions.
- **Connection pooling**: Sequelize uses a PostgreSQL connection pool by default. When running **several API instances**, cap **pool size per instance** so total connections stay within PostgreSQL’s `max_connections` (often tuned with `DB_POOL_MAX` or Sequelize options in config).

### Scaling data and queries

- **Indexes**: As tables grow (users, appointments, logs), add **indexes** on foreign keys and frequent `WHERE` / `ORDER BY` columns to keep list and lookup queries fast.
- **Pagination**: For large lists (appointments, admin tables, education content), use **limit/offset or keyset pagination** in APIs to avoid loading unbounded result sets. (Treat as a growth requirement if not yet universal across endpoints.)
- **Read/write split (future)**: For heavy read traffic, **read replicas** with Sequelize read/write separation can offload reporting and dashboards from the primary writer.
- **File uploads**: If prescriptions or media grow large, prefer **object storage** (e.g. S3-compatible) with URLs in the database instead of storing binaries in the DB or a single server disk.

---

## 2. Load balancing and caching

### Load balancing — current status and **planned strategy**

- **Today**: We do **not** run load balancing yet. The API is deployed as a **single instance** (or a single target group), which is sufficient for development, demos, and early pilot traffic.
- **Planned**: We **intend to adopt load balancing** in a later phase when traffic, availability goals, or horizontal scaling require it. The application is already structured so this is a **deployment/infrastructure** change rather than a rewrite: stateless HTTP APIs and **`GET /health`** are compatible with standard balancer setups.
- **Planned approach** (infrastructure layer; not embedded in application code):
  - Put a **reverse proxy or cloud load balancer** in front of the API (e.g. **Nginx**, **HAProxy**, **AWS ALB**, **GCP Cloud Load Balancing**).
  - Terminate **TLS** at the balancer or ingress.
  - Run **multiple identical Node/Express instances** behind the balancer; distribute traffic (e.g. round-robin or least connections).
  - Register **`GET /health`** (`backend/src/app.js`) as the **health check** URL so failed instances are drained from rotation without manual intervention.
- **Why defer for now**: Cost and operational simplicity; a single node is easier to operate while features stabilize. **Why plan ahead**: When user growth or uptime targets increase, load balancing plus multiple instances is the natural next step—**already anticipated** in connection-pool and stateless-API guidance above.

### Caching (optional; not currently implemented)

- **Application cache**: **Redis** (or Memcached) for hot reads—e.g. public education content, reference data, or aggregated dashboard KPIs—with a defined **TTL** and **invalidation** on updates.
- **HTTP caching**: Cache-Control headers for static React assets and versioned bundles; API responses are often **private/no-store** if they contain user-specific or sensitive health data—evaluate per route.
- **CDN**: Serve the frontend build from a **CDN** to reduce latency and origin load globally.

### Rate limiting and abuse protection

- **`express-rate-limit`** is listed in `backend/package.json` but **not wired in `app.js` yet**. Enabling it (globally or on auth/login routes) reduces brute-force and accidental overload when exposed to the public internet.
- For **multiple API nodes**, prefer a **shared store** (e.g. Redis) for rate-limit counters so limits are consistent across instances.

---

## 3. Deployment strategy and uptime

### Current enablers in code

- **Health endpoint**: `GET /health` returns `200` with `status` and `timestamp`—suitable for **liveness** probes (is the process up?).
- **Environment configuration**: `dotenv` and `process.env` (e.g. `PORT`, `CORS_ORIGIN`, DB credentials) support **separate dev/staging/production** configs without code changes.
- **Security middleware**: **Helmet** and **CORS** reduce common web risks; important when exposing the API publicly.

### Deployment patterns (operational)

- **Process manager**: Use **PM2**, **systemd**, or platform schedulers (Kubernetes, ECS, Cloud Run) to **restart** the API on crash and on deploy.
- **Rolling or blue/green deploys**: Deploy new instances, run **health checks**, then shift traffic—minimizes downtime and allows quick rollback.
- **Database migrations**: Use a controlled **migration** path (`npm run migrate` / Sequelize migrations) so schema changes apply **before** or **in sync** with new app versions—avoid `sync({ alter: true })` in production if possible.
- **Backups & recovery**: Scheduled **PostgreSQL backups** (snapshots + WAL if required) and tested **restore** procedures are the main lever for **data availability** after failures.

### Uptime and monitoring

- **Synthetic checks**: Ping `/health` and critical API flows from outside the VPC.
- **Logging**: `morgan` (dev-style logging) can be complemented in production with structured logs and aggregation (e.g. CloudWatch, ELK, Datadog).
- **Alerts**: Error rate, latency, DB connection failures, and disk usage on DB and API hosts.

---

## Summary

| Area | Current state | Direction as load grows |
|------|----------------|-------------------------|
| API | Single Express app | **Planned:** scale out behind a load balancer; tune DB pool per instance |
| Data | PostgreSQL + Sequelize | Indexes, pagination, replicas for heavy reads |
| Cache / LB | No LB yet; no app-level cache | **Planned:** load balancing + optional Redis/CDN when traffic warrants |
| Availability | `/health`, env-based config | Managed deploys, backups, monitoring, rate limits |

This aligns the **documented** scalability story with the **actual** stack (Express, Sequelize/PostgreSQL, React), states that **load balancing is not in use today but is planned**, and calls out **infrastructure and incremental code changes** (rate limiting, pagination, Redis) needed for higher traffic and SLA targets.
