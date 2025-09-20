<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { swapState } from '../state/swap-state.svelte';
	import SwapButton from './SwapButton.svelte';
	import SwapInput from './SwapInput.svelte';
	import { toast } from 'svelte-sonner';
	import LucideArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
</script>

<div class="flex flex-col gap-2">
	<div class="relative flex flex-col gap-2">
		<Button
			onclick={() => {
				[swapState.token1, swapState.token2, swapState.token1Amount, swapState.token2Amount] = [
					swapState.token2,
					swapState.token1,
					swapState.token2Amount,
					swapState.token1Amount
				];
			}}
			size="icon"
			variant="secondary"
			class="absolute m-auto inset-0"
		>
			<LucideArrowUpDown />
		</Button>
		<SwapInput
			showMaxButton
			bind:token={
				() => swapState.token1,
				(value) => {
					const chainIdToken1 = value?.chainId;
					const chainIdToken2 = swapState.token2?.chainId;
					if (chainIdToken1 !== chainIdToken2) swapState.token2 = undefined;

					if (
						value?.address === swapState.token2?.address &&
						value?.chainId === swapState.token2?.chainId
					) {
						toast.error('Token cant be identical', { richColors: true });
						return swapState.token1;
					}

					swapState.token1 = value;
				}
			}
			bind:inputAmount={swapState.token1Amount}
			bind:selectedChain={swapState.chain}
		/>
		<SwapInput
			bind:token={
				() => swapState.token2,
				(value) => {
					const chainIdToken2 = value?.chainId;
					const chainIdToken1 = swapState.token1?.chainId;
					if (chainIdToken1 !== chainIdToken2) swapState.token1 = undefined;

					if (
						value?.address === swapState.token1?.address &&
						value?.chainId === swapState.token1?.chainId
					) {
						toast.error('Token cant be identical', { richColors: true });
						return swapState.token2;
					}

					swapState.token2 = value;
				}
			}
			bind:inputAmount={swapState.token2Amount}
			bind:selectedChain={swapState.chain}
		/>
	</div>
	<SwapButton />
</div>
