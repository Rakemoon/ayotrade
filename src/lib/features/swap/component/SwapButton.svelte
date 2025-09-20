<script lang="ts">
	import ConnectButton from '$lib/components/button/ConnectButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { wagmiAdapter } from '$lib/provider/reown.provider';
	import { appStore } from '$lib/store';
	import { switchChain } from '@wagmi/core';
	import { toast } from 'svelte-sonner';
	import { swapState } from '../state/swap-state.svelte';
	import { wagmiStore } from '$lib/store/wagmi.store.svelte';
	import { swapHistory } from '../state/swap-history.svelte';
	import LucideLoader from '@lucide/svelte/icons/loader';

	const isCantSwap = $derived(!swapState.token1 || !swapState.token2 || !swapState.token1Amount);
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
	<Button
		disabled={isCantSwap || !swapState.selectedQuote}
		onclick={async () => {
			if (
				!swapState.token1 ||
				!swapState.token2 ||
				!swapState.token1Amount ||
				!swapState.selectedQuote
			)
				return;

			try {
				// Get the swap transaction from the selected router
				const swapParams = await swapState.selectedQuote.router.buildSwapTransaction();

				// Calculate price per unit
				const price = (
					Number(swapState.selectedQuote.formattedAmountOut) / swapState.token1Amount
				).toFixed(4);

				// Add to history as pending
				const historyId = swapHistory.addEntry({
					router: swapState.selectedQuote.router.getProtocolName(),
					chainId: swapState.token1.chainId,
					sellToken: swapState.token1,
					buyToken: swapState.token2,
					sellAmount: swapState.token1Amount.toString(),
					buyAmount: swapState.selectedQuote.formattedAmountOut,
					price,
					txHash: '0x', // Will be updated when transaction is sent
					status: 'pending',
					chainName: ''
				});

				// For demo purposes, simulate a transaction result after 2 seconds
				toast.success(`Swap initiated via ${swapState.selectedQuote.router.getProtocolName()}`, {
					description: `${swapState.token1Amount} ${swapState.token1.symbol} → ${swapState.selectedQuote.formattedAmountOut} ${swapState.token2.symbol}`,
					richColors: true
				});

				// Simulate transaction processing
				setTimeout(() => {
					// Generate a mock transaction hash
					const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);

					// Randomly simulate success or failure for demo
					const isSuccess = Math.random() > 0.2; // 80% success rate

					swapHistory.updateEntryStatus(historyId, isSuccess ? 'success' : 'failed', mockTxHash);

					if (isSuccess) {
						toast.success('Swap completed successfully!', {
							description: `Transaction: ${mockTxHash.slice(0, 10)}...`,
							richColors: true
						});
					} else {
						toast.error('Swap failed', {
							description: 'Transaction was reverted',
							richColors: true
						});
					}
				}, 2000);

				// TODO: Execute the actual transaction
				// const tx = await sendTransaction(wagmiAdapter.wagmiConfig, swapParams);
				// swapHistory.updateEntryStatus(historyId, 'success', tx.hash);
			} catch (error) {
				toast.error('Failed to prepare swap', {
					description: (error as Error).message,
					richColors: true
				});
			}
		}}
	>
		{#if swapState.isLoadingQuotes}
			<LucideLoader class="mr-2 size-4 animate-spin" />
			Fetching Quotes...
		{:else if swapState.selectedQuote}
			Swap via {swapState.selectedQuote.router.getProtocolName()}
		{:else}
			Swap
		{/if}
	</Button>
{/if}
