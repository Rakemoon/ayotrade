<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import SwapForm from './SwapForm.svelte';
	import SwapHistory from './SwapHistory.svelte';
	import SwapQuotations from './SwapQuotations.svelte';
</script>

<Card class="p-2 h-max">
	<SwapForm />
</Card>

<Card class="p-2">
	<SwapQuotations />
</Card>

<Card class="col-[1/-1] p-2">
	<SwapHistory />
</Card>
