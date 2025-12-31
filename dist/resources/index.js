/**
 * Aztec Noir MCP Server - Resources
 *
 * Provides comprehensive documentation and guides for:
 * - Getting started with Aztec
 * - Noir smart contract development
 * - Privacy concepts and patterns
 * - Account abstraction
 * - Cross-chain bridging
 */
// ============================================
// Resource Definitions
// ============================================
export const resources = [
    {
        uri: "aztec://network/status",
        name: "Network Status",
        description: "Current Aztec network status, block height, and sync information",
        mimeType: "application/json",
    },
    {
        uri: "aztec://docs/getting-started",
        name: "Getting Started Guide",
        description: "Complete guide to setting up and using Aztec for development",
        mimeType: "text/markdown",
    },
    {
        uri: "aztec://docs/noir-contracts",
        name: "Noir Contract Development",
        description: "Comprehensive guide to writing Noir smart contracts for Aztec",
        mimeType: "text/markdown",
    },
    {
        uri: "aztec://docs/privacy-patterns",
        name: "Privacy Patterns",
        description: "Best practices for building privacy-preserving applications on Aztec",
        mimeType: "text/markdown",
    },
    {
        uri: "aztec://docs/accounts",
        name: "Account Abstraction",
        description: "Understanding Aztec's native account abstraction and account contracts",
        mimeType: "text/markdown",
    },
    {
        uri: "aztec://docs/bridging",
        name: "L1-L2 Bridging",
        description: "Guide to bridging assets between Ethereum L1 and Aztec L2",
        mimeType: "text/markdown",
    },
    {
        uri: "aztec://docs/cli-reference",
        name: "CLI Quick Reference",
        description: "Quick reference for aztec and aztec-wallet CLI commands",
        mimeType: "text/markdown",
    },
];
// ============================================
// Resource Content
// ============================================
export function getGettingStartedGuide() {
    return `# Getting Started with Aztec

## Overview

Aztec is a privacy-first Layer 2 rollup on Ethereum. It enables private smart contracts using zero-knowledge proofs, allowing developers to build applications where transaction details, balances, and contract state can remain confidential.

## Key Components

### 1. Aztec Sandbox
Local development environment that includes:
- **Aztec Node**: Processes and validates transactions
- **PXE (Private Execution Environment)**: Executes private functions locally
- **Anvil**: Local Ethereum L1 for testing

### 2. Noir Language
Domain-specific language for writing zero-knowledge circuits and smart contracts.

### 3. aztec-wallet CLI
Command-line tool for account management and contract interaction.

## Prerequisites

- **Node.js**: v20.x or higher (LTS recommended)
- **Docker**: Required for running the sandbox
- **Git**: For cloning repositories

## Installation

### Step 1: Install Aztec Toolchain

\`\`\`bash
bash -i <(curl -s https://install.aztec.network)
\`\`\`

This installs:
- \`aztec\` - Main CLI for network operations
- \`aztec-nargo\` - Noir compiler for Aztec contracts
- \`aztec-wallet\` - Wallet CLI for transactions
- \`aztec-up\` - Toolchain updater

### Step 2: Start the Sandbox

\`\`\`bash
aztec start --sandbox
\`\`\`

Wait for the message indicating PXE is ready (usually at http://localhost:8080).

### Step 3: Create Your First Account

\`\`\`bash
aztec-wallet create-account -a my-wallet
\`\`\`

This creates a Schnorr account and registers it with the PXE.

## Quick Start: Deploy a Token Contract

### 1. Deploy the Token Contract

\`\`\`bash
aztec-wallet deploy TokenContractArtifact \\
  --from accounts:my-wallet \\
  --args accounts:my-wallet MyToken MTK 18 \\
  -a my-token
\`\`\`

### 2. Mint Tokens (Public)

\`\`\`bash
aztec-wallet send mint_to_public \\
  -ca contracts:my-token \\
  --args accounts:my-wallet 1000 \\
  -f accounts:my-wallet
\`\`\`

### 3. Check Balance

\`\`\`bash
aztec-wallet simulate balance_of_public \\
  -ca contracts:my-token \\
  --args accounts:my-wallet \\
  -f accounts:my-wallet
\`\`\`

## Project Structure

A typical Aztec project structure:

\`\`\`
my-aztec-project/
├── contracts/
│   └── my_contract/
│       ├── Nargo.toml
│       └── src/
│           └── main.nr
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`AZTEC_NODE_URL\` | Aztec node URL | http://localhost:8080 |
| \`PXE_URL\` | PXE service URL | http://localhost:8080 |
| \`ETHEREUM_HOST\` | L1 Ethereum RPC | http://localhost:8545 |

## Next Steps

1. Read the [Noir Contract Development](aztec://docs/noir-contracts) guide
2. Understand [Privacy Patterns](aztec://docs/privacy-patterns)
3. Learn about [Account Abstraction](aztec://docs/accounts)
4. Explore [L1-L2 Bridging](aztec://docs/bridging)

## Resources

- [Official Documentation](https://docs.aztec.network)
- [Aztec GitHub](https://github.com/AztecProtocol/aztec-packages)
- [Noir Language](https://noir-lang.org)
- [Example Contracts](https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects/noir-contracts)
`;
}
export function getNoirContractGuide() {
    return `# Noir Contract Development for Aztec

## Overview

Noir is a domain-specific language for writing zero-knowledge proofs. On Aztec, Noir is used to write smart contracts that can execute privately, publicly, or both.

## Contract Structure

### Basic Contract Template

\`\`\`noir
use dep::aztec::macros::aztec;

#[aztec]
contract MyContract {
    use dep::aztec::prelude::{
        AztecAddress,
        FunctionSelector,
        NoteHeader,
        NoteInterface,
        PrivateContext,
        PublicMutable,
        Map,
        PrivateSet,
    };
    
    use dep::aztec::macros::{storage::storage, functions::{private, public, initializer}};

    // ================================
    // Storage
    // ================================
    
    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        balances: Map<AztecAddress, PrivateSet<ValueNote, Context>, Context>,
        total_supply: PublicMutable<U128, Context>,
    }

    // ================================
    // Constructor
    // ================================
    
    #[initializer]
    #[public]
    fn constructor(admin: AztecAddress) {
        storage.admin.write(admin);
    }

    // ================================
    // Private Functions
    // ================================
    
    #[private]
    fn private_transfer(to: AztecAddress, amount: Field) {
        let sender = context.msg_sender();
        
        // Subtract from sender's private balance
        let sender_balance = storage.balances.at(sender);
        sender_balance.remove(amount);
        
        // Add to recipient's private balance
        let recipient_balance = storage.balances.at(to);
        recipient_balance.insert(amount);
    }

    // ================================
    // Public Functions
    // ================================
    
    #[public]
    fn public_mint(to: AztecAddress, amount: Field) {
        let admin = storage.admin.read();
        assert(context.msg_sender() == admin, "Only admin can mint");
        
        // Update total supply
        let supply = storage.total_supply.read();
        storage.total_supply.write(supply + U128::from_integer(amount));
    }

    // ================================
    // Unconstrained (View) Functions
    // ================================
    
    unconstrained fn get_admin() -> pub AztecAddress {
        storage.admin.read()
    }
}
\`\`\`

## Function Types

### 1. Private Functions (\`#[private]\`)

- Execute locally in the user's PXE
- Generate zero-knowledge proofs
- Can read/write private state (notes)
- Cannot directly read public state
- Transaction details are hidden on-chain

\`\`\`noir
#[private]
fn private_function(secret_input: Field) {
    // Private execution
    // Proof generated locally
}
\`\`\`

### 2. Public Functions (\`#[public]\`)

- Execute on the sequencer
- Visible on-chain (like traditional smart contracts)
- Can read/write public state
- Cannot access private state directly

\`\`\`noir
#[public]
fn public_function(public_input: Field) {
    // Public execution
    // Visible on-chain
}
\`\`\`

### 3. Unconstrained Functions

- View functions (no state changes)
- No proof generation
- Used for reading state

\`\`\`noir
unconstrained fn view_balance(owner: AztecAddress) -> pub Field {
    storage.balances.at(owner).read()
}
\`\`\`

## Storage Types

### Public Storage

\`\`\`noir
// Single value
admin: PublicMutable<AztecAddress, Context>,

// Mapping
allowances: Map<AztecAddress, Map<AztecAddress, PublicMutable<U128, Context>, Context>, Context>,
\`\`\`

### Private Storage (Notes)

\`\`\`noir
// Set of notes
balances: Map<AztecAddress, PrivateSet<ValueNote, Context>, Context>,

// Single note
secret_data: PrivateMutable<DataNote, Context>,
\`\`\`

## Notes and Nullifiers

### Creating a Note

\`\`\`noir
use dep::value_note::value_note::ValueNote;

#[private]
fn mint_private(to: AztecAddress, amount: Field) {
    let note = ValueNote::new(amount, to);
    storage.balances.at(to).insert(&mut note);
}
\`\`\`

### Consuming a Note

\`\`\`noir
#[private]
fn spend_private(amount: Field) {
    let sender = context.msg_sender();
    let notes = storage.balances.at(sender).pop_notes(
        NoteGetterOptions::new()
            .select(ValueNote::properties().value, Comparator.EQ, amount)
            .set_limit(1)
    );
    assert(notes.len() == 1, "Note not found");
}
\`\`\`

## Calling Between Functions

### Private to Public

\`\`\`noir
#[private]
fn private_to_public(amount: Field) {
    // Queue a public function call
    MyContract::at(context.this_address())
        .public_update(amount)
        .enqueue(&mut context);
}
\`\`\`

### Public to Private (via Messages)

Public functions cannot directly call private functions. Use message passing patterns instead.

## Compiling Contracts

\`\`\`bash
# Navigate to contract directory
cd contracts/my_contract

# Compile with aztec-nargo
aztec-nargo compile

# Generate TypeScript artifacts
aztec codegen ./target -o ../../src/artifacts
\`\`\`

## Testing Contracts

### Using aztec-nargo test

\`\`\`bash
aztec-nargo test
\`\`\`

### Test Structure

\`\`\`noir
#[test]
fn test_private_transfer() {
    // Setup
    let contract = MyContract::deploy();
    
    // Execute
    contract.private_transfer(recipient, 100);
    
    // Assert
    assert(contract.get_balance(recipient) == 100);
}
\`\`\`

## Best Practices

1. **Minimize public state**: Keep sensitive data in private notes
2. **Use nullifiers properly**: Ensure notes can only be spent once
3. **Batch operations**: Combine multiple note operations when possible
4. **Handle failed transactions**: Notes consumed in failed txs are lost
5. **Test thoroughly**: Private bugs are hard to debug on-chain

## Common Patterns

### Access Control

\`\`\`noir
#[public]
fn admin_only_function() {
    assert(context.msg_sender() == storage.admin.read(), "Not admin");
    // ... 
}
\`\`\`

### Private-Public Hybrid

\`\`\`noir
#[private]
fn shield(amount: Field) {
    // Burn public tokens
    MyContract::at(context.this_address())
        .burn_public(context.msg_sender(), amount)
        .enqueue(&mut context);
    
    // Mint private notes
    let note = ValueNote::new(amount, context.msg_sender());
    storage.private_balances.at(context.msg_sender()).insert(&mut note);
}
\`\`\`
`;
}
export function getPrivacyPatternsGuide() {
    return `# Privacy Patterns for Aztec

## Overview

Building privacy-preserving applications requires careful consideration of information leakage. This guide covers common patterns and best practices.

## Core Privacy Concepts

### 1. Private State (Notes)

Private state in Aztec is stored as encrypted **notes**. Only the note owner can decrypt and view the contents.

\`\`\`noir
// Note structure
struct ValueNote {
    value: Field,
    owner: AztecAddress,
    randomness: Field,  // Prevents linking
}
\`\`\`

### 2. Nullifiers

When a note is "spent," a **nullifier** is published on-chain. This prevents double-spending without revealing which note was spent.

\`\`\`
Note Created → Note Exists (encrypted)
    ↓
Note Spent → Nullifier Published (unlinkable to note)
\`\`\`

### 3. Information Leakage Points

Be aware of what IS visible on-chain:
- Transaction timing
- Gas usage patterns
- Public function calls
- Nullifier publication
- Contract addresses interacted with

## Privacy Patterns

### Pattern 1: Private Transfers

Transfer tokens without revealing sender, recipient, or amount.

\`\`\`noir
#[private]
fn private_transfer(to: AztecAddress, amount: Field) {
    // 1. Consume sender's note (publishes nullifier)
    let sender_notes = storage.balances.at(context.msg_sender());
    sender_notes.remove(amount);
    
    // 2. Create new note for recipient (encrypted)
    let recipient_notes = storage.balances.at(to);
    recipient_notes.insert(amount);
    
    // On-chain: Only nullifier visible, no amounts or addresses
}
\`\`\`

### Pattern 2: Shielding (Public → Private)

Convert public tokens to private notes.

\`\`\`noir
#[private]
fn shield(amount: Field) {
    let owner = context.msg_sender();
    
    // 1. Burn public balance (visible)
    Token::at(token_address)
        .burn_public(owner, amount)
        .enqueue(&mut context);
    
    // 2. Create private note (hidden)
    let note = ValueNote::new(amount, owner);
    storage.private_balances.at(owner).insert(&mut note);
}
\`\`\`

### Pattern 3: Unshielding (Private → Public)

Convert private notes to public tokens.

\`\`\`noir
#[private]
fn unshield(amount: Field, recipient: AztecAddress) {
    let owner = context.msg_sender();
    
    // 1. Consume private note (nullifier published)
    storage.private_balances.at(owner).remove(amount);
    
    // 2. Mint public balance (visible)
    Token::at(token_address)
        .mint_public(recipient, amount)
        .enqueue(&mut context);
}
\`\`\`

### Pattern 4: Private Voting

Vote without revealing your choice.

\`\`\`noir
#[private]
fn cast_vote(proposal_id: Field, vote: bool) {
    let voter = context.msg_sender();
    
    // 1. Verify voter hasn't voted (via nullifier)
    let nullifier = pedersen_hash([proposal_id, voter.to_field()]);
    context.push_nullifier(nullifier);
    
    // 2. Update vote counts privately
    // Use homomorphic techniques or commit-reveal
}
\`\`\`

### Pattern 5: Private NFT Ownership

Own NFTs without revealing your collection.

\`\`\`noir
struct NFTNote {
    token_id: Field,
    owner: AztecAddress,
    randomness: Field,
}

#[private]
fn transfer_nft(token_id: Field, to: AztecAddress) {
    let from = context.msg_sender();
    
    // Consume old ownership note
    let nft_notes = storage.nfts.at(from);
    nft_notes.remove_by_token_id(token_id);
    
    // Create new ownership note
    let new_note = NFTNote::new(token_id, to);
    storage.nfts.at(to).insert(&mut new_note);
}
\`\`\`

## Anti-Patterns to Avoid

### ❌ Leaking via Timing

\`\`\`noir
// BAD: Timing reveals information
#[private]
fn conditional_transfer(condition: bool, amount: Field) {
    if condition {
        do_transfer(amount);  // Gas usage differs
    }
}

// GOOD: Constant-time execution
#[private]
fn conditional_transfer(condition: bool, amount: Field) {
    let actual_amount = condition as Field * amount;
    do_transfer(actual_amount);  // Always executes
}
\`\`\`

### ❌ Unique Amounts

\`\`\`noir
// BAD: Unique amounts are linkable
transfer(1234567);  // Easy to track

// GOOD: Use standard denominations
transfer(1000);  // Blends with other transfers
\`\`\`

### ❌ Immediate Shield/Unshield

\`\`\`noir
// BAD: Timing correlation
shield(1000);
// immediately...
unshield(1000);  // Obviously linked

// GOOD: Add delay, split amounts
shield(1000);
// wait...
unshield(600);
// wait...
unshield(400);
\`\`\`

## Privacy Checklist

- [ ] Sensitive data stored in private notes, not public state
- [ ] Nullifiers don't leak note contents
- [ ] No timing correlations between related actions
- [ ] Standard denominations used where possible
- [ ] Constant-time execution for conditional logic
- [ ] No unique identifiers in private operations
- [ ] Public function calls minimized
`;
}
export function getAccountsGuide() {
    return `# Account Abstraction on Aztec

## Overview

Aztec has **native account abstraction** - every account is a smart contract. This enables flexible authentication, recovery mechanisms, and custom transaction logic.

## How Accounts Work

### Traditional (Ethereum)
\`\`\`
EOA (Externally Owned Account)
├── Fixed ECDSA signature scheme
├── No custom logic
└── Private key = full control
\`\`\`

### Aztec
\`\`\`
Account Contract
├── Custom signature verification
├── Programmable authentication
├── Recovery mechanisms
└── Batched transactions
\`\`\`

## Account Types

### 1. Schnorr Account (Default)

Uses Schnorr signatures over the Grumpkin curve.

\`\`\`bash
aztec-wallet create-account -t schnorr -a my-wallet
\`\`\`

**Properties:**
- Fast signature verification
- Native to Aztec's curve
- Single-key (same key for signing and encryption)

### 2. ECDSA Accounts

Compatible with existing Ethereum tooling.

\`\`\`bash
# secp256k1 (Ethereum-compatible)
aztec-wallet create-account -t ecdsasecp256k1 -a eth-wallet

# secp256r1 (WebAuthn/Secure Enclave compatible)
aztec-wallet create-account -t ecdsasecp256r1 -a secure-wallet
\`\`\`

### 3. SSH Account (Secure Enclave)

Uses keys stored in hardware security modules.

\`\`\`bash
aztec-wallet create-account -t ecdsasecp256r1ssh -a hardware-wallet
\`\`\`

**Use Case:** TouchID/FaceID signing on Mac.

## Account Contract Structure

\`\`\`noir
#[aztec]
contract SchnorrAccount {
    use dep::aztec::prelude::*;
    use dep::authwit::auth::{assert_current_call_valid_authwit, compute_authwit_message_hash};

    #[storage]
    struct Storage<Context> {
        signing_public_key: PublicImmutable<Point, Context>,
    }

    // ================================
    // Authentication
    // ================================
    
    #[private]
    fn verify_private_authwit(inner_hash: Field) -> Field {
        // 1. Compute the message hash
        let message_hash = compute_authwit_message_hash(
            context.msg_sender(),
            context.chain_id(),
            context.version(),
            inner_hash
        );
        
        // 2. Verify Schnorr signature
        let public_key = storage.signing_public_key.read();
        let signature = context.get_signature();
        
        assert(verify_schnorr(message_hash, signature, public_key));
        
        IS_VALID_SELECTOR
    }

    // ================================
    // Entrypoint
    // ================================
    
    #[private]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload) {
        // Verify authentication
        let payload_hash = app_payload.hash();
        assert(self.verify(payload_hash));
        
        // Execute the application calls
        app_payload.execute_calls(&mut context);
        
        // Handle fee payment
        fee_payload.execute_calls(&mut context);
    }
}
\`\`\`

## Authorization Witnesses (AuthWit)

AuthWits allow delegating actions to other accounts.

### Creating an AuthWit

\`\`\`bash
# Allow spender to transfer tokens on your behalf
aztec-wallet create-authwit transfer \\
  <spender_address> \\
  -ca <token_contract> \\
  -f accounts:my-wallet \\
  --args accounts:my-wallet <recipient> 100
\`\`\`

### Using an AuthWit

\`\`\`noir
#[private]
fn transfer_from(from: AztecAddress, to: AztecAddress, amount: Field) {
    // Verify the caller is authorized
    assert_current_call_valid_authwit(&mut context, from);
    
    // Perform the transfer
    // ...
}
\`\`\`

## Account Recovery Patterns

### Multi-Sig Recovery

\`\`\`noir
#[storage]
struct Storage<Context> {
    owner: PublicMutable<AztecAddress, Context>,
    guardians: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
    recovery_threshold: PublicMutable<u8, Context>,
}

#[public]
fn initiate_recovery(new_owner: AztecAddress) {
    // Requires threshold guardian signatures
}
\`\`\`

### Time-Locked Recovery

\`\`\`noir
#[storage]
struct Storage<Context> {
    recovery_address: PublicMutable<AztecAddress, Context>,
    recovery_delay: PublicMutable<u64, Context>,
    pending_recovery: PublicMutable<Option<(AztecAddress, u64)>, Context>,
}
\`\`\`

### Social Recovery

Designate trusted friends/family who can collectively recover your account.

## Best Practices

1. **Use appropriate account type** for your security model
2. **Implement recovery mechanisms** before you need them
3. **Test authentication thoroughly** - bugs can lock you out
4. **Consider multi-sig** for high-value accounts
5. **Rotate keys periodically** using account migration

## Account Deployment

Accounts must be deployed before use (costs gas):

\`\`\`bash
# Create and deploy in one step
aztec-wallet create-account -a my-wallet

# Or register first, deploy later
aztec-wallet create-account -a my-wallet --register-only
aztec-wallet deploy-account accounts:my-wallet
\`\`\`
`;
}
export function getBridgingGuide() {
    return `# L1-L2 Bridging on Aztec

## Overview

Aztec connects to Ethereum L1, allowing assets to be bridged between layers. This guide covers the bridging architecture and how to move assets.

## Architecture

\`\`\`
Ethereum L1                          Aztec L2
┌─────────────────┐                 ┌─────────────────┐
│                 │                 │                 │
│  Portal         │ ←── Messages ──→│  L2 Contract    │
│  Contract       │                 │                 │
│                 │                 │                 │
│  Token (ERC20)  │                 │  Token (Noir)   │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
        ↑                                   ↑
        │                                   │
    L1 Rollup ◄─────── Proofs ─────────────┘
    Contract
\`\`\`

## Key Components

### 1. Portal Contracts (L1)
Solidity contracts that:
- Lock/unlock L1 tokens
- Send messages to L2
- Receive messages from L2

### 2. L2 Token Contracts
Noir contracts that:
- Mint/burn L2 representations
- Handle private/public balances
- Process cross-chain messages

### 3. Message Passing
- **L1 → L2**: Messages added to inbox, consumed on L2
- **L2 → L1**: Messages added to outbox, consumed on L1

## Bridging Tokens

### L1 → L2 (Deposit)

#### Public Deposit

\`\`\`bash
aztec bridge-erc20 1000 <aztec_recipient> \\
  -t <l1_token_address> \\
  -p <portal_address>
\`\`\`

**Flow:**
1. User approves portal to spend tokens
2. Portal locks tokens on L1
3. Message sent to L2 inbox
4. L2 contract mints tokens to recipient

#### Private Deposit

\`\`\`bash
aztec bridge-erc20 1000 <aztec_recipient> \\
  -t <l1_token_address> \\
  -p <portal_address> \\
  --private
\`\`\`

**Flow:**
1. Same as public, but...
2. L2 tokens minted as private notes
3. Recipient receives encrypted notes

### L2 → L1 (Withdrawal)

#### From Public Balance

\`\`\`noir
#[public]
fn withdraw_public(
    recipient: EthAddress,
    amount: Field,
    caller_on_l1: EthAddress
) {
    // Burn L2 tokens
    storage.public_balances.at(context.msg_sender()).sub(amount);
    
    // Send message to L1
    let content = compute_withdraw_content(recipient, amount);
    context.message_portal(portal_address, content);
}
\`\`\`

#### From Private Balance

\`\`\`noir
#[private]
fn withdraw_private(
    recipient: EthAddress,
    amount: Field,
    caller_on_l1: EthAddress
) {
    // Consume private notes
    storage.private_balances.at(context.msg_sender()).remove(amount);
    
    // Queue public function to send L1 message
    Token::at(context.this_address())
        .finalize_withdraw(recipient, amount)
        .enqueue(&mut context);
}
\`\`\`

## Claiming Messages

### L1 → L2 Message Claiming

After depositing on L1, claim on L2:

\`\`\`noir
#[public]
fn claim_public(
    to: AztecAddress,
    amount: Field,
    secret: Field,
    message_leaf_index: Field
) {
    // Verify the L1 message
    let content_hash = compute_deposit_content_hash(to, amount, secret);
    
    context.consume_l1_to_l2_message(
        content_hash,
        secret,
        portal_address,
        message_leaf_index
    );
    
    // Mint tokens
    storage.public_balances.at(to).add(amount);
}
\`\`\`

### Getting Message Witness

\`\`\`bash
aztec get-l1-to-l2-message-witness \\
  --contract-address <l2_token> \\
  --message-hash <hash> \\
  --secret <secret>
\`\`\`

## Fee Juice Bridging

Fee Juice is the native gas token on Aztec.

\`\`\`bash
# Bridge fee juice for gas
aztec bridge-erc20 1000 <aztec_address> \\
  --mint  # Mint test tokens first (testnet only)
\`\`\`

## Portal Contract Example (Solidity)

\`\`\`solidity
contract TokenPortal {
    IERC20 public token;
    IRegistry public registry;
    
    function depositToAztecPublic(
        address _to,
        uint256 _amount,
        bytes32 _secretHash
    ) external returns (bytes32) {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Send message to L2
        IInbox inbox = registry.getInbox();
        bytes32 content = computeDepositContent(_to, _amount, _secretHash);
        
        return inbox.sendL2Message(
            DataStructures.L2Actor(l2TokenAddress, 1),
            content
        );
    }
    
    function withdrawFromAztec(
        address _recipient,
        uint256 _amount,
        bool _withCaller,
        bytes32 _messageHash,
        bytes calldata _proof
    ) external {
        // Verify L2 message
        IOutbox outbox = registry.getOutbox();
        outbox.consume(_messageHash, l2TokenAddress, _proof);
        
        // Release tokens
        token.safeTransfer(_recipient, _amount);
    }
}
\`\`\`

## Security Considerations

1. **Message Replay**: Each message can only be consumed once
2. **Portal Trust**: Portal contracts are trusted bridges
3. **Finality**: Wait for L2 proofs before considering deposits final
4. **Secret Management**: Keep claim secrets secure

## Troubleshooting

### Message Not Found

\`\`\`bash
# Check if message is in the tree
aztec get-l1-to-l2-message-witness ...
\`\`\`

If not found:
- Wait for L1 block finality
- Verify portal address is correct
- Check secret hash matches

### Claim Failing

- Ensure sufficient fee juice for gas
- Verify message hasn't already been claimed
- Check recipient address is correct
`;
}
export function getCLIReferenceGuide() {
    return `# Aztec CLI Quick Reference

## aztec - Main CLI

### Network Commands

\`\`\`bash
# Start sandbox
aztec start --sandbox

# Get block number
aztec block-number

# Get block info
aztec get-block [blockNumber]

# Get node info
aztec get-node-info --json

# Get current base fee
aztec get-current-base-fee
\`\`\`

### Contract Commands

\`\`\`bash
# List example contracts
aztec example-contracts

# Inspect contract functions
aztec inspect-contract <artifact>

# Compute function selector
aztec compute-selector "transfer(Field,Field)"

# Generate TypeScript from artifact
aztec codegen <noir-abi-path> -o <output-dir>
\`\`\`

### Key Generation

\`\`\`bash
# Generate account keys
aztec generate-keys --json

# Generate secret and hash
aztec generate-secret-and-hash

# Generate BLS keypair (validators)
aztec generate-bls-keypair --json

# Generate P2P key
aztec generate-p2p-private-key

# Generate L1 account
aztec generate-l1-account --json
\`\`\`

### L1 Operations

\`\`\`bash
# Get L1 contract addresses
aztec get-l1-addresses --json

# Get L1 balance
aztec get-l1-balance <address> -t <token>

# Bridge ERC20
aztec bridge-erc20 <amount> <recipient> -t <token> -p <portal>

# Deploy L1 contracts (admin)
aztec deploy-l1-contracts --test-accounts
\`\`\`

### Validator Commands

\`\`\`bash
# Add validator
aztec add-l1-validator --attester <addr> --withdrawer <addr>

# Remove validator
aztec remove-l1-validator --validator <addr>

# List sequencers
aztec sequencers list

# Advance epoch (devnet)
aztec advance-epoch
\`\`\`

---

## aztec-wallet - Wallet CLI

### Account Commands

\`\`\`bash
# Create account
aztec-wallet create-account -a <alias> -t <type>
# Types: schnorr, ecdsasecp256r1, ecdsasecp256k1, ecdsasecp256r1ssh

# Deploy account
aztec-wallet deploy-account <address>

# List accounts
aztec-wallet get-accounts

# Import test accounts
aztec-wallet import-test-accounts
\`\`\`

### Contract Commands

\`\`\`bash
# Deploy contract
aztec-wallet deploy <artifact> \\
  --from <account> \\
  --args <arg1> <arg2> \\
  -a <alias>

# Register existing contract
aztec-wallet register-contract <address> <artifact> -a <alias>
\`\`\`

### Transaction Commands

\`\`\`bash
# Send transaction
aztec-wallet send <function> \\
  -ca <contract> \\
  -f <from> \\
  --args <arg1> <arg2>

# Simulate (dry run)
aztec-wallet simulate <function> \\
  -ca <contract> \\
  -f <from> \\
  --args <arg1> <arg2>

# Estimate gas only
aztec-wallet simulate <function> ... --estimate-gas-only
\`\`\`

### Authorization

\`\`\`bash
# Create auth witness (private)
aztec-wallet create-authwit <function> <caller> \\
  -ca <contract> \\
  -f <from>

# Authorize action (public)
aztec-wallet authorize-action <function> <caller> \\
  -ca <contract> \\
  -f <from>
\`\`\`

### Aliases

\`\`\`bash
# Reference accounts
accounts:<alias>

# Reference contracts
contracts:<alias>

# Reference last deployed
contracts:last
\`\`\`

---

## Common Options

| Option | Description |
|--------|-------------|
| \`-n, --node-url\` | Aztec node URL (default: localhost:8080) |
| \`-f, --from\` | Sender account |
| \`-a, --alias\` | Alias for created resource |
| \`--json\` | Output as JSON |
| \`-h, --help\` | Show help |

## Environment Variables

| Variable | Description |
|----------|-------------|
| \`AZTEC_NODE_URL\` | Node URL |
| \`PXE_URL\` | PXE URL |
| \`ETHEREUM_HOST\` | L1 RPC URL |
| \`SECRET_KEY\` | Account secret key |
| \`L1_CHAIN_ID\` | L1 chain ID |

## Fee Payment Options

\`\`\`bash
--payment method=fee_juice
--payment method=fpc-public,asset=<addr>,fpc=<addr>
--payment method=fpc-private,asset=<addr>,fpc=<addr>
--payment method=fpc-sponsored
\`\`\`

## Gas Options

\`\`\`bash
--gas-limits da=100,l2=100,teardownDA=10,teardownL2=10
--max-fees-per-gas da=100,l2=100
\`\`\`
`;
}
// ============================================
// Resource Handler
// ============================================
export async function getResourceContent(uri, getNetworkStatus) {
    switch (uri) {
        case "aztec://network/status": {
            const status = await getNetworkStatus();
            return {
                mimeType: "application/json",
                text: JSON.stringify(status, null, 2),
            };
        }
        case "aztec://docs/getting-started":
            return {
                mimeType: "text/markdown",
                text: getGettingStartedGuide(),
            };
        case "aztec://docs/noir-contracts":
            return {
                mimeType: "text/markdown",
                text: getNoirContractGuide(),
            };
        case "aztec://docs/privacy-patterns":
            return {
                mimeType: "text/markdown",
                text: getPrivacyPatternsGuide(),
            };
        case "aztec://docs/accounts":
            return {
                mimeType: "text/markdown",
                text: getAccountsGuide(),
            };
        case "aztec://docs/bridging":
            return {
                mimeType: "text/markdown",
                text: getBridgingGuide(),
            };
        case "aztec://docs/cli-reference":
            return {
                mimeType: "text/markdown",
                text: getCLIReferenceGuide(),
            };
        default:
            throw new Error(`Unknown resource: ${uri}`);
    }
}
//# sourceMappingURL=index.js.map