# Cyber Threat Intelligence (CTI) Portal
### Software Engineering Project | Course Code: BCS 502
**Amity University Rajasthan — Department of Computer Science & Engineering**  
**Academic Year:** 2026–2027 | **Semester:** 5th Semester | **Section:** A  

---

### Project Investigators & Supervisor Credits
- **Submitted by:**
  - **B. Sai Charan** — Enrollment No: `A20405224070`
  - **D. Ganesh Ravichandu** — Enrollment No: `A20405224296`
- **Faculty Supervisor / Guide:**
  - **Dr. Deepti Saxena**, Associate Professor, Department of Computer Science & Engineering, Amity University Rajasthan

---

## 1. Problem Statement & Motivation (Slides 03–05)
Modern SOC (Security Operations Center) analysts face severe fatigue due to **fragmented security feeds**. Analysts must constantly context-switch between disparate portals:
- NIST NVD for CVE vulnerability details
- VirusTotal for malware hash reputation
- AlienVault OTX & AbuseIPDB for IP/Domain/URL threat pulse correlation
- MITRE ATT&CK Matrix for threat actor tactic and technique classification
- Manual document assemblers for compiling incident reports

**The Goal:** Build a unified, browser-based, three-tier Cyber Threat Intelligence Portal that consolidates vulnerability tracking, indicator reputation checks, malware hashing, alert lifecycles, and automated PDF threat briefing exports into a seamless analyst workflow.

---

## 2. Three-Tier System Architecture (Slides 08, 12, 20)

```
+-------------------------------------------------------------------------------+
|                             TIER 1: WEB CLIENT                                |
|  React 18 SPA + Vite + Tailwind CSS + Lucide React + Recharts (SOC Dark UI)   |
+-------------------------------------------------------------------------------+
                                      |  HTTPS / REST JSON
                                      v
+-------------------------------------------------------------------------------+
|                         TIER 2: APPLICATION SERVER                            |
|  Node.js (v20 LTS) + Express.js                                               |
|  - JWT Session State Machine & RBAC Middleware                                |
|  - Correlation Engine (Auto-Alert & MITRE Mapping)                            |
|  - PDFKit Threat Report Generator                                             |
|  - External Threat Adapters (NVD, VirusTotal, AlienVault OTX, AbuseIPDB)       |
+-------------------------------------------------------------------------------+
                                      |  TCP (Mongoose Driver)
                                      v
+-------------------------------------------------------------------------------+
|                             TIER 3: DATABASE                                  |
|  MongoDB / Automatic High-Performance In-Memory Document Store Fallback       |
+-------------------------------------------------------------------------------+
```

---

## 3. Pre-Seeded UML Object Diagram Baseline (Slide 18)
The application starts fully pre-seeded with the exact instances specified in the UML Object Diagram so it is immediately ready for viva presentations:

| Object Instance | Entity | Key Attributes | Notes / Presentation Context |
| :--- | :--- | :--- | :--- |
| **`analyst1`** | `User` | `a.rao@soc.org` / `Password@123` | Role: `SECURITY_ANALYST` |
| **`socLead`** | `User` | `soc.lead@soc.org` / `Password@123` | Role: `SOC_TEAM` |
| **`researcher`** | `User` | `researcher@soc.org` / `Password@123` | Role: `TI_RESEARCHER` |
| **`cve1`** | `CVE` | `CVE-2024-3094`, CVSS: `10.0`, `CRITICAL` | XZ Utils liblzma backdoor supply chain exploit |
| **`ioc1`** | `IOC` | `185.220.101.4` (IP), Abuse: `97%`, Rep: `95.0` | Active Tor Exit Node / Cobalt Strike C2 proxy |
| **`mal1`** | `MalwareSample`| `44d88612fea8a8f36de82e1278abb02f`, Det: `0.82` | `payload_dropper.exe` (58/70 AV engines flagged) |
| **`m1`** | `MitreMapping` | `TA0001` (Initial Access) / `T1190` | Exploit Public-Facing App linked to `cve1` & `ioc1` |
| **`alert1`** | `Alert` | Severity: `HIGH`, Status: `UNREAD` | Triggered by malware sample `mal1` |
| **`report1`** | `Report` | Report ID: `R-0007`, Format: `PDF` | Briefing containing `cve1`, `ioc1`, `m1` |

