## RPM (Release Planning Meeting) — Sprint 2 Release Plan

**Release window:** 2026/02/23 – 2026/03/09  
**Project:** Healthcare App Development  
**Status:** Active  

### Meeting details
- **Date(s):** 2026/02/23 (kick-off) with updates through 2026/03/09
- **Purpose:** Confirm Sprint 2 release scope, quality targets, dependencies/limitations, and delivery plan
- **Attendees:** Sprint 2 team members (feature owners)

---

## 1) Release goal (Sprint 2)
Deliver a stable **Assisted Home Care booking workflow** and **Daily Monitoring** experience for patients, while improving appointment visibility and ensuring the product is demo-ready.

---

## 2) Included features (Release scope)
The following items are **in scope** for the Sprint 2 release:

- **Booking workflow** (Jira: SCRUM-37)
  - Booking screen supports: pick date/time, address (home-care), notes, and price display.
  - Booking submits to backend appointment creation and handles slot conflicts safely.

- **Assisted Home Care service categories + booking fixes** (Jira: SCRUM-42)
  - Six categories: Physical Therapy, Occupational Therapy, Prosthetics & Orthotics, Family Medicine & Chronic Care, Mental Health, Nutrition.
  - Directory filtering by category and improved booking reliability.

- **Daily Monitoring (Health Metrics / Medications / Medical Records)** (Jira: SCRUM-43)
  - Daily check-in creation + recent history.
  - Dashboard widgets show latest metrics and profile-derived information.

- **Appointments visibility improvements** (Jira: SCRUM-13)
  - View upcoming appointments and appointment history (patient-facing).
  - Included if stable and verified by sprint end.

- **Patient profile preview before a session** (Jira: SCRUM-29)
  - Included if stable and verified by sprint end.

- **Educational platform & upskilling** (Jira: SCRUM-17)
  - Partial delivery if stable; otherwise deferred to the next release.

---

## 3) Excluded features (Out of scope)
The following items are **explicitly excluded** from the Sprint 2 release:

- Full real-time telemedicine/video consultation feature (UI placeholder only, if present)
- Full analytics dashboards and multi-week charting for health metrics (latest values + recent entries only)
- Full Admin Dashboard completion (only minor fixes for demo stability if needed)
- Production-grade payment + email delivery hardening (dev/demo fallbacks allowed; production reliability deferred)

---

## 4) Bug fixes (Release-scoped)
The following bug fixes are treated as **release items**:

- **Booking auto-submit bug**
  - Selecting a time slot does not submit the form; booking occurs only when clicking the booking button.

- **Availability consistency**
  - After a successful booking, the selected time slot becomes unavailable to other users.
  - After cancellation, the time slot becomes available again.
  - Unavailable time slots are hidden from the UI.
  - Booking conflicts return a clear error and refresh availability.

- **Cancel appointment + bulk cancel**
  - Single cancel works from appointment details.
  - “Cancel Selected” works on the appointment list.

- **Upcoming/history appointment display**
  - Filtering and sorting corrected so the dashboard and appointment views reflect accurate upcoming/history data.

- **Therapist login stability**
  - Therapist login issue reviewed and confirmed fixed (not part of new feature scope, but required for demo stability).

---

## 5) Non-functional requirements (NFRs)
The Sprint 2 release must meet these quality requirements:

- **Security & privacy**
  - All patient monitoring/profile endpoints require authentication.
  - Patients cannot directly modify therapist availability (prevents malicious slot locking).
  - Patient data access is restricted to the authenticated user.

- **Reliability**
  - Booking must not crash in dev/demo due to external payment/email provider failures.
  - Slot conflicts must be handled safely (no double booking).

- **Usability**
  - Only days with at least one available slot are selectable on the calendar.
  - Unavailable time slots do not appear in the time list.
  - Clear user feedback for errors (e.g., slot already booked).

- **Maintainability**
  - Domain logic is centralized (e.g., slot reserve/release in the availability service layer).
  - Design-pattern documentation comments exist in relevant modules (per Sprint 2 requirement).

---

## 6) Release dependencies & limitations

### Dependencies
- MongoDB must be running and seeded with therapists/availability for demo testing.
- Environment variables must be configured where applicable (e.g., DB connection string, JWT secret).

### Limitations
- Email sending may be skipped in dev/demo if SendGrid API key/credits are missing.
- Payment may be skipped/disabled in non-production to keep booking functional for demos.
- “In Progress” Jira items may be deferred if not stable by sprint end.

---

## 7) Risks & mitigation
- **Risk:** In-progress features may slip or destabilize the demo.
  - **Mitigation:** Prioritize demo-critical workflows; defer non-critical scope; keep Jira updated with clear acceptance criteria.

- **Risk:** External services (payment/email) may be unstable during demos.
  - **Mitigation:** Dev/demo fallbacks; clearly document the limitation in release scope.

---

## 8) Milestones / timeline
- **Mid-sprint:** Booking flow stable end-to-end; time-slot reservation verified.
- **Sprint end (2026/03/09):** Daily monitoring + booking demo-ready; remaining in-progress items included only if stable.

---

## 9) Release success criteria
Sprint 2 release is successful if:

- Patients can complete Assisted Home Care booking reliably.
- Reserved time slots disappear after booking and return after cancellation.
- Daily check-ins can be saved and shown on the dashboard.
- Demo flow runs without blockers and Jira reflects final scope and completion status.

---

## 10) Next steps
- Finalize remaining “In Progress” Jira items or move to the next sprint with clear rationale.
- Merge and submit PR(s) for the Sprint 2 release work.
- Prepare demo script and verification checklist aligned with the included scope.

