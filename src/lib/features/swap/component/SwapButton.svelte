<script lang="ts">
	import ConnectButton from '$lib/components/button/ConnectButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { wagmiAdapter } from '$lib/provider/reown.provider';
	import { appStore } from '$lib/store';
	import { switchChain } from '@wagmi/core';
	import { toast } from 'svelte-sonner';
	import { swapState } from '../state/swap-state.svelte';
</script>

{#if !appStore.wagmi.account?.address}
	<ConnectButton />
{:else if appStore.wagmi.chain?.id !== swapState?.chain?.id}
	<Button
		onclick={() => {
			toast.promise(switchChain(wagmiAdapter.wagmiConfig, { chainId: swapState.chain?.id ?? 1 }), {
				success: () => 'Success change network',
				error: () => 'Fail to change network',
				loading: () => 'Loading...',
				richColors: true
			});
		}}
	>
		Change Network
	</Button>
{:else}
	<Button>Swap</Button>
{/if}
