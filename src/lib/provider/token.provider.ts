import { appStore } from '$lib/store';
import type { PortofolioResult, Token } from '$lib/types';
import { queryCache } from '$lib/utils';
import { getBalance, readContract } from '@wagmi/core';
import { bsc, mainnet, base, arbitrum, polygon } from 'viem/chains';
import { wagmiAdapter } from './reown.provider';
import { erc20Abi } from 'viem';

const endpointNames = {
	[mainnet.id]: 'ethereum',
	[bsc.id]: 'binance-smart-chain',
	[base.id]: 'base',
	[arbitrum.id]: 'arbitrum-one',
	[polygon.id]: 'polygon-pos'
};

export async function getTokenByChain(
	chainId: keyof typeof endpointNames,
	props?: {
		searchTerm?: string;
	}
) {
	return queryCache({
		deps: [0],
		key: 'token:' + chainId,
		fn: async () => {
			const response = await fetch(
				`https://tokens.coingecko.com/${endpointNames[chainId]}/all.json`
			);
			if (response.ok) {
				const body = await response.json();
				return body.tokens as Token[];
			}
			throw new Error("Can't fetch right now ->" + response.status + ' -> ' + response.text());
		}
	}).then((x) => {
		const searchTerm = props?.searchTerm || '';
		return x
			?.filter(
				(item) =>
					item.name.toLowerCase().includes(searchTerm.toLowerCase() || '') ||
					item.address.toLowerCase().includes(searchTerm.toLowerCase() || '') ||
					item.symbol.toLowerCase().includes(searchTerm.toLowerCase() || '')
			)
			.sort((a, b) => {
				if (!searchTerm) return 0;
				const aIdenticalWithAddress = Number(a.address === searchTerm);
				const bIdenticalWithAddress = Number(b.address === searchTerm);

				const aIdenticalWithSymbol = Number(a.symbol === searchTerm);
				const bIdenticalWithSymbol = Number(b.symbol === searchTerm);

				const aIdenticalWithName = Number(a.symbol === searchTerm);
				const bIdenticalWithName = Number(b.symbol === searchTerm);

				//lowerCase

				const aLowIdenticalWithAddress = Number(
					a.address.toLowerCase() === searchTerm.toLowerCase()
				);
				const bLowIdenticalWithAddress = Number(
					b.address.toLowerCase() === searchTerm.toLowerCase()
				);

				const aLowIdenticalWithSymbol = Number(a.symbol.toLowerCase() === searchTerm.toLowerCase());
				const bLowIdenticalWithSymbol = Number(b.symbol.toLowerCase() === searchTerm.toLowerCase());

				const aLowIdenticalWithName = Number(a.symbol.toLowerCase() === searchTerm.toLowerCase());
				const bLowIdenticalWithName = Number(b.symbol.toLowerCase() === searchTerm.toLowerCase());

				return -(
					aIdenticalWithAddress - bIdenticalWithAddress ||
					aIdenticalWithSymbol - bIdenticalWithSymbol ||
					aIdenticalWithName - bIdenticalWithName ||
					aLowIdenticalWithAddress - bLowIdenticalWithAddress ||
					aLowIdenticalWithSymbol - bLowIdenticalWithSymbol ||
					aLowIdenticalWithName - bLowIdenticalWithName
				);
			});
	});
}

export function getPortofolio(chainId: number) {
	return queryCache({
		fn: async () => {
			if (!appStore.wagmi.account?.address) return null;
			const response = await fetch(
				'https://interface.gateway.uniswap.org/v2/data.v1.DataApiService/GetPortfolio',
				{
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						walletAccount: {
							platformAddresses: [{ address: appStore.wagmi.account?.address }]
						},
						chainIds: [chainId]
					}),
					method: 'POST'
				}
			);
			if (response.ok) {
				const body: PortofolioResult = await response.json();
				if (body.portfolio.balances) {
					body.portfolio.balances = body.portfolio.balances.filter((balance) => {
						return balance.token.metadata.safetyLevel === 'SAFETY_LEVEL_VERIFIED';
					});
				}
				return body;
			}
			throw new Error("Can't fetch right now ->" + response.status + ' -> ' + response.text());
		},
		deps: [appStore.wagmi.account?.address ?? ''],
		key: 'eth:portofolio:' + chainId
	});
}

export async function getTokenBalance(token: Token) {
	const accountAddress = appStore.wagmi.account?.address;
	const blockNumber = appStore.wagmi.blockNumber;
	return queryCache({
		key: 'eth:balance:' + token.address + ':' + token.chainId,
		deps: [accountAddress, blockNumber],
		fn: () => {
			if (!accountAddress) return 0n;
			if (token.address === '0x0000000000000000000000000000000000000000')
				return getBalance(wagmiAdapter.wagmiConfig, {
					chainId: token.chainId,
					address: accountAddress
				}).then((x) => x.value);

			return readContract(wagmiAdapter.wagmiConfig, {
				address: token.address,
				chainId: token.chainId,
				abi: erc20Abi,
				functionName: 'balanceOf',
				args: [accountAddress]
			});
		}
	});
}
