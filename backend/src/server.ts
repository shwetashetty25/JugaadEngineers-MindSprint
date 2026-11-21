import { app } from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('[PostgreSQL]: Database connection verified successfully.');

    app.listen(config.port, () => {
      console.log('==============================================');
      console.log(`VERIDEGREE X Backend REST API running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Network: Ethereum Sepolia (Chain ID: ${config.blockchain.chainId})`);
      console.log(`Health endpoint: http://localhost:${config.port}/api/health`);
      console.log('==============================================');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

