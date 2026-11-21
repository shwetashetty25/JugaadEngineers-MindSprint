import { WalletService } from '../src/services/walletService';
import { ethers } from 'ethers';

describe('Wallet Nonce & EIP-191 Authentication Tests', () => {
  const wallet = ethers.Wallet.createRandom();

  it('should generate a cryptographically random nonce with expiry', () => {
    const { nonce, message, expiresAt } = WalletService.generateNonce(wallet.address);

    expect(nonce).toBeDefined();
    expect(nonce.length).toBe(32);
    expect(message).toContain(wallet.address);
    expect(message).toContain(nonce);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should verify signature successfully when signed by owner', async () => {
    const { nonce, message } = WalletService.generateNonce(wallet.address);
    const signature = await wallet.signMessage(message);

    const verification = WalletService.verifySignature(wallet.address, signature, nonce);
    expect(verification.valid).toBe(true);
  });

  it('should prevent nonce replay attacks', async () => {
    const { nonce, message } = WalletService.generateNonce(wallet.address);
    const signature = await wallet.signMessage(message);

    // First use: Valid
    const firstAttempt = WalletService.verifySignature(wallet.address, signature, nonce);
    expect(firstAttempt.valid).toBe(true);

    // Second use with same nonce: Must be rejected!
    const replayAttempt = WalletService.verifySignature(wallet.address, signature, nonce);
    expect(replayAttempt.valid).toBe(false);
    expect(replayAttempt.error).toContain('replay');
  });

  it('should reject signature from an unauthorized wallet address', async () => {
    const maliciousWallet = ethers.Wallet.createRandom();
    const { nonce, message } = WalletService.generateNonce(wallet.address);
    const signature = await maliciousWallet.signMessage(message);

    // Malicious wallet signed, but address given is victim's
    const attackAttempt = WalletService.verifySignature(wallet.address, signature, nonce);
    expect(attackAttempt.valid).toBe(false);
  });
});

