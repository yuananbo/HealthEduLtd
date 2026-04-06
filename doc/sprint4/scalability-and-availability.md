# Scalability & Availability Considerations (HealthEduLtd / MOBIREHAB) - Sprint 4

This document summarizes how the deployed system handles growth in users and data, what scalability and availability practices are currently in place after Sprint 4 deployment, and what strategies are still planned but **not yet optimized/implemented** (for example, **Redis caching**).

---

## 1. Handling increased users and data

### Current architecture (Sprint 4 deployed baseline)

- **Backend**: Node.js + Express API deployed to Microsoft Azure.
- **Database**: MongoDB Atlas as the managed cloud database.
- **Frontend**: Nginx-served frontend in the production environment.
- **Cloud Platform**: Microsoft Azure


Compared with earlier local-first development, Sprint 4 moved the platform to a real hosted setup. This improves availability and accessibility for demos and stakeholder usage, but it does not automatically solve high-traffic scaling bottlenecks.

### Current scaling behavior

- **Application tier**: The service currently runs with a straightforward deployment shape suitable for current traffic volume.
- **Database tier**: MongoDB Atlas provides managed reliability and can scale with higher cluster tiers, but query/index tuning remains an ongoing task as data grows.
- **Feature focus in Sprint 4**: Team effort prioritized deployment completion, CI/CD, and bug fixes rather than introducing new high-scale optimization layers.

### Growth implications

- As concurrent users grow, likely bottlenecks are API throughput, repeated read queries, and heavier appointment/status workflows.
- Without dedicated cache and multi-instance balancing, performance at peak traffic may degrade sooner than desired.

---

## 2. Load balancing and caching

### Load balancing — current status

- **Current**: No newly introduced advanced load-balancing strategy was implemented in Sprint 4.
- Deployment is stable for present usage, but the architecture is still in a relatively simple operational phase.
- CI/CD on `main` improves release consistency, but it is not a substitute for runtime traffic distribution.

### Caching — current status

- **Current**: No new application-level caching strategy (e.g., Redis) was implemented in Sprint 4.
- API responses are served directly from service/database logic without a dedicated distributed cache layer.
- This keeps architecture simple, but repeated hot-read workloads can increase database pressure.

### Planned optimization direction (not yet implemented)

- Introduce **Redis** for high-frequency read paths (for example: dashboard aggregates, reusable lookup data, and selected appointment-related read models).
- Define TTL and invalidation rules to avoid stale healthcare-related data.
- Add a formal load balancer / reverse proxy strategy when traffic requires horizontal scale and stronger uptime guarantees.

---

## 3. Deployment strategy and uptime

### What Sprint 4 improved

- **Production deployment completed**: Backend, database, and frontend are now deployed in cloud-managed infrastructure.
- **Main-branch CI/CD established**: Releases are more repeatable and less dependent on manual deployment steps.
- **Post-deployment bug fixing performed**: Several important functional inconsistencies were fixed (account operations, appointment/date/status consistency, dashboard correctness).

### Current uptime considerations

- Environment is now more reliable than local-only development for stakeholder demos and continuous usage.
- Availability still depends on basic operational controls; full SRE-style hardening is not yet complete.
- Operational risks remain around unoptimized scaling paths and late-stage bug emergence after releases.

### Next-step availability hardening

- Add stronger monitoring/alerting for latency, error rates, and service health trends.
- Introduce staged rollout patterns (rolling/blue-green where feasible) to reduce deployment risk.
- Prepare backup/recovery runbooks and regular restore drills for MongoDB Atlas data safety.
- Combine deployment stability work with performance optimization (especially Redis + traffic distribution) in the next iteration.

---

## Summary

| Area | Sprint 4 current state | Next direction |
|------|-------------------------|----------------|
| Deployment | Successfully deployed (Azure + MongoDB Atlas + Nginx) | Continue stabilization and operational maturity |
| User/Data Growth | Handles current load; no new scale strategy introduced this sprint | Capacity tuning, query/index review, traffic-aware scaling |
| Cache / LB | No new Redis or advanced load-balancing implementation | Introduce Redis and formal LB strategy when traffic increases |
| Availability | CI/CD on `main`, better baseline uptime than local-only | Monitoring, rollout safety, backup/recovery hardening |

Sprint 4 delivered a major availability milestone by completing real deployment. However, this sprint did **not** introduce new performance optimization strategies (such as Redis caching). The next iteration should focus on combining post-deployment stability with targeted scalability improvements.