---

## 4. Exact Implementation of Functional Requirements (`FR-01` to `FR-09`)

- **FR-01 & FR-09: Authentication, User Session State Machine & RBAC**
  - Session state machine: `Anonymous` &rarr; `Authenticating` &rarr; `Authenticated (role)` &rarr; `Anonymous (logout / timeout)`.
  - 1-Click Demo Role Switcher in navbar to toggle between `SECURITY_ANALYST`, `SOC_TEAM`, and `TI_RESEARCHER`.
  - Role enforcement: Only `TI_RESEARCHER` can generate/export reports; `SOC_TEAM` triages alerts.

- **FR-02: CVE Search (Sequence Diagram Flow - Slide 14)**
  - `GET /api/cve/search?query=...` validates query, queries NVD API adapter, caches in database, returns CVSS score, severity badge, affected software, and CWE ID. Includes dedicated `"No CVEs found"` state. Allows triggering real-time alerts on Critical CVEs.

- **FR-03 & FR-04: IOC Investigation & Normalization (Communication Diagram Flow - Slide 16)**
  - `POST /api/ioc/investigate`: Queries AlienVault OTX pulses and AbuseIPDB confidence score. Invokes `consolidate()` method to calculate normalized weighted reputation score. Auto-generates alert if abuse confidence &ge; 80%.

- **FR-05: MITRE ATT&CK Matrix (Slide 17)**
  - Interactive matrix of Tactics (`TA0001` through `TA0011`) and Techniques (`T1190`, `T1059`, `T1071`, etc.). Highlights mapped CVEs, IOCs, and malware samples. Includes manual threat mapping modal (`mapThreat()`).

- **FR-06: Malware Sample Reputation (Slide 17)**
  - Look up file hashes (MD5 / SHA-256) through VirusTotal adapter. Renders detection ratio (e.g. `0.82` / `58/70`), malware family, behavior tags, and AV vendor breakdown.

- **FR-07: Operational Dashboard & Alert Lifecycle State Machine (Slide 19)**
  - State machine: `Generated` &rarr; `Unread` &rarr; `markRead()` (`Read`) or `dismiss()` (`Dismissed`).
  - Interactive charts powered by Recharts: Severity Breakdown Donut and MITRE Tactics Distribution Bar Chart.

- **FR-08: Threat Intelligence Report Generator & PDF Export (Activity Diagram Flow - Slide 15)**
  - Multi-step builder with checkboxes for CVEs, IOCs, and Malware samples.
  - Validates RBAC (`TI_RESEARCHER`). Compiles data and linked MITRE mappings.
  - Streams high-fidelity PDF report with Amity University Rajasthan project metadata and SOC executive summary.

---

## 5. Quickstart Guide (Zero-Config Execution)

### Prerequisites
- Node.js (v18+)

### Step 1: Install Dependencies
```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
npm run build
```

### Step 2: Start the Web Application
```bash
# From root directory:
npm start
```
The server will start on **`http://localhost:5000`** and serve both the Express REST API and the compiled React SPA!

### Demo Login Credentials
- **Security Analyst:** `a.rao@soc.org` / `Password@123`
- **SOC Team Lead:** `soc.lead@soc.org` / `Password@123`
- **TI Researcher:** `researcher@soc.org` / `Password@123`
*(Or use the 1-click Demo Role Switcher button directly on the login page!)*

---

## 6. Built-in UML Architecture Modal
Click the **"UML Specs"** button in the application header or footer to view interactive, high-resolution documentation for all **8 UML diagrams** directly inside the live application during your presentation.
