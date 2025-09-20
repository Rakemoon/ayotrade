import type { Token } from '$lib/types';

// Common interfaces for all routers
export interface QuoteOptions {
	tokenIn: Token;
	tokenOut: Token;
	input: bigint;
	inputOnOut?: boolean;
	slippage: number;
	recipient?: string;
	deadline?: number;
}

export interface QuoteResult {
	amountOut: bigint;
	gasEstimate: bigint;
	priceImpact?: number;
	route?: string[];
	protocol: string;
	fee?: number;
}

export interface SwapParams {
	to: string;
	data: string;
	value: bigint;
	gasLimit: bigint;
}

// Abstract base class
export abstract class AbstractQuote {
	constructor(public options: QuoteOptions) {}

	// Abstract methods that each router must implement
	abstract executeSimulation(): Promise<QuoteResult>;
	abstract buildSwapTransaction(): Promise<SwapParams>;
	abstract getSupportedChains(): number[];
	abstract getProtocolName(): string;

	// Shared validation logic
	public validateInputs(): void {
		if (this.options.input <= 0n) {
			throw new Error('Input amount must be greater than 0');
		}

		if (this.options.slippage < 0 || this.options.slippage > 1) {
			throw new Error('Slippage must be between 0 and 1');
		}

		if (!this.getSupportedChains().includes(this.options.tokenIn.chainId)) {
			throw new Error(
				`Chain ${this.options.tokenIn.chainId} not supported by ${this.getProtocolName()}`
			);
		}

		// Ensure both tokens are on the same chain
		if (this.options.tokenIn.chainId !== this.options.tokenOut.chainId) {
			throw new Error(
				`Cross-chain swaps not supported. TokenIn is on chain ${this.options.tokenIn.chainId}, TokenOut is on chain ${this.options.tokenOut.chainId}`
			);
		}

		if (
			this.options.tokenIn.address.toLowerCase() === this.options.tokenOut.address.toLowerCase()
		) {
			throw new Error('Token addresses cannot be the same');
		}
	}

	// Shared utility methods
	public applySlippage(amountOut: bigint): bigint {
		const slippageBps = BigInt(Math.floor(this.options.slippage * 10000));
		const slippageAmount = (amountOut * slippageBps) / 10000n;
		return amountOut - slippageAmount;
	}

	public formatQuote(result: QuoteResult): {
		amountOutFormatted: string;
		minAmountOut: bigint;
		effectivePrice: string;
	} {
		const amountOutFormatted = (
			Number(result.amountOut) / Math.pow(10, this.options.tokenOut.decimals)
		).toFixed(6);
		const amountInFormatted = (
			Number(this.options.input) / Math.pow(10, this.options.tokenIn.decimals)
		).toFixed(6);
		const effectivePrice = (Number(amountOutFormatted) / Number(amountInFormatted)).toFixed(6);
		const minAmountOut = this.applySlippage(result.amountOut);

		return {
			amountOutFormatted,
			minAmountOut,
			effectivePrice
		};
	}
}
