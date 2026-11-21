# VeriDegree X — Security Specification & Threat Model
**Version:** 1.0.0

---

## 1. Zero-PII Blockchain Architecture
Under no circumstances is Personally Identifiable Information (PII) recorded to Ethereum Sepolia.
- **On-chain records contain ONLY**:
  - `credentialId` (bytes32 keccak256 hash)
  - `documentHash` (bytes32 SHA-256 binary hash of the degree PDF)
  - `metadataHash` (bytes32 SHA-256 canonical hash of the degree transcript)
  - `issuer` (institutional Ethereum address)
  - `issuedAt`, `revokedAt` timestamps
- **Student Privacy Protection**: Full student names, emails, grades, and actual PDF documents remain off-chain, encrypted in private object storage and PostgreSQL.

---

## 2. Cryptographic Integrity Protocol
- **Document Hashing**: Evaluated directly over raw binary bytes using SHA-256. Validated against PDF magic bytes (`%PDF-` / `0x255044462D`).
- **Deterministic Metadata Hashing**: Uses RFC 8785 canonical JSON sorting to guarantee that identical metadata structures yield the exact same 32-byte digest across any platform or runtime.
- **Tamper Evident**: Modifying even 1 bit of a certificate (e.g., changing CGPA 9.62 to 9.63) produces a completely different hash digest, triggering an immediate `INVALID / TAMPERED` alert.

---

## 3. Web3 & Wallet Signature Security (EIP-4361 / SIWE)
- **Nonce Replay Prevention**: Every wallet connection requires a single-use, 32-character hex nonce with a 5-minute expiration window. Used nonces are immediately invalidated.
- **Zero Server-Side Private Key Custody**: Universities sign transactions directly using their own MetaMask wallet in the browser. The server never asks for, handles, or stores institutional private keys.

---

## 4. API & Data Storage Security
- **Encrypted Document Storage**: Uploaded degree PDFs are encrypted at rest using `AES-256-GCM` with a unique 12-byte initialization vector (IV) and 16-byte authentication tag per file.
- **Access Control & Authorization**: REST API endpoints enforce role-based access control (`UNIVERSITY`, `STUDENT`, `RECRUITER`, `ADMIN`).
- **OWASP Hardening**:
  - `Helmet` security headers
  - Strict CORS allowlist
  - Rate limiting (300 requests per 15-minute window)
  - `Zod` request payload validation
  - SQL injection protection via Prisma ORM parameterized queries

