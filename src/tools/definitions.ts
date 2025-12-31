import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Aztec Noir MCP Server - Tool Definitions
 * 
 * 47 tools organized into 9 categories:
 * 1. Network & Node (8 tools)
 * 2. Account Management (6 tools)
 * 3. Contract Operations (7 tools)
 * 4. Transaction Operations (7 tools)
 * 5. L1 Bridge & Cross-Chain (5 tools)
 * 6. Validator & Sequencer (5 tools)
 * 7. Governance (4 tools)
 * 8. Cryptography & Keys (5 tools)
 */

// ============================================
// Category 1: Network & Node Tools (8)
// ============================================

const networkTools: Tool[] = [
  {
    name: "aztec_get_node_info",
    description: "Get comprehensive information about the Aztec node including version, L1 chain ID, protocol version, and contract addresses",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_get_block_number",
    description: "Get the current Aztec L2 block number",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_get_block",
    description: "Get detailed block information by block number. Returns latest block if no number specified",
    inputSchema: {
      type: "object",
      properties: {
        blockNumber: {
          type: "number",
          description: "Block number to fetch. Leave empty for latest block",
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_get_current_base_fee",
    description: "Get the current base fee for DA (Data Availability) and L2 gas",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_get_logs",
    description: "Get public logs filtered by transaction hash, block range, or contract address",
    inputSchema: {
      type: "object",
      properties: {
        txHash: {
          type: "string",
          description: "Filter by transaction hash",
        },
        fromBlock: {
          type: "number",
          description: "Start block number (default: 1)",
        },
        toBlock: {
          type: "number",
          description: "End block number (default: latest)",
        },
        contractAddress: {
          type: "string",
          description: "Filter by contract address",
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_get_l1_contract_addresses",
    description: "Get all L1 contract addresses including rollup, registry, inbox, outbox, fee juice, and governance contracts",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_get_protocol_contract_addresses",
    description: "Get Aztec protocol contract addresses including class registerer, fee juice, instance deployer",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_health_check",
    description: "Check the health status of Aztec node and PXE, including sync status",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// ============================================
// Category 2: Account Management Tools (6)
// ============================================

const accountTools: Tool[] = [
  {
    name: "aztec_get_accounts",
    description: "List all registered accounts in the PXE",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_create_account",
    description: "Create a new Aztec account. Supports multiple account types: schnorr (default), ecdsasecp256r1, ecdsasecp256r1ssh, ecdsasecp256k1",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Account type",
          enum: ["schnorr", "ecdsasecp256r1", "ecdsasecp256r1ssh", "ecdsasecp256k1"],
          default: "schnorr",
        },
        alias: {
          type: "string",
          description: "Alias for the account (for easy reference)",
        },
        secretKey: {
          type: "string",
          description: "Optional secret key. Random if not provided",
        },
        publicDeploy: {
          type: "boolean",
          description: "Whether to publicly deploy the account contract",
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_deploy_account",
    description: "Deploy an already registered Aztec account contract",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Address of the registered account to deploy",
        },
        skipInitialization: {
          type: "boolean",
          description: "Skip contract initialization",
          default: false,
        },
      },
      required: ["address"],
    },
  },
  {
    name: "aztec_register_sender",
    description: "Register a sender address for note syncing. Required to receive notes from this address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Sender address to register",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "aztec_get_account_public_key",
    description: "Get the public key for a registered account",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "aztec_import_test_accounts",
    description: "Import pre-funded test accounts from the sandbox/devnet",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// ============================================
// Category 3: Contract Operations Tools (7)
// ============================================

const contractTools: Tool[] = [
  {
    name: "aztec_deploy_contract",
    description: "Deploy a compiled Noir contract to Aztec. Requires contract artifact and deployer account",
    inputSchema: {
      type: "object",
      properties: {
        artifact: {
          type: "string",
          description: "Contract artifact name (e.g., TokenContract) or path to compiled JSON",
        },
        args: {
          type: "array",
          description: "Constructor arguments",
          items: { type: "string" },
          default: [],
        },
        from: {
          type: "string",
          description: "Deployer account address or alias",
        },
        alias: {
          type: "string",
          description: "Alias for the deployed contract",
        },
        salt: {
          type: "string",
          description: "Deployment salt for deterministic addresses",
        },
        publicDeploy: {
          type: "boolean",
          description: "Publish the contract publicly",
          default: false,
        },
      },
      required: ["artifact", "from"],
    },
  },
  {
    name: "aztec_register_contract",
    description: "Register an existing contract in the PXE to interact with it",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Contract address to register",
        },
        artifact: {
          type: "string",
          description: "Contract artifact name or path",
        },
        alias: {
          type: "string",
          description: "Alias for easy reference",
        },
        publicKey: {
          type: "string",
          description: "Encryption public key (for contracts receiving private notes)",
        },
      },
      required: ["address", "artifact"],
    },
  },
  {
    name: "aztec_get_contract_info",
    description: "Get information about a deployed contract including class ID, deployer, and public keys",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Contract address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "aztec_inspect_contract",
    description: "List all external callable functions for a contract artifact",
    inputSchema: {
      type: "object",
      properties: {
        artifact: {
          type: "string",
          description: "Contract artifact name or path to JSON file",
        },
      },
      required: ["artifact"],
    },
  },
  {
    name: "aztec_list_example_contracts",
    description: "List all available example contracts from @aztec/noir-contracts.js",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_compute_selector",
    description: "Compute the function selector for a given function signature",
    inputSchema: {
      type: "object",
      properties: {
        functionSignature: {
          type: "string",
          description: "Function signature (e.g., 'transfer(Field,Field)')",
        },
      },
      required: ["functionSignature"],
    },
  },
  {
    name: "aztec_is_contract_deployed",
    description: "Check if a contract is publicly deployed on the network",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Contract address to check",
        },
      },
      required: ["address"],
    },
  },
];

// ============================================
// Category 4: Transaction Operations Tools (7)
// ============================================

const transactionTools: Tool[] = [
  {
    name: "aztec_send_transaction",
    description: "Send a transaction by calling a function on an Aztec contract (private or public)",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "Contract address to call",
        },
        functionName: {
          type: "string",
          description: "Function name to call",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: { type: "string" },
          default: [],
        },
        from: {
          type: "string",
          description: "Sender account address or alias",
        },
        authWitnesses: {
          type: "array",
          description: "Authorization witnesses for delegated calls",
          items: { type: "string" },
        },
      },
      required: ["contractAddress", "functionName", "from"],
    },
  },
  {
    name: "aztec_simulate_transaction",
    description: "Simulate a transaction without executing it. Returns gas estimation and potential errors",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "Contract address",
        },
        functionName: {
          type: "string",
          description: "Function name",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: { type: "string" },
          default: [],
        },
        from: {
          type: "string",
          description: "Sender account address or alias",
        },
      },
      required: ["contractAddress", "functionName", "from"],
    },
  },
  {
    name: "aztec_get_transaction_receipt",
    description: "Get the receipt for a transaction including status, block number, and fees",
    inputSchema: {
      type: "object",
      properties: {
        txHash: {
          type: "string",
          description: "Transaction hash",
        },
      },
      required: ["txHash"],
    },
  },
  {
    name: "aztec_get_pending_transactions",
    description: "List all pending transactions in the PXE mempool",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_estimate_gas",
    description: "Estimate gas costs for a transaction",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "Contract address",
        },
        functionName: {
          type: "string",
          description: "Function name",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: { type: "string" },
          default: [],
        },
        from: {
          type: "string",
          description: "Sender account",
        },
      },
      required: ["contractAddress", "functionName", "from"],
    },
  },
  {
    name: "aztec_create_authwit",
    description: "Create an authorization witness for delegated actions (private auth)",
    inputSchema: {
      type: "object",
      properties: {
        functionName: {
          type: "string",
          description: "Function to authorize",
        },
        caller: {
          type: "string",
          description: "Address authorized to call",
        },
        contractAddress: {
          type: "string",
          description: "Contract address",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: { type: "string" },
        },
        from: {
          type: "string",
          description: "Account creating the authwit",
        },
      },
      required: ["functionName", "caller", "contractAddress", "from"],
    },
  },
  {
    name: "aztec_authorize_action",
    description: "Authorize a public call on behalf of an account (public auth)",
    inputSchema: {
      type: "object",
      properties: {
        functionName: {
          type: "string",
          description: "Function to authorize",
        },
        caller: {
          type: "string",
          description: "Address authorized to call",
        },
        contractAddress: {
          type: "string",
          description: "Contract address",
        },
        from: {
          type: "string",
          description: "Account authorizing the action",
        },
      },
      required: ["functionName", "caller", "contractAddress", "from"],
    },
  },
];

// ============================================
// Category 5: L1 Bridge & Cross-Chain Tools (5)
// ============================================

const bridgeTools: Tool[] = [
  {
    name: "aztec_bridge_erc20",
    description: "Bridge ERC20 tokens from L1 Ethereum to Aztec L2",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "string",
          description: "Amount to bridge",
        },
        recipient: {
          type: "string",
          description: "Aztec L2 recipient address",
        },
        tokenAddress: {
          type: "string",
          description: "L1 ERC20 token address",
        },
        portalAddress: {
          type: "string",
          description: "L1 portal contract address",
        },
        mint: {
          type: "boolean",
          description: "Mint tokens on L1 first (testnet only)",
          default: false,
        },
        private: {
          type: "boolean",
          description: "Use private bridging flow",
          default: false,
        },
      },
      required: ["amount", "recipient"],
    },
  },
  {
    name: "aztec_get_l1_balance",
    description: "Get ERC20 token balance on L1 Ethereum for an address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Ethereum address to check",
        },
        tokenAddress: {
          type: "string",
          description: "ERC20 token address",
        },
      },
      required: ["address", "tokenAddress"],
    },
  },
  {
    name: "aztec_get_l1_to_l2_message_witness",
    description: "Get the witness for claiming an L1 to L2 message on Aztec",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "Aztec contract address",
        },
        messageHash: {
          type: "string",
          description: "L1 to L2 message hash",
        },
        secret: {
          type: "string",
          description: "Secret for claiming",
        },
      },
      required: ["contractAddress", "messageHash", "secret"],
    },
  },
  {
    name: "aztec_deploy_l1_contracts",
    description: "Deploy all L1 infrastructure contracts for a new Aztec network (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description: "L1 deployer private key",
        },
        mnemonic: {
          type: "string",
          description: "L1 deployer mnemonic (alternative to privateKey)",
        },
        testAccounts: {
          type: "boolean",
          description: "Initialize test accounts with fee juice",
          default: false,
        },
        sponsoredFpc: {
          type: "boolean",
          description: "Deploy sponsored FPC contract",
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_get_canonical_fpc_address",
    description: "Get the canonical SponsoredFPC address for the current network version",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// ============================================
// Category 6: Validator & Sequencer Tools (5)
// ============================================

const validatorTools: Tool[] = [
  {
    name: "aztec_add_validator",
    description: "Add a validator to the L1 rollup contract via direct deposit",
    inputSchema: {
      type: "object",
      properties: {
        attester: {
          type: "string",
          description: "Ethereum address of the attester",
        },
        withdrawer: {
          type: "string",
          description: "Ethereum address of the withdrawer",
        },
        blsSecretKey: {
          type: "string",
          description: "BN254 scalar field element for BLS signatures",
        },
        privateKey: {
          type: "string",
          description: "L1 private key for the transaction",
        },
      },
      required: ["attester", "withdrawer", "blsSecretKey"],
    },
  },
  {
    name: "aztec_remove_validator",
    description: "Remove a validator from the L1 rollup contract",
    inputSchema: {
      type: "object",
      properties: {
        validator: {
          type: "string",
          description: "Validator address to remove",
        },
        privateKey: {
          type: "string",
          description: "L1 private key with permission",
        },
      },
      required: ["validator"],
    },
  },
  {
    name: "aztec_get_sequencers",
    description: "List registered sequencers on the L1 rollup contract",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command: list, who-next",
          enum: ["list", "who-next"],
          default: "list",
        },
        blockNumber: {
          type: "number",
          description: "Block number to query next sequencer for",
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_advance_epoch",
    description: "Use L1 cheat codes to warp time to the next epoch (devnet/sandbox only)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_prune_rollup",
    description: "Prune the pending chain on the rollup contract",
    inputSchema: {
      type: "object",
      properties: {
        rollupAddress: {
          type: "string",
          description: "Rollup contract address",
        },
        privateKey: {
          type: "string",
          description: "L1 private key with permission",
        },
      },
      required: [],
    },
  },
];

// ============================================
// Category 7: Governance Tools (4)
// ============================================

const governanceTools: Tool[] = [
  {
    name: "aztec_deposit_governance_tokens",
    description: "Deposit governance tokens to participate in voting",
    inputSchema: {
      type: "object",
      properties: {
        amount: {
          type: "string",
          description: "Amount of tokens to deposit",
        },
        recipient: {
          type: "string",
          description: "Recipient of voting power",
        },
        mint: {
          type: "boolean",
          description: "Mint tokens first (testnet only)",
          default: false,
        },
        privateKey: {
          type: "string",
          description: "L1 private key",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "aztec_propose_governance",
    description: "Create a governance proposal with token lock",
    inputSchema: {
      type: "object",
      properties: {
        payloadAddress: {
          type: "string",
          description: "Address of the payload contract",
        },
        privateKey: {
          type: "string",
          description: "L1 private key",
        },
      },
      required: ["payloadAddress"],
    },
  },
  {
    name: "aztec_vote_on_proposal",
    description: "Vote on a governance proposal",
    inputSchema: {
      type: "object",
      properties: {
        proposalId: {
          type: "string",
          description: "Proposal ID to vote on",
        },
        voteAmount: {
          type: "string",
          description: "Amount of voting power to use",
        },
        inFavor: {
          type: "boolean",
          description: "Vote in favor (true) or against (false)",
        },
        privateKey: {
          type: "string",
          description: "L1 private key",
        },
      },
      required: ["proposalId", "voteAmount", "inFavor"],
    },
  },
  {
    name: "aztec_execute_proposal",
    description: "Execute a passed governance proposal",
    inputSchema: {
      type: "object",
      properties: {
        proposalId: {
          type: "string",
          description: "Proposal ID to execute",
        },
        wait: {
          type: "boolean",
          description: "Wait until proposal is executable",
          default: false,
        },
        privateKey: {
          type: "string",
          description: "L1 private key",
        },
      },
      required: ["proposalId"],
    },
  },
];

// ============================================
// Category 8: Cryptography & Keys Tools (5)
// ============================================

const cryptoTools: Tool[] = [
  {
    name: "aztec_generate_keys",
    description: "Generate a new encryption and signing key pair for Aztec accounts",
    inputSchema: {
      type: "object",
      properties: {
        json: {
          type: "boolean",
          description: "Output in JSON format",
          default: true,
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_generate_secret_and_hash",
    description: "Generate an arbitrary secret (Fr field element) and its hash using Aztec defaults",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_generate_bls_keypair",
    description: "Generate a BLS keypair for validator operations",
    inputSchema: {
      type: "object",
      properties: {
        mnemonic: {
          type: "string",
          description: "Mnemonic for BLS derivation",
        },
        ikm: {
          type: "string",
          description: "Initial keying material (alternative to mnemonic)",
        },
        blsPath: {
          type: "string",
          description: "EIP-2334 path (default: m/12381/3600/0/0/0)",
        },
        compressed: {
          type: "boolean",
          description: "Output compressed public key",
          default: false,
        },
      },
      required: [],
    },
  },
  {
    name: "aztec_generate_p2p_key",
    description: "Generate a LibP2P peer private key for P2P networking",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "aztec_generate_l1_account",
    description: "Generate a new Ethereum L1 account (private key and address)",
    inputSchema: {
      type: "object",
      properties: {
        json: {
          type: "boolean",
          description: "Output in JSON format",
          default: true,
        },
      },
      required: [],
    },
  },
];

// ============================================
// Export All Tools
// ============================================

export const tools: Tool[] = [
  ...networkTools,
  ...accountTools,
  ...contractTools,
  ...transactionTools,
  ...bridgeTools,
  ...validatorTools,
  ...governanceTools,
  ...cryptoTools,
];

// Export categories for reference
export const toolCategories = {
  network: networkTools.map((t) => t.name),
  account: accountTools.map((t) => t.name),
  contract: contractTools.map((t) => t.name),
  transaction: transactionTools.map((t) => t.name),
  bridge: bridgeTools.map((t) => t.name),
  validator: validatorTools.map((t) => t.name),
  governance: governanceTools.map((t) => t.name),
  crypto: cryptoTools.map((t) => t.name),
};

export const toolCount = tools.length;
