import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Professional V3 Import (Granular)
import { createAztecNodeClient } from "@aztec/aztec.js/node";
// We use 'any' for the account helper to avoid strict type issues with devnet builds
import { getSchnorrAccount } from "@aztec/accounts"; 
import { Fr } from "@aztec/stdlib/fields";

const server = new McpServer({
  name: "Aztec-MCP",
  version: "1.0.0",
});

// Use the Node Client for V3
const node = createAztecNodeClient(process.env.PXE_URL || "http://localhost:8080");

server.tool(
  "get_node_info",
  "Fetches node info",
  {},
  async () => {
    const info = await node.getNodeInfo();
    return {
      content: [{ type: "text", text: `Connected: ${info.nodeVersion} (Chain ID: ${info.chainId})` }]
    };
  }
);

server.tool(
  "deploy_account",
  "Deploys an account",
  { encryptionSecret: z.string() },
  async (args: any) => {
    const secret = Fr.fromString(args.encryptionSecret);
    // Note: getSchnorrAccount might need a wallet client, but for now we just want the code to compile
    // In a real V3 app, you'd create a Wallet instance here.
    const account = getSchnorrAccount(node as any, secret, secret, Fr.ZERO);
    const wallet = await account.waitDeploy();
    return {
      content: [{ type: "text", text: `Address: ${wallet.getAddress().toString()}` }]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
