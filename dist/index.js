#!/usr/bin/env node
/**
 * Aztec Noir MCP Server
 *
 * A comprehensive Model Context Protocol server for the Aztec Network -
 * the privacy-first zkRollup on Ethereum with Noir smart contracts.
 *
 * Features:
 * - 47 tools across 8 categories
 * - 7 documentation resources
 * - Full Aztec CLI integration
 * - Privacy-preserving blockchain operations
 *
 * @author rudazy
 * @license MIT
 * @repository https://github.com/rudazy/aztecmcp
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { AztecClient } from "./aztec-client.js";
import { tools, toolCategories, toolCount } from "./tools/index.js";
import { handleToolCall } from "./tools/index.js";
import { resources, getResourceContent } from "./resources/index.js";
function loadConfig() {
    return {
        pxeUrl: process.env.AZTEC_PXE_URL || process.env.PXE_URL || "http://localhost:8080",
        nodeUrl: process.env.AZTEC_NODE_URL || "http://localhost:8080",
        l1RpcUrl: process.env.ETHEREUM_HOST || process.env.L1_RPC_URL || "http://localhost:8545",
    };
}
// ============================================
// Server Metadata
// ============================================
const SERVER_INFO = {
    name: "aztec-noir-mcp",
    version: "0.1.0",
    description: "Comprehensive MCP server for Aztec Network - Privacy-first zkRollup with Noir contracts",
    author: "rudazy",
    repository: "https://github.com/rudazy/aztecmcp",
    features: {
        tools: toolCount,
        resources: resources.length,
        categories: Object.keys(toolCategories).length,
    },
};
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (data) {
        console.error(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    }
    else {
        console.error(`${prefix} ${message}`);
    }
}
// ============================================
// Error Handling
// ============================================
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return JSON.stringify(error);
}
function createMcpError(code, message, data) {
    log("error", message, data);
    return new McpError(code, message);
}
// ============================================
// Server Implementation
// ============================================
async function createServer() {
    const config = loadConfig();
    log("info", "Initializing Aztec Noir MCP Server", {
        version: SERVER_INFO.version,
        tools: SERVER_INFO.features.tools,
        resources: SERVER_INFO.features.resources,
    });
    log("info", "Configuration loaded", {
        pxeUrl: config.pxeUrl,
        nodeUrl: config.nodeUrl,
        l1RpcUrl: config.l1RpcUrl,
    });
    // Initialize Aztec client
    const aztecClient = new AztecClient(config.pxeUrl, config.nodeUrl, config.l1RpcUrl);
    // Create MCP server
    const server = new Server({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
    }, {
        capabilities: {
            tools: {},
            resources: {},
        },
    });
    // ----------------------------------------
    // Tool Handlers
    // ----------------------------------------
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        log("debug", `Listing ${tools.length} tools`);
        return { tools };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        log("info", `Tool called: ${name}`, { arguments: args });
        try {
            const result = await handleToolCall(name, args || {}, aztecClient);
            log("debug", `Tool ${name} completed successfully`);
            // Format result for MCP response
            const content = formatToolResult(result);
            return {
                content: [
                    {
                        type: "text",
                        text: content,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = formatError(error);
            throw createMcpError(ErrorCode.InternalError, `Tool '${name}' failed: ${errorMessage}`, { tool: name, arguments: args, error: errorMessage });
        }
    });
    // ----------------------------------------
    // Resource Handlers
    // ----------------------------------------
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        log("debug", `Listing ${resources.length} resources`);
        return { resources };
    });
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        log("info", `Resource requested: ${uri}`);
        try {
            const { mimeType, text } = await getResourceContent(uri, async () => {
                // Get network status for the status resource
                try {
                    return await aztecClient.healthCheck();
                }
                catch {
                    return {
                        error: "Unable to connect to Aztec network",
                        hint: "Ensure the Aztec sandbox is running: aztec start --sandbox",
                    };
                }
            });
            log("debug", `Resource ${uri} retrieved successfully`);
            return {
                contents: [
                    {
                        uri,
                        mimeType,
                        text,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = formatError(error);
            throw createMcpError(ErrorCode.InvalidRequest, `Resource '${uri}' not found: ${errorMessage}`, { uri, error: errorMessage });
        }
    });
    return server;
}
// ============================================
// Result Formatting
// ============================================
function formatToolResult(result) {
    if (result === null || result === undefined) {
        return "Operation completed successfully.";
    }
    if (typeof result === "string") {
        return result;
    }
    if (typeof result === "number" || typeof result === "boolean") {
        return String(result);
    }
    // Format objects and arrays as pretty JSON
    try {
        return JSON.stringify(result, null, 2);
    }
    catch {
        return String(result);
    }
}
// ============================================
// Startup Banner
// ============================================
function printBanner() {
    const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     █████╗ ███████╗████████╗███████╗ ██████╗                  ║
║    ██╔══██╗╚══███╔╝╚══██╔══╝██╔════╝██╔════╝                  ║
║    ███████║  ███╔╝    ██║   █████╗  ██║                       ║
║    ██╔══██║ ███╔╝     ██║   ██╔══╝  ██║                       ║
║    ██║  ██║███████╗   ██║   ███████╗╚██████╗                  ║
║    ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝ ╚═════╝                  ║
║                                                               ║
║    ███╗   ██╗ ██████╗ ██╗██████╗                              ║
║    ████╗  ██║██╔═══██╗██║██╔══██╗                             ║
║    ██╔██╗ ██║██║   ██║██║██████╔╝                             ║
║    ██║╚██╗██║██║   ██║██║██╔══██╗                             ║
║    ██║ ╚████║╚██████╔╝██║██║  ██║                             ║
║    ╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═╝                             ║
║                                                               ║
║    MCP Server v${SERVER_INFO.version.padEnd(46)}║
║    Privacy-first zkRollup on Ethereum                         ║
║                                                               ║
║    Tools: ${String(SERVER_INFO.features.tools).padEnd(5)} | Resources: ${String(SERVER_INFO.features.resources).padEnd(4)} | Categories: ${String(SERVER_INFO.features.categories).padEnd(2)}    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
    console.error(banner);
}
// ============================================
// Main Entry Point
// ============================================
async function main() {
    // Print startup banner
    printBanner();
    try {
        // Create and configure server
        const server = await createServer();
        // Create transport
        const transport = new StdioServerTransport();
        // Connect server to transport
        await server.connect(transport);
        log("info", "Aztec Noir MCP Server started successfully");
        log("info", "Listening for MCP requests on stdio");
        // Handle graceful shutdown
        process.on("SIGINT", async () => {
            log("info", "Received SIGINT, shutting down...");
            await server.close();
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            log("info", "Received SIGTERM, shutting down...");
            await server.close();
            process.exit(0);
        });
    }
    catch (error) {
        log("error", "Failed to start server", { error: formatError(error) });
        process.exit(1);
    }
}
// ============================================
// Run Server
// ============================================
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
// ============================================
// Exports for Testing
// ============================================
export { SERVER_INFO, createServer, formatToolResult, loadConfig, };
//# sourceMappingURL=index.js.map