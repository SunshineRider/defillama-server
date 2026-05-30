import { getVisibleChainsForAppMetadata, removeHiddenChainMetadata } from "./appMetadataVisibility";

describe("app metadata chain visibility", () => {
  test("derives visible chains from current protocol tvl and dimensions data", () => {
    const visibleChains = getVisibleChainsForAppMetadata(
      [
        {
          category: "Dexs",
          chains: ["Ethereum"],
          chainTvls: {
            Ethereum: { tvl: 100 },
          },
        },
      ],
      {
        hyperliquid: {
          fees: {
            df: { "24h": 1 },
          },
        },
        hyperevm: {},
      }
    );

    expect(visibleChains).toEqual(["Ethereum", "Hyperliquid L1"]);
  });

  test("matches protocol tvl chain adjustments used by protocols2 visibility", () => {
    const visibleChains = getVisibleChainsForAppMetadata(
      [
        {
          category: "Dexs",
          chains: ["Ethereum", "Arbitrum"],
          chainTvls: {
            Ethereum: { tvl: 100 },
            "Ethereum-doublecounted": { tvl: 80 },
            Arbitrum: { tvl: 30 },
          },
        },
      ],
      {}
    );

    expect(visibleChains).toEqual(["Arbitrum", "Ethereum"]);
  });

  test("removes metadata-only chains that are absent from the filtered chain list", () => {
    const finalChains = {
      ethereum: { name: "Ethereum", id: "Ethereum" },
      hyperevm: {
        name: "HyperEVM",
        id: "hyper_evm",
        chainActiveUsers: true,
        chainNewUsers: true,
        dimAgg: {},
        protocolCount: 0,
      },
    };

    removeHiddenChainMetadata(finalChains, new Set(["ethereum"]));

    expect(finalChains).toEqual({
      ethereum: { name: "Ethereum", id: "Ethereum" },
    });
  });

  test("keeps visible dimension-backed chains without protocol tvl", () => {
    const finalChains = {
      "hyperliquid-l1": {
        name: "Hyperliquid L1",
        id: "hyperliquid",
        fees: true,
        dimAgg: { fees: { df: { "24h": 1 } } },
        protocolCount: 0,
      },
    };

    removeHiddenChainMetadata(finalChains, new Set(["hyperliquid-l1"]));

    expect(finalChains["hyperliquid-l1"]).toEqual({
      name: "Hyperliquid L1",
      id: "hyperliquid",
      fees: true,
      dimAgg: { fees: { df: { "24h": 1 } } },
      protocolCount: 0,
    });
  });
});
