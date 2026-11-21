import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'veridegree_x_super_secure_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veridegree_x',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  encryptionKey: process.env.DOCUMENT_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  storagePath: process.env.PRIVATE_STORAGE_PATH || './storage/credentials',
  blockchain: {
    sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    registryAddress: process.env.REGISTRY_CONTRACT_ADDRESS || '0x98D5a89f0fbdCD2Af870380fE5094d833Fd60dCc',
    chainId: 11155111,
  },
};

