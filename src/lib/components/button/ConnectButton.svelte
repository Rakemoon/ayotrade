<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import { appStore } from '$lib/store';
	import { appKit } from '$lib/provider/reown.provider';
	import LucideLoader from '@lucide/svelte/icons/loader';
</script>

<Button class="items-center py-0" onclick={() => appKit?.open()}>
	{#await appStore.wagmi.profile}
		<LucideLoader class="animate-spin" />
	{:then result}
		{#if result}
			<img class="size-6 rounded-sm" src={result.avatar} alt={result.name} />
			{result.name}
		{:else}
			Connect Wallet
		{/if}
	{/await}
</Button>
