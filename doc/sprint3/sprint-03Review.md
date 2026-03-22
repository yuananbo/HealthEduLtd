# HealthEduLtd (Mobirehab) / 111

## Iteration 03 - Review & Retrospect

* When: 2026/03/21 (Sprint 3 review meeting); other meetings: 2026/03/09, 2026/03/11, 2026/03/14, 2026/03/16, 2026/03/18, 2026/03/20
 * Where: Google Meet (with founder), Slack (internal)

## Process - Reflection

Sprint 3 built on **develop 2.0** toward **develop 3.0**, focusing on hardening the appointment and payment journey, improving admin visibility, and adding patient feedback on therapists. Compared with Sprint 2, the team spent more time on integration testing and edge cases (search, filters, payment modes) rather than only greenfield features.

#### Decisions that turned out well

 * **Mock payment path for non-production environments**: We introduced a configurable mock payment flow so development and staging can exercise booking and status transitions without calling live payment APIs when the environment is not considered secure enough for real credentials. This unblocked end-to-end testing and reduced risk while Flutterwave remains optional behind configuration. (Evidence: payment utility / controller paths using mock vs real processing; appointment booking tests covering payment branches)
 * **Targeted fixes in appointment service and UI**: We addressed several bugs where **searching or filtering** could produce confusing results—e.g. empty result sets hiding controls, or **date filtering misaligned with the user’s local calendar day** (timezone-related off-by-one). Centralizing date comparison (e.g. local calendar-day matching) and keeping filter UI visible improved reliability. (Evidence: appointment list components and controller/service tests)
 * **Mid-sprint integration from Sprint 2 retrospective**: Holding merges into **develop** with shared smoke tests reduced last-minute breakage before the **develop 3.0** cut. (Evidence: PR history into develop / develop 3.0)
 * **Feature ownership continuity**: Same module owners as prior sprints deepened knowledge of appointment, admin, and therapist surfaces, which sped up rating and dashboard work. (Evidence: focused PRs per area)

#### Decisions that did not turn out as well as we hoped

 * **Payment complexity split across “real” vs “mock”**: Supporting two modes added branching and test surface area; some scenarios still need clearer documentation for demos (which mode is active, what “success” looks like). (Evidence: env/config notes and payment tests)
 * **Residual scope from Sprint 2**: Items such as full production payment hardening and email verification still compete for capacity when appointment polish expands. (Evidence: deferred backlog items)

#### Planned changes

 * **Document payment modes for demos and QA**: Short runbook: required env vars, mock vs live behavior, and expected appointment statuses after pay-now / pay-later.
 * **Continue minimum sync cadence**: Keep at least two team meetings per week through exam periods.
 * **Pre-release checklist on develop**: Before tagging branches (e.g. **develop 3.0**), run shared checklist: patient book → pay (mock) → status → admin views → therapist rating.

## Product - Review

#### Goals and/or tasks that were met/completed:

 * **Appointment service (majority complete on develop 3.0)**: Booking, rescheduling/cancel rules where applicable, status handling (including patient/therapist views), consultation-fee flow, and **mock payment** to complete flows without live provider calls in insecure dev setups. Real provider integration remains configurable for when credentials and environment are ready. (Evidence: patient appointment controller/service, `BookAppointment` / `BookHomeCare` / `AppointmentDetails`, payment helper and tests)
 * **Appointment bugs and UX fixes**: Resolved issues tied to **search and filters**—including **misalignment** of listed appointments vs selected **date** when timezones differ from stored UTC, and **empty search** states that should still show search/filter affordances. (Evidence: appointment list logic such as local calendar-day matching; frontend and backend tests)
 * **Administrator dashboard**: Extended and refined admin dashboard capabilities for operational visibility (building on Sprint 2 KPI work). (Evidence: admin dashboard pages and related APIs), administrator can now publish new education content for patients and are able to view all therapists and patients information.
 * **Therapist ratings**: Patients can submit **star ratings and optional text reviews**; therapists can see aggregated and per-review feedback (e.g. profile ratings tab, backend `TherapistRating` model and APIs). (Evidence: `therapistRating.model.js`, common service/controller routes, `RatingsTab` and related UI)

#### Goals and/or tasks that were planned but not met/completed:

 * **Production-ready payment only**: Full, audited live payment flows in all environments may still require provider setup, HTTPS, and compliance review; mock mode covers development needs first. (Why: security and configuration; prioritized working E2E with mock.)
 * **Email verification**: If still in backlog, remains deferred in favor of appointment completion and ratings. (Why: capacity; same as prior sprint unless reprioritized.)
 * **Further admin user management CRUD**: If not fully finished, table-level manage users may remain partial next to dashboard improvements. (Why: dashboard and appointments took precedence.)

## Meeting Highlights

Going into the next iteration, our main insights are:

 * **Appointment service is largely “feature complete” on develop 3.0** for core journeys; remaining work is **production payment**, polish, and operational hardening.
 * **Mock payment is a deliberate trade-off** for insecure dev environments—it must stay clearly separated from production configuration.
 * **Ratings close the feedback loop** between patients and therapists; monitor data quality and moderation needs as usage grows.
 * **Keep regression tests** for search, date filters, and payment branches whenever appointment logic changes.
