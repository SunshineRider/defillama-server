import { excludeProtocolInCharts } from "../../utils/excludeProtocols";
import { getVisibleChainLabels } from "../../utils/visibleChains";

type MetadataProtocol = {
  category?: string;
  chains?: string[];
  chainTvls?: Record<string, { tvl?: number | null }>;
};

export function getVisibleChainsForAppMetadata(
  protocols: MetadataProtocol[],
  dimensionsChainAggData: any = {}
) {
  const protocolChainTvls: Record<string, number> = {};
  for (const protocol of protocols) {
    if (!protocol.category || excludeProtocolInCharts(protocol.category)) continue;

    const chainTvls = protocol.chainTvls ?? {};
    for (const chain of protocol.chains ?? []) {
      protocolChainTvls[chain] = (protocolChainTvls[chain] ?? 0) + (chainTvls[chain]?.tvl ?? 0);

      if (chainTvls[`${chain}-liquidstaking`]) {
        protocolChainTvls[chain] -= chainTvls[`${chain}-liquidstaking`]?.tvl ?? 0;
      }

      if (chainTvls[`${chain}-doublecounted`]) {
        protocolChainTvls[chain] -= chainTvls[`${chain}-doublecounted`]?.tvl ?? 0;
      }

      if (chainTvls[`${chain}-dcAndLsOverlap`]) {
        protocolChainTvls[chain] += chainTvls[`${chain}-dcAndLsOverlap`]?.tvl ?? 0;
      }
    }
  }

  return getVisibleChainLabels(protocolChainTvls, dimensionsChainAggData);
}

export function removeHiddenChainMetadata<T>(finalChains: Record<string, T>, visibleChainSlugs: Set<string>) {
  for (const chain in finalChains) {
    if (!visibleChainSlugs.has(chain)) delete finalChains[chain];
  }
}
