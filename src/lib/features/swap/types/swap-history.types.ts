import type { Token } from '$lib/types';

export interface SwapHistoryEntry {
	id: string;
	date: Date;
	router: string;
	chainId: number;
	chainName: string;
	sellToken: Token;
	buyToken: Token;
	sellAmount: string;
	buyAmount: string;
	price: string; // Price per unit (buyAmount / sellAmount)
	txHash: string;
	status: 'pending' | 'success' | 'failed';
	gasUsed?: string;
	gasPrice?: string;
}

export interface SwapHistoryState {
	entries: SwapHistoryEntry[];
	isLoading: boolean;
	error?: string;
}