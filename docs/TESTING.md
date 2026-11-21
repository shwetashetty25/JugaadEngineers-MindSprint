# VERIDEGREE X — Testing Documentation

This document covers all automated test suites, test configurations, and verification procedures across smart contracts, backend services, and the frontend client.

---

## 1. Smart Contract Test Suite (Hardhat + ethers.js)

The smart contract test suite verifies the security, access controls, zero-PII storage, and state machine of `AcademicCredentialRegistry.sol`.

### Location
- `contracts/test/AcademicCredentialRegistry.test.ts`

### Running the Contract Tests
```bash
cd contracts
npx hardhat test
```

### Test Coverage (12 Passing Tests)

1. **Deployment & Access Control**
   - Correctly assigns `DEFAULT_ADMIN_ROLE` to the deployer.
   - Prevents non-admin accounts from registering an institution (`AccessControlUnauthorizedAccount`).
   - Prevents zero-address university registration (`InvalidAddress`).

2. **Institution Authorization**
   - Successfully registers an institution wallet with its institution code hash.
   - Accurately reports `isUniversityRegistered(wallet) == true`.
   - Admin can deactivate an institution; deactivated institutions cannot issue degrees (`UnauthorizedIssuer`).

3. **Credential Issuance**
   - Authorised institution can issue credentials with valid 32-byte hashes.
   - Rejects credential issuance if `credentialId` already exists (`CredentialAlreadyExists`).
   - Rejects issuance if `documentHash` or `metadataHash` is `bytes32(0)` (`InvalidHash`).
   - Emits `CredentialIssued` event with indexed parameters.

4. **Credential Verification**
   - Any public caller (including recruiters) can query `verifyCredential(credentialId)` and receive:
     - `exists: true`
     - `isAuthentic: true`
     - `isRevoked: false`
     - Matching `issuer`, `documentHash`, and `metadataHash`.
   - Returns `exists: false` and `isAuthentic: false` for non-existent IDs without reverting.

5. **Credential Revocation**
   - Original issuing university can revoke a credential with a reason hash.
   - Admin can also revoke credentials for regulatory enforcement.
   - Emits `CredentialRevoked` event with reason hash and revoker.
   - Verification of a revoked credential returns `isAuthentic: false` and `isRevoked: true`.
   - Rejects revocation from unauthorized third-party wallets (`UnauthorizedIssuer`).
   - Prevents duplicate revocation (`CredentialAlreadyRevoked`).

---

## 2. Backend Unit & Cryptographic Test Suite (Jest)

The backend test suite validates PDF integrity, document SHA-256 hashing, RFC 8785 canonical metadata hashing, and EIP-4361 Sign-In with Ethereum (SIWE) signature verification.

### Location
- `backend/tests/hashing.test.ts`
- `backend/tests/wallet.test.ts`

### Running Backend Tests
```bash
cd backend
npm test
```

### Test Coverage (8 Passing Tests)

1. **Hashing & Document Integrity (`hashing.test.ts`)**
   - Validates PDF magic header bytes (`%PDF-`) and rejects non-PDF buffers.
   - Computes deterministic SHA-256 digests matching standard OpenSSL output.
   - Produces identical hash for identical buffers.
   - Normalizes and hashes metadata canonically according to RFC 8785 (keys sorted, whitespace invariant).
   - Confirms that altered metadata fields yield completely different hashes.

2. **Wallet SIWE Authentication (`wallet.test.ts`)**
   - Generates cryptographically secure alphanumeric nonces with 5-minute expirations.
   - Successfully verifies EIP-191 signatures against the claimed wallet address.
   - Flags consumed nonces to prevent replay attacks.
   - Rejects forged signatures and mismatched addresses.

---

## 3. Frontend Build & Static Analysis

Ensures TypeScript strict typing, component trees, and Web3 hooks build without errors.

### Running Frontend Build
```bash
npm run build
```

**Verification Criteria:**
- 0 TypeScript compilation errors (`tsc`).
- Vite bundle creation in `dist/`.
- All CSS classes resolved by Tailwind.

---

## 4. End-to-End Lifecycle Walkthrough

To verify the complete platform lifecycle manually:

| Step | Actor | Action | Expected Result |
| :--- | :--- | :--- | :--- |
| 1 | University | Connect MetaMask to Sepolia | Address displayed in header with green Sepolia badge |
| 2 | University | Navigate to `/university/issue` | Form loads with file uploader |
| 3 | University | Fill student info & upload sample PDF | Document & canonical metadata hashes calculated client/server side |
| 4 | University | Submit Issue Degree | MetaMask prompts transaction signature (`issueCredential`) |
| 5 | University | Confirm in MetaMask | Transaction mined on Sepolia; receipt displayed with Tx Hash & Etherscan link |
| 6 | Recruiter | Navigate to `/verify` | Search input displayed |
| 7 | Recruiter | Enter issued Credential ID | Instant verification result returned: `VERIFIED` with on-chain cryptographic proof |
| 8 | University | Navigate to `/university/credentials/:id` | Credential detail page displays Revoke button |
| 9 | University | Click Revoke Credential | MetaMask prompts `revokeCredential`; transaction mined |
| 10 | Recruiter | Re-query `/verify` with same Credential ID | Status displays `REVOKED` with revocation decree timestamp |

