# RPM (Release Planning Meeting) — Sprint 3 Release Plan

**Release window:** 2026/03/09 – 2026/03/23  
**Project:** Healthcare App Development  
**Status:** Active  

---

## Meeting details
- **Date(s):** 2026/03/09 (kick-off) with updates through 2026/03/22 
- **Purpose:** Confirm Sprint 3 release scope, quality targets, dependencies/limitations, and delivery plan  
- **Attendees:** Sprint 3 team members (feature owners)

---

## 1) Release goal (Sprint 3)

The goal of Sprint 3 is to extend the platform with Assistive Device and a simulated payment workflow for booking therapists and purchasing assistive devices, improve admin management features, and increase unit tests in a relatively high coverage, performance, and system reliability in preparation for the final demo.

---

## 2) Included features (Release scope)

The following items are in scope for the Sprint 3 release (based on Jira items):

- **Assistive Device Purchase (Jira: SCRUM-15)**
  - Users can browse assistive devices
  - Users can add assistive devices to cart
  - Users can change the quantity of a device
  - Simulated payment flow integrated

- **Simulated Payment + Confirmation (Jira: SCRUM-38)**
  - Payment simulation for therapist booking
  - Payment simulation for assistive device purchase
  - Confirmation page after successful payment

- **Therapist List (Browse & Select a Therapist) (Jira: SCRUM-36)**
  - Browse and select therapist
  - Booking confirmation workflow improvements

- **My Appointments (Track Upcoming Care) (Jira: SCRUM-39)**
  - Patients can view upcoming and past appointments sorted by date
  - Each appointment shows therapy type, therapist name, date/time, booking status, and payment status
  - Patients can open an appointment to view detailed information such as address, notes, and reference number

- **Admin Content Management Dashboard (Jira: SCRUM-47)**
  - Admin can manage education content
  - Admin can add/edit/remove educational content

- **Admin Bookings Management (Jira: SCRUM-48)**
  - Admin can view and manage bookings
  - Admin can update booking status

- **Therapists View Patient Health Metrics (Jira: SCRUM-51)**
  - Therapists can view patient health metrics and monitoring data
  - Metrics include vital signs and submission dates
  - The system shows an empty state if no data is available
  - Records update when new health data is submitted

- **Patient Rating & Review Therapist (Jira: SCRUM-52)**
  - Patients can submit ratings and reviews for therapists after completed appointments
  - Therapists can view ratings, review statistics, and recent patient feedback

- **Add Session Notes After an Appointment (Jira: SCRUM-30)**
  - Therapists can add and save session notes for completed appointments
  - Session notes are stored with the appointment record and can be viewed later


---

## 3) Excluded features (Out of scope)

The following items are excluded from Sprint 3:

- Real payment gateway integration (Stripe/PayPal)
- Email notification system
- Production deployment optimizations
- Advanced recommendation system

These features may be considered for future development.

---

## 4) Bug fixes (Release-scoped)

The following bug fixes are included in this release (based on fix branches):

- **fix/therapist-registration**
  - Fix therapist registration issues and validation problems

- **fix/local-mongodb-setup**
  - Fix local MongoDB connection and environment configuration issues

- **fix/choose-rehab-servicebranch**
  - Fix service branch selection logic

- **fix/choose-rehab-service**
  - Fix rehab service selection workflow

- **fix/admin_log_out**
  - Fix admin logout flow and session handling

These fixes improve system stability and usability.

---

## 5) Non-functional requirements (NFRs)
The Sprint 3 release must meet the following quality requirements:

- **Security**
  - All patient, therapist, and assistive device purchase endpoints require authentication.
  - Users can only access their own profile, bookings, and purchase history.
  - Payment functionality uses a simulated payment flow and does not store real card information.
  - Input validation is applied to booking, profile, and payment forms to prevent invalid data.

- **Performance**
  - Booking, assistive device browsing, and cart operations should respond within a few seconds.
  - The system should handle multiple booking and purchasing operations without significant delays.
  - Database queries for appointments, products, and user profiles are optimized to reduce load time.

- **Usability**
  - The assistive device store allows users to browse by category, view product details, and manage a shopping cart easily.
  - Booking workflow clearly separates online and in-person appointments.
  - The system provides clear feedback messages for errors, successful bookings, and payment results.
  - Navigation between profile, bookings, store, and medical pages is consistent and intuitive.

---

## 6) Release dependencies & limitations

### Dependencies
- MongoDB must be running and seeded with test data
- Environment variables must be configured (DB connection, JWT secret)
- Frontend and backend must be running together for full workflow testing

### Limitations
- Payment is simulated and does not process real transactions
- Email notifications may not be implemented
- Some advanced features may be deferred if not stable by sprint end

---

## 7) Risks & mitigation

**Risk:** Integration issues between frontend and backend  
**Mitigation:** Perform integration testing on develop branch before release

**Risk:** Payment simulation workflow may cause issues  
**Mitigation:** Add validation and test booking + payment workflow thoroughly


---

## 8) Milestones / timeline

- **Week 1:** Implement admin dashboards, assistive device, simulated payment, ratings, therapist metrics
- **Week 2:** Testing, bug fixing, performance testing, demo preparation
- **Sprint end (2026/03/22):** All features demo-ready and tested

---

## 9) Release success criteria

Sprint 3 release is successful if:

- Users can book therapists with simulated payment
- Users can purchase assistive devices with simulated payment
- Admin can manage bookings and content
- Therapists can view patient metrics
- Patients can rate therapists
- Unit test coverage is between 70–90%
- Performance and security testing completed
- Demo flow runs without blockers

---

## 10) Next steps

- Finalize remaining Jira items or move to next sprint
- Prepare demo script and testing checklist
- Perform integration testing on develop branch
- Merge completed features into develop2.0 branch

---

## 11) Code integration & branch strategy

All Sprint 3 completed features and fixes will be merged into the **develop3.0** branch after verification and code review.  

