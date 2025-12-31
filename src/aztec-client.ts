/**
 * Aztec Client - Comprehensive HTTP/RPC client for Aztec Network
 * 
 * Communicates with:
 * - Aztec PXE (Private Execution Environment) 
 * - Aztec Node
 * - L1 Ethereum (for bridge operations)
 */

// ============================================
// Type Definitions
// ============================================

interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: unknown[];
  id: number;
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: number;
}

// Node Info
export interface NodeInfo {
  nodeVersion: string;
  l1ChainId: number;
  protocolVersion: number;
  enr?: string;
  l1ContractAddresses?: L1ContractAddresses;
  protocolContractAddresses?: ProtocolContractAddresses;
}

export interface L1ContractAddresses {
  rollupAddress?: string;
  registryAddress?: string;
  inboxAddress?: string;
  outboxAddress?: string;
  feeJuiceAddress?: string;
  stakingAssetAddress?: string;
  feeJuicePortalAddress?: string;
  coinIssuerAddress?: string;
  rewardDistributorAddress?: string;
  governanceProposerAddress?: string;
  governanceAddress?: string;
}

export interface ProtocolContractAddresses {
  classRegisterer?: string;
  feeJuice?: string;
  instanceDeployer?: string;
  multiCallEntrypoint?: string;
}

// Block Info
export interface BlockInfo {
  number: number;
  hash?: string;
  timestamp?: number;
  txCount?: number;
  header?: BlockHeader;
}

export interface BlockHeader {
  globalVariables?: {
    chainId: number;
    version: number;
    blockNumber: number;
    slotNumber: number;
    timestamp: number;
    coinbase: string;
    feeRecipient: string;
    gasFees: {
      feePerDaGas: number;
      feePerL2Gas: number;
    };
  };
}

// Account Info
export interface AccountInfo {
  address: string;
  publicKey?: string;
  partialAddress?: string;
  type?: string;
  alias?: string;
}

// Contract Info
export interface ContractInfo {
  address: string;
  contractClassId?: string;
  deployer?: string;
  initializationHash?: string;
  portalContractAddress?: string;
  publicKeys?: string[];
  version?: number;
}

export interface ContractFunction {
  name: string;
  functionType: "private" | "public" | "unconstrained";
  isInternal: boolean;
  parameters: Array<{
    name: string;
    type: string;
  }>;
}

// Transaction Types
export interface TransactionReceipt {
  txHash: string;
  status: "success" | "failed" | "pending" | "dropped";
  blockNumber?: number;
  blockHash?: string;
  error?: string;
  transactionFee?: string;
  gasUsed?: GasUsed;
}

export interface GasUsed {
  da: number;
  l2: number;
  teardownDA: number;
  teardownL2: number;
}

export interface GasEstimate {
  gasLimits: GasUsed;
  maxFeesPerGas: {
    da: number;
    l2: number;
  };
  estimatedFee: string;
}

export interface SimulationResult {
  success: boolean;
  returnValues?: unknown[];
  gasUsed?: GasUsed;
  error?: string;
  logs?: LogEntry[];
}

export interface LogEntry {
  contractAddress: string;
  data: string;
  blockNumber?: number;
  txHash?: string;
}

// Keys
export interface GeneratedKeys {
  encryptionPrivateKey: string;
  encryptionPublicKey: string;
  signingPrivateKey: string;
  signingPublicKey: string;
}

export interface BLSKeypair {
  secretKey: string;
  publicKey: string;
  publicKeyCompressed?: string;
}

export interface SecretAndHash {
  secret: string;
  hash: string;
}

// Validator/Sequencer
export interface ValidatorInfo {
  address: string;
  stake?: string;
  isActive: boolean;
}

export interface SequencerInfo {
  address: string;
  blockNumber?: number;
}

// L1 Bridge
export interface L1ToL2MessageWitness {
  messageHash: string;
  secret: string;
  index: number;
  path: string[];
}

// ============================================
// Aztec Client Class
// ============================================

export class AztecClient {
  private pxeUrl: string;
  private nodeUrl: string;
  private l1RpcUrl: string;
  private requestId = 0;

