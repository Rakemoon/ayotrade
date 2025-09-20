import { arbitrum, mainnet, polygon, base, bsc } from 'viem/chains';
import { AbstractQuote, type QuoteResult, type SwapParams } from './BaseQuote';
import { wagmiAdapter } from '$lib/provider/reown.provider';
import { UNISWAP_V2_ROUTER_ABI } from './abis';
import { readContract } from '@wagmi/core';
import { encodeFunctionData } from 'viem';

export class UniswapV2Quote extends AbstractQuote {
	public getProtocolName(): string {
		return 'Uniswap V2';
	}

	public getSupportedChains(): number[] {
		return [mainnet.id, arbitrum.id, polygon.id, base.id, bsc.id];
	}

	public async executeSimulation(): Promise<QuoteResult> {
		const routerAddress = this.getRouterContract();
		const path = [this.options.tokenIn.address, this.options.tokenOut.address] as const;

		const result = await readContract(wagmiAdapter.wagmiConfig, {
			chainId: this.options.tokenIn.chainId,
			abi: UNISWAP_V2_ROUTER_ABI,
			address: routerAddress as `0x${string}`,
			functionName: 'getAmountsOut',
			args: [this.options.input, path]
		});

		const amountOut = result[1]; // Second element is the output amount

		return {
			amountOut,
			gasEstimate: 150000n, // Estimated gas for V2 swap
			protocol: 'Uniswap V2',
			route: [this.options.tokenIn.symbol, this.options.tokenOut.symbol]
		};
	}

	public async buildSwapTransaction(): Promise<SwapParams> {
		const quote = await this.executeSimulation();
		const routerAddress = this.getRouterContract();
		const deadline = Math.floor(Date.now() / 1000) + 1200;
		const minAmountOut = this.applySlippage(quote.amountOut);
		const path = [this.options.tokenIn.address, this.options.tokenOut.address];

		const swapData = encodeFunctionData({
			abi: UNISWAP_V2_ROUTER_ABI,
			functionName: 'swapExactTokensForTokens',
			args: [
				this.options.input,
				minAmountOut,
				path as `0x${string}`[],
				(this.options.recipient || '0x') as `0x${string}`,
				BigInt(deadline)
			]
		});

		return {
			to: routerAddress,
			data: swapData,
			value: 0n,
			gasLimit: quote.gasEstimate + 30000n
		};
	}

	private getRouterContract(): string {
		const contracts = {
			[mainnet.id]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
			[arbitrum.id]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
			[polygon.id]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
			[base.id]: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // BaseSwap Router (Uniswap V2 fork)
			[bsc.id]: '0x10ED43C718714eb63d5aA57B78B54704E256024E' // PancakeSwap V2 Router on BSC
		};
		return contracts[this.options.tokenIn.chainId as never];
	}
}
