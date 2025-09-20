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

	const balance = $derived(token ? getTokenBalance(token) : 0);
</script>

<label class="">
	<Card.Root class="focus-within:ring-2 ring-primary bg-background/40">
		<Card.Content class="flex gap-2 max-sm:px-4">
			<input
				bind:value={rawInputValue}
				class="grow outline-0 max-h-[36px] w-full"
				placeholder={inputPlaceHolder}
			/>
			<div class="flex flex-col gap-2 items-end">
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
					<div class="text-xs flex items-center">
						{#await balance}
							<LucideLoader class="animate-spin size-[15.99px]" />
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
							class="text-xs p-0 h-min cursor-pointer"
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
