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
import { Resource } from "@modelcontextprotocol/sdk/types.js";
export declare const resources: Resource[];
export declare function getGettingStartedGuide(): string;
export declare function getNoirContractGuide(): string;
export declare function getPrivacyPatternsGuide(): string;
export declare function getAccountsGuide(): string;
export declare function getBridgingGuide(): string;
export declare function getCLIReferenceGuide(): string;
export declare function getResourceContent(uri: string, getNetworkStatus: () => Promise<unknown>): Promise<{
    mimeType: string;
    text: string;
}>;
//# sourceMappingURL=index.d.ts.map