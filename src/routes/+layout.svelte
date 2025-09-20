<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/provider/reown.provider';
	import '$lib/store';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster />
{@render children?.()}
