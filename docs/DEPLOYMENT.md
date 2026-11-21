# VERIDEGREE X — Deployment Guide

This guide details the deployment of **VeriDegree X** across its three core tiers:
1. Solidity Smart Contracts to Ethereum Sepolia testnet.
2. Node.js / Express Backend REST API with PostgreSQL.
3. React / Vite Frontend application.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` v9+
- **Database**: PostgreSQL 14+ running locally or hosted (e.g., Supabase, Neon, AWS RDS)
- **Web3 Wallet**: MetaMask browser extension
- **Sepolia Testnet ETH**: From [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)

---

## 2. Smart Contract Deployment (Ethereum Sepolia)

### Step 1: Navigate to contracts directory and install dependencies
```bash
cd contracts
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in:
- `SEPOLIA_RPC_URL`: e.g. `https://sepolia.infura.io/v3/YOUR_INFURA_KEY` or `https://rpc.sepolia.org`
- `SEPOLIA_PRIVATE_KEY`: Private key of deployer wallet funded with Sepolia ETH
- `IITD_UNIVERSITY_WALLET`: Optional wallet address to register as an issuer (defaults to deployer)

### Step 3: Run Contract Test Suite
Ensure all 12 tests pass before deploying:
```bash
npx hardhat test
```

### Step 4: Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected Output:**
```
==========================================
Deploying AcademicCredentialRegistry...
Deployer Address: 0x...
Deployer Balance: 0.5 ETH
==========================================
AcademicCredentialRegistry deployed to: 0x27B08E9D1e457e8006E88B92e10419266F31336c
Registering university 0x... with code hash 0x...
University registered successfully! Tx: 0x...
Deployment details saved to src/config/contractDeployment.json
```

---

## 3. Backend Deployment (Node.js + PostgreSQL)

### Step 1: Navigate to backend directory and install dependencies
```bash
cd ../backend
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` points to an active PostgreSQL instance, e.g.:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/veridegree_x?schema=public
REGISTRY_CONTRACT_ADDRESS=0x27B08E9D1e457e8006E88B92e10419266F31336c
DOCUMENT_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Step 3: Run Prisma Migrations & Generate Client
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 4: Run Backend Unit Tests
```bash
npm test
```

### Step 5: Start the Backend Server
Development mode:
```bash
npm run dev
```
Production build:
```bash
npm run build
npm start
```
Verify health:
```bash
curl http://localhost:4000/api/health
```

---

## 4. Frontend Deployment (React + Vite)

### Step 1: Return to root directory and install dependencies
```bash
cd ..
npm install
```

### Step 2: Configure Environment
Create `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_REGISTRY_CONTRACT_ADDRESS` matches your deployed Sepolia contract address.

### Step 3: Build and Test Frontend
```bash
npm run build
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 5. End-to-End Verification Check

1. Open frontend at `http://localhost:5173`.
2. Connect MetaMask and switch to Sepolia network.
3. Switch role to **University**.
4. Go to **Issue Degree** (`/university/issue`), fill in candidate details, upload a PDF degree.
5. Click **Issue & Anchor to Blockchain**.
6. MetaMask will prompt for a transaction signature. Confirm transaction.
7. Upon confirmation, navigate to `/verify` as a Recruiter, enter the generated Credential ID, and verify the on-chain status!

