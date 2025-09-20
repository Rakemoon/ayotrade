<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import SwapForm from './SwapForm.svelte';
	import SwapQuotations from './SwapQuotations.svelte';
</script>

<div class="flex flex-col gap-2">
	<Card class="p-2">
		<SwapForm />
	</Card>

	<Card class="p-2">
		<SwapQuotations />
	</Card>
</div>
