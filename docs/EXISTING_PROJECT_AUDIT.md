# VeriDegree X — Existing Project Audit
**Audit Date:** November 2026  
**Platform Version:** 1.0.0 (Frontend Prototype)  
**Target Architecture:** Full-Stack Blockchain Academic Credential Ledger

---

## 1. Executive Summary

VeriDegree X is an academic credential storage and verification platform connecting three stakeholders:
1. **Universities / Institutions**: Mint digital degrees, manage student records, initiate bulk issuance via CSV, track verification telemetry, and enforce cryptographic revocations.
2. **Students**: Hold self-sovereign digital credential wallets, inspect degrees, generate dynamic QR codes for selective disclosure, and track verifier audits.
3. **Recruiters / Employers**: Independently verify academic credentials via QR scan or Credential ID in seconds, receiving cryptographically verified, revoked, or invalid tamper alerts.

The UI design is inspired by Apple, Linear, and Stripe design principles, featuring a high-contrast luxury automotive palette:
- **Powder Blue (`#A8C9C8`)**
- **Pure White (`#FFFFFF`)**
- **Vibrant Racing Orange (`#F45B0B`)**
- **Obsidian Dark (`#141A1B`)**

This document audits the existing frontend architecture, routes, mock state stores, and outlines the precise backend, database, and smart contract integration requirements.

---

## 2. Existing Frontend Framework & Dependencies

- **Build Tool:** Vite 6.0.7 with `@vitejs/plugin-react` 4.3.4
- **Language:** TypeScript 5.6.3
- **Core Libraries:**
  - `react` 18.3.1
  - `react-dom` 18.3.1
  - `react-router-dom` 6.28.0
- **UI & Visualization:**
  - `tailwindcss` 3.4.17
  - `lucide-react` 1.16.0
  - `recharts` 2.15.0
  - `qrcode.react` 4.2.0
  - `canvas-confetti` 1.9.4
  - `three` 0.187.0
  - `tailwind-merge` 2.6.0 & `clsx` 2.1.1
- **Web3 Dependency to Add:** `ethers` v6 (`ethers@^6.13.0`) for MetaMask browser provider, Sepolia testnet interaction, and contract call signing.

---

## 3. Existing Route Structure

| Route | Page Component | Access / Role | Description |
|---|---|---|---|
| `/` | `LandingPage` | Public | Hero showcase, interactive attack/verify simulation, problem statements, benefits, trust architecture. |
| `/login` | `LoginPage` | Public / Auth | Role selection login with mock credential presets. |
| `/register` | `RegisterPage` | Public / Auth | User and institution onboarding form with role selection. |
| `/select-role` | `RoleSelectionPage` | Public / Auth | 3-Card interactive role portal routing. |
| **University Portal** (`/university`) | `UniversityLayout` | University | Sidebar navigation, role switcher pill, profile dropdown. |
| `/university/dashboard` | `UniversityDashboard` | University | Telemetry metrics (Total Issued, Active, Revoked, Verifications), charts, quick issuance actions. |
| `/university/issue` | `IssueDegreePage` | University | Degree issuance form, PDF document upload preview, modal confirmation. |
| `/university/bulk-issue` | `BulkIssuePage` | University | CSV drag-and-drop parser, row-level validation, preview table, bulk mint simulator. |
| `/university/credentials` | `IssuedCredentialsPage` | University | Filterable, searchable table of all issued credentials with status badges. |
| `/university/credentials/:id` | `CredentialDetailPage` | University | Full parchment preview, audit logs, student metadata, revocation modal. |
| `/university/students` | `UniversityStudentsPage` | University | Student directory, degree counts, enrollment IDs. |
| `/university/revocations` | `RevocationManagementPage` | University | Official revocation decree records, reasons, timestamps. |
| `/university/verifications` | `UniversityVerificationsPage` | University | Real-time recruiter verification audit logs, IP geo, verification method. |
| `/university/profile` | `UniversityProfilePage` | University | Institutional settings, accreditation status, authorized signatories. |
| `/university/settings` | `UniversitySettingsPage` | University | Security settings, keypair preferences, notification toggles. |
| **Student Portal** (`/student`) | `StudentLayout` | Student | Sidebar navigation, student profile header. |
| `/student/dashboard` | `StudentDashboard` | Student | Wallet overview, degree summary cards, quick share actions. |
| `/student/credentials` | `MyCredentialsPage` | Student | Credential cards list with search, filter, and detail links. |
| `/student/credentials/:id` | `StudentCredentialDetailPage` | Student | High-resolution degree parchment, download mock PDF, QR modal. |
| `/student/share` & `/student/share/:id` | `ShareCredentialPage` | Student | Dynamic QR code generator, selective field disclosure toggles, expiry controls. |
| `/student/history` | `StudentVerificationHistoryPage` | Student | Transparency log showing which recruiters inspected the credential. |
| `/student/profile` | `StudentProfilePage` | Student | Student details, enrollment ID, linked university. |
| `/student/settings` | `StudentSettingsPage` | Student | Privacy controls, notification toggles. |
| **Recruiter Portal** (`/recruiter`) | `RecruiterLayout` | Recruiter | Sidebar navigation, recruiter profile summary. |
| `/recruiter/dashboard` | `RecruiterDashboard` | Recruiter | Verification telemetry, quick verification input, compliance records. |
| `/recruiter/verify` | `VerifyDegreePage` | Recruiter | Credential ID search form and live camera/file QR scanner simulator. |
| `/recruiter/result/:id` | `VerificationResultPage` | Recruiter | Cryptographic proof report: **VERIFIED**, **REVOKED**, or **NOT FOUND**, issuer signatures, blockchain block confirmation. |
| `/recruiter/history` | `RecruiterHistoryPage` | Recruiter | Audit log of past verifications conducted by the recruiter's company. |
| `/recruiter/profile` | `RecruiterProfilePage` | Recruiter | Organization profile, verified recruiter badge. |
| `/recruiter/settings` | `RecruiterSettingsPage` | Recruiter | API keys, compliance settings, team access. |

