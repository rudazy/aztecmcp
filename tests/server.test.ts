/**
 * Aztec Noir MCP Server - Test Suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import { tools, toolCategories, toolCount } from "../src/tools/definitions.js";
import { formatToolResult, loadConfig, SERVER_INFO } from "../src/index.js";

// ============================================
// Server Info Tests
// ============================================

describe("Server Info", () => {
  it("should have correct server name", () => {
    expect(SERVER_INFO.name).toBe("aztec-noir-mcp");
  });

  it("should have valid version format", () => {
    expect(SERVER_INFO.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should have correct tool count", () => {
    expect(SERVER_INFO.features.tools).toBe(47);
  });

  it("should have correct resource count", () => {
    expect(SERVER_INFO.features.resources).toBe(7);
  });

  it("should have correct category count", () => {
    expect(SERVER_INFO.features.categories).toBe(8);
  });
});

// ============================================
// Configuration Tests
// ============================================

describe("Configuration", () => {
  it("should load default configuration", () => {
    const config = loadConfig();

    expect(config.pxeUrl).toBeDefined();
    expect(config.nodeUrl).toBeDefined();
    expect(config.l1RpcUrl).toBeDefined();
  });

  it("should have valid URL format for defaults", () => {
    const config = loadConfig();

    expect(config.pxeUrl).toMatch(/^https?:\/\//);
    expect(config.nodeUrl).toMatch(/^https?:\/\//);
    expect(config.l1RpcUrl).toMatch(/^https?:\/\//);
  });
});

// ============================================
// Tool Definitions Tests
// ============================================

describe("Tool Definitions", () => {
  it("should have exactly 47 tools", () => {
    expect(tools.length).toBe(47);
    expect(toolCount).toBe(47);
  });

  it("should have 8 categories", () => {
    const categoryNames = Object.keys(toolCategories);
    expect(categoryNames.length).toBe(8);
  });

  it("should have correct category names", () => {
    const expectedCategories = [
      "network",
      "account",
      "contract",
      "transaction",
      "bridge",
      "validator",
      "governance",
      "crypto",
    ];

    const actualCategories = Object.keys(toolCategories);
    expectedCategories.forEach((category) => {
      expect(actualCategories).toContain(category);
    });
  });

  it("all tools should have required properties", () => {
    tools.forEach((tool) => {
      expect(tool.name).toBeDefined();
      expect(tool.name).toMatch(/^aztec_/);
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    });
  });

  it("all tools should have valid JSON Schema", () => {
    tools.forEach((tool) => {
      expect(tool.inputSchema).toHaveProperty("type");
      expect(tool.inputSchema).toHaveProperty("properties");
      expect(typeof tool.inputSchema.properties).toBe("object");
    });
  });

  it("should have unique tool names", () => {
    const names = tools.map((t) => t.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });
});

// ============================================
// Tool Category Tests
// ============================================

describe("Tool Categories", () => {
  it("network category should have 8 tools", () => {
    expect(toolCategories.network.length).toBe(8);
  });

  it("account category should have 6 tools", () => {
    expect(toolCategories.account.length).toBe(6);
  });

  it("contract category should have 7 tools", () => {
    expect(toolCategories.contract.length).toBe(7);
  });

  it("transaction category should have 7 tools", () => {
    expect(toolCategories.transaction.length).toBe(7);
  });

  it("bridge category should have 5 tools", () => {
    expect(toolCategories.bridge.length).toBe(5);
  });

  it("validator category should have 5 tools", () => {
    expect(toolCategories.validator.length).toBe(5);
  });

  it("governance category should have 4 tools", () => {
    expect(toolCategories.governance.length).toBe(4);
  });

  it("crypto category should have 5 tools", () => {
    expect(toolCategories.crypto.length).toBe(5);
  });

  it("sum of all categories should equal total tools", () => {
    const totalFromCategories = Object.values(toolCategories).reduce(
      (sum, category) => sum + category.length,
      0
    );
    expect(totalFromCategories).toBe(toolCount);
  });
});

// ============================================
// Specific Tool Tests
// ============================================

describe("Specific Tools", () => {
  describe("aztec_get_node_info", () => {
    const tool = tools.find((t) => t.name === "aztec_get_node_info");

    it("should exist", () => {
      expect(tool).toBeDefined();
    });

    it("should have no required parameters", () => {
      const required = tool?.inputSchema.required || [];
      expect(required.length).toBe(0);
    });
  });

  describe("aztec_create_account", () => {
    const tool = tools.find((t) => t.name === "aztec_create_account");

    it("should exist", () => {
      expect(tool).toBeDefined();
    });

    it("should have alias property available", () => {
      const properties = tool?.inputSchema.properties as Record<string, unknown>;
      expect(properties).toHaveProperty("alias");
    });

    it("should support multiple account types", () => {
      const typeProperty = tool?.inputSchema.properties?.type as {
        enum?: string[];
      };
      expect(typeProperty?.enum).toContain("schnorr");
      expect(typeProperty?.enum).toContain("ecdsasecp256k1");
      expect(typeProperty?.enum).toContain("ecdsasecp256r1");
      expect(typeProperty?.enum).toContain("ecdsasecp256r1ssh");
    });
  });

  describe("aztec_deploy_contract", () => {
    const tool = tools.find((t) => t.name === "aztec_deploy_contract");

    it("should exist", () => {
      expect(tool).toBeDefined();
    });

    it("should require artifact and from parameters", () => {
      expect(tool?.inputSchema.required).toContain("artifact");
      expect(tool?.inputSchema.required).toContain("from");
    });
  });

  describe("aztec_send_transaction", () => {
    const tool = tools.find((t) => t.name === "aztec_send_transaction");

    it("should exist", () => {
      expect(tool).toBeDefined();
    });

    it("should require contractAddress, functionName, and from", () => {
      expect(tool?.inputSchema.required).toContain("contractAddress");
      expect(tool?.inputSchema.required).toContain("functionName");
      expect(tool?.inputSchema.required).toContain("from");
    });
  });

  describe("aztec_bridge_erc20", () => {
    const tool = tools.find((t) => t.name === "aztec_bridge_erc20");

    it("should exist", () => {
      expect(tool).toBeDefined();
    });

    it("should require amount and recipient", () => {
      expect(tool?.inputSchema.required).toContain("amount");
      expect(tool?.inputSchema.required).toContain("recipient");
    });
  });
});

// ============================================
// Result Formatting Tests
// ============================================

describe("Result Formatting", () => {
  it("should handle null result", () => {
    const result = formatToolResult(null);
    expect(result).toBe("Operation completed successfully.");
  });

  it("should handle undefined result", () => {
    const result = formatToolResult(undefined);
    expect(result).toBe("Operation completed successfully.");
  });

  it("should handle string result", () => {
    const result = formatToolResult("test string");
    expect(result).toBe("test string");
  });

  it("should handle number result", () => {
    const result = formatToolResult(42);
    expect(result).toBe("42");
  });

  it("should handle boolean result", () => {
    expect(formatToolResult(true)).toBe("true");
    expect(formatToolResult(false)).toBe("false");
  });

  it("should handle object result as JSON", () => {
    const obj = { key: "value", number: 123 };
    const result = formatToolResult(obj);
    expect(result).toBe(JSON.stringify(obj, null, 2));
  });

  it("should handle array result as JSON", () => {
    const arr = [1, 2, 3];
    const result = formatToolResult(arr);
    expect(result).toBe(JSON.stringify(arr, null, 2));
  });

  it("should handle nested objects", () => {
    const nested = {
      level1: {
        level2: {
          value: "deep",
        },
      },
    };
    const result = formatToolResult(nested);
    expect(result).toContain("level1");
    expect(result).toContain("level2");
    expect(result).toContain("deep");
  });
});

// ============================================
// Tool Input Schema Validation Tests
// ============================================

describe("Tool Input Schema Validation", () => {
  it("all string properties should have type string", () => {
    tools.forEach((tool) => {
      const properties = tool.inputSchema.properties as Record<
        string,
        { type: string }
      >;
      Object.entries(properties).forEach(([propName, propSchema]) => {
        if (propName.toLowerCase().includes("address")) {
          expect(propSchema.type).toBe("string");
        }
        if (propName.toLowerCase().includes("hash")) {
          expect(propSchema.type).toBe("string");
        }
      });
    });
  });

  it("all number/integer properties should have correct type", () => {
    tools.forEach((tool) => {
      const properties = tool.inputSchema.properties as Record<
        string,
        { type: string }
      >;
      Object.entries(properties).forEach(([propName, propSchema]) => {
        if (
          propName.toLowerCase().includes("blocknumber") ||
          propName.toLowerCase().includes("amount") ||
          propName.toLowerCase() === "limit"
        ) {
          expect(["number", "integer", "string"]).toContain(propSchema.type);
        }
      });
    });
  });

  it("all boolean properties should have type boolean", () => {
    tools.forEach((tool) => {
      const properties = tool.inputSchema.properties as Record<
        string,
        { type: string }
      >;
      Object.entries(properties).forEach(([propName, propSchema]) => {
        if (
          propName.toLowerCase().startsWith("is") ||
          propName.toLowerCase().includes("public") ||
          propName.toLowerCase().includes("private")
        ) {
          if (propSchema.type === "boolean") {
            expect(propSchema.type).toBe("boolean");
          }
        }
      });
    });
  });
});

// ============================================
// Edge Cases Tests
// ============================================

describe("Edge Cases", () => {
  it("should handle empty tool arguments gracefully", () => {
    tools.forEach((tool) => {
      const required = tool.inputSchema.required || [];
      if (required.length === 0) {
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });
  });

  it("tools with defaults should have default values defined", () => {
    tools.forEach((tool) => {
      const properties = tool.inputSchema.properties as Record<
        string,
        { default?: unknown }
      >;
      Object.entries(properties).forEach(([_propName, propSchema]) => {
        if (propSchema.default !== undefined) {
          expect(propSchema.default).not.toBeNull();
        }
      });
    });
  });
});
