import { AztecClient } from "../aztec-client.js";

/**
 * Aztec Noir MCP Server - Tool Handlers
 * 
 * Implements the logic for all 47 tools
 */

// ============================================
// Main Handler Function
// ============================================

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  client: AztecClient
): Promise<unknown> {
  switch (name) {
    // ========================================
    // Category 1: Network & Node Tools
    // ========================================

    case "aztec_get_node_info":
      return client.getNodeInfo();

    case "aztec_get_block_number":
      return { blockNumber: await client.getBlockNumber() };

    case "aztec_get_block":
      return client.getBlock(args.blockNumber as number | undefined);

    case "aztec_get_current_base_fee":
      return client.getCurrentBaseFee();

    case "aztec_get_logs":
      return client.getLogs({
        txHash: args.txHash as string | undefined,
        fromBlock: args.fromBlock as number | undefined,
        toBlock: args.toBlock as number | undefined,
        contractAddress: args.contractAddress as string | undefined,
      });

    case "aztec_get_l1_contract_addresses":
      return client.getL1ContractAddresses();

    case "aztec_get_protocol_contract_addresses":
      return client.getProtocolContractAddresses();

    case "aztec_health_check":
      return client.healthCheck();

    // ========================================
    // Category 2: Account Management Tools
    // ========================================

    case "aztec_get_accounts":
      return { accounts: await client.getRegisteredAccounts() };

    case "aztec_create_account": {
      const accountType = (args.type as string) || "schnorr";
      const alias = args.alias as string | undefined;
      const secretKey = args.secretKey as string | undefined;
      const publicDeploy = args.publicDeploy as boolean | undefined;

      // This would typically call aztec-wallet CLI or use SDK
      // For now, return instruction on how to create account
      return {
        instruction: "Account creation requires aztec-wallet CLI",
        command: `aztec-wallet create-account -t ${accountType}${alias ? ` -a ${alias}` : ""}${publicDeploy ? " --public-deploy" : ""}`,
        type: accountType,
        note: "Run this command in terminal with Aztec sandbox running",
      };
    }

    case "aztec_deploy_account": {
      const address = args.address as string;
      const skipInit = args.skipInitialization as boolean;

      return {
        instruction: "Account deployment requires aztec-wallet CLI",
        command: `aztec-wallet deploy-account ${address}${skipInit ? " --skip-initialization" : ""}`,
        address,
      };
    }

    case "aztec_register_sender": {
      const address = args.address as string;
      await client.registerSender(address);
      return { success: true, message: `Registered sender: ${address}` };
    }

    case "aztec_get_account_public_key": {
      const address = args.address as string;
      const publicKey = await client.getAccountPublicKey(address);
      return { address, publicKey };
    }

    case "aztec_import_test_accounts":
      return {
        instruction: "Import test accounts from sandbox",
        command: "aztec-wallet import-test-accounts",
        note: "This imports pre-funded accounts from the sandbox for testing",
      };

    // ========================================
    // Category 3: Contract Operations Tools
    // ========================================

    case "aztec_deploy_contract": {
      const artifact = args.artifact as string;
      const contractArgs = (args.args as string[]) || [];
      const from = args.from as string;
      const alias = args.alias as string | undefined;
      const salt = args.salt as string | undefined;
      const publicDeploy = args.publicDeploy as boolean;

      const argsStr = contractArgs.length > 0 ? ` --args ${contractArgs.join(" ")}` : "";
      const aliasStr = alias ? ` -a ${alias}` : "";
      const saltStr = salt ? ` --salt ${salt}` : "";
      const publicStr = publicDeploy ? " --public-deploy" : "";

      return {
        instruction: "Contract deployment requires aztec-wallet CLI",
        command: `aztec-wallet deploy ${artifact} --from ${from}${argsStr}${aliasStr}${saltStr}${publicStr}`,
        artifact,
        from,
        args: contractArgs,
      };
    }

    case "aztec_register_contract": {
      const address = args.address as string;
      const artifact = args.artifact as string;
      const alias = args.alias as string | undefined;
      const publicKey = args.publicKey as string | undefined;

      const aliasStr = alias ? ` -a ${alias}` : "";
      const pkStr = publicKey ? ` -k ${publicKey}` : "";

      return {
        instruction: "Register contract in PXE",
        command: `aztec-wallet register-contract ${address} ${artifact}${aliasStr}${pkStr}`,
        address,
        artifact,
      };
    }

    case "aztec_get_contract_info": {
      const address = args.address as string;
      const info = await client.getContractInstance(address);
      if (!info) {
        return { error: "Contract not found", address };
      }
      return info;
    }

    case "aztec_inspect_contract": {
      const artifact = args.artifact as string;
      return {
        instruction: "Inspect contract functions",
        command: `aztec inspect-contract ${artifact}`,
        artifact,
        note: "This lists all external callable functions for the contract",
      };
    }

    case "aztec_list_example_contracts":
      return {
        contracts: client.getAvailableExampleContracts(),
        note: "These contracts are available from @aztec/noir-contracts.js",
        usage: "Use with aztec-wallet deploy <ContractName> --from <account>",
      };

    case "aztec_compute_selector": {
      const functionSignature = args.functionSignature as string;
      return {
        instruction: "Compute function selector",
        command: `aztec compute-selector "${functionSignature}"`,
        functionSignature,
        note: "Returns the 4-byte selector for the function",
      };
    }

    case "aztec_is_contract_deployed": {
      const address = args.address as string;
      const deployed = await client.isContractPubliclyDeployed(address);
      return { address, isDeployed: deployed };
    }

    // ========================================
    // Category 4: Transaction Operations Tools
    // ========================================

    case "aztec_send_transaction": {
      const contractAddress = args.contractAddress as string;
      const functionName = args.functionName as string;
      const txArgs = (args.args as string[]) || [];
      const from = args.from as string;
      const authWitnesses = args.authWitnesses as string[] | undefined;

      const argsStr = txArgs.length > 0 ? ` --args ${txArgs.join(" ")}` : "";
      const awStr = authWitnesses ? ` --auth-witness ${authWitnesses.join(",")}` : "";

      return {
        instruction: "Send transaction via aztec-wallet",
        command: `aztec-wallet send ${functionName} -ca ${contractAddress} -f ${from}${argsStr}${awStr}`,
        contractAddress,
        functionName,
        from,
        args: txArgs,
      };
    }

    case "aztec_simulate_transaction": {
      const contractAddress = args.contractAddress as string;
      const functionName = args.functionName as string;
      const txArgs = (args.args as string[]) || [];
      const from = args.from as string;

      const argsStr = txArgs.length > 0 ? ` --args ${txArgs.join(" ")}` : "";

      return {
        instruction: "Simulate transaction (dry run)",
        command: `aztec-wallet simulate ${functionName} -ca ${contractAddress} -f ${from}${argsStr}`,
        contractAddress,
        functionName,
        from,
        args: txArgs,
        note: "Simulation shows return values and gas estimation without executing",
      };
    }

    case "aztec_get_transaction_receipt": {
      const txHash = args.txHash as string;
      return client.getTransactionReceipt(txHash);
    }

    case "aztec_get_pending_transactions":
      return { pendingTxs: await client.getPendingTxs() };

    case "aztec_estimate_gas": {
      const contractAddress = args.contractAddress as string;
      const functionName = args.functionName as string;
      const txArgs = (args.args as string[]) || [];
      const from = args.from as string;

      const argsStr = txArgs.length > 0 ? ` --args ${txArgs.join(" ")}` : "";

      return {
        instruction: "Estimate gas for transaction",
        command: `aztec-wallet simulate ${functionName} -ca ${contractAddress} -f ${from}${argsStr} --estimate-gas-only`,
        contractAddress,
        functionName,
        from,
        note: "Returns DA gas, L2 gas, and estimated fee",
      };
    }

    case "aztec_create_authwit": {
      const functionName = args.functionName as string;
      const caller = args.caller as string;
      const contractAddress = args.contractAddress as string;
      const from = args.from as string;
      const authArgs = (args.args as string[]) || [];

      const argsStr = authArgs.length > 0 ? ` --args ${authArgs.join(" ")}` : "";

      return {
        instruction: "Create authorization witness for private delegation",
        command: `aztec-wallet create-authwit ${functionName} ${caller} -ca ${contractAddress} -f ${from}${argsStr}`,
        functionName,
        caller,
        contractAddress,
        from,
      };
    }

    case "aztec_authorize_action": {
      const functionName = args.functionName as string;
      const caller = args.caller as string;
      const contractAddress = args.contractAddress as string;
      const from = args.from as string;

      return {
        instruction: "Authorize public action on behalf of account",
        command: `aztec-wallet authorize-action ${functionName} ${caller} -ca ${contractAddress} -f ${from}`,
        functionName,
        caller,
        contractAddress,
        from,
      };
    }

    // ========================================
    // Category 5: L1 Bridge & Cross-Chain Tools
    // ========================================

    case "aztec_bridge_erc20": {
      const amount = args.amount as string;
      const recipient = args.recipient as string;
      const tokenAddress = args.tokenAddress as string | undefined;
      const portalAddress = args.portalAddress as string | undefined;
      const mint = args.mint as boolean;
      const isPrivate = args.private as boolean;

      let cmd = `aztec bridge-erc20 ${amount} ${recipient}`;
      if (tokenAddress) cmd += ` -t ${tokenAddress}`;
      if (portalAddress) cmd += ` -p ${portalAddress}`;
      if (mint) cmd += " --mint";
      if (isPrivate) cmd += " --private";

      return {
        instruction: "Bridge ERC20 tokens from L1 to Aztec L2",
        command: cmd,
        amount,
        recipient,
        private: isPrivate,
      };
    }

    case "aztec_get_l1_balance": {
      const address = args.address as string;
      const tokenAddress = args.tokenAddress as string;

      return {
        instruction: "Get L1 ERC20 balance",
        command: `aztec get-l1-balance ${address} -t ${tokenAddress}`,
        address,
        tokenAddress,
      };
    }

    case "aztec_get_l1_to_l2_message_witness": {
      const contractAddress = args.contractAddress as string;
      const messageHash = args.messageHash as string;
      const secret = args.secret as string;

      const witness = await client.getL1ToL2MessageWitness(
        contractAddress,
        messageHash,
        secret
      );

      if (!witness) {
        return { error: "Message witness not found", messageHash };
      }
      return witness;
    }

    case "aztec_deploy_l1_contracts": {
      const privateKey = args.privateKey as string | undefined;
      const mnemonic = args.mnemonic as string | undefined;
      const testAccounts = args.testAccounts as boolean;
      const sponsoredFpc = args.sponsoredFpc as boolean;

      let cmd = "aztec deploy-l1-contracts";
      if (privateKey) cmd += ` -pk ${privateKey}`;
      if (mnemonic) cmd += ` -m "${mnemonic}"`;
      if (testAccounts) cmd += " --test-accounts";
      if (sponsoredFpc) cmd += " --sponsored-fpc";

      return {
        instruction: "Deploy L1 infrastructure contracts",
        command: cmd,
        note: "This deploys rollup, registry, inbox, outbox, and other L1 contracts",
        warning: "Admin operation - requires sufficient L1 ETH",
      };
    }

    case "aztec_get_canonical_fpc_address":
      return {
        instruction: "Get canonical SponsoredFPC address",
        command: "aztec get-canonical-sponsored-fpc-address",
        note: "Returns the FPC address for current network version",
      };

    // ========================================
    // Category 6: Validator & Sequencer Tools
    // ========================================

    case "aztec_add_validator": {
      const attester = args.attester as string;
      const withdrawer = args.withdrawer as string;
      const blsSecretKey = args.blsSecretKey as string;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec add-l1-validator --attester ${attester} --withdrawer ${withdrawer} --bls-secret-key ${blsSecretKey}`;
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Add validator to L1 rollup contract",
        command: cmd,
        attester,
        withdrawer,
        note: "Requires stake deposit",
      };
    }

    case "aztec_remove_validator": {
      const validator = args.validator as string;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec remove-l1-validator --validator ${validator}`;
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Remove validator from L1 rollup",
        command: cmd,
        validator,
      };
    }

    case "aztec_get_sequencers": {
      const command = (args.command as string) || "list";
      const blockNumber = args.blockNumber as number | undefined;

      let cmd = `aztec sequencers ${command}`;
      if (blockNumber !== undefined) cmd += ` --block-number ${blockNumber}`;

      return {
        instruction: `${command === "list" ? "List sequencers" : "Get next sequencer"}`,
        command: cmd,
      };
    }

    case "aztec_advance_epoch":
      return {
        instruction: "Advance to next epoch (devnet only)",
        command: "aztec advance-epoch",
        note: "Uses L1 cheat codes to warp time - only works on local devnet",
        warning: "This is a testing utility, not for production",
      };

    case "aztec_prune_rollup": {
      const rollupAddress = args.rollupAddress as string | undefined;
      const privateKey = args.privateKey as string | undefined;

      let cmd = "aztec prune-rollup";
      if (rollupAddress) cmd += ` --rollup ${rollupAddress}`;
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Prune pending chain on rollup",
        command: cmd,
        note: "Removes stale pending blocks",
      };
    }

    // ========================================
    // Category 7: Governance Tools
    // ========================================

    case "aztec_deposit_governance_tokens": {
      const amount = args.amount as string;
      const recipient = args.recipient as string | undefined;
      const mint = args.mint as boolean;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec deposit-governance-tokens -a ${amount}`;
      if (recipient) cmd += ` --recipient ${recipient}`;
      if (mint) cmd += " --mint";
      if (privateKey) cmd += ` -p ${privateKey}`;

      return {
        instruction: "Deposit governance tokens for voting",
        command: cmd,
        amount,
      };
    }

    case "aztec_propose_governance": {
      const payloadAddress = args.payloadAddress as string;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec propose-with-lock -p ${payloadAddress}`;
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Create governance proposal",
        command: cmd,
        payloadAddress,
        note: "Requires locked governance tokens",
      };
    }

    case "aztec_vote_on_proposal": {
      const proposalId = args.proposalId as string;
      const voteAmount = args.voteAmount as string;
      const inFavor = args.inFavor as boolean;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec vote-on-governance-proposal -p ${proposalId} -a ${voteAmount} --in-favor ${inFavor ? "yea" : "nay"}`;
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Vote on governance proposal",
        command: cmd,
        proposalId,
        voteAmount,
        inFavor,
      };
    }

    case "aztec_execute_proposal": {
      const proposalId = args.proposalId as string;
      const wait = args.wait as boolean;
      const privateKey = args.privateKey as string | undefined;

      let cmd = `aztec execute-governance-proposal -p ${proposalId}`;
      if (wait) cmd += " --wait true";
      if (privateKey) cmd += ` -pk ${privateKey}`;

      return {
        instruction: "Execute passed governance proposal",
        command: cmd,
        proposalId,
      };
    }

    // ========================================
    // Category 8: Cryptography & Keys Tools
    // ========================================

    case "aztec_generate_keys": {
      const json = args.json !== false;
      return {
        instruction: "Generate encryption and signing keys",
        command: `aztec generate-keys${json ? " --json" : ""}`,
        note: "Generates a new key pair for Aztec accounts",
        output: "Returns encryptionPrivateKey, encryptionPublicKey, signingPrivateKey, signingPublicKey",
      };
    }

    case "aztec_generate_secret_and_hash":
      return {
        instruction: "Generate secret and its hash",
        command: "aztec generate-secret-and-hash",
        note: "Generates a random Fr field element and computes its Aztec hash",
        usage: "Useful for creating secrets for private claims and messages",
      };

    case "aztec_generate_bls_keypair": {
      const mnemonic = args.mnemonic as string | undefined;
      const ikm = args.ikm as string | undefined;
      const blsPath = args.blsPath as string | undefined;
      const compressed = args.compressed as boolean;

      let cmd = "aztec generate-bls-keypair";
      if (mnemonic) cmd += ` --mnemonic "${mnemonic}"`;
      if (ikm) cmd += ` --ikm ${ikm}`;
      if (blsPath) cmd += ` --bls-path ${blsPath}`;
      if (compressed) cmd += " --compressed";
      cmd += " --json";

      return {
        instruction: "Generate BLS keypair for validator operations",
        command: cmd,
        note: "BLS keys are used for validator attestations",
      };
    }

    case "aztec_generate_p2p_key":
      return {
        instruction: "Generate LibP2P peer private key",
        command: "aztec generate-p2p-private-key",
        note: "Used for P2P networking between Aztec nodes",
      };

    case "aztec_generate_l1_account": {
      const json = args.json !== false;
      return {
        instruction: "Generate Ethereum L1 account",
        command: `aztec generate-l1-account${json ? " --json" : ""}`,
        note: "Generates a new Ethereum private key and address",
      };
    }

    // ========================================
    // Default: Unknown Tool
    // ========================================

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
