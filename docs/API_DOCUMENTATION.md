# VeriDegree X — REST API Documentation
**Base URL:** `http://localhost:4000/api`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new account (University, Student, Recruiter).
```json
// Request Body
{
  "fullName": "Prof. V. Ramgopal Rao",
  "email": "registrar.office@iitd.ac.in",
  "password": "SecurePassword123!",
  "role": "UNIVERSITY",
  "institutionName": "Indian Institute of Technology Delhi",
  "institutionCode": "IITD"
}

// Response (201 Created)
{
  "user": {
    "id": "c62040d3-3b56-4251-ba8d-...",
    "fullName": "Prof. V. Ramgopal Rao",
    "email": "registrar.office@iitd.ac.in",
    "role": "UNIVERSITY"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### `POST /auth/login`
Authenticates a user and returns a signed JWT.
```json
// Request Body
{
  "email": "registrar.office@iitd.ac.in",
  "password": "SecurePassword123!"
}

// Response (200 OK)
{
  "user": {
    "id": "c62040d3-3b56-4251-ba8d-...",
    "email": "registrar.office@iitd.ac.in",
    "role": "UNIVERSITY"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Wallet & Web3 Nonce Endpoints

### `POST /wallet/nonce`
Generates an EIP-4361 / SIWE compatible challenge nonce.
```json
// Request Body
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}

// Response (200 OK)
{
  "nonce": "a7b3c9f1e2d4...",
  "message": "veridegree-x.network wants you to sign in with your Ethereum account:\n0x1234...\n\nNonce: a7b3c9...\nIssued At: 2026-11-21T...",
  "expiresAt": "2026-11-21T19:45:00.000Z"
}
```

### `POST /wallet/verify-signature`
Validates personal_sign signature and links the wallet to the account.
```json
// Request Body
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0x4f8a...1c",
  "nonce": "a7b3c9f1e2d4..."
}
```

---

## 3. Credential Lifecycle Endpoints

### `POST /credentials/prepare` (Multipart/form-data)
Uploads degree PDF, calculates real SHA-256 binary hash and metadata hash, and returns data for university MetaMask signing.
- `degreePdf`: File upload (`.pdf`, max 15MB)
- `credentialId`: "VDX-2024-IITD-0891"
- `studentNumber`: "2020CS10492"
- `studentName`: "Aarav Sharma"
- `degreeName`: "Bachelor of Technology in Computer Science & Engineering"
- `department`: "Department of Computer Science and Engineering"
- `graduationYear`: 2024
- `grade`: "CGPA: 9.62 (Gold Medal)"
- `issueDate`: "2024-06-25"

```json
// Response (200 OK)
{
  "success": true,
  "documentHash": "0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411",
  "storageKey": "doc_e4f81c9a.enc",
  "fileSizeBytes": 248912,
  "preparation": {
    "credentialId": "VDX-2024-IITD-0891",
    "bytesCredentialId": "0x3c71a9e88b410fb37ca29801f92e104cb99182a17724a8799a9b9a674558231d",
    "bytesDocHash": "0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411",
    "bytesMetaHash": "0x91d84e27fbc109...",
    "contractAddress": "0x27B08E9D1e457e8006E88B92e10419266F31336c",
    "chainId": 11155111
  }
}
```

### `POST /credentials/confirm-issuance`
Called after university MetaMask confirms on-chain transaction.
```json
// Request Body
{
  "credentialId": "VDX-2024-IITD-0891",
  "blockchainTxHash": "0x5a8b7c..."
}
```

---

## 4. Verification Endpoints

### `POST /verification/verify`
Public zero-knowledge / privacy-safe verification endpoint.
```json
// Request Body
{
  "credentialId": "VDX-2024-IITD-0891",
  "verificationMethod": "QR_SCAN"
}

// Response (200 OK)
{
  "result": "VERIFIED",
  "credentialId": "VDX-2024-IITD-0891",
  "isAuthentic": true,
  "degreeName": "Bachelor of Technology in Computer Science & Engineering",
  "institutionName": "Indian Institute of Technology Delhi",
  "onChainDetails": {
    "exists": true,
    "revoked": false,
    "issuerWallet": "0x14791697260E4c9A71f18484C9f997B308e59325",
    "documentHash": "0x8f2a91b34c7e5d10a904e2876fc931d87f4c02eb98b631f4a9c680214a1e9411",
    "blockchainNetwork": "Ethereum Sepolia Testnet (EIP-155:11155111)"
  },
  "auditTimestamp": "2026-11-21T19:30:00.000Z"
}
```

