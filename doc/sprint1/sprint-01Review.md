# HealthEduLtd (Mobirehab) / 111

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 01 - Review & Retrospect

* When: 2026/02/14 (Sprint 1 review meeting); other meetings: 2026/02/02, 2026/02/07, 2026/02/09, 2026/02/12, 2026/02/13
 * Where: Google Meet (with founder), Slack (internal)

## Process - Reflection

Sprint 1 started with major external dependencies (founder codebase access and the timing of CRC Card course content). Once the codebase was shared, we shifted into Phase 1 (Feather 1), aligned priorities to the “Mobirehab – User Flow Diagrams & UI/UX Wireframe Structure” document, and executed bug fixes and feature work in parallel while completing required documentation.

#### Decisions that turned out well

 * **Increased meeting cadence during blockers**: We scheduled frequent syncs (including three meetings in a week) to maintain coordination while waiting on the codebase. This reduced confusion and let us pivot quickly once dependencies cleared. (Evidence: meeting notes on 2026/02/02, 02/09, 02/12)
 * **Escalated dependencies early**: We assigned a team member to follow up with the founder for the codebase and a meeting to clarify structure/expectations. This directly unblocked implementation and reduced guesswork. (Evidence: founder meeting on 2026/02/07)
 * **Clear module-based responsibility split**: After reviewing the codebase, we assigned ownership across modules (Patient, Home Care Rehab, Therapist, Education) and ran bug fixes and new features in parallel. This improved throughput and avoided duplicated effort. (Evidence: 2026/02/09 planning meeting)
 * **Validated database configuration early**: We prioritized database setup/review early in the sprint, which supported steady progress on authentication and core modules. (Evidence: 2026/02/12 progress alignment)

#### Decisions that did not turn out as well as we hoped

 * **Started sprint planning without confirmed codebase access**: We discussed task allocation early, but implementation could not begin because the codebase had not yet been shared. This created idle time and delayed real progress. (Evidence: 2026/02/02 meeting)
 * **Postponed CRC Cards entirely until the lecture**: Waiting for the relevant lecture improved correctness, but it also pushed CRC work late and compressed documentation time near the deadline. (Evidence: 2026/02/02 and 2026/02/09 notes)
 * **No explicit “blocker/risk log” with owners and due dates**: Blockers were identified, but we did not formalize tracking (owner, next action, escalation date). This made early sprint work less structured than it could have been.






#### Planned changes

 * **Adopt a sprint kickoff checklist for external dependencies**: Before committing to sprint scope, confirm codebase access, environment setup steps, and required accounts/credentials (and assign an owner to chase anything missing). This prevents “planned work with no ability to start.”
 * **Maintain a lightweight blocker/risk log**: Track each blocker with an owner, next action, and escalation date; review it in every meeting. This improves transparency and reduces idle time.
 * **Start documentation/CRC skeletons earlier**: Draft CRC Cards and documentation structure early (based on user flows/wireframes), then refine after lectures and codebase review. This reduces deadline compression.
 * **Use a pre-submission demo/DoD checklist**: Define “done” per module (happy path, error handling, DB verified) and run through a demo checklist before the finalization meeting to catch issues earlier.


## Product - Review

#### Goals and/or tasks that were met/completed:

 * **Codebase onboarding and readiness**: Received and reviewed the founder’s shared codebase and clarified technical expectations in a founder meeting. This enabled the sprint to move into implementation. (Evidence: 2026/02/07 meeting)
 * **Database configuration and validation**: Completed database setup and reviewed/validated the database structure to support ongoing development. (Evidence: 2026/02/12 meeting)
 * **Patient module authentication stabilized**: Fixed/verified patient login and registration issues and confirmed they work with the configured database. (Evidence: 2026/02/09 and 2026/02/12 notes)
 * **Education module progress**: Implemented core parts of the Education module and continued remaining feature work through the sprint. (Evidence: 2026/02/12 status update)

#### Goals and/or tasks that were planned but not met/completed:

 * **Early sprint implementation start**: Planned to begin implementation immediately, but could not due to the founder codebase not being available at the sprint start. (Why: external dependency; we needed access and a structure walkthrough first.)
 * **CRC Cards started later than ideal**: CRC Card work was postponed until relevant lecture content and codebase access, which pushed it later in the sprint and reduced buffer time for iteration-end documentation. (Why: dependency on course content + desire to align with expectations.)

## Meeting Highlights

Going into the next iteration, our main insights are:

 * **Treat external dependencies as first-class sprint work**: Track access/codebase/expectation questions as explicit tasks with owners and escalation timelines so sprint scope remains realistic.
 * **Anchor implementation priorities to user flows and wireframes**: Continue using the “Mobirehab – User Flow Diagrams & UI/UX Wireframe Structure” as the primary source for sequencing fixes/features and validating completeness.
 * **Ship vertical slices with steady integration**: Keep parallel module ownership, but integrate frequently and verify against the database early to reduce last-minute surprises.
 * **Do documentation incrementally, not at the end**: Maintain living architecture/interactions/CRC docs throughout the sprint to avoid deadline compression and improve shared understanding.
