import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { useToast } from '../context/ToastContext';
import { encodeCredentialIdToBytes32 } from '../utils/credentialEncoder';

// Sepolia Network Configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_HEX_CHAIN_ID = '0xaa36a7';
export const DEFAULT_REGISTRY_ADDRESS = '0x98D5a89f0fbdCD2Af870380fE5094d833Fd60dCc'; // Deployed Sepolia Registry Address
export const DEFAULT_SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// ABI for the AcademicCredentialRegistry
export const REGISTRY_ABI = [
  'function registerUniversity(address wallet, bytes32 institutionIdHash) external',
  'function deactivateUniversity(address wallet) external',
  'function isUniversityRegistered(address wallet) external view returns (bool)',
  'function issueCredential(bytes32 credentialId, bytes32 documentHash, bytes32 metadataHash) external',
  'function revokeCredential(bytes32 credentialId, bytes32 reasonHash) external',
  'function verifyCredential(bytes32 credentialId) external view returns (bool exists, bool isAuthentic, bool isRevoked, address issuer, bytes32 documentHash, bytes32 metadataHash, uint256 issuedAt, uint256 revokedAt)',
  'function getCredential(bytes32 credentialId) external view returns (tuple(bytes32 credentialId, bytes32 documentHash, bytes32 metadataHash, address issuer, uint256 issuedAt, uint256 revokedAt, bytes32 revocationReason, bool exists, bool revoked))',
  'event CredentialIssued(bytes32 indexed credentialId, bytes32 indexed documentHash, bytes32 metadataHash, address indexed issuer, uint256 issuedAt)',
  'event CredentialRevoked(bytes32 indexed credentialId, bytes32 indexed reasonHash, address indexed revoker, uint256 revokedAt)',
];

export type WalletConnectionStatus =
  | 'NOT_INSTALLED'
  | 'LOCKED'
  | 'WRONG_NETWORK'
  | 'CONNECTED'
  | 'DISCONNECTED';

export interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isSepolia: boolean;
  isConnecting: boolean;
  hasMetaMask: boolean;
  isDemoWallet: boolean;
  walletStatus: WalletConnectionStatus;
  connectWallet: () => Promise<string | null>;
  connectDemoWallet: () => string;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<boolean>;
  getSigner: () => Promise<JsonRpcSigner | null>;
  issueCredentialOnChain: (
    bytesCredentialId: string,
    bytesDocHash: string,
    bytesMetaHash: string
  ) => Promise<{ txHash: string; blockNumber?: number }>;
  revokeCredentialOnChain: (
    bytesCredentialId: string,
    bytesReasonHash: string
  ) => Promise<{ txHash: string }>;
  verifyCredentialOnChain: (credentialId: string) => Promise<any>;
}

/**
 * Safely detects and returns genuine MetaMask provider from window.ethereum.
 * Avoids assuming every injected provider is MetaMask (e.g. handles multiple extensions, Brave, Phantom, Coinbase).
 */
