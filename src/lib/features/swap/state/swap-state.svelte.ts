import type { ChainList } from '$lib/provider/chain.provider';
import { selectedChains, wagmiAdapter } from '$lib/provider/reown.provider';
import type { Token } from '$lib/types';
import { MultiRouterQuote } from '$lib/transformer/quotes/MultiRouterQuote';
import type { AbstractQuote, QuoteResult } from '$lib/transformer/quotes/BaseQuote';
import { getAccount } from '@wagmi/core';

export interface QuoteDetails {
	quote: QuoteResult;
	router: AbstractQuote;
	formattedAmountOut: string;
	effectivePrice: string;
}

export interface QuoteError {
	error: string;
	router: AbstractQuote;
}

class SwapStateManager {
	token1 = $state<Token | undefined>(undefined);
	token2 = $state<Token | undefined>(undefined);
	token1Amount = $state<number>(0);
	token2Amount = $state<number>(0);
	chain = $state<ChainList | undefined>(selectedChains[0]);

	// Quote related state
	isLoadingQuotes = $state<boolean>(false);
	quotes = $state<(QuoteDetails | QuoteError)[]>([]);
	bestQuote = $state<QuoteDetails | undefined>(undefined);
	selectedQuote = $state<QuoteDetails | undefined>(undefined);
	lastQuoteUpdate = $state<number>(0);
	quoteError = $state<string | undefined>(undefined);

	private quoteTimeout: NodeJS.Timeout | undefined;

	constructor() {
		// Watch for changes that should trigger quote updates
		$effect.root(() => {
			$effect(() => {
				// Track dependencies
				const t1 = this.token1;
				const t2 = this.token2;
				const amount = this.token1Amount;

				// Debounce quote fetching
				if (this.quoteTimeout) {
					clearTimeout(this.quoteTimeout);
				}

				if (t1 && t2 && amount > 0) {
					this.quoteTimeout = setTimeout(() => {
						this.fetchQuotes();
					}, 500); // 500ms debounce
				} else {
					this.quotes = [];
					this.bestQuote = undefined;
					this.selectedQuote = undefined;
					this.token2Amount = 0;
				}
			});
		});
	}

	async fetchQuotes() {
		if (!this.token1 || !this.token2 || this.token1Amount <= 0) {
			return;
		}

		this.isLoadingQuotes = true;
		this.quoteError = undefined;

		try {
			const account = getAccount(wagmiAdapter.wagmiConfig);
			const multiRouter = new MultiRouterQuote({
				tokenIn: this.token1,
				tokenOut: this.token2,
				input: BigInt(Math.floor(this.token1Amount * 10 ** this.token1.decimals)),
				slippage: 0.005, // 0.5% default slippage
				recipient: account.address
			});

			// Get all quotes
			const allQuotes = await multiRouter.getAllQuotes();

			// Process quotes
			const processedQuotes: (QuoteDetails | QuoteError)[] = allQuotes.map((result) => {
				if ('quote' in result) {
					const amountOutFormatted = (
						Number(result.quote.amountOut) / Math.pow(10, this.token2!.decimals)
					).toFixed(6);

					const amountInFormatted = this.token1Amount.toFixed(6);

					const effectivePrice = (Number(amountOutFormatted) / Number(amountInFormatted)).toFixed(
						6
					);

					return {
						quote: result.quote,
						router: result.router,
						formattedAmountOut: amountOutFormatted,
						effectivePrice
					};
				} else {
					return {
						error: result.error,
						router: result.router
					};
				}
			});

			// Sort successful quotes by output amount (descending)
			const successfulQuotes = processedQuotes
				.filter((q): q is QuoteDetails => 'quote' in q)
				.sort((a, b) => Number(b.quote.amountOut - a.quote.amountOut));

			this.quotes = processedQuotes;
			this.bestQuote = successfulQuotes[0];

			// Auto-select best quote if none selected
			if (!this.selectedQuote && this.bestQuote) {
				this.selectedQuote = this.bestQuote;
			}

			// Update token2Amount based on selected/best quote
			if (this.selectedQuote) {
				this.token2Amount = Number(this.selectedQuote.formattedAmountOut);
			} else if (this.bestQuote) {
				this.token2Amount = Number(this.bestQuote.formattedAmountOut);
			}

			this.lastQuoteUpdate = Date.now();
		} catch (error) {
			console.error('Failed to fetch quotes:', error);
			this.quoteError = (error as Error).message;
			this.quotes = [];
			this.bestQuote = undefined;
			this.selectedQuote = undefined;
		} finally {
			this.isLoadingQuotes = false;
		}
	}

	selectQuote(quote: QuoteDetails) {
		this.selectedQuote = quote;
		this.token2Amount = Number(quote.formattedAmountOut);
	}

	reset() {
		this.token1 = undefined;
		this.token2 = undefined;
		this.token1Amount = 0;
		this.token2Amount = 0;
		this.quotes = [];
		this.bestQuote = undefined;
		this.selectedQuote = undefined;
		this.quoteError = undefined;
	}
}

export const swapState = new SwapStateManager();
