<script lang="ts">
	import SelectTokenModal from '$lib/components/button/SelectTokenModal.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { getTokenBalance } from '$lib/provider/token.provider';
	import { Debounced } from 'runed';
	import { untrack, type ComponentProps } from 'svelte';
	import LucideLoader from '@lucide/svelte/icons/loader';
	type SelectTokenModalProps = ComponentProps<typeof SelectTokenModal>;

	type Props = {
		isLoading?: boolean;
		inputAmount?: number;
		inputPlaceHolder?: string;
		showMaxButton?: boolean;
	};

	let {
		token = $bindable(),
		selectedChain = $bindable(),
		isLoading = $bindable(false),
		inputAmount = $bindable(0),
		inputPlaceHolder = '',
		showMaxButton = false,
		...props
	}: SelectTokenModalProps & Props = $props();

	let rawInputValue = $state('');
	const debouncedValue = new Debounced(() => rawInputValue, 500);

	$effect.pre(() => {
		const value = debouncedValue.current;
		if (value === '')
			return untrack(() => {
				inputAmount = 0;
			});
		const num = +value;
		const result = isNaN(num) ? 0 : num;

		untrack(() => {
			if (result + '' !== rawInputValue) rawInputValue = result + '';
			if (inputAmount != result) inputAmount = result;
		});
	});

	$effect.pre(() => {
		const newValue = inputAmount;
		untrack(() => {
			rawInputValue = newValue + '';
		});
	});

	const balance = $derived(token ? untrack(() => (token ? getTokenBalance(token) : 0)) : 0);
</script>

<label class="">
	<Card.Root class="bg-background/40 ring-primary focus-within:ring-2">
		<Card.Content class="flex gap-2 max-sm:px-4">
			<input
				bind:value={rawInputValue}
				class="max-h-[36px] w-full grow outline-0"
				placeholder={inputPlaceHolder}
				disabled={isLoading}
			/>
			<div class="flex flex-col items-end gap-2">
				<SelectTokenModal
					bind:token={
						() => token,
						(ken) => {
							token = ken;
							rawInputValue = '0';
						}
					}
					bind:selectedChain
					{...props}
				/>
				<div class="flex gap-2 text-muted-foreground">
					<div class="flex items-center text-xs">
						{#await balance}
							<LucideLoader class="size-[15.99px] animate-spin" />
						{:then value}
							{(+(Number(value) / 10 ** (token?.decimals ?? 18)).toPrecision(6))
								.toString()
								.padEnd(4, '.00')}
						{/await}
					</div>
					{#if showMaxButton}
						<Button
							onclick={async () =>
								(rawInputValue = String(Number(await balance) / 10 ** (token?.decimals ?? 18)))}
							class="h-min cursor-pointer p-0 text-xs"
							size="sm"
							variant="link"
						>
							Max
						</Button>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</label>