export const getInjectedMetaMaskProvider = (): any => {
  if (typeof window === 'undefined') return null;
  const eth = (window as any).ethereum;
  if (!eth) return null;

  // Case 1: Multiple providers registered under ethereum.providers (EIP-5749 / EIP-1193)
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    // Specifically locate MetaMask provider while filtering out extensions that spoof isMetaMask
    const genuineMetaMask = eth.providers.find(
      (p: any) => p.isMetaMask && !p.isBraveWallet && !p.isPhantom && !p.isCoinbaseWallet
    );
    if (genuineMetaMask) return genuineMetaMask;

    // Fallback to any provider flagged as isMetaMask
    const anyMetaMask = eth.providers.find((p: any) => p.isMetaMask);
    if (anyMetaMask) return anyMetaMask;

    return null;
  }

  // Case 2: Single provider with isMetaMask flag
  if (eth.isMetaMask) {
    return eth;
  }

  return null;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isDemoWallet, setIsDemoWallet] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletConnectionStatus>('DISCONNECTED');

  const { success, error, info } = useToast();

  // Safe silent detection of MetaMask on mount (NO error popups on page load)
  useEffect(() => {
    let isMounted = true;

    const inspectProvider = async () => {
      const mmProvider = getInjectedMetaMaskProvider();
      if (!mmProvider) {
        if (isMounted) {
          setHasMetaMask(false);
          setWalletStatus('NOT_INSTALLED');
        }
        return;
      }

      if (isMounted) {
        setHasMetaMask(true);
      }

      try {
        // Query accounts silently without opening popup or prompting user
        const accounts: string[] = await mmProvider.request({ method: 'eth_accounts' });
        const currentChainHex: string = await mmProvider.request({ method: 'eth_chainId' });
        const parsedChainId = currentChainHex ? parseInt(currentChainHex, 16) : null;

        if (isMounted) {
          setChainId(parsedChainId);
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsDemoWallet(false);
            if (parsedChainId === SEPOLIA_CHAIN_ID) {
              setWalletStatus('CONNECTED');
            } else {
              setWalletStatus('WRONG_NETWORK');
            }
          } else {
            // Extension is present, but locked or disconnected
            setAccount(null);
            setWalletStatus('LOCKED');
          }
        }
      } catch (silentErr) {
        console.debug('Silent provider check completed without active session:', silentErr);
      }

      // Attach EIP-1193 event listeners
      const handleAccountsChanged = (accs: string[]) => {
        if (!isMounted) return;
        if (accs && accs.length > 0) {
          setAccount(accs[0]);
          setIsDemoWallet(false);
          setWalletStatus('CONNECTED');
          info('Account Changed', `Active wallet: ${accs[0].slice(0, 6)}...${accs[0].slice(-4)}`);
        } else {
          setAccount(null);
          setIsDemoWallet(false);
          setWalletStatus('LOCKED');
        }
      };

      const handleChainChanged = (newChainIdHex: string) => {
        if (!isMounted) return;
        const newId = parseInt(newChainIdHex, 16);
        setChainId(newId);
        if (newId === SEPOLIA_CHAIN_ID) {
          setWalletStatus('CONNECTED');
        } else {
          setWalletStatus('WRONG_NETWORK');
        }
      };

      if (mmProvider.on) {
        mmProvider.on('accountsChanged', handleAccountsChanged);
        mmProvider.on('chainChanged', handleChainChanged);
      }
    };

    inspectProvider();

    // Listen for late injection in Chromium browsers
    const handleEthereumInitialized = () => {
      inspectProvider();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', handleEthereumInitialized, { once: true });
    }

    return () => {
      isMounted = false;
      const mmProvider = getInjectedMetaMaskProvider();
      if (mmProvider && mmProvider.removeListener) {
        mmProvider.removeListener('accountsChanged', () => {});
        mmProvider.removeListener('chainChanged', () => {});
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('ethereum#initialized', handleEthereumInitialized);
      }
    };
  }, []);

  const connectDemoWallet = (): string => {
    const demoAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    setAccount(demoAddress);
    setChainId(SEPOLIA_CHAIN_ID);
    setIsDemoWallet(true);
    setWalletStatus('CONNECTED');
    success(
      'Demo Wallet Connected',
      'Connected as IIT Delhi Registrar (0x7099...79C8). You can explore all UI features immediately.'
    );
    return demoAddress;
  };

  /**
   * Connects to MetaMask safely with distinct handling for:
   * - MetaMask not installed
   * - MetaMask installed but locked
   * - User rejected connection
   * - Wrong network
   * - Successful connection
   */
  const connectWallet = async (): Promise<string | null> => {
    const mmProvider = getInjectedMetaMaskProvider();

    // 1. State: MetaMask not installed
    if (!mmProvider) {
      setHasMetaMask(false);
      setWalletStatus('NOT_INSTALLED');
      info(
        'MetaMask Not Detected',
        'MetaMask extension was not detected in this browser. Connecting Demo Registrar Wallet (0x7099...79C8) for immediate UI testing. Install MetaMask from metamask.io for live Sepolia signing.'
      );
      return connectDemoWallet();
    }

    try {
      setIsConnecting(true);

      // Request accounts from MetaMask
      let accounts: string[] = [];
      try {
        accounts = await mmProvider.request({ method: 'eth_requestAccounts' });
      } catch (reqError: any) {
        // 2. State: User rejected connection (EIP-1193 code 4001)
        if (reqError.code === 4001 || reqError?.message?.toLowerCase().includes('user rejected')) {
          info('Connection Cancelled', 'Wallet connection request was rejected in MetaMask.');
          setWalletStatus('DISCONNECTED');
          return null;
        }

        // 3. State: MetaMask installed but locked / prompt already pending (code -32002)
        if (reqError.code === -32002) {
          setWalletStatus('LOCKED');
          info(
            'MetaMask Action Required',
            'MetaMask has a pending request or is locked. Please open your MetaMask extension popup to unlock and approve the connection.'
          );
          return null;
        }

        throw reqError;
      }

      if (!accounts || accounts.length === 0) {
        setWalletStatus('LOCKED');
        info('MetaMask Locked', 'No accounts unlocked. Please unlock your MetaMask wallet.');
        return null;
      }

      const activeAccount = accounts[0];
      setAccount(activeAccount);
      setIsDemoWallet(false);

      // Verify chain ID
      const chainIdHex = await mmProvider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // 4. State: Wrong network
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        setWalletStatus('WRONG_NETWORK');
        info(
          'Wrong Network',
          `Connected to Chain ID ${currentChainId}. Switching to Ethereum Sepolia (11155111)...`
        );
        const switched = await switchToSepolia();
        if (!switched) {
          return activeAccount;
        }
      }

      // 5. State: Wallet connected successfully
      setWalletStatus('CONNECTED');
      success(
        'Wallet Connected',
        `Connected: ${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)} on Sepolia`
      );

      return activeAccount;
    } catch (e: any) {
      if (e.code === 4001) {
        info('Connection Cancelled', 'Wallet connection was cancelled in MetaMask.');
      } else {
        error('Connection Failed', e.message || 'Failed to connect MetaMask wallet.');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsDemoWallet(false);
    setWalletStatus('DISCONNECTED');
    info('Wallet Disconnected', 'Wallet session disconnected.');
  };

  /**
   * Prompts network switch to Ethereum Sepolia (Chain ID: 11155111).
   * Adds network if missing (Error 4902).
   */
  const switchToSepolia = async (): Promise<boolean> => {
    const mmProvider = getInjectedMetaMaskProvider();
    if (!mmProvider) {
      error('MetaMask Required', 'Please install MetaMask to switch networks.');
      return false;
    }

    try {
      await mmProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }],
      });
      setChainId(SEPOLIA_CHAIN_ID);
      setWalletStatus('CONNECTED');
      success('Network Switched', 'Connected to Ethereum Sepolia Testnet (11155111)');
      return true;
    } catch (switchError: any) {
      // User rejected switch
      if (switchError.code === 4001) {
        setWalletStatus('WRONG_NETWORK');
        error('Wrong Network', 'Network switch rejected. Please switch MetaMask to Ethereum Sepolia (11155111) to sign transactions.');
        return false;
      }

      // Network not added to MetaMask yet
      if (switchError.code === 4902) {
        try {
          await mmProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_HEX_CHAIN_ID,
                chainName: 'Ethereum Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: [DEFAULT_SEPOLIA_RPC],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          setChainId(SEPOLIA_CHAIN_ID);
          setWalletStatus('CONNECTED');
          success('Network Added', 'Sepolia network registered and selected in MetaMask.');
          return true;
        } catch (addError: any) {
          if (addError.code === 4001) {
            error('Network Cancelled', 'Adding Sepolia network was cancelled in MetaMask.');
          } else {
            error('Network Error', 'Could not add Sepolia network to MetaMask.');
          }
          return false;
        }
      }

      error('Network Switch Failed', switchError.message || 'Could not switch to Sepolia.');
      return false;
    }
  };

  const getSigner = async (): Promise<JsonRpcSigner | null> => {
    const mmProvider = getInjectedMetaMaskProvider();
    if (!mmProvider) return null;
    const provider = new BrowserProvider(mmProvider);
    return await provider.getSigner();
  };

  /**
   * Issues credential on-chain via MetaMask on Sepolia.
   */
  const issueCredentialOnChain = async (
    bytesCredentialId: string,
    bytesDocHash: string,
    bytesMetaHash: string
  ): Promise<{ txHash: string; blockNumber?: number }> => {
    if (isDemoWallet) {
      throw new Error('Demo Wallet cannot broadcast live on-chain transactions. Please connect your university MetaMask wallet on Ethereum Sepolia.');
    }

    const mmProvider = getInjectedMetaMaskProvider();
    if (!mmProvider) {
      throw new Error('MetaMask is required to submit transactions on Ethereum Sepolia. Please install MetaMask from metamask.io.');
    }

    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected. Please connect your MetaMask wallet.');

    if (chainId !== SEPOLIA_CHAIN_ID) {
      const switched = await switchToSepolia();
      if (!switched) {
        throw new Error('Please switch your wallet network to Ethereum Sepolia (Chain ID: 11155111).');
      }
    }

    const contract = new Contract(DEFAULT_REGISTRY_ADDRESS, REGISTRY_ABI, signer);

    // 1. Enforce on-chain university authorization
    const signerAddress = await signer.getAddress();
    const isAuthorized = await contract.isUniversityRegistered(signerAddress);
    if (!isAuthorized) {
      throw new Error(
        `Signing wallet (${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}) is not an authorized university issuer on AcademicCredentialRegistry. Only registered institutions can issue degrees.`
      );
    }

    // 2. Pre-flight duplicate check on-chain
    const existing = await contract.verifyCredential(bytesCredentialId);
    if (existing && existing.exists) {
      throw new Error('Credential ID is already registered on Ethereum Sepolia. Duplicate issuance rejected.');
    }

    info('Broadcasting Transaction', 'Please confirm the degree issuance in MetaMask...');

    let tx: any;
    try {
      tx = await contract.issueCredential(bytesCredentialId, bytesDocHash, bytesMetaHash);
    } catch (broadcastErr: any) {
      if (broadcastErr.code === 4001 || broadcastErr?.message?.toLowerCase().includes('user rejected')) {
        throw new Error('Transaction was rejected in MetaMask.');
      }
      throw broadcastErr;
    }

    info('Mining Block', `Transaction submitted: ${tx.hash.slice(0, 10)}... Waiting for Sepolia block confirmation.`);

    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Transaction failed or reverted on Sepolia (Status: ${receipt?.status})`);
    }

    // Verify CredentialIssued event is in transaction receipt logs
    const eventInterface = new ethers.Interface(REGISTRY_ABI);
    const hasIssuedEvent = receipt.logs.some((log: any) => {
      try {
        const parsed = eventInterface.parseLog(log);
        return parsed && parsed.name === 'CredentialIssued';
      } catch {
        return false;
      }
    });

    if (!hasIssuedEvent) {
      console.warn('CredentialIssued event was not found in transaction receipt logs.');
    }

    success('Transaction Confirmed!', `Credential anchored on-chain in Sepolia block #${receipt.blockNumber}`);

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  };

  /**
   * Revokes credential on-chain via MetaMask on Sepolia.
   */
  const revokeCredentialOnChain = async (
    bytesCredentialId: string,
    bytesReasonHash: string
  ): Promise<{ txHash: string }> => {
    if (isDemoWallet) {
      throw new Error('Demo Wallet cannot broadcast on-chain revocations. Please connect your university MetaMask wallet on Ethereum Sepolia.');
    }

    const mmProvider = getInjectedMetaMaskProvider();
    if (!mmProvider) {
      throw new Error('MetaMask is required to revoke credentials on Ethereum Sepolia.');
    }

    const signer = await getSigner();
    if (!signer) throw new Error('Wallet not connected. Please connect your MetaMask wallet.');

    if (chainId !== SEPOLIA_CHAIN_ID) {
      const switched = await switchToSepolia();
      if (!switched) {
        throw new Error('Please switch your wallet network to Ethereum Sepolia (Chain ID: 11155111).');
      }
    }

    const contract = new Contract(DEFAULT_REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    info('Broadcasting Revocation', 'Please sign the revocation decree in MetaMask...');

    let tx: any;
    try {
      tx = await contract.revokeCredential(bytesCredentialId, bytesReasonHash);
    } catch (revokeErr: any) {
      if (revokeErr.code === 4001 || revokeErr?.message?.toLowerCase().includes('user rejected')) {
        throw new Error('Revocation decree signature was rejected in MetaMask.');
      }
      throw revokeErr;
    }

    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Revocation transaction failed or reverted on Sepolia (Status: ${receipt?.status})`);
    }

    success('Revocation Confirmed', `Degree officially revoked on Ethereum Sepolia ledger in block #${receipt.blockNumber}.`);

    return { txHash: tx.hash };
  };

  /**
   * Read-only smart contract verification.
   * ALWAYS uses public Sepolia JSON-RPC provider. NEVER requires MetaMask or wallet interaction.
   */
  const verifyCredentialOnChain = async (credentialId: string): Promise<any> => {
    const provider = new ethers.JsonRpcProvider(DEFAULT_SEPOLIA_RPC);
    const contract = new Contract(DEFAULT_REGISTRY_ADDRESS, REGISTRY_ABI, provider);
    const bytesId = encodeCredentialIdToBytes32(credentialId);
    return await contract.verifyCredential(bytesId);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        isSepolia: chainId === SEPOLIA_CHAIN_ID,
        isConnecting,
        hasMetaMask,
        isDemoWallet,
        walletStatus,
        connectWallet,
        connectDemoWallet,
        disconnectWallet,
        switchToSepolia,
        getSigner,
        issueCredentialOnChain,
        revokeCredentialOnChain,
        verifyCredentialOnChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
