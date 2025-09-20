import type { ChainList } from '$lib/provider/chain.provider';
import { selectedChains } from '$lib/provider/reown.provider';
import type { Token } from '$lib/types';

export const swapState = $state({
	token1: undefined as Token | undefined,
	token2: undefined as Token | undefined,
	token1Amount: 0,
	token2Amount: 0,
	chain: selectedChains[0] as undefined | ChainList
});
