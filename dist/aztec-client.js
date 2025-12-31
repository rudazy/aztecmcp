/**
 * Aztec Client - Comprehensive HTTP/RPC client for Aztec Network
 *
 * Communicates with:
 * - Aztec PXE (Private Execution Environment)
 * - Aztec Node
 * - L1 Ethereum (for bridge operations)
 */
// ============================================
// Aztec Client Class
// ============================================
export class AztecClient {
    pxeUrl;
    nodeUrl;
    l1RpcUrl;
    requestId = 0;
    constructor(pxeUrl = "http://localhost:8080", nodeUrl, l1RpcUrl = "http://localhost:8545") {
        this.pxeUrl = pxeUrl;
        this.nodeUrl = nodeUrl || pxeUrl;
        this.l1RpcUrl = l1RpcUrl;
    }
    // ============================================
    // Core RPC Methods
    // ============================================
    async rpcCall(url, method, params = []) {
        const request = {
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
        const json = (await response.json());
        if (json.error) {
            throw new Error(`RPC error: ${json.error.message} (code: ${json.error.code})`);
        }
        return json.result;
    }
    // ============================================
    // Node & Network Information
    // ============================================
    async getNodeInfo() {
        return this.rpcCall(this.nodeUrl, "node_getInfo");
    }
    async getBlockNumber() {
        return this.rpcCall(this.nodeUrl, "aztec_getBlockNumber");
    }
    async getBlock(blockNumber) {
        const params = blockNumber !== undefined ? [blockNumber] : [];
        return this.rpcCall(this.nodeUrl, "aztec_getBlock", params);
    }
    async getCurrentBaseFee() {
        return this.rpcCall(this.nodeUrl, "aztec_getCurrentBaseFee");
    }
    async getChainId() {
        const info = await this.getNodeInfo();
        return info.l1ChainId;
    }
    async getProtocolVersion() {
        const info = await this.getNodeInfo();
        return info.protocolVersion;
    }
    async getL1ContractAddresses() {
        const info = await this.getNodeInfo();
        return info.l1ContractAddresses || {};
    }
    async getProtocolContractAddresses() {
        const info = await this.getNodeInfo();
        return info.protocolContractAddresses || {};
    }
    // ============================================
    // Logs
    // ============================================
    async getLogs(options) {
        return this.rpcCall(this.pxeUrl, "pxe_getLogs", [options]);
    }
    // ============================================
    // Account Management
    // ============================================
    async getRegisteredAccounts() {
        const accounts = await this.rpcCall(this.pxeUrl, "pxe_getRegisteredAccounts");
        return accounts.map((addr) => ({ address: addr }));
    }
    async registerAccount(secretKey, partialAddress) {
        const result = await this.rpcCall(this.pxeUrl, "pxe_registerAccount", [secretKey, partialAddress]);
        return {
            address: result.address,
            publicKey: result.publicKey,
            partialAddress,
        };
    }
    async getAccountPublicKey(address) {
        try {
            return await this.rpcCall(this.pxeUrl, "pxe_getRegisteredAccountPublicKey", [address]);
        }
        catch {
            return null;
        }
    }
    async registerSender(address) {
        await this.rpcCall(this.pxeUrl, "pxe_registerSender", [address]);
    }
    // ============================================
    // Contract Operations
    // ============================================
    async getContractInstance(address) {
        try {
            return await this.rpcCall(this.pxeUrl, "pxe_getContractInstance", [address]);
        }
        catch {
            return null;
        }
    }
    async getContractClass(classId) {
        return this.rpcCall(this.pxeUrl, "pxe_getContractClass", [classId]);
    }
    async registerContract(address, artifact, options) {
        await this.rpcCall(this.pxeUrl, "pxe_registerContract", [
            address,
            artifact,
            options,
        ]);
    }
    async isContractClassPubliclyRegistered(classId) {
        return this.rpcCall(this.nodeUrl, "aztec_isContractClassPubliclyRegistered", [classId]);
    }
    async isContractPubliclyDeployed(address) {
        return this.rpcCall(this.nodeUrl, "aztec_isContractPubliclyDeployed", [address]);
    }
    // ============================================
    // Transaction Operations
    // ============================================
    async sendTransaction(txRequest, options) {
        return this.rpcCall(this.pxeUrl, "pxe_sendTx", [txRequest, options]);
    }
    async simulateTransaction(txRequest, options) {
        try {
            const result = await this.rpcCall(this.pxeUrl, "pxe_simulateTx", [txRequest, options]);
            return {
                success: true,
                returnValues: result.returnValues,
                gasUsed: result.gasUsed,
                logs: result.logs,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    async getTransactionReceipt(txHash) {
        const receipt = await this.rpcCall(this.nodeUrl, "aztec_getTransactionReceipt", [txHash]);
        return {
            txHash,
            status: receipt.status,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            error: receipt.error,
            transactionFee: receipt.transactionFee,
        };
    }
    async getTxEffect(txHash) {
        return this.rpcCall(this.nodeUrl, "aztec_getTxEffect", [txHash]);
    }
    async getPendingTxs() {
        return this.rpcCall(this.pxeUrl, "pxe_getPendingTxs");
    }
    async estimateGas(txRequest) {
        return this.rpcCall(this.pxeUrl, "pxe_estimateGas", [txRequest]);
    }
    // ============================================
    // Authorization & Auth Witnesses
    // ============================================
    async createAuthWitness(messageHash, secretKey) {
        return this.rpcCall(this.pxeUrl, "pxe_createAuthWitness", [
            messageHash,
            secretKey,
        ]);
    }
    async addAuthWitness(witness) {
        await this.rpcCall(this.pxeUrl, "pxe_addAuthWitness", [witness]);
    }
    async getAuthWitness(messageHash) {
        try {
            return await this.rpcCall(this.pxeUrl, "pxe_getAuthWitness", [
                messageHash,
            ]);
        }
        catch {
            return null;
        }
    }
    // ============================================
    // Notes & Private State
    // ============================================
    async getNotes(options) {
        return this.rpcCall(this.pxeUrl, "pxe_getNotes", [options]);
    }
    async addNote(note) {
        await this.rpcCall(this.pxeUrl, "pxe_addNote", [note]);
    }
    // ============================================
    // Sync Status
    // ============================================
    async getSyncStatus() {
        return this.rpcCall(this.pxeUrl, "pxe_getSyncStatus");
    }
    async isGlobalStateSynchronized() {
        return this.rpcCall(this.pxeUrl, "pxe_isGlobalStateSynchronized");
    }
    async isAccountSynchronized(address) {
        return this.rpcCall(this.pxeUrl, "pxe_isAccountStateSynchronized", [
            address,
        ]);
    }
    // ============================================
    // L1 to L2 Messaging
    // ============================================
    async getL1ToL2MessageWitness(contractAddress, messageHash, secret) {
        try {
            return await this.rpcCall(this.pxeUrl, "pxe_getL1ToL2MembershipWitness", [contractAddress, messageHash, secret]);
        }
        catch {
            return null;
        }
    }
    // ============================================
    // Cryptographic Utilities
    // ============================================
    async computeSecretHash(secret) {
        return this.rpcCall(this.pxeUrl, "pxe_computeSecretHash", [secret]);
    }
    async generateSecretAndHash() {
        // Generate random Fr element and compute its hash
        const secret = await this.rpcCall(this.pxeUrl, "pxe_generateSecret");
        const hash = await this.computeSecretHash(secret);
        return { secret, hash };
    }
    // ============================================
    // Health Checks
    // ============================================
    async isNodeHealthy() {
        try {
            await this.getNodeInfo();
            return true;
        }
        catch {
            return false;
        }
    }
    async isPxeHealthy() {
        try {
            await this.getRegisteredAccounts();
            return true;
        }
        catch {
            return false;
        }
    }
    async healthCheck() {
        const [nodeHealthy, pxeHealthy] = await Promise.all([
            this.isNodeHealthy(),
            this.isPxeHealthy(),
        ]);
        let blockNumber;
        let syncStatus;
        if (nodeHealthy) {
            try {
                blockNumber = await this.getBlockNumber();
            }
            catch {
                // Ignore
            }
        }
        if (pxeHealthy) {
            try {
                syncStatus = await this.getSyncStatus();
            }
            catch {
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
    getAvailableExampleContracts() {
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
    getUrls() {
        return {
            pxe: this.pxeUrl,
            node: this.nodeUrl,
            l1: this.l1RpcUrl,
        };
    }
    setUrls(options) {
        if (options.pxe)
            this.pxeUrl = options.pxe;
        if (options.node)
            this.nodeUrl = options.node;
        if (options.l1)
            this.l1RpcUrl = options.l1;
    }
}
//# sourceMappingURL=aztec-client.js.map