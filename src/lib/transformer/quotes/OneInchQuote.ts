import { arbitrum, mainnet, polygon, base, bsc } from 'viem/chains';
import { AbstractQuote, type QuoteResult, type SwapParams } from './BaseQuote';

export class OneInchQuote extends AbstractQuote {
	public getProtocolName(): string {
		return '1inch';
	}

	public getSupportedChains(): number[] {
		return [mainnet.id, arbitrum.id, polygon.id, base.id, bsc.id];
	}

	public async executeSimulation(): Promise<QuoteResult> {
		// 1inch uses API calls instead of on-chain simulation
		const quote = await this.fetch1inchQuote();

		return {
			amountOut: BigInt(quote.toTokenAmount),
			gasEstimate: BigInt(quote.estimatedGas),
			priceImpact: parseFloat(quote.priceImpact),
			protocol: '1inch',
			route: quote.protocols?.[0]?.map((p: any) => p.name) || []
		};
	}

	public async buildSwapTransaction(): Promise<SwapParams> {
		const swap = await this.fetch1inchSwap();

		return {
			to: swap.tx.to,
			data: swap.tx.data,
			value: BigInt(swap.tx.value),
			gasLimit: BigInt(swap.tx.gas)
		};
	}

	private async fetch1inchQuote() {
		const params = new URLSearchParams({
			fromTokenAddress: this.options.tokenIn.address,
			toTokenAddress: this.options.tokenOut.address,
			amount: this.options.input.toString()
		});

		const response = await fetch(
			`https://api.1inch.dev/swap/v5.2/${this.options.tokenIn.chainId}/quote?${params}`
		);
		return response.json();
	}

	private async fetch1inchSwap() {
		const params = new URLSearchParams({
			fromTokenAddress: this.options.tokenIn.address,
			toTokenAddress: this.options.tokenOut.address,
			amount: this.options.input.toString(),
			fromAddress: this.options.recipient || '0x',
			slippage: (this.options.slippage * 100).toString()
		});

		const response = await fetch(
			`https://api.1inch.dev/swap/v5.2/${this.options.tokenIn.chainId}/swap?${params}`
		);
		return response.json();
	}
}
