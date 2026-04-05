# HealthEduLtd (Mobirehab) / 111

## Iteration 04 - Review & Retrospect

* When: 2026/04/05 (Sprint 4 review meeting); other meetings: 2026/03/25, 2026/03/27, 2026/03/30, 2026/04/03, 2026/04/04
 * Where: Google Meet (with founder), Slack (internal), Wechat (internal)

## Process - Reflection

Sprint 4 focused on release readiness and delivery, moving from the develop stream into a production-facing deployment and preparing for both founder and professor demonstrations. Compared with Sprint 3, this iteration shifted effort from feature expansion to CI/CD stabilization, bug resolution, and environment hardening.

#### Decisions that turned out well

 * **Final deployment and founder presentation were completed on schedule**: Shipping the full stack to a hosted environment (backend, database, frontend) gave the founder a realistic end-to-end view of the product and validated that the team can deliver beyond local development.
 * **Pre-demo bug checks before the final presentation reduced visible risk**: Running a focused regression pass before the professor demo helped catch user-facing issues (authentication/account operations, dashboard consistency, booking time behavior) before they impacted assessment.
 * **Merging develop into main enabled a cleaner CI/CD flow**: Consolidating the final sprint work into `main` aligned release behavior with deployment automation and reduced confusion over which branch represented production truth.

#### Decisions that did not turn out as well as we hoped

 * **Email verification remained incomplete at sprint close**: The team prioritized deployment and release-critical fixes, so verification work did not make the final cut despite being part of the broader roadmap.
 * **Payment feature was still not implemented with real provider calls**: This remains blocked by founder-side readiness (bank account and operational setup), which was outside direct team control during this sprint.
 * **Meeting load concentrated in the second half of the sprint**: Team syncs were less evenly distributed, which reduced early risk surfacing and compressed final decisions into the closing days.
 * **CI/CD consumed more capacity than expected**: Significant time was spent troubleshooting release infrastructure, leaving less room for introducing new user-facing features.

#### Planned changes

 * **Prioritize post-deployment defect triage**: Address unexpected bugs discovered in the hosted environment with a short stabilization cycle before large new feature work.
 * **Implement payment and email verification once founder prerequisites are ready**: Resume both items as top-priority integration tasks as soon as operational dependencies are confirmed.
 * **Move to a formal, branded domain**: Replace the machine-generated domain with a stable project domain to improve trust, usability, and presentation quality.
 * **Balance sprint capacity between platform and features**: Reserve explicit budget for feature delivery while containing CI/CD work with clearer runbooks and ownership.

## Product - Review

#### Goals and/or tasks that were met/completed:

 * **Production-oriented deployment completed**: Backend deployed on Microsoft Azure, database hosted on MongoDB Atlas, and frontend served via Nginx.
 * **CI/CD for `main` branch established**: Mainline deployment automation is now in place to support controlled release updates.
 * **Therapist rating logic corrected**: Ratings are now bound to a specific appointment instead of being loosely attached to therapist records.
 * **Account management bugs fixed**: Resolved issues preventing users from updating passwords and deleting accounts.
 * **Admin filtering improved**: Administrator dashboard filtering now supports more practical criteria for managing users and appointments.
 * **Dashboard greeting mismatch fixed**: Corrected inconsistency where displayed dashboard username did not match profile data.
 * **Therapist timeslot date-shift bug fixed**: Resolved one-day offset behavior caused by UTC casting during appointment time selection.
 * **Appointment status consistency and transition bugs fixed**: Corrected mismatched appointment statuses between therapist-side and patient-side views, and resolved status transition logic issues during updates.

#### Goals and/or tasks that were planned but not met/completed:

 * **Real payment API integration**: Live payment provider calls are still pending and will be completed once external prerequisites are ready.
 * **Email verification feature**: Not completed in this sprint due to deployment-first prioritization and remaining integration workload.
 * **Post-deployment bug stabilization backlog**: Additional defects discovered after deployment still require follow-up fixes in the next iteration.

## Meeting Highlights

Going into the next iteration, our main insights are:

 * **Release execution is now proven**: The team demonstrated it can move from local development to cloud hosting and complete stakeholder-facing demos in one sprint.
 * **Late-sprint concentration increases delivery risk**: Earlier and more even meeting cadence should be maintained so blockers are surfaced before final integration.
 * **External dependencies must be tracked as first-class risks**: Payment and verification readiness should be explicitly gated by founder-side prerequisites in sprint planning.
 * **CI/CD value is high, but needs bounded effort**: Deployment automation should continue, while runbooks and shared ownership prevent it from displacing core product features.
 * **Stabilization-first next sprint**: Early sprint effort should focus on post-deployment bug fixes, then transition to payment and email verification implementation.
