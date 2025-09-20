<script>
	import ConnectButton from '$lib/components/button/ConnectButton.svelte';
	import SwapContainer from '$lib/features/swap/component/SwapContainer.svelte';
</script>

<div class="flex gap-2 p-2 justify-between items-center">
	<span class="font-bold">AYO.TRADE</span>
	<ConnectButton />
</div>
<div class="grid grid-cols-2 gap-2 px-2 max-w-[1000px] mx-auto max-sm:grid-cols-1">
	<SwapContainer />
</div>
