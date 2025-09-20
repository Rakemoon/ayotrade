import { wagmiStore } from './wagmi.store.svelte';

export const appStore = {
	get wagmi() {
		return wagmiStore;
	}
};