  constructor(
    pxeUrl: string = "http://localhost:8080",
    nodeUrl?: string,
    l1RpcUrl: string = "http://localhost:8545"
  ) {
    this.pxeUrl = pxeUrl;
    this.nodeUrl = nodeUrl || pxeUrl;
    this.l1RpcUrl = l1RpcUrl;
  }

  // ============================================
  // Core RPC Methods
  // ============================================

  private async rpcCall<T>(
    url: string,
    method: string,
    params: unknown[] = []
  ): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      method,
      params,
      id: ++this.requestId,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as JsonRpcResponse<T>;

    if (json.error) {
      throw new Error(`RPC error: ${json.error.message} (code: ${json.error.code})`);
    }

    return json.result as T;
  }

  // ============================================
  // Node & Network Information
  // ============================================

  async getNodeInfo(): Promise<NodeInfo> {
    return this.rpcCall<NodeInfo>(this.nodeUrl, "node_getInfo");
  }

  async getBlockNumber(): Promise<number> {
    return this.rpcCall<number>(this.nodeUrl, "aztec_getBlockNumber");
  }

  async getBlock(blockNumber?: number): Promise<BlockInfo> {
    const params = blockNumber !== undefined ? [blockNumber] : [];
    return this.rpcCall<BlockInfo>(this.nodeUrl, "aztec_getBlock", params);
  }

  async getCurrentBaseFee(): Promise<{ feePerDaGas: number; feePerL2Gas: number }> {
    return this.rpcCall(this.nodeUrl, "aztec_getCurrentBaseFee");
  }

  async getChainId(): Promise<number> {
    const info = await this.getNodeInfo();
    return info.l1ChainId;
  }

  async getProtocolVersion(): Promise<number> {
    const info = await this.getNodeInfo();
    return info.protocolVersion;
  }

  async getL1ContractAddresses(): Promise<L1ContractAddresses> {
    const info = await this.getNodeInfo();
    return info.l1ContractAddresses || {};
  }

  async getProtocolContractAddresses(): Promise<ProtocolContractAddresses> {
    const info = await this.getNodeInfo();
    return info.protocolContractAddresses || {};
  }

  // ============================================
  // Logs
  // ============================================

  async getLogs(options: {
    txHash?: string;
    fromBlock?: number;
    toBlock?: number;
    contractAddress?: string;
    afterLog?: string;
  }): Promise<LogEntry[]> {
    return this.rpcCall<LogEntry[]>(this.pxeUrl, "pxe_getLogs", [options]);
  }

  // ============================================
  // Account Management
  // ============================================

  async getRegisteredAccounts(): Promise<AccountInfo[]> {
    const accounts = await this.rpcCall<string[]>(
      this.pxeUrl,
      "pxe_getRegisteredAccounts"
    );
    return accounts.map((addr) => ({ address: addr }));
  }

  async registerAccount(
    secretKey: string,
    partialAddress: string
  ): Promise<AccountInfo> {
    const result = await this.rpcCall<{ address: string; publicKey: string }>(
      this.pxeUrl,
      "pxe_registerAccount",
      [secretKey, partialAddress]
    );
    return {
      address: result.address,
      publicKey: result.publicKey,
      partialAddress,
    };
  }

  async getAccountPublicKey(address: string): Promise<string | null> {
    try {
      return await this.rpcCall<string>(
        this.pxeUrl,
        "pxe_getRegisteredAccountPublicKey",
        [address]
      );
    } catch {
      return null;
    }
  }

  async registerSender(address: string): Promise<void> {
    await this.rpcCall(this.pxeUrl, "pxe_registerSender", [address]);
  }

  // ============================================
  // Contract Operations
  // ============================================

  async getContractInstance(address: string): Promise<ContractInfo | null> {
    try {
      return await this.rpcCall<ContractInfo>(
        this.pxeUrl,
        "pxe_getContractInstance",
        [address]
      );
    } catch {
      return null;
    }
  }

  async getContractClass(classId: string): Promise<unknown> {
    return this.rpcCall(this.pxeUrl, "pxe_getContractClass", [classId]);
  }

  async registerContract(
    address: string,
    artifact: unknown,
    options?: {
      publicKey?: string;
      salt?: string;
      deployer?: string;
      args?: unknown[];
    }
  ): Promise<void> {
    await this.rpcCall(this.pxeUrl, "pxe_registerContract", [
      address,
      artifact,
      options,
    ]);
  }

  async isContractClassPubliclyRegistered(classId: string): Promise<boolean> {
    return this.rpcCall<boolean>(
      this.nodeUrl,
      "aztec_isContractClassPubliclyRegistered",
      [classId]
    );
  }

  async isContractPubliclyDeployed(address: string): Promise<boolean> {
    return this.rpcCall<boolean>(
      this.nodeUrl,
      "aztec_isContractPubliclyDeployed",
      [address]
    );
  }

  // ============================================
  // Transaction Operations
  // ============================================

  async sendTransaction(
    txRequest: unknown,
    options?: {
      simulatePublic?: boolean;
    }
  ): Promise<string> {
    return this.rpcCall<string>(this.pxeUrl, "pxe_sendTx", [txRequest, options]);
  }

  async simulateTransaction(
    txRequest: unknown,
    options?: {
      skipTxValidation?: boolean;
    }
  ): Promise<SimulationResult> {
    try {
      const result = await this.rpcCall<{
        returnValues: unknown[];
        gasUsed: GasUsed;
        logs?: LogEntry[];
      }>(this.pxeUrl, "pxe_simulateTx", [txRequest, options]);

      return {
        success: true,
        returnValues: result.returnValues,
        gasUsed: result.gasUsed,
        logs: result.logs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    const receipt = await this.rpcCall<{
      status: string;
      blockNumber?: number;
      blockHash?: string;
      error?: string;
      transactionFee?: string;
    }>(this.nodeUrl, "aztec_getTransactionReceipt", [txHash]);

    return {
      txHash,
      status: receipt.status as TransactionReceipt["status"],
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      error: receipt.error,
      transactionFee: receipt.transactionFee,
    };
  }

  async getTxEffect(txHash: string): Promise<unknown> {
    return this.rpcCall(this.nodeUrl, "aztec_getTxEffect", [txHash]);
  }

  async getPendingTxs(): Promise<string[]> {
    return this.rpcCall<string[]>(this.pxeUrl, "pxe_getPendingTxs");
  }

  async estimateGas(txRequest: unknown): Promise<GasEstimate> {
    return this.rpcCall<GasEstimate>(this.pxeUrl, "pxe_estimateGas", [txRequest]);
  }

  // ============================================
  // Authorization & Auth Witnesses
  // ============================================

  async createAuthWitness(
    messageHash: string,
    secretKey: string
  ): Promise<{ witness: string }> {
    return this.rpcCall(this.pxeUrl, "pxe_createAuthWitness", [
      messageHash,
      secretKey,
    ]);
  }

  async addAuthWitness(witness: string): Promise<void> {
    await this.rpcCall(this.pxeUrl, "pxe_addAuthWitness", [witness]);
  }

  async getAuthWitness(messageHash: string): Promise<string | null> {
    try {
      return await this.rpcCall<string>(this.pxeUrl, "pxe_getAuthWitness", [
        messageHash,
      ]);
    } catch {
      return null;
    }
  }

  // ============================================
  // Notes & Private State
  // ============================================

  async getNotes(options: {
    contractAddress: string;
    storageSlot?: string;
    owner?: string;
    status?: "active" | "nullified";
  }): Promise<unknown[]> {
    return this.rpcCall<unknown[]>(this.pxeUrl, "pxe_getNotes", [options]);
  }

  async addNote(note: unknown): Promise<void> {
    await this.rpcCall(this.pxeUrl, "pxe_addNote", [note]);
  }

  // ============================================
  // Sync Status
  // ============================================

  async getSyncStatus(): Promise<{
    blocks: number;
    notes: number;
    syncedToBlock: number;
  }> {
    return this.rpcCall(this.pxeUrl, "pxe_getSyncStatus");
  }

  async isGlobalStateSynchronized(): Promise<boolean> {
    return this.rpcCall<boolean>(this.pxeUrl, "pxe_isGlobalStateSynchronized");
  }

  async isAccountSynchronized(address: string): Promise<boolean> {
    return this.rpcCall<boolean>(this.pxeUrl, "pxe_isAccountStateSynchronized", [
      address,
    ]);
  }

  // ============================================
  // L1 to L2 Messaging
  // ============================================

  async getL1ToL2MessageWitness(
    contractAddress: string,
    messageHash: string,
    secret: string
  ): Promise<L1ToL2MessageWitness | null> {
    try {
      return await this.rpcCall<L1ToL2MessageWitness>(
        this.pxeUrl,
        "pxe_getL1ToL2MembershipWitness",
        [contractAddress, messageHash, secret]
      );
    } catch {
      return null;
    }
  }

  // ============================================
  // Cryptographic Utilities
  // ============================================

  async computeSecretHash(secret: string): Promise<string> {
    return this.rpcCall<string>(this.pxeUrl, "pxe_computeSecretHash", [secret]);
  }

  async generateSecretAndHash(): Promise<SecretAndHash> {
    // Generate random Fr element and compute its hash
    const secret = await this.rpcCall<string>(this.pxeUrl, "pxe_generateSecret");
    const hash = await this.computeSecretHash(secret);
    return { secret, hash };
  }

  // ============================================
  // Health Checks
  // ============================================

  async isNodeHealthy(): Promise<boolean> {
    try {
      await this.getNodeInfo();
      return true;
    } catch {
      return false;
    }
  }

  async isPxeHealthy(): Promise<boolean> {
    try {
      await this.getRegisteredAccounts();
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{
    node: boolean;
    pxe: boolean;
    blockNumber?: number;
    syncStatus?: { blocks: number; notes: number; syncedToBlock: number };
  }> {
    const [nodeHealthy, pxeHealthy] = await Promise.all([
      this.isNodeHealthy(),
      this.isPxeHealthy(),
    ]);

    let blockNumber: number | undefined;
    let syncStatus: { blocks: number; notes: number; syncedToBlock: number } | undefined;

    if (nodeHealthy) {
      try {
        blockNumber = await this.getBlockNumber();
      } catch {
        // Ignore
      }
    }

    if (pxeHealthy) {
      try {
        syncStatus = await this.getSyncStatus();
      } catch {
        // Ignore
      }
    }

    return {
      node: nodeHealthy,
      pxe: pxeHealthy,
      blockNumber,
      syncStatus,
    };
  }

  // ============================================
  // Available Example Contracts
  // ============================================

  getAvailableExampleContracts(): string[] {
    return [
      "TokenContract",
      "TokenBridgeContract",
      "CounterContract",
      "EasyPrivateVotingContract",
      "EscrowContract",
      "CardGameContract",
      "CrowdfundingContract",
      "DocsExampleContract",
      "EcdsaKAccountContract",
      "EcdsaRAccountContract",
      "FPCContract",
      "InclusionProofsContract",
      "MultiCallEntrypointContract",
      "NFTContract",
      "PendingNoteHashesContract",
      "PriceFeedContract",
      "SchnorrAccountContract",
      "SchnorrHardcodedAccountContract",
      "SchnorrSingleKeyAccountContract",
      "SlowTreeContract",
      "StatefulTestContract",
      "TestContract",
      "UniswapContract",
    ];
  }

  // ============================================
  // Utility Methods
  // ============================================

  getUrls(): { pxe: string; node: string; l1: string } {
    return {
      pxe: this.pxeUrl,
      node: this.nodeUrl,
      l1: this.l1RpcUrl,
    };
  }

  setUrls(options: { pxe?: string; node?: string; l1?: string }): void {
    if (options.pxe) this.pxeUrl = options.pxe;
    if (options.node) this.nodeUrl = options.node;
    if (options.l1) this.l1RpcUrl = options.l1;
  }
}
