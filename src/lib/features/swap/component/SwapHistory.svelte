<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import LucideExternalLink from '@lucide/svelte/icons/external-link';
	import LucideLoader from '@lucide/svelte/icons/loader';
	import LucideCheck from '@lucide/svelte/icons/check';
	import LucideX from '@lucide/svelte/icons/x';
	import LucideClock from '@lucide/svelte/icons/clock';
	import LucideArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { SwapHistoryEntry } from '../types/swap-history.types';
	import { swapHistory } from '../state/swap-history.svelte';

	// Use actual history state
	const history = $derived(swapHistory.entries);

	// Get chain name from chain ID
	const getChainName = (chainId: number) => {
		const chainNames: Record<number, string> = {
			1: 'Ethereum',
			56: 'BSC',
			137: 'Polygon',
			8453: 'Base',
			42161: 'Arbitrum'
		};
		return chainNames[chainId] || `Chain ${chainId}`;
	};

	const getStatusIcon = (status: SwapHistoryEntry['status']) => {
		switch (status) {
			case 'success':
				return LucideCheck;
			case 'failed':
				return LucideX;
			case 'pending':
				return LucideClock;
			default:
				return LucideLoader;
		}
	};

	const getStatusColor = (status: SwapHistoryEntry['status']) => {
		switch (status) {
			case 'success':
				return 'bg-green-500/10 text-green-500 border-green-500/20';
			case 'failed':
				return 'bg-red-500/10 text-red-500 border-red-500/20';
			case 'pending':
				return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
			default:
				return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
		}
	};

	const getChainExplorer = (chainId: number, txHash: string) => {
		const explorers: Record<number, string> = {
			1: 'https://etherscan.io',
			56: 'https://bscscan.com',
			137: 'https://polygonscan.com',
			8453: 'https://basescan.org',
			42161: 'https://arbiscan.io'
		};
		const baseUrl = explorers[chainId];
		return baseUrl ? `${baseUrl}/tx/${txHash}` : '#';
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(date);
	};

	const formatAmount = (amount: string, decimals: number = 6) => {
		const num = parseFloat(amount);
		if (num < 0.001) return num.toExponential(2);
		return num.toFixed(Math.min(decimals, 6));
	};

	const getRouterColor = (router: string) => {
		const colors: Record<string, string> = {
			'Uniswap V3': 'bg-pink-500/10 text-pink-500',
			'Uniswap V2': 'bg-purple-500/10 text-purple-500',
			'1inch': 'bg-red-500/10 text-red-500',
			'Universal Router': 'bg-blue-500/10 text-blue-500'
		};
		return colors[router] || 'bg-gray-500/10 text-gray-500';
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Swap History</h2>
		<Badge variant="secondary" class="text-xs">
			{history.length} transaction{history.length !== 1 ? 's' : ''}
		</Badge>
	</div>

	{#if history.length === 0}
		<div class="py-12 text-center text-muted-foreground">
			<div class="text-sm">No swap history yet</div>
			<div class="text-xs">Your completed swaps will appear here</div>
		</div>
	{:else}
		<div class="rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-16">Status</Table.Head>
						<Table.Head class="w-20">Date</Table.Head>
						<Table.Head class="w-24">Router</Table.Head>
						<Table.Head class="w-20">Chain</Table.Head>
						<Table.Head class="w-40">Trade</Table.Head>
						<Table.Head class="w-24 text-right">Price</Table.Head>
						<Table.Head class="w-16 text-center">Tx</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each history as entry (entry.id)}
						<Table.Row>
							<!-- Status -->
							<Table.Cell>
								<Badge variant="secondary" class="{getStatusColor(entry.status)} border">
									<svelte:component this={getStatusIcon(entry.status)} class="mr-1 size-3" />
									{entry.status}
								</Badge>
							</Table.Cell>

							<!-- Date -->
							<Table.Cell class="text-xs text-muted-foreground">
								{formatDate(entry.date)}
							</Table.Cell>

							<!-- Router -->
							<Table.Cell>
								<Badge variant="secondary" class="{getRouterColor(entry.router)} border-0 text-xs">
									{entry.router}
								</Badge>
							</Table.Cell>

							<!-- Chain -->
							<Table.Cell>
								<Badge variant="outline" class="text-xs">
									{getChainName(entry.chainId)}
								</Badge>
							</Table.Cell>

							<!-- Trade -->
							<Table.Cell>
								<div class="flex items-center gap-1 text-xs">
									<span class="font-medium">
										{formatAmount(entry.sellAmount)} {entry.sellToken.symbol}
									</span>
									<LucideArrowRight class="size-3 text-muted-foreground" />
									<span class="font-medium">
										{formatAmount(entry.buyAmount)} {entry.buyToken.symbol}
									</span>
								</div>
							</Table.Cell>

							<!-- Price -->
							<Table.Cell class="text-right">
								<div class="text-xs">
									<div class="font-medium">${formatAmount(entry.price, 2)}</div>
									<div class="text-muted-foreground">per {entry.buyToken.symbol}</div>
								</div>
							</Table.Cell>

							<!-- Transaction Hash -->
							<Table.Cell class="text-center">
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									onclick={() => window.open(getChainExplorer(entry.chainId, entry.txHash), '_blank')}
								>
									<LucideExternalLink class="size-3" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<!-- Summary Stats -->
		<div class="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3 text-xs">
			<div class="text-center">
				<div class="font-medium text-green-500">
					{swapHistory.getEntriesByStatus('success').length}
				</div>
				<div class="text-muted-foreground">Success</div>
			</div>
			<div class="text-center">
				<div class="font-medium text-yellow-500">
					{swapHistory.getEntriesByStatus('pending').length}
				</div>
				<div class="text-muted-foreground">Pending</div>
			</div>
			<div class="text-center">
				<div class="font-medium text-red-500">
					{swapHistory.getEntriesByStatus('failed').length}
				</div>
				<div class="text-muted-foreground">Failed</div>
			</div>
		</div>
	{/if}
</div>