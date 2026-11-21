# VeriDegree X — Smart Contract Architecture Specification
**Contract Name:** `AcademicCredentialRegistry.sol`  
**Solidity Version:** `^0.8.20`  
**Dependencies:** `@openzeppelin/contracts@^5.0.0`

---

## 1. Design Overview

The `AcademicCredentialRegistry` contract acts as an immutable, tamper-evident registrar on Ethereum Sepolia. It stores cryptographic hashes of academic credentials issued by authorized institutions.

### Core Security Principles:
1. **Zero PII on Blockchain**: No personal data (names, marks, emails) is stored in contract state or emitted in event logs.
2. **Access Control**: Built on OpenZeppelin `AccessControl`.
   - `DEFAULT_ADMIN_ROLE`: Authorizes or deactivates university issuer wallets.
   - `UNIVERSITY_ROLE`: Authorized university wallets capable of issuing and revoking credentials.
3. **Immutability of Historical Issuance**: Existing credentials remain verifiable even if an institution is later deactivated.
4. **Idempotence & Anti-Replay**: Duplicate `credentialId` registrations and repeated revocations are strictly reverted with custom errors.

---

## 2. Data Structures

```solidity
struct CredentialRecord {
    bytes32 credentialId;   // Unique deterministic identifier (e.g. keccak256("VDX-2024-IITD-0891"))
    bytes32 documentHash;   // SHA-256 fingerprint of the academic degree PDF
    bytes32 metadataHash;   // SHA-256 fingerprint of canonical degree metadata
    address issuer;         // Address of the conferring institution
    uint256 issuedAt;       // On-chain block timestamp of issuance
    uint256 revokedAt;      // On-chain block timestamp of revocation (0 if active)
    bytes32 revocationReason; // Hash of official revocation decree (bytes32(0) if active)
    bool exists;            // Whether the credential has been registered
    bool revoked;           // Revocation status flag
}

struct UniversityRecord {
    bytes32 institutionIdHash; // keccak256 of institutional code (e.g. "IITD")
    bool isRegistered;          // Registration status
    bool isActive;              // Operational status
    uint256 registeredAt;       // Registration timestamp
}
```

---

## 3. Function Interface

### Administrative Functions:
- `function registerUniversity(address wallet, bytes32 institutionIdHash) external onlyRole(DEFAULT_ADMIN_ROLE)`:
  Authorizes an institutional wallet to issue credentials.
- `function deactivateUniversity(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE)`:
  Revokes issuing privileges without affecting previously issued credentials.
- `function reactivateUniversity(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE)`:
  Restores issuing privileges.

### Credential Operations:
- `function issueCredential(bytes32 credentialId, bytes32 documentHash, bytes32 metadataHash) external`:
  Callable only by an active registered university. Reverts if `credentialId` already exists or hashes are zero.
- `function revokeCredential(bytes32 credentialId, bytes32 reasonHash) external`:
  Callable only by the original issuing university or default admin. Reverts if already revoked or non-existent.
- `function verifyCredential(bytes32 credentialId) external view returns (bool exists, bool isAuthentic, bool isRevoked, address issuer, bytes32 documentHash, bytes32 metadataHash, uint256 issuedAt, uint256 revokedAt)`:
  Public view function returning comprehensive credential status.
- `function getCredential(bytes32 credentialId) external view returns (CredentialRecord memory)`:
  Returns full credential struct.

---

## 4. On-Chain Events

```solidity
event UniversityRegistered(address indexed wallet, bytes32 indexed institutionIdHash, uint256 timestamp);
event UniversityDeactivated(address indexed wallet, uint256 timestamp);
event UniversityReactivated(address indexed wallet, uint256 timestamp);
event CredentialIssued(bytes32 indexed credentialId, bytes32 indexed documentHash, address indexed issuer, uint256 issuedAt);
event CredentialRevoked(bytes32 indexed credentialId, bytes32 indexed reasonHash, address indexed revoker, uint256 revokedAt);
```

