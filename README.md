# MOBIREHAB

**Rehabilitation at Your Home** — A healthcare platform for appointment booking, home physiotherapy, virtual exercises, and community health empowerment.

*Built by **HealthLearn Builders***

---

## Project Overview

MOBIREHAB is part of the **HealthEdu** initiative. It serves as a **one-stop center** for:

- **Health professionals** — Access updated information and accredited training to prevent medical errors and malpractice, and to earn credits for license renewal (Ministry of Health accredited).
- **Community health workers** — Smoothen access to healthcare in the community and connect doctors with patients.
- **Patients** — Book home physiotherapy and virtual exercise sessions, access assistive devices, and educational content.

This repository focuses on the **Appointment Booking App**: patients book therapists for **home Physiotherapy** and **virtual exercises**. The platform supports both **web** and **mobile** users.

### Core Services

| Service | Description |
|--------|-------------|
| **Home Care Rehab** | Book therapists (Physiotherapy, OT, P&O, Nutrition, Mental Health, Family Medicine) for in-home or virtual sessions. |
| **Assistive Devices** | Browse, request assessment, and procure mobility aids, orthotics, prosthetics, and daily living aids. |
| **Education** | NCD management, exercises, nutrition, disability prevention — read/watch content, save, share with caregivers. |
| **CPD / Upskilling** | Continuous Professional Development courses for working professionals: learning materials → test (80% pass) → paid certificate with credits (accredited). |

### User Roles

- **Patient** — Book appointments, order devices, access education.
- **Therapist** — Manage schedule, accept/reject bookings, add session notes, complete sessions.
- **Admin / Care Coordinator** — Manage users, therapists, bookings, devices, content; assign coordinators; monitor quality and reports.

---

## Key User Flows (Summary)

1. **Patient** — Landing → Login/Signup → Dashboard → Select Service (Book / Devices / Education) → Payment (if applicable) → Confirmation.
2. **Booking** — Service → Therapy Type → Therapist → Date/Time → Address & Notes → Payment → Confirmation.
3. **Assistive Devices** — Category → Device Details → Assessment/Purchase → Payment → Delivery/Fitting.
4. **Education** — Topic → Content → Read/Watch → Save/Share.
5. **Therapist** — Login → Dashboard → Appointments → Patient Profile → Session Notes → Complete.
6. **Admin** — Login → Dashboard → Manage Users, Therapists, Bookings, Devices, Content.

---

## Training & Certification

- **Accredited training**: Courses include reading materials; users complete a **quiz** and, on passing, receive a **certificate** automatically.
- Each certificate carries a defined number of **credits**, **accredited by the Ministry of Health**, for use in **renewing practicing licenses**.
- **Upskilling / CPD**: Courses for professionals in work settings; after learning materials, users must **pass a test with 80%**; the system then **generates a certificate**; these courses are **paid**.

---

## Technology & Delivery

- **Platform**: Web and mobile (both supported; scope and timeline for web vs mobile will be advised per phase).
- **Integrations** (to be implemented): Certification bodies, payment systems, analytics tools.
- **Security**: Payment and user data require appropriate security measures; recommendations will be followed for payment and health-related data.

---

## Installation

*(To be updated once the tech stack and repository structure are finalized.)*

### Prerequisites

- Node.js (version TBD)
- Package manager: npm or yarn
- (Optional) Docker for local services

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd project

# Install dependencies (example — adjust for actual stack)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local/config values

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file from `.env.example` and configure:

- API base URL
- Payment gateway keys (never commit production secrets)
- Database / backend connection if applicable

---

## Development

### Branching Strategy

We use **Git Flow**:

- **`main`** — Production-ready code.
- **`develop`** — Integration branch for features and fixes.
- **`feature/<ticket-id>-short-name`** — New features (e.g. `feature/MOB-42-booking-calendar`).
- **`bugfix/<ticket-id>-short-name`** — Bug fixes.
- **`release/<version>`** — Release preparation (e.g. `release/1.0.0`).
- **`hotfix/<ticket-id>-short-name`** — Urgent production fixes.

Merge flow: `feature`/`bugfix` → `develop` → `release` → `main`; `hotfix` → `main` and `develop`.

### Ticketing & Issues

- **Ticketing**: **GitHub Issues** for tasks, bugs, and enhancements.
- Use labels (e.g. `bug`, `feature`, `docs`, `priority: high`).
- Reference issue numbers in branch names and commits (e.g. `MOB-42`, `#42`).

### Contribution Guidelines

1. **Before coding**: Open or pick an issue; comment if you’re working on it.
2. **Branch**: Create a branch from `develop` using the naming above.
3. **Code**: Follow project style and any lint/format rules; add tests where applicable.
4. **Commit**: Clear messages; reference issue ID (e.g. `MOB-42 Add booking calendar`).
5. **Push & PR**: Push your branch and open a **Pull Request** into `develop`.
6. **Review**: Address review feedback; maintainers will merge when approved.
7. **Do not** push directly to `main` or `develop` without an approved PR (unless otherwise agreed for hotfixes).

---

## Project Documentation

- **MOBIREHAB – User Flow Diagrams & UI/UX Wireframe Structure** (internal): user flows and screen-by-screen wireframe structure for Patient, Therapist, Admin, Booking, Devices, and Education.
- **Next steps**: Figma wireframes, clinician validation, MVP scope lock, then development.

---

## Compliance & Security

- **Healthcare context**: Consider applicable regulations, standards, and guidelines during development (e.g. data privacy, consent, audit trails).
- **Payments**: All payment-related features must follow secure practices (e.g. PCI DSS–aware design, no storage of raw card data); use accredited payment providers and secure APIs.
- **Data privacy**: Handle health and personal data according to local laws and platform policy; document data flows and retention.

---

## License

*(To be defined by the MOBIREHAB / HealthEdu team.)*

---

*Prepared for the MOBIREHAB Founding Team · **HealthLearn Builders***

# HealthEduLtd
