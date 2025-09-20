<script lang="ts">
	import type { Token } from '$lib/types';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '../ui/scroll-area';
	import { selectedChains } from '$lib/provider/reown.provider';
	import { getChainInfo, type ChainList } from '$lib/provider/chain.provider';
	import * as Tabs from '../ui/tabs';
	import { getPortofolio, getTokenByChain } from '$lib/provider/token.provider';
	import LucideCopy from '@lucide/svelte/icons/copy';
	import LucideCoins from '@lucide/svelte/icons/coins';
	import { formatAddress } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { Input } from '../ui/input';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { untrack } from 'svelte';
	import { Skeleton } from '../ui/skeleton';

	type Props = {
		token?: Token;
		title?: string;
		description?: string;
		placeholder?: string;
		open?: boolean;
		selectedChain?: ChainList;
	};

	let {
		open = $bindable(false),
		token = $bindable<Token | undefined>(),
		selectedChain = $bindable<ChainList | undefined>(),
		title = 'Select An Token',
		description = 'Select your token to use',
		placeholder = 'Select Token'
	}: Props = $props();

	let searchTerm = $state('');
	const tokenList = $derived(getTokenByChain(selectedChain?.id ?? 1, { searchTerm }));
	const portofolio = $derived(getPortofolio(selectedChain?.id ?? 1));

	let scrollAreaRef = $state<HTMLDivElement | null>(null);
	let virtualizer = createVirtualizer({
		count: 0,
		estimateSize: () => 64,
		getScrollElement: () => {
			const element = scrollAreaRef?.querySelector('&>[data-scroll-area-viewport]') ?? null;
			return element;
		}
	});

	$effect.pre(() => {
		searchTerm;
		scrollAreaRef?.querySelector('&>[data-scroll-area-viewport]')?.scrollTo({ top: 0 });
	});

	const tokenAssets = $derived(Promise.all([tokenList, portofolio]));

	$effect.pre(() => {
		open;
		const all = tokenAssets;
		all.then(([tokenResponse, portoResponse]) => {
			untrack(() => {
				$virtualizer.setOptions({
					count:
						(tokenResponse?.length ?? 0) +
						(!searchTerm ? (portoResponse?.portfolio.balances?.length ?? 0) : 0)
				});
			});
		});
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', class: 'py-0' })}>
		{#if token}
			{@const chain = getChainInfo(token.chainId)}
			<div class="relative shrink-0">
				<img src={token.logoURI} alt={token.symbol} class="size-6 rounded-md" />
				<img src={chain.logo} alt={chain.name} class="absolute size-3 -bottom-0.5 -right-0.5" />
			</div>
			{token.symbol}
		{:else}
			<span class="text-muted-foreground">{placeholder}</span>
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="flex flex-col">
		<Dialog.Header class="flex flex-row items-center gap-2">
			<LucideCoins />
			<div class="flex flex-col items-start gap-2">
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>
					{description}
				</Dialog.Description>
			</div>
		</Dialog.Header>
		<ScrollArea class="w-full overflow-hidden" orientation="horizontal">
			<Tabs.Root
				value={(selectedChain?.id ?? '1') + ''}
				onValueChange={(value) => {
					selectedChain = getChainInfo(Number(value));
				}}
				class="flex-row gap-2 pb-4"
			>
				{#each selectedChains as rawChain}
					{@const chain = getChainInfo(rawChain.id)}
					<Tabs.Trigger value={chain.id + ''} class="p-2 min-w-max">
						<img src={chain.logo} alt={chain.name} class="size-4 object-contain" />
						{chain.name}
					</Tabs.Trigger>
				{/each}
			</Tabs.Root>
		</ScrollArea>
		<Input placeholder="Search Token..." bind:value={searchTerm} />
		<ScrollArea bind:ref={scrollAreaRef} class="h-[500px]">
			{#await tokenAssets}
				{#each { length: 10 } as _}
					<div class="flex flex-col gap-2 my-2">
						<div class="flex gap-4">
							<Skeleton class="size-[20px]" />
							<Skeleton class="h-[20px] grow max-w-[200px]" />
						</div>
						<Skeleton class="h-[20px] ml-9 max-w-[100px]" />
					</div>
				{/each}
			{:then [items, portos]}
				<div class="flex flex-col gap-4 relative" style:height="{$virtualizer.getTotalSize()}px">
					{#each $virtualizer.getVirtualItems() as itemVirtual}
						{@const porto = portos?.portfolio.balances?.[itemVirtual.index]}
						{@const item = (() => {
							const index = itemVirtual.index;
							if (searchTerm) return items![index];
							const portoLength = portos?.portfolio.balances?.length ?? 0;
							if (index < portoLength) {
								const item = portos?.portfolio.balances?.[index].token;
								if (item) {
									item.logoURI = item.metadata.logoUrl;
								}
								return item;
							}
							return items![index - portoLength];
						})()}
						<div
							class="absolute left-0 right-0"
							style:transform="translateY({itemVirtual.start}px)"
						>
							<div
								class={buttonVariants({
									variant: 'ghost',
									class: 'flex gap-5 justify-start items-stretch h-auto text-left relative isolate'
								})}
							>
								<button
									class="inset-0 absolute -z-1"
									aria-label="select"
									onclick={() => {
										token = item;
										open = false;
									}}
								></button>
								<div class="flex flex-col">
									<span class="text-lg flex gap-4 items-center">
										<img src={item?.logoURI} alt={item?.symbol} class="rounded-sm size-5" />
										{item?.name}
									</span>
									<p class="text-sm flex items-end gap-1 ml-9">
										<span class="text-muted-foreground">{item?.symbol}</span>
										<button
											class="cursor-pointer"
											onclick={() => {
												const id = 'copy:' + item?.address;
												toast.loading('Copying...', { id, richColors: true });
												navigator.clipboard
													.writeText(item?.address ?? '0x0')
													.then(() => toast.success('Success Copying', { id, richColors: true }))
													.catch((e) => toast.error(e.message, { id, richColors: true }));
											}}
										>
											<span
												class="text-xs text-muted-foreground/70 flex items-end gap-2 border rounded-full px-2"
											>
												{formatAddress(item?.address ?? '0x0')}
												<LucideCopy class="size-2.5 mb-[2.4px]" />
											</span>
										</button>
									</p>
								</div>
								{#if porto?.amount?.amount && !searchTerm}
									<div class="flex flex-col ml-auto text-lg items-end">
										<span>{+porto.amount.amount.toPrecision(6)}</span>
										<span class="text-muted-foreground text-sm"
											>${+porto.valueUsd.toPrecision(6)}</span
										>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/await}
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
