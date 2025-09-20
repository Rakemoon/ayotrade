import type { SwapHistoryEntry, SwapHistoryState } from '../types/swap-history.types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'ayotrade_swap_history';

class SwapHistoryManager {
	private state = $state<SwapHistoryState>({
		entries: [],
		isLoading: false,
		error: undefined
	});

	constructor() {
		if (browser) {
			this.loadFromStorage();
		}
	}

	get entries() {
		return this.state.entries;
	}

	get isLoading() {
		return this.state.isLoading;
	}

	get error() {
		return this.state.error;
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Convert date strings back to Date objects
				this.state.entries = parsed.map((entry: any) => ({
					...entry,
					date: new Date(entry.date)
				}));
			}
		} catch (error) {
			console.error('Failed to load swap history from storage:', error);
			this.state.error = 'Failed to load history';
		}
	}

	private saveToStorage() {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.entries));
		} catch (error) {
			console.error('Failed to save swap history to storage:', error);
		}
	}

	addEntry(entry: Omit<SwapHistoryEntry, 'id' | 'date'>) {
		const newEntry: SwapHistoryEntry = {
			...entry,
			id: crypto.randomUUID(),
			date: new Date()
		};

		// Add to beginning of array (most recent first)
		this.state.entries = [newEntry, ...this.state.entries];
		this.saveToStorage();

		return newEntry.id;
	}

	updateEntryStatus(id: string, status: SwapHistoryEntry['status'], txHash?: string) {
		const entryIndex = this.state.entries.findIndex(entry => entry.id === id);
		if (entryIndex !== -1) {
			this.state.entries[entryIndex] = {
				...this.state.entries[entryIndex],
				status,
				...(txHash && { txHash })
			};
			this.saveToStorage();
		}
	}

	removeEntry(id: string) {
		this.state.entries = this.state.entries.filter(entry => entry.id !== id);
		this.saveToStorage();
	}

	clearHistory() {
		this.state.entries = [];
		this.saveToStorage();
	}

	getEntriesByChain(chainId: number) {
		return this.state.entries.filter(entry => entry.chainId === chainId);
	}

	getEntriesByRouter(router: string) {
		return this.state.entries.filter(entry => entry.router === router);
	}

	getEntriesByStatus(status: SwapHistoryEntry['status']) {
		return this.state.entries.filter(entry => entry.status === status);
	}

	getStats() {
		const total = this.state.entries.length;
		const success = this.getEntriesByStatus('success').length;
		const pending = this.getEntriesByStatus('pending').length;
		const failed = this.getEntriesByStatus('failed').length;

		return { total, success, pending, failed };
	}
}

export const swapHistory = new SwapHistoryManager();