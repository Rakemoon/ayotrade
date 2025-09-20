// lib/appkit.ts
import { browser } from '$app/environment';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrum, mainnet, base, bsc, type AppKitNetwork } from '@reown/appkit/networks';
import { hydrate } from '@wagmi/core';

// Only initialize in browser environment
let appKit: ReturnType<typeof createAppKit> | undefined = undefined;
let wagmiAdapter: WagmiAdapter;

const selectedChains = [mainnet, arbitrum, base, bsc] satisfies [
	AppKitNetwork,
	...AppKitNetwork[]
];

if (browser) {
	const projectId = import.meta.env.VITE_REOWN_PROJECT_ID!;

	// Create adapter
	wagmiAdapter = new WagmiAdapter({
		networks: selectedChains,
		projectId
	});

	const { onMount } = hydrate(wagmiAdapter.wagmiConfig, { reconnectOnMount: true });

	onMount();

	// Initialize AppKit
	appKit = createAppKit({
		adapters: [wagmiAdapter],
		networks: selectedChains,
		defaultNetwork: arbitrum,
		projectId,
		metadata: {
			name: 'SvelteKit Example',
			description: 'SvelteKit Example using Wagmi adapter',
			url: 'https://reown.com/appkit',
			icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
		}
	});
}

export { appKit, wagmiAdapter, selectedChains };
