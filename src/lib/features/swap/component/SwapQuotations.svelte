<script lang="ts">
	import { swapState } from '../state/swap-state.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import LucideLoader from '@lucide/svelte/icons/loader';
	import LucideCheck from '@lucide/svelte/icons/check';
	import LucideAlertCircle from '@lucide/svelte/icons/alert-circle';
	import LucideTrendingUp from '@lucide/svelte/icons/trending-up';
	import type { QuoteDetails } from '../state/swap-state.svelte';

	const formatPrice = (price: string) => {
		const num = parseFloat(price);
		if (num < 0.01) return num.toExponential(2);
		return num.toFixed(4);
	};

	const getProtocolColor = (protocol: string) => {
		const colors: Record<string, string> = {
			'Uniswap V3': 'bg-pink-500/10 text-pink-500',
			'Uniswap V2': 'bg-purple-500/10 text-purple-500',
			'1inch': 'bg-red-500/10 text-red-500',
			'Uniswap Universal Router': 'bg-blue-500/10 text-blue-500'
		};
		return colors[protocol] || 'bg-gray-500/10 text-gray-500';
	};

	const sortedQuotes = $derived(
		swapState.quotes
			.filter((q): q is QuoteDetails => 'quote' in q)
			.sort((a, b) => Number(b.quote.amountOut - a.quote.amountOut))
	);

	const failedQuotes = $derived(
		swapState.quotes.filter((q) => 'error' in q)
	);
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">Available Routes</h3>
		{#if swapState.isLoadingQuotes}
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<LucideLoader class="size-3 animate-spin" />
				Fetching quotes...
			</div>
		{:else if swapState.lastQuoteUpdate > 0}
			<span class="text-xs text-muted-foreground">
				Updated {new Date(swapState.lastQuoteUpdate).toLocaleTimeString()}
			</span>
		{/if}
	</div>

	{#if swapState.quoteError}
		<div class="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
			<LucideAlertCircle class="size-4 flex-shrink-0" />
			<span>{swapState.quoteError}</span>
		</div>
	{:else if !swapState.token1 || !swapState.token2}
		<div class="py-8 text-center text-sm text-muted-foreground">
			Select tokens to see available routes
		</div>
	{:else if swapState.token1Amount <= 0}
		<div class="py-8 text-center text-sm text-muted-foreground">
			Enter an amount to see quotes
		</div>
	{:else if swapState.isLoadingQuotes}
		<div class="space-y-2">
			{#each [1, 2, 3] as _}
				<div class="h-16 animate-pulse rounded-lg bg-muted/50" />
			{/each}
		</div>
	{:else if sortedQuotes.length === 0 && failedQuotes.length === 0}
		<div class="py-8 text-center text-sm text-muted-foreground">
			No routes available for this pair
		</div>
	{:else}
		<div class="space-y-2">
			{#each sortedQuotes as quote, index}
				<button
					onclick={() => swapState.selectQuote(quote)}
					class="group relative w-full rounded-lg border p-3 text-left transition-all hover:bg-accent {
						swapState.selectedQuote === quote ? 'border-primary bg-primary/5' : 'border-border'
					}"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<Badge
									variant="secondary"
									class="{getProtocolColor(quote.router.getProtocolName())} border-0"
								>
									{quote.router.getProtocolName()}
								</Badge>
								{#if index === 0}
									<Badge variant="default" class="bg-green-500/10 text-green-500">
										<LucideTrendingUp class="mr-1 size-3" />
										Best Rate
									</Badge>
								{/if}
								{#if swapState.selectedQuote === quote}
									<LucideCheck class="size-4 text-primary" />
								{/if}
							</div>

							<div class="mt-2 grid grid-cols-2 gap-4 text-sm">
								<div>
									<span class="text-muted-foreground">Output:</span>
									<div class="font-medium">
										{quote.formattedAmountOut} {swapState.token2?.symbol}
									</div>
								</div>
								<div>
									<span class="text-muted-foreground">Rate:</span>
									<div class="font-medium">
										1 {swapState.token1?.symbol} = {formatPrice(quote.effectivePrice)} {swapState.token2?.symbol}
									</div>
								</div>
							</div>

							{#if quote.quote.fee}
								<div class="mt-1 text-xs text-muted-foreground">
									Fee: {quote.quote.fee}%
								</div>
							{/if}

							{#if quote.quote.gasEstimate}
								<div class="mt-1 text-xs text-muted-foreground">
									Gas: ~{(Number(quote.quote.gasEstimate) / 1000).toFixed(0)}k
								</div>
							{/if}
						</div>
					</div>

					{#if index > 0}
						{@const difference = Number(quote.quote.amountOut - sortedQuotes[0].quote.amountOut)}
						{@const percentDiff = (difference / Number(sortedQuotes[0].quote.amountOut)) * 100}
						<div class="mt-2 text-xs text-destructive">
							{percentDiff.toFixed(2)}% less than best
						</div>
					{/if}
				</button>
			{/each}

			{#if failedQuotes.length > 0}
				<details class="group">
					<summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
						{failedQuotes.length} route{failedQuotes.length > 1 ? 's' : ''} unavailable
					</summary>
					<div class="mt-2 space-y-1">
						{#each failedQuotes as failed}
							<div class="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs">
								<span class="font-medium">{failed.router.getProtocolName()}</span>
								<span class="text-muted-foreground">Failed</span>
							</div>
						{/each}
					</div>
				</details>
			{/if}
		</div>
	{/if}

	{#if sortedQuotes.length > 0 && !swapState.isLoadingQuotes}
		<div class="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
			<div class="flex items-center gap-1">
				<LucideAlertCircle class="size-3" />
				Quotes refresh automatically when you change amounts
			</div>
		</div>
	{/if}
</div>