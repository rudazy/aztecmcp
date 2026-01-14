import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Use "any" for the client if types remain stubborn, ensuring the code RUNS
// (This is a valid strategy when types are broken in devnet builds)
import { createPXEClient } from "@aztec/pxe"; 
import { getSchnorrAccount } from "@aztec/accounts";
import { Fr } from "@aztec/stdlib/fields";

const server = new McpServer({
  name: "Aztec-MCP",
  version: "1.0.0",
});

const pxe = createPXEClient(process.env.PXE_URL || "http://localhost:8080");

server.tool(
  "get_node_info",
  "Fetches node info",
  {},
  async () => {
    const info = await pxe.getNodeInfo();
    return {
      content: [{ type: "text", text: `Connected: ${info.chainId}` }]
    };
  }
);

server.tool(
  "deploy_account",
  "Deploys an account",
  { encryptionSecret: z.string() },
  async (args: any) => {
    // Fr from stdlib/fields
    const secret = Fr.fromString(args.encryptionSecret);
    const account = getSchnorrAccount(pxe, secret, secret, Fr.ZERO);
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
