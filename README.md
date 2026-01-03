# Aztec Noir MCP Server

The first comprehensive Model Context Protocol server for Aztec Network - a privacy-first zkRollup on Ethereum with Noir smart contracts.

---

## Overview

Aztec Noir MCP Server enables AI assistants (Claude, GPT, etc.) to interact with the Aztec Network. It provides **47 tools** across **8 categories** for complete blockchain development workflows.

### What is Aztec?

Aztec is a privacy-focused Layer 2 that enables:

- **Private transactions** - Hidden amounts, senders, and recipients
- **Private smart contracts** - Confidential state and logic using Noir
- **Account abstraction** - Native smart contract wallets
- **L1-L2 bridging** - Move assets between Ethereum and Aztec

### What is MCP?

Model Context Protocol (MCP) is an open standard for connecting AI assistants to external tools and data sources. This server implements MCP to give AI assistants full Aztec development capabilities.

---

## Features

| Category | Tools | Description |
|----------|-------|-------------|
| Network and Node | 8 | Node info, blocks, health checks, L1 addresses |
| Account Management | 6 | Create/deploy accounts, register senders |
| Contract Operations | 7 | Deploy, register, inspect contracts |
| Transactions | 7 | Send, simulate, estimate gas |
| L1 Bridge | 5 | Bridge ERC20, L1 balances, messages |
| Validator | 5 | Add/remove validators, sequencers |
| Governance | 4 | Proposals, voting, execution |
| Cryptography | 5 | Generate keys, secrets, hashes |

**Total: 47 Tools + 7 Documentation Resources**

---

## Installation

### Prerequisites

- Node.js v20.x or higher
- Aztec Sandbox (for local development)
- MCP-compatible client (Claude Desktop, etc.)

### Install via npm
```bash
npm install -g aztec-noir-mcp
```

### Install from source
```bash
git clone https://github.com/rudazy/aztecmcp.git
cd aztecmcp
npm install
npm run build
```

---

## Usage

### Claude Desktop Configuration

Add to your Claude Desktop config file:

- Linux/Mac: `~/.config/claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "aztec": {
      "command": "npx",
      "args": ["aztec-noir-mcp"]
    }
  }
}
```

### Direct Execution
```bash
npx aztec-noir-mcp
```

---

## Tools Reference

### Network and Node (8 tools)

- `aztec_get_node_info` - Get node version, chain ID, protocol version
- `aztec_get_block_number` - Get current block height
- `aztec_get_block` - Get block by number with transactions
- `aztec_get_current_base_fee` - Get current gas base fee
- `aztec_get_logs` - Query contract event logs
- `aztec_get_l1_contract_addresses` - Get Rollup, Registry, Inbox addresses
- `aztec_get_protocol_contract_addresses` - Get protocol contract addresses
- `aztec_health_check` - Check node and PXE health status

### Account Management (6 tools)

- `aztec_create_account` - Create new account (schnorr, ecdsa variants)
- `aztec_deploy_account` - Deploy account contract on-chain
- `aztec_get_accounts` - List registered accounts
- `aztec_get_account` - Get account details by address
- `aztec_register_sender` - Register address as known sender
- `aztec_import_test_accounts` - Import sandbox test accounts

### Contract Operations (7 tools)

- `aztec_deploy_contract` - Deploy Noir contract with constructor args
- `aztec_get_contract_instance` - Get deployed contract info
- `aztec_get_contract_class` - Get contract class by ID
- `aztec_register_contract` - Register existing contract with PXE
- `aztec_list_example_contracts` - List 23 available example contracts
- `aztec_inspect_contract` - Inspect contract functions and parameters
- `aztec_compute_selector` - Compute function selector from signature

### Transaction Operations (7 tools)

- `aztec_send_transaction` - Send private or public transaction
- `aztec_simulate_transaction` - Simulate without broadcasting
- `aztec_get_transaction_receipt` - Get transaction receipt by hash
- `aztec_get_pending_transactions` - List pending transactions
- `aztec_estimate_gas` - Estimate gas for transaction
- `aztec_create_auth_witness` - Create authorization witness
- `aztec_add_auth_witness` - Add auth witness for delegated calls

### L1 Bridge and Cross-Chain (5 tools)

- `aztec_bridge_erc20` - Bridge ERC20 tokens L1 to L2
- `aztec_get_l1_balance` - Get L1 token balance
- `aztec_get_l1_to_l2_message_witness` - Get cross-chain message proof
- `aztec_claim_l1_to_l2_message` - Claim bridged tokens on L2
- `aztec_withdraw_to_l1` - Withdraw tokens from L2 to L1

### Validator and Sequencer (5 tools)

- `aztec_add_validator` - Add L1 validator with stake
- `aztec_remove_validator` - Remove validator from set
- `aztec_get_sequencers` - List current sequencers
- `aztec_set_sequencer` - Configure sequencer settings
- `aztec_advance_epoch` - Advance epoch (devnet only)

### Governance (4 tools)

- `aztec_deposit_to_governance` - Deposit tokens for voting power
- `aztec_propose_governance` - Create governance proposal
- `aztec_vote_on_proposal` - Vote on active proposal
- `aztec_execute_proposal` - Execute passed proposal

### Cryptography and Keys (5 tools)

- `aztec_generate_keys` - Generate account keypair
- `aztec_generate_encryption_keys` - Generate encryption keys
- `aztec_generate_bls_keypair` - Generate BLS keys for validators
- `aztec_generate_p2p_key` - Generate P2P networking key
- `aztec_generate_l1_account` - Generate Ethereum L1 account

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZTEC_NODE_URL` | Aztec node RPC URL | `http://localhost:8080` |
| `AZTEC_PXE_URL` | PXE service URL | `http://localhost:8080` |
| `ETHEREUM_HOST` | Ethereum L1 RPC URL | `http://localhost:8545` |

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Author

**rudazy** - https://github.com/rudazy
