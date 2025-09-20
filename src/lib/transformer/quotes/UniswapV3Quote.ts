import { arbitrum, mainnet, polygon, base, bsc } from 'viem/chains';
import { AbstractQuote, type QuoteResult, type SwapParams } from './BaseQuote';
import { UNISWAP_QUOTER_ABI, UNISWAP_V3_ROUTER_ABI } from './abis';
import { encodeFunctionData } from 'viem';
import { wagmiAdapter } from '$lib/provider/reown.provider';
import { simulateContract } from '@wagmi/core';
import type { Token } from '$lib/types';

export class UniswapV3Quote extends AbstractQuote {
	private readonly FEE_TIERS = [500, 3000, 10000];

	public getProtocolName(): string {
		return 'Uniswap V3';
	}

	public getSupportedChains(): number[] {
		return [mainnet.id, arbitrum.id, polygon.id, base.id, bsc.id];
	}

	public async executeSimulation(): Promise<QuoteResult> {
		const contractAddress = this.getQuoterContract();

		// Try different fee tiers
		for (const fee of this.FEE_TIERS) {
			try {
				const result = await this.tryQuoteWithFee(contractAddress, fee);
				return {
					amountOut: result.result[0],
					gasEstimate: result.result[3],
					protocol: 'Uniswap V3',
					fee,
					route: [this.options.tokenIn.symbol, this.options.tokenOut.symbol]
				};
			} catch (error) {
				console.warn(`Uniswap V3 quote failed with fee ${fee}:`, error);
			}
		}

		throw new Error('No Uniswap V3 pool found for this pair');
	}

	public async buildSwapTransaction(): Promise<SwapParams> {
		const quote = await this.executeSimulation();
		const routerAddress = this.getRouterContract();
		const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
		const minAmountOut = this.applySlippage(quote.amountOut);

		const swapData = encodeFunctionData({
			abi: UNISWAP_V3_ROUTER_ABI,
			functionName: 'exactInputSingle',
			args: [
				{
					tokenIn: this.options.tokenIn.address as `0x${string}`,
					tokenOut: this.options.tokenOut.address as `0x${string}`,
					fee: quote.fee || 3000,
					recipient: (this.options.recipient || '0x') as `0x${string}`,
					deadline: BigInt(deadline),
					amountIn: this.options.input,
					amountOutMinimum: minAmountOut,
					sqrtPriceLimitX96: 0n
				}
			]
		});

		return {
			to: routerAddress,
			data: swapData,
			value: this.isNativeToken(this.options.tokenIn) ? this.options.input : 0n,
			gasLimit: quote.gasEstimate + 50000n // Add buffer
		};
	}

	private async tryQuoteWithFee(contractAddress: string, fee: number) {
		return simulateContract(wagmiAdapter.wagmiConfig, {
			chainId: this.options.tokenIn.chainId,
			abi: UNISWAP_QUOTER_ABI,
			address: contractAddress as `0x${string}`,
			functionName: 'quoteExactInputSingle',
			args: [
				{
					tokenIn: this.options.tokenIn.address as `0x${string}`,
					tokenOut: this.options.tokenOut.address as `0x${string}`,
					amountIn: this.options.input,
					fee,
					sqrtPriceLimitX96: 0n
				}
			]
		});
	}

	private getQuoterContract(): string {
		const contracts = {
			[mainnet.id]: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
			[arbitrum.id]: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
			[polygon.id]: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
			[base.id]: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
			[bsc.id]: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077'
		};
		return contracts[this.options.tokenIn.chainId as never];
	}

	private getRouterContract(): string {
		const contracts = {
			[mainnet.id]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
			[arbitrum.id]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
			[polygon.id]: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
			[base.id]: '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap V3 SwapRouter on Base
			[bsc.id]: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2' // PancakeSwap V3 Router on BSC (Uniswap fork)
		};
		return contracts[this.options.tokenIn.chainId as never];
	}

	private isNativeToken(token: Token): boolean {
		return token.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
	}
}