---

## 4. Current Mock Functionality & Local State

Currently, state is managed client-side in `src/services/credentialStore.ts` using `localStorage` keys:
- `vdx_credentials_v1`: Seeded from `INITIAL_CREDENTIALS` (IIT Delhi, BITS Pilani credentials, active and revoked).
- `vdx_universities_v1`: Institutional profile for IIT Delhi (`INST-IITD-001`).
- `vdx_students_v1`: Student roster with enrollment IDs and degrees.
- `vdx_verifications_v1`: Verification history logs.
- `vdx_current_role_v1`: Active demo role toggle (`university`, `student`, `recruiter`).

### Limitations of Mock State:
1. **No Real Cryptographic Hashing**: Hashes like `0x8f2a91b3...` are static strings.
2. **No Real Blockchain Anchor**: "Block #19,521,402" is hardcoded text; no transaction is submitted to Ethereum Sepolia.
3. **No Wallet Signature**: Issuing a degree currently calls a synchronous JavaScript method with a `setTimeout(..., 500)`.
4. **No True Server-Side Document Storage**: Uploaded PDFs are stored in memory or represented by filename strings.
5. **No True Multi-User Authorization**: Anyone switching the client-side role switcher gains immediate access.

---

## 5. UI Components to Preserve Intact

The visual identity and UX patterns must remain strictly identical:
1. `BrandLogo.tsx`: Custom SVG cryptographic shield emblem with faceted **X** and typography.
2. `Navbar.tsx`: Floating frosted glass header with clean center nav pills, dropdown role switcher, and orange CTA.
3. `HeroCredentialShowcase.tsx`: The interactive attack/verification sandbox with live 3-step audit pipeline.
4. `ThreeCredentialCard.tsx` / `CredentialThreeCanvas.tsx`: Three.js WebGL particle matrix and 3D parchment visualizer.
5. `RoleSwitcher.tsx`: Dropdown role switcher with demo mode reset.
6. `CertificateDocument.tsx`: Institutional diploma parchment with guilloche borders, official stamps, and QR code.
7. `Modal.tsx`, `Badge.tsx`: Reusable design system primitives.

---

## 6. Required Full-Stack Architecture

### A. Backend Services (`backend/`)
- **Runtime:** Node.js + Express.js + TypeScript
- **ORM & DB:** Prisma ORM connected to PostgreSQL
- **Security:** Helmet, CORS allowlist, Express Rate Limit, Argon2id/Bcrypt password hashing, JWT HttpOnly sessions, Zod request validators
- **Document Hashing Service:**
  - Receive PDF via `multer`
  - MIME type and magic number validation (PDF `%PDF-`)
  - Real SHA-256 binary digest computation
  - Deterministic JSON metadata canonicalization (RFC 8785)
  - Encrypted file storage (AES-256-GCM / private local object store)
- **Blockchain Service:**
  - Read-only JsonRpcProvider (Sepolia)
  - Verify transaction receipts (`txReceipt.status === 1`)
  - Verify `CredentialIssued` and `CredentialRevoked` on-chain events
  - Reconcile database status with smart contract state

### B. Smart Contract (`contracts/`)
- Contract: `AcademicCredentialRegistry.sol`
- Standard: Solidity `^0.8.20`, OpenZeppelin Contracts v5 (`AccessControl`, `Pausable`)
- Functionality:
  - University registration and deactivation by `DEFAULT_ADMIN_ROLE`
  - Credential issuance with `credentialId`, `documentHash`, and `metadataHash`
  - Credential verification (`getCredential`, `verifyCredential`)
  - Credential revocation with `reasonHash`
  - Zero PII stored on-chain

### C. Frontend Wallet & Web3 Integration (`src/`)
- `ethers.js` v6 provider wrapping `window.ethereum`
- `WalletContext` providing:
  - `connectWallet()`, `disconnectWallet()`
  - `account`, `chainId`, `isSepolia`
  - `switchToSepolia()`
  - Transaction submission helpers with pending notifications and block explorer links (`https://sepolia.etherscan.io/tx/...`)
- API client communicating with Express REST endpoints (`/api/...`)

---

## 7. Migration & Preservation Strategy

1. **Keep existing frontend working seamlessly**: Existing mock store will gracefully fall back or bridge to the REST API and Web3 provider.
2. **Add Backend in `/backend`**: Clean modular Express + Prisma application.
3. **Add Contracts in `/contracts`**: Hardhat project with complete unit tests for `AcademicCredentialRegistry.sol`.
4. **Hook into existing UI forms**:
   - `IssueDegreePage`: Calls backend `/api/credentials/prepare` -> prompts university MetaMask transaction -> submits tx hash to `/api/credentials/confirm-issuance`.
   - `VerifyDegreePage`: Calls backend `/api/verification/verify` which queries the smart contract via RPC and returns verifiable cryptographic evidence.
   - `RevocationManagementPage`: Prompts university MetaMask transaction `revokeCredential()` -> records on-chain revocation decree.

