# VERIDEGREE X — Decentralized Academic Credential Ledger

> A production-grade, zero-PII blockchain academic credential platform built for Universities, Students, and Recruiters.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia_Testnet-orange.svg)](https://sepolia.etherscan.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Product Overview

**VeriDegree X** eliminates academic credential fraud while preserving student privacy. Universities issue cryptographically verifiable degrees anchored to the Ethereum Sepolia blockchain, students maintain verifiable sovereign ownership of their achievements, and employers or recruiters verify degree authenticity in under 0.2 seconds without relying on proprietary databases.

### Core Roles
- **University**: Authorised academic senates register their institution, issue immutable cryptographic credentials, and manage degree revocations.
- **Student**: Store academic degrees in private, AES-256 encrypted vaults, generate verifiable verification tokens, and share credentials securely.
- **Recruiter / Verifier**: Instantly verify degree authenticity against the Ethereum blockchain ledger without manual phone calls or institutional friction.

---

## 2. Zero-PII Cryptographic Architecture

VeriDegree X strictly adheres to zero-PII on-chain principles. **No student names, emails, grades, roll numbers, or personal documents are ever stored on the public blockchain.**

```
[Student Degree PDF] ──> SHA-256 ──────────> [bytes32 documentHash] ──┐
                                                                      ├──> [AcademicCredentialRegistry.sol]
[Degree Metadata JSON] ─> RFC 8785 Canonical ─> [bytes32 metadataHash] ──┘         (Ethereum Sepolia)
```

- **Document Hash**: Cryptographic SHA-256 fingerprint of the original PDF document.
- **Metadata Hash**: Deterministic SHA-256 digest of canonicalized metadata (RFC 8785).
- **On-Chain Registry**: Stores only 32-byte hashes, issuer address, issuance timestamp, and revocation status.
- **Private Vault**: Sensitive student documents and metadata are encrypted with AES-256-GCM and stored in private off-chain storage.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React, Three.js / WebGL, ethers.js v6 |
| **Backend REST API** | Node.js, Express.js, TypeScript, Prisma ORM, Zod, Helmet, Rate Limiter |
| **Database** | PostgreSQL 14+, Prisma Client |
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin Contracts 5.x (`AccessControl`, `Pausable`), Hardhat 3 |
| **Blockchain Network** | Ethereum Sepolia Testnet (Chain ID: `11155111`) |
| **Wallet Interaction** | MetaMask (EIP-1193 / EIP-4361 SIWE) |
| **Document Security** | AES-256-GCM encryption at rest, SHA-256 file hashing |

---

## 4. System Architecture

```
                    ┌────────────────────────┐
                    │   React 18 Frontend    │
                    │ (Tailwind + ethers.js) │
                    └───────┬────────┬───────┘
                            │        │
             EIP-1193 Tx    │        │ REST API (Zod validated)
           (MetaMask Sign)  │        │
                            ▼        ▼
       ┌────────────────────────┐  ┌────────────────────────┐
       │   Ethereum Sepolia     │  │   Node.js / Express    │
       │     Testnet            │  │        Backend         │
       │                        │  └───────────┬────────────┘
       │ AcademicCredential-    │              │
       │ Registry.sol           │              ▼
       │                        │  ┌────────────────────────┐
       │ • University Registry  │  │   PostgreSQL Database  │
       │ • Credential Registry  │  │      (Prisma ORM)      │
       │ • On-Chain Revocation  │  └────────────────────────┘
       └────────────────────────┘              │
                                               ▼
                                   ┌────────────────────────┐
                                   │ Private Storage Vault  │
                                   │  (AES-256-GCM Encrypt) │
                                   └────────────────────────┘
```

---

## 5. Quick Start & Setup Guide

### Prerequisites
- Node.js v18.0.0+
- PostgreSQL 14+
- MetaMask extension installed in browser
- Sepolia testnet ETH

### 1. Clone & Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment Files
Copy example environment templates:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp contracts/.env.example contracts/.env
```

### 3. Database Migration & Prisma Client
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 4. Smart Contract Tests & Deployment
```bash
cd contracts
# Run test suite
npx hardhat test

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
cd ..
```

### 5. Launch Development Services
Start backend REST API:
```bash
cd backend
npm run dev
```

In another terminal, start frontend application:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Smart Contract Reference

- **Contract Name**: `AcademicCredentialRegistry`
- **Network**: Ethereum Sepolia (`11155111`)
- **Default Deployed Address**: `0x27B08E9D1e457e8006E88B92e10419266F31336c`
- **Etherscan Sepolia**: [https://sepolia.etherscan.io/address/0x27B08E9D1e457e8006E88B92e10419266F31336c](https://sepolia.etherscan.io/address/0x27B08E9D1e457e8006E88B92e10419266F31336c)

### Key Functions
- `registerUniversity(address wallet, bytes32 institutionIdHash)`: Authorize an institution wallet.
- `deactivateUniversity(address wallet)`: Deactivate an institution.
- `issueCredential(bytes32 credentialId, bytes32 documentHash, bytes32 metadataHash)`: Register degree on-chain.
- `revokeCredential(bytes32 credentialId, bytes32 reasonHash)`: Revoke a degree with recorded reason.
- `verifyCredential(bytes32 credentialId)`: Public read function returning authentic status and hashes.
- `getCredential(bytes32 credentialId)`: Full on-chain credential struct lookup.

---

## 7. Verification Lifecycle & APIs

### REST Endpoints
- `GET /api/credentials/verify/:credentialId`: Dual-layer verification (verifies against both PostgreSQL record and real-time Ethereum Sepolia on-chain contract state).
- `POST /api/credentials/prepare`: Uploads degree PDF, calculates document SHA-256, canonicalizes metadata JSON, and computes `bytes32` hashes.
- `POST /api/credentials/confirm`: Confirms mined Sepolia transaction hash and indexes on-chain block numbers.
- `POST /api/credentials/revoke`: Confirms on-chain revocation transaction.
- `POST /api/auth/wallet/nonce`: Issues EIP-4361 SIWE challenge nonce.
- `POST /api/auth/wallet/verify`: Verifies MetaMask ECDSA signature for decentralized session auth.

---

## 8. Verification & Test Outcomes

- **Smart Contracts**: 12/12 Hardhat unit tests passing.
- **Backend API**: 8/8 Jest cryptographic and SIWE tests passing.
- **Frontend**: Clean TypeScript build with zero compilation errors (`npm run build`).

---

## 9. License

This project is licensed under the MIT License.

