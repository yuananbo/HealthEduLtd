# RPM (Release Planning Meeting) — Sprint 4 Release Plan

**Release window:** 2026/03/25 – 2026/04/05  
**Project:** Healthcare App Development  
**Status:** Active  

---

## Meeting details
- **Date(s):** 2026/03/25 (kick-off) with updates through 2026/04/05  
- **Purpose:** Confirm Sprint 4 release scope, quality targets, dependencies/limitations, and delivery plan  
- **Attendees:** Sprint 4 team members (feature owners)

---

## 1) Release goal (Sprint 4)

The goal of Sprint 4 is to enhance the therapist workflow, improve patient portal security and therapist information access, stabilize admin booking operations, and extend the assistive device purchasing workflow with shopping cart and delivery date functionality in preparation for the final deployment and system demo, also to deploy the app with Azure.

---

## 2) Included features (Release scope)

The following items are in scope for the Sprint 4 release (based on Jira items):

- **Enhance Therapist Flow (Jira: SCRUM-50)**
  - Improve therapist workflow and usability
  - Therapists can manage appointments and workflow more efficiently
  - Improve therapist dashboard and workflow navigation

- **Admin Portal – Merge and Stabilize Booking Operations (Jira: SCRUM-21)**
  - Merge booking management features in admin portal
  - Stabilize booking operations and dashboard panel controls
  - Improve booking status management and system stability

- **Add Assistive Device to Cart with Delivery Date (Jira: SCRUM-20)**
  - Users can add assistive devices to a shopping cart
  - Users can select a preferred delivery date before checkout
  - Cart information is stored and processed during checkout
  - Delivery date is saved with the order information

- **Patient Portal – Secure Patient Profile Access (Jira: SCRUM-53)**
  - Patients can securely access their profile information
  - Authentication and authorization checks are enforced
  - Users cannot access other users’ profile data

- **Patient Portal – Therapist Profile (Jira: SCRUM-54)**
  - Patients can view therapist profiles
  - Therapist profile includes specialization, availability, and basic information
  - Therapist information is retrieved from the database dynamically

---

## 3) Excluded features (Out of scope)

The following items are excluded from Sprint 4:

- Real payment gateway integration
- Email notification system
- Advanced recommendation system
- Mobile application development
- Major UI redesign

These features may be considered for future development.

---

## 4) Bug fixes (Release-scoped)

The following bug fixes and system fixes are included in this release:

- Fix logout redirect issues
- Fix authentication token handling issues
- Fix booking workflow edge cases
- Fix database connection and environment configuration issues
- Fix frontend routing issues after deployment
- Fix admin booking dashboard integration issues
- Fix patient profile update functionality (patients can now change password correctly)
- Fix deployment environment variable issues on Azure
- Fix Docker build and image deployment issues
- Fix database permission and access issues for team members

---

## 5) Non-functional requirements (NFRs)

The Sprint 4 release must meet the following quality requirements:

- **Security**
  - All patient profile, therapist profile, booking, and assistive device endpoints require authentication.
  - Users can only access their own profile, bookings, and purchase history.
  - Authentication tokens are required for protected routes.
  - Input validation is applied to booking, profile, and cart operations.

- **Performance**
  - Booking, assistive device cart, and profile operations should respond within a few seconds.
  - The system should handle multiple booking and purchasing operations without significant delays.
  - Database queries for profiles, bookings, and devices are optimized.

- **Usability**
  - Assistive device cart allows users to add devices and select delivery date easily.
  - Therapist profiles are clearly displayed in the patient portal.
  - Admin dashboard allows easy booking management.
  - Navigation between patient portal, therapist portal, admin portal, and store is consistent and intuitive.

---

## 6) Release dependencies & limitations

### Dependencies
- MongoDB must be running and accessible
- Environment variables must be configured (DB connection, JWT secret)
- Frontend and backend must be running together for full workflow testing
- Azure deployment must be working

### Limitations
- Payment is simulated and does not process real transactions
- Email notifications may not be implemented
- Some advanced features may be simplified for demo

---

## 7) Risks & mitigation

**Risk:** Integration issues between frontend and backend  
**Mitigation:** Perform integration testing before release  

**Risk:** Authentication and token issues  
**Mitigation:** Perform authentication testing and token validation  

**Risk:** Deployment issues on Azure  
**Mitigation:** Test deployment before final demo  

---

## 8) Milestones / timeline

- **Week 1:** Implement therapist flow enhancements, patient portal security, therapist profile, assistive device cart and delivery date
- **Week 2:** Admin portal stabilization, testing, bug fixing, deployment testing, demo preparation
- **Sprint end (2026/04/05):** All features demo-ready and deployed

---

## 9) Release success criteria

Sprint 4 release is successful if:

- Therapists can manage workflow and appointments
- Admin portal booking operations are stable
- Users can add assistive devices to cart and select delivery date
- Patients can securely access their profiles and could change their password
- Backend and frontend are successfully deployed
- Demo workflow runs without blockers