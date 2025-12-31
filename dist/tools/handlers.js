/**
 * Aztec Noir MCP Server - Tool Handlers
 *
 * Implements the logic for all 47 tools
 */
// ============================================
// Main Handler Function
// ============================================
export async function handleToolCall(name, args, client) {
    switch (name) {
        // ========================================
        // Category 1: Network & Node Tools
        // ========================================
        case "aztec_get_node_info":
            return client.getNodeInfo();
        case "aztec_get_block_number":
            return { blockNumber: await client.getBlockNumber() };
        case "aztec_get_block":
            return client.getBlock(args.blockNumber);
        case "aztec_get_current_base_fee":
            return client.getCurrentBaseFee();
        case "aztec_get_logs":
            return client.getLogs({
                txHash: args.txHash,
                fromBlock: args.fromBlock,
                toBlock: args.toBlock,
                contractAddress: args.contractAddress,
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
            const accountType = args.type || "schnorr";
            const alias = args.alias;
            const secretKey = args.secretKey;
            const publicDeploy = args.publicDeploy;
            // Build command with all options
            let command = `aztec-wallet create-account -t ${accountType}`;
            if (alias) {
                command += ` -a ${alias}`;
            }
            if (secretKey) {
                command += ` --secret-key ${secretKey}`;
            }
            if (publicDeploy) {
                command += " --public-deploy";
            }
            return {
                instruction: "Account creation requires aztec-wallet CLI",
                command,
                type: accountType,
                note: "Run this command in terminal with Aztec sandbox running",
            };
        }
        case "aztec_deploy_account": {
            const address = args.address;
            const skipInit = args.skipInitialization;
            return {
                instruction: "Account deployment requires aztec-wallet CLI",
                command: `aztec-wallet deploy-account ${address}${skipInit ? " --skip-initialization" : ""}`,
                address,
            };
        }
        case "aztec_register_sender": {
            const address = args.address;
            await client.registerSender(address);
            return { success: true, message: `Registered sender: ${address}` };
        }
        case "aztec_get_account_public_key": {
            const address = args.address;
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
            const artifact = args.artifact;
            const contractArgs = args.args || [];
            const from = args.from;
            const alias = args.alias;
            const salt = args.salt;
            const publicDeploy = args.publicDeploy;
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
            const address = args.address;
            const artifact = args.artifact;
            const alias = args.alias;
            const publicKey = args.publicKey;
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
            const address = args.address;
            const info = await client.getContractInstance(address);
            if (!info) {
                return { error: "Contract not found", address };
            }
            return info;
        }
        case "aztec_inspect_contract": {
            const artifact = args.artifact;
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
            const functionSignature = args.functionSignature;
            return {
                instruction: "Compute function selector",
                command: `aztec compute-selector "${functionSignature}"`,
                functionSignature,
                note: "Returns the 4-byte selector for the function",
            };
        }
        case "aztec_is_contract_deployed": {
            const address = args.address;
            const deployed = await client.isContractPubliclyDeployed(address);
            return { address, isDeployed: deployed };
        }
        // ========================================
        // Category 4: Transaction Operations Tools
        // ========================================
        case "aztec_send_transaction": {
            const contractAddress = args.contractAddress;
            const functionName = args.functionName;
            const txArgs = args.args || [];
            const from = args.from;
            const authWitnesses = args.authWitnesses;
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
            const contractAddress = args.contractAddress;
            const functionName = args.functionName;
            const txArgs = args.args || [];
            const from = args.from;
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
            const txHash = args.txHash;
            return client.getTransactionReceipt(txHash);
        }
        case "aztec_get_pending_transactions":
            return { pendingTxs: await client.getPendingTxs() };
        case "aztec_estimate_gas": {
            const contractAddress = args.contractAddress;
            const functionName = args.functionName;
            const txArgs = args.args || [];
            const from = args.from;
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
            const functionName = args.functionName;
            const caller = args.caller;
            const contractAddress = args.contractAddress;
            const from = args.from;
            const authArgs = args.args || [];
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
            const functionName = args.functionName;
            const caller = args.caller;
            const contractAddress = args.contractAddress;
            const from = args.from;
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
            const amount = args.amount;
            const recipient = args.recipient;
            const tokenAddress = args.tokenAddress;
            const portalAddress = args.portalAddress;
            const mint = args.mint;
            const isPrivate = args.private;
            let cmd = `aztec bridge-erc20 ${amount} ${recipient}`;
            if (tokenAddress)
                cmd += ` -t ${tokenAddress}`;
            if (portalAddress)
                cmd += ` -p ${portalAddress}`;
            if (mint)
                cmd += " --mint";
            if (isPrivate)
                cmd += " --private";
            return {
                instruction: "Bridge ERC20 tokens from L1 to Aztec L2",
                command: cmd,
                amount,
                recipient,
                private: isPrivate,
            };
        }
        case "aztec_get_l1_balance": {
            const address = args.address;
            const tokenAddress = args.tokenAddress;
            return {
                instruction: "Get L1 ERC20 balance",
                command: `aztec get-l1-balance ${address} -t ${tokenAddress}`,
                address,
                tokenAddress,
            };
        }
        case "aztec_get_l1_to_l2_message_witness": {
            const contractAddress = args.contractAddress;
            const messageHash = args.messageHash;
            const secret = args.secret;
            const witness = await client.getL1ToL2MessageWitness(contractAddress, messageHash, secret);
            if (!witness) {
                return { error: "Message witness not found", messageHash };
            }
            return witness;
        }
        case "aztec_deploy_l1_contracts": {
            const privateKey = args.privateKey;
            const mnemonic = args.mnemonic;
            const testAccounts = args.testAccounts;
            const sponsoredFpc = args.sponsoredFpc;
            let cmd = "aztec deploy-l1-contracts";
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
            if (mnemonic)
                cmd += ` -m "${mnemonic}"`;
            if (testAccounts)
                cmd += " --test-accounts";
            if (sponsoredFpc)
                cmd += " --sponsored-fpc";
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
            const attester = args.attester;
            const withdrawer = args.withdrawer;
            const blsSecretKey = args.blsSecretKey;
            const privateKey = args.privateKey;
            let cmd = `aztec add-l1-validator --attester ${attester} --withdrawer ${withdrawer} --bls-secret-key ${blsSecretKey}`;
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
            return {
                instruction: "Add validator to L1 rollup contract",
                command: cmd,
                attester,
                withdrawer,
                note: "Requires stake deposit",
            };
        }
        case "aztec_remove_validator": {
            const validator = args.validator;
            const privateKey = args.privateKey;
            let cmd = `aztec remove-l1-validator --validator ${validator}`;
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
            return {
                instruction: "Remove validator from L1 rollup",
                command: cmd,
                validator,
            };
        }
        case "aztec_get_sequencers": {
            const command = args.command || "list";
            const blockNumber = args.blockNumber;
            let cmd = `aztec sequencers ${command}`;
            if (blockNumber !== undefined)
                cmd += ` --block-number ${blockNumber}`;
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
            const rollupAddress = args.rollupAddress;
            const privateKey = args.privateKey;
            let cmd = "aztec prune-rollup";
            if (rollupAddress)
                cmd += ` --rollup ${rollupAddress}`;
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
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
            const amount = args.amount;
            const recipient = args.recipient;
            const mint = args.mint;
            const privateKey = args.privateKey;
            let cmd = `aztec deposit-governance-tokens -a ${amount}`;
            if (recipient)
                cmd += ` --recipient ${recipient}`;
            if (mint)
                cmd += " --mint";
            if (privateKey)
                cmd += ` -p ${privateKey}`;
            return {
                instruction: "Deposit governance tokens for voting",
                command: cmd,
                amount,
            };
        }
        case "aztec_propose_governance": {
            const payloadAddress = args.payloadAddress;
            const privateKey = args.privateKey;
            let cmd = `aztec propose-with-lock -p ${payloadAddress}`;
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
            return {
                instruction: "Create governance proposal",
                command: cmd,
                payloadAddress,
                note: "Requires locked governance tokens",
            };
        }
        case "aztec_vote_on_proposal": {
            const proposalId = args.proposalId;
            const voteAmount = args.voteAmount;
            const inFavor = args.inFavor;
            const privateKey = args.privateKey;
            let cmd = `aztec vote-on-governance-proposal -p ${proposalId} -a ${voteAmount} --in-favor ${inFavor ? "yea" : "nay"}`;
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
            return {
                instruction: "Vote on governance proposal",
                command: cmd,
                proposalId,
                voteAmount,
                inFavor,
            };
        }
        case "aztec_execute_proposal": {
            const proposalId = args.proposalId;
            const wait = args.wait;
            const privateKey = args.privateKey;
            let cmd = `aztec execute-governance-proposal -p ${proposalId}`;
            if (wait)
                cmd += " --wait true";
            if (privateKey)
                cmd += ` -pk ${privateKey}`;
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
            const mnemonic = args.mnemonic;
            const ikm = args.ikm;
            const blsPath = args.blsPath;
            const compressed = args.compressed;
            let cmd = "aztec generate-bls-keypair";
            if (mnemonic)
                cmd += ` --mnemonic "${mnemonic}"`;
            if (ikm)
                cmd += ` --ikm ${ikm}`;
            if (blsPath)
                cmd += ` --bls-path ${blsPath}`;
            if (compressed)
                cmd += " --compressed";
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
//# sourceMappingURL=handlers.js.map