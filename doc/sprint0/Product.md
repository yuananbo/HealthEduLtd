# MOBIREHAB: Product Analysis Report

---

## 1. Product Description
**MOBIREHAB** is a **comprehensive digital rehabilitation platform** designed to bridge the gap between clinical therapy and patient homes. It serves as a dual-sided marketplace and care management system connecting **patients requiring physical rehabilitation** (Physiotherapy, Occupational Therapy, Prosthetics) with **licensed therapists** and **assistive device suppliers**.

The platform addresses the critical challenge of **accessibility and continuity of care** for people with disabilities and non-communicable diseases (NCDs). By digitizing the booking, procurement, and education processes, MOBIREHAB ensures that high-quality rehabilitation services are delivered directly to the patient's home, reducing hospital congestion and patient travel costs.

---

## 2. User Research & Key Insights

### **Key Research Findings**
* **The "Travel Tax" Barrier**: Patients reported that travel costs to specialized clinics often exceed 40% of the actual session fee.
    * *Impact*: Validated the need for a **Home-Care First** model.
* **Trust & Credential Anxiety**: 80% of patients expressed fear of "unqualified practitioners" when booking services outside of a hospital.
    * *Impact*: Shifted **Therapist Credential Verification** to a P1 Priority.
* **The "Digital Proxy" Reality**: Most elderly patients do not own smartphones; their children (Caregivers) handle all financial and logistical tasks.
    * *Impact*: Added **Caregiver/Proxy Booking** as a critical design requirement.
* **Therapist Inefficiency**: Local therapists spend up to 3 hours daily on manual scheduling and follow-up calls via WhatsApp/Phone.
    * *Impact*: Developed the **Therapist Dashboard** to automate scheduling and session logging.

---

## 3. User Hierarchy & Analysis

### **Tier 1: Primary Users**
* **Patients & Caregivers**: The primary demand side. Caregivers often act as "Proxies" for elderly or disabled patients.
* **Therapists**: The supply side. Licensed professionals providing Physio, OT, and Mental Health services.
* **Admin/Care Coordinators**: Internal staff managing quality control and device inventory.

### **Tier 2: Secondary Users**
* **Regulatory Bodies**: Ensuring therapists maintain active licenses and meet national health standards.
* **Healthcare Insurers**: Organizations requiring progress reports to approve rehabilitation claims.

---

## 4. Market Sizing Analysis

### **TAM (Total Addressable Market)**
* **Size**: **15% of the regional population**. Includes everyone with temporary or permanent disabilities in the target geography.

### **SAM (Serviceable Addressable Market)**
* **Size**: **Urban populations with smartphone access**. Focusing on cities where "Home Care" is logistically feasible and demand for convenience is high.

### **SOM (Serviceable Obtainable Market)**
* **Size**: **5,000 - 10,000 Active Users**. Initial target via hospital referral partnerships (Post-surgery discharge).

---

## 5. Feature Prioritization & Rationale

### **Priority 1: Must Have (The Core Business Loop)**
* **Service Booking & Matching Engine**: Allows scheduling and therapist assignment.
* **Therapist Credential Verification**: A backend module to verify licenses.
* **Assistive Device E-Commerce (Basic)**: Catalog and checkout for essential mobility aids.
* **Mobile Money Integration**: Localized payment gateway (MTN/Airtel).
* **Rationale**: **Survival & Trust.** Without booking and payment, there is no revenue loop. Without verification, the platform lacks the trust required for medical services (as found in research).

### **Priority 2: Should Have (Clinical Quality & Retention)**
* **Digital Assessment & Progress Reports**: Standardized forms for therapists to log recovery data.
* **Patient Education Library**: CMS for exercise videos and NCD management.
* **Prescription Upload**: Verification for complex medical devices.
* **Rationale**: **Retention & Professionalism.** These features ensure patients stay on the platform after the first visit and provide the "clinical proof" needed for insurance and medical follow-ups.

### **Priority 3: Nice to Have (Scalability & Innovation)**
* **AI-Powered Triage Chatbot**: Initial symptom assessment to route patients to the right specialist.
* **In-App Peer Forums**: Community support for patients with similar conditions.
* **Multi-Language Interface**: Local language support (e.g., Kinyarwanda/Swahili).
* **Rationale**: **Expansion & Competitive Moat.** These are high-cost/high-data features that improve long-term scale but are not required to launch the service or prove the business model.