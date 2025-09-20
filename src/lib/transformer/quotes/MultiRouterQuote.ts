import type { AbstractQuote, QuoteOptions, QuoteResult } from './BaseQuote';
import { OneInchQuote } from './OneInchQuote';
import { UniswapV2Quote } from './UniswapV2Quote';
import { UniswapV3Quote } from './UniswapV3Quote';
import { UniversalRouterQuote } from './UniversalRouterQuote';

export class MultiRouterQuote {
	private routers: AbstractQuote[];

	constructor(
		options: QuoteOptions,
		enabledRouters: ('uniswap-v3' | 'uniswap-v2' | '1inch' | 'universal-router')[] = [
			'uniswap-v3',
			'uniswap-v2',
			'1inch',
			'universal-router'
		]
	) {
		this.routers = [];

		if (enabledRouters.includes('uniswap-v3')) {
			this.routers.push(new UniswapV3Quote(options));
		}
		if (enabledRouters.includes('uniswap-v2')) {
			this.routers.push(new UniswapV2Quote(options));
		}
		if (enabledRouters.includes('1inch')) {
			this.routers.push(new OneInchQuote(options));
		}
		if (enabledRouters.includes('universal-router')) {
			this.routers.push(new UniversalRouterQuote(options));
		}
	}

	public async getBestQuote(): Promise<{ quote: QuoteResult; router: AbstractQuote }> {
		const quotes = await Promise.allSettled(
			this.routers.map(async (router) => {
				const quote = await router.executeSimulation();
				return { quote, router };
			})
		);

		const successfulQuotes = quotes
			.filter(
				(result): result is PromiseFulfilledResult<{ quote: QuoteResult; router: AbstractQuote }> =>
					result.status === 'fulfilled'
			)
			.map((result) => result.value);

		if (successfulQuotes.length === 0) {
			throw new Error('No routers could provide a quote');
		}

		// Find the quote with the highest output amount
		const bestQuote = successfulQuotes.reduce((best, current) =>
			current.quote.amountOut > best.quote.amountOut ? current : best
		);

		return bestQuote;
	}

	public async getAllQuotes(): Promise<
		Array<{ quote: QuoteResult; router: AbstractQuote } | { error: string; router: AbstractQuote }>
	> {
		const quotes = await Promise.allSettled(
			this.routers.map(async (router) => {
				try {
					const quote = await router.executeSimulation();
					return { quote, router };
				} catch (error) {
					return { error: (error as Error).message, router };
				}
			})
		);

		return quotes.map((result, index) => {
			if (result.status === 'fulfilled') {
				return result.value;
			} else {
				return { error: result.reason.message, router: this.routers[index] };
			}
		});
	}
}
