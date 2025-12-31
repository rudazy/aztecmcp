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
interface ServerConfig {
    pxeUrl: string;
    nodeUrl: string;
    l1RpcUrl: string;
}
declare function loadConfig(): ServerConfig;
declare const SERVER_INFO: {
    name: string;
    version: string;
    description: string;
    author: string;
    repository: string;
    features: {
        tools: number;
        resources: number;
        categories: number;
    };
};
declare function createServer(): Promise<Server>;
declare function formatToolResult(result: unknown): string;
export { SERVER_INFO, createServer, formatToolResult, loadConfig, };
//# sourceMappingURL=index.d.ts.map