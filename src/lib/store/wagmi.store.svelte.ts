import { browser } from '$app/environment';
import { wagmiAdapter } from '$lib/provider/reown.provider';
import { queryCache, formatAddress } from '$lib/utils';
import {
	getChainId,
	getEnsAvatar,
	getEnsName,
	watchAccount,
	watchBlockNumber,
	type Config,
	type GetAccountReturnType
} from '@wagmi/core';
import type { Chain } from 'viem';

let account = <GetAccountReturnType<Config, Chain> | undefined>$state.raw();
let chainId = $state.raw(0);
let blockNumber = $state.raw(0n);
const chain = $derived.by(() => account?.chain);
const profile = $derived.by(async () => {
	const address = account?.address;
	if (!address) return;
	const ens = await getEnsName(wagmiAdapter.wagmiConfig, { chainId: 1, address });
	if (!ens)
		return {
			name: formatAddress(address),
			avatar: `https://effigy.im/a/${address}.svg`
		};
	const ensAva = await getEnsAvatar(wagmiAdapter.wagmiConfig, { chainId: 1, name: ens });
	return { name: ens, avatar: ensAva ?? `https://effigy.im/a/${address}.svg` };
});

export const wagmiStore = {
	get account() {
		return account;
	},
	get chain() {
		return chain;
	},

	get profile() {
		return profile;
	},

	get chainId() {
		return chainId;
	},

	get blockNumber() {
		return blockNumber;
	}
};

if (browser) {
	watchAccount(wagmiAdapter.wagmiConfig, {
		onChange(acc) {
			account = acc;
			chainId = getChainId(wagmiAdapter.wagmiConfig);
		}
	});
}

$effect.root(() => {
	$effect(() => {
		if (!chainId) return;
		const clean = watchBlockNumber(wagmiAdapter.wagmiConfig, {
			onBlockNumber: (next, prev) => {
				blockNumber = next;
			},
			pollingInterval: 5 * 1_000,
			chainId
		});

		return () => {
			clean();
		};
	});
});
