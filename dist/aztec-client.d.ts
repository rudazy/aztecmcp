/**
 * Aztec Client - Comprehensive HTTP/RPC client for Aztec Network
 *
 * Communicates with:
 * - Aztec PXE (Private Execution Environment)
 * - Aztec Node
 * - L1 Ethereum (for bridge operations)
 */
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
export interface AccountInfo {
    address: string;
    publicKey?: string;
    partialAddress?: string;
    type?: string;
    alias?: string;
}
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
export interface ValidatorInfo {
    address: string;
    stake?: string;
    isActive: boolean;
}
export interface SequencerInfo {
    address: string;
    blockNumber?: number;
}
export interface L1ToL2MessageWitness {
    messageHash: string;
    secret: string;
    index: number;
    path: string[];
}
export declare class AztecClient {
    private pxeUrl;
    private nodeUrl;
    private l1RpcUrl;
    private requestId;
    constructor(pxeUrl?: string, nodeUrl?: string, l1RpcUrl?: string);
    private rpcCall;
    getNodeInfo(): Promise<NodeInfo>;
    getBlockNumber(): Promise<number>;
    getBlock(blockNumber?: number): Promise<BlockInfo>;
    getCurrentBaseFee(): Promise<{
        feePerDaGas: number;
        feePerL2Gas: number;
    }>;
    getChainId(): Promise<number>;
    getProtocolVersion(): Promise<number>;
    getL1ContractAddresses(): Promise<L1ContractAddresses>;
    getProtocolContractAddresses(): Promise<ProtocolContractAddresses>;
    getLogs(options: {
        txHash?: string;
        fromBlock?: number;
        toBlock?: number;
        contractAddress?: string;
        afterLog?: string;
    }): Promise<LogEntry[]>;
    getRegisteredAccounts(): Promise<AccountInfo[]>;
    registerAccount(secretKey: string, partialAddress: string): Promise<AccountInfo>;
    getAccountPublicKey(address: string): Promise<string | null>;
    registerSender(address: string): Promise<void>;
    getContractInstance(address: string): Promise<ContractInfo | null>;
    getContractClass(classId: string): Promise<unknown>;
    registerContract(address: string, artifact: unknown, options?: {
        publicKey?: string;
        salt?: string;
        deployer?: string;
        args?: unknown[];
    }): Promise<void>;
    isContractClassPubliclyRegistered(classId: string): Promise<boolean>;
    isContractPubliclyDeployed(address: string): Promise<boolean>;
    sendTransaction(txRequest: unknown, options?: {
        simulatePublic?: boolean;
    }): Promise<string>;
    simulateTransaction(txRequest: unknown, options?: {
        skipTxValidation?: boolean;
    }): Promise<SimulationResult>;
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
    getTxEffect(txHash: string): Promise<unknown>;
    getPendingTxs(): Promise<string[]>;
    estimateGas(txRequest: unknown): Promise<GasEstimate>;
    createAuthWitness(messageHash: string, secretKey: string): Promise<{
        witness: string;
    }>;
    addAuthWitness(witness: string): Promise<void>;
    getAuthWitness(messageHash: string): Promise<string | null>;
    getNotes(options: {
        contractAddress: string;
        storageSlot?: string;
        owner?: string;
        status?: "active" | "nullified";
    }): Promise<unknown[]>;
    addNote(note: unknown): Promise<void>;
    getSyncStatus(): Promise<{
        blocks: number;
        notes: number;
        syncedToBlock: number;
    }>;
    isGlobalStateSynchronized(): Promise<boolean>;
    isAccountSynchronized(address: string): Promise<boolean>;
    getL1ToL2MessageWitness(contractAddress: string, messageHash: string, secret: string): Promise<L1ToL2MessageWitness | null>;
    computeSecretHash(secret: string): Promise<string>;
    generateSecretAndHash(): Promise<SecretAndHash>;
    isNodeHealthy(): Promise<boolean>;
    isPxeHealthy(): Promise<boolean>;
    healthCheck(): Promise<{
        node: boolean;
        pxe: boolean;
        blockNumber?: number;
        syncStatus?: {
            blocks: number;
            notes: number;
            syncedToBlock: number;
        };
    }>;
    getAvailableExampleContracts(): string[];
    getUrls(): {
        pxe: string;
        node: string;
        l1: string;
    };
    setUrls(options: {
        pxe?: string;
        node?: string;
        l1?: string;
    }): void;
}
//# sourceMappingURL=aztec-client.d.ts.map