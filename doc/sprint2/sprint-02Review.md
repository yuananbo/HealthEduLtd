# HealthEduLtd (Mobirehab) / 111

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 02 - Review & Retrospect

* When: 2026/03/07 (Sprint 2 review meeting); other meetings: 2026/02/23, 2026/02/28, 2026/03/02, 2026/03/04, 2026/03/06
 * Where: Google Meet (with founder), Slack (internal)

## Process - Reflection

Sprint 2 continued the work from Sprint 1, building on the foundation established during the first iteration. This sprint coincided with the university midterm week, which affected team availability and reduced overall efficiency during the first half of the sprint. Despite this, the team maintained steady progress by leveraging improved project management practices and consistent communication with the founder.

#### Decisions that turned out well

 * **Reorganized Jira workflow and corrected user story management**: We restructured the Jira board to fix errors in user story management inherited from Sprint 0, and adopted the burndown chart in Jira for efficiency analysis. This gave the team better visibility into sprint progress and helped identify bottlenecks earlier. (Evidence: updated Jira board and burndown chart)
 * **Maintained regular communication with the founder**: Continued syncs with the founder ensured alignment on priorities and allowed us to clarify requirements before implementation, reducing rework. (Evidence: Google Meet sessions throughout the sprint)
 * **Effective use of Git for version control and code review**: All merging was done through GitHub pull requests, enabling teammates to be invited for code review and catch issues before merging into the main branch. This improved code quality and shared understanding of the codebase. (Evidence: GitHub PR history)
 * **Continuity of task ownership from Sprint 1**: Team members continued working on the modules they were allocated in Sprint 1, which eliminated work conflicts and allowed deeper domain knowledge within each module. (Evidence: no merge conflicts or duplicated effort across modules)

#### Decisions that did not turn out as well as we hoped

 * **Did not use Jira properly until consulting the professor**: The team was not leveraging Jira's full capabilities (e.g., proper sprint tracking, story point estimation) until guidance was received from the professor. This meant the first portion of the sprint lacked structured tracking. (Evidence: Jira board restructuring mid-sprint)
 * **Lack of meetings in the first week due to university midterms**: The overlap with midterm exams reduced meeting frequency early in the sprint, which slowed coordination and delayed decision-making on implementation details. (Evidence: no meetings between 2026/02/23 and 2026/02/28)

#### Planned changes

 * **Establish a minimum meeting commitment regardless of academic schedule**: Guarantee at least two team syncs per week even during busy academic periods (e.g., midterms, finals) to maintain momentum and catch blockers early.
 * **Complete Jira onboarding and standardize usage across the team**: Hold a brief Jira workflow session at the start of Sprint 3 so all members follow consistent practices for story creation, estimation, status updates, and burndown tracking from day one.
 * **Introduce a mid-sprint checkpoint for feature integration**: Schedule a dedicated mid-sprint integration session where all in-progress features are merged into develop and tested together, reducing last-minute integration issues.


## Product - Review

#### Goals and/or tasks that were met/completed:

 * **Appointment service**: Fully implemented the appointment booking flow for patients, including therapist selection, date/time scheduling, and booking confirmation with email notifications. (Evidence: BookAppointment and BookHomeCare components, appointment controller and service)
 * **Patient education section**: Completed the education platform allowing patients to browse, read, and interact with health education content organized by topic categories. (Evidence: Education component and education controller)
 * **Administrator dashboard**: Built the admin dashboard with key performance indicators, providing administrators with an overview of system activity including bookings and user management. (Evidence: admin dashboard components)
 * **Therapist history analysis chart**: Implemented data visualization for therapist appointment history using Recharts, enabling therapists to review their session trends and performance over time. (Evidence: therapist dashboard with Recharts integration)

#### Goals and/or tasks that were planned but not met/completed:

 * **Email verification**: Planned email verification for new user registration was not completed due to time constraints from midterm week and prioritization of core service features. (Why: deferred in favor of appointment and education features; will be prioritized in Sprint 3.)
 * **Payment feature**: The full payment integration with Flutterwave was not finalized. A placeholder "Add to Calendar" flow was introduced to allow appointment creation without immediate payment. (Why: payment provider configuration and testing required more time than estimated; partial implementation carried forward.)
 * **User management system in admin portal**: The admin user management table (view, edit, deactivate users) was not fully completed. (Why: admin dashboard KPIs were prioritized first; remaining CRUD operations deferred to Sprint 3.)

## Meeting Highlights

Going into the next iteration, our main insights are:

 * **Midterm-proof the sprint plan**: Account for known academic deadlines when scoping sprint work, front-loading critical tasks before busy periods and setting realistic capacity expectations.
 * **Jira as the single source of truth**: With the board now properly configured, use burndown charts and velocity tracking from Sprint 3 onward to improve estimation accuracy and sprint commitment confidence.
 * **Close the payment and verification loops**: Prioritize completing the Flutterwave payment integration and email verification in Sprint 3, as these are critical for the end-to-end user journey from registration through appointment booking and payment.
 * **Leverage code review culture**: Continue the GitHub PR-based review process established in this sprint — it has already improved code quality and should be maintained as the team scales feature complexity.
