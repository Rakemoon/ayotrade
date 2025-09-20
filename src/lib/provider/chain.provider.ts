import { selectedChains } from './reown.provider';

const chainLogo = {
	1: 'https://coin-images.coingecko.com/asset_platforms/images/279/small/ethereum.png?1706606803',
	56: 'https://coin-images.coingecko.com/asset_platforms/images/1/small/bnb_smart_chain.png?1706606721',
	8453: 'https://coin-images.coingecko.com/asset_platforms/images/131/small/base-network.png?1720533039',
	42161: 'https://arbitrum.io/favicon.ico',
	137: 'https://cdn.prod.website-files.com/637359c81e22b715cec245ad/66273ffe068c26509a5a7c7c_Frame%20514542.png'
};


export type ChainList = (typeof selectedChains)[number];
type ChainMap = {
	[Chain in ChainList as Chain['id']]: Chain;
};

const chainMap: ChainMap = selectedChains.reduce((a, b) => {
	a[b.id] = b;
	return a;
}, {} as any);

export function getChainInfo<ChainId extends number>(
	chainId: ChainId
): (ChainId extends ChainList['id'] ? ChainMap[ChainId] : ChainList) & { logo: string } {
	const m = chainMap[chainId as never] as never;
	(m as any).logo = chainLogo[chainId as never] as never;
	return m;
}
