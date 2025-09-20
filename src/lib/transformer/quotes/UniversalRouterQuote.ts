import { AbstractQuote, type QuoteOptions, type QuoteResult, type SwapParams } from './BaseQuote';
import { readContract, simulateContract } from '@wagmi/core';
import { wagmiAdapter } from '$lib/provider/reown.provider';
import { encodeFunctionData, encodeAbiParameters, parseAbiParameters, type Address } from 'viem';

// Universal Router addresses for supported chains
const UNIVERSAL_ROUTER_ADDRESSES: Record<number, Address> = {
	1: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', // Ethereum Mainnet
	56: '0x4Dae2f939ACf50408e13d58534Ff8c2776d45265', // BSC
	8453: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', // Base
	42161: '0x5E325eDA8064b456f4781070C0738d849c824258', // Arbitrum One
	137: '0xec7BE89e9d109e7e3Fec59c222CF297125FEFda2' // Polygon
};

// Quoter V2 addresses for getting quotes
const QUOTER_V2_ADDRESSES: Record<number, Address> = {
	1: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Ethereum Mainnet
	56: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077', // BSC
	8453: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Base
	42161: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Arbitrum One
	137: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' // Polygon
};

// Universal Router command types
enum Commands {
	V3_SWAP_EXACT_IN = 0x00,
	V3_SWAP_EXACT_OUT = 0x01,
	PERMIT2_PERMIT = 0x0a,
	PERMIT2_TRANSFER_FROM = 0x0b,
	PERMIT2_PERMIT_BATCH = 0x0c,
	PERMIT2_TRANSFER_FROM_BATCH = 0x0d,
	WRAP_ETH = 0x0e,
	UNWRAP_WETH = 0x0f,
	V2_SWAP_EXACT_IN = 0x08,
	V2_SWAP_EXACT_OUT = 0x09,
	PAY_PORTION = 0x06
}

const QUOTER_V2_ABI = [
	{
		inputs: [
			{
				components: [
					{ name: 'tokenIn', type: 'address' },
					{ name: 'tokenOut', type: 'address' },
					{ name: 'amountIn', type: 'uint256' },
					{ name: 'fee', type: 'uint24' },
					{ name: 'sqrtPriceLimitX96', type: 'uint160' }
				],
				name: 'params',
				type: 'tuple'
			}
		],
		name: 'quoteExactInputSingle',
		outputs: [
			{ name: 'amountOut', type: 'uint256' },
			{ name: 'sqrtPriceX96After', type: 'uint160' },
			{ name: 'initializedTicksCrossed', type: 'uint32' },
			{ name: 'gasEstimate', type: 'uint256' }
		],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

const UNIVERSAL_ROUTER_ABI = [
	{
		inputs: [
			{ name: 'commands', type: 'bytes' },
			{ name: 'inputs', type: 'bytes[]' },
			{ name: 'deadline', type: 'uint256' }
		],
		name: 'execute',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

export class UniversalRouterQuote extends AbstractQuote {
	constructor(options: QuoteOptions) {
		super(options);
	}

	public getSupportedChains(): number[] {
		return Object.keys(UNIVERSAL_ROUTER_ADDRESSES).map(Number);
	}

	public getProtocolName(): string {
		return 'Uniswap Universal Router';
	}

	public async executeSimulation(): Promise<QuoteResult> {
		this.validateInputs();

		const quoterAddress = QUOTER_V2_ADDRESSES[this.options.tokenIn.chainId];
		if (!quoterAddress) {
			throw new Error(`Quoter V2 not deployed on chain ${this.options.tokenIn.chainId}`);
		}

		try {
			// Try multiple fee tiers (0.05%, 0.3%, 1%)
			const feeTiers = [500, 3000, 10000];
			let bestQuote: QuoteResult | null = null;
			let bestAmountOut = 0n;

			for (const fee of feeTiers) {
				try {
					const params = {
						tokenIn: this.options.tokenIn.address as Address,
						tokenOut: this.options.tokenOut.address as Address,
						amountIn: this.options.input,
						fee: fee,
						sqrtPriceLimitX96: 0n
					};

					const { result } = await simulateContract(wagmiAdapter.wagmiConfig, {
						address: quoterAddress,
						abi: QUOTER_V2_ABI,
						functionName: 'quoteExactInputSingle',
						args: [params],
						chainId: this.options.tokenIn.chainId
					});

					const [amountOut, , , gasEstimate] = result;

					if (amountOut > bestAmountOut) {
						bestAmountOut = amountOut;
						bestQuote = {
							amountOut: amountOut,
							gasEstimate: gasEstimate,
							protocol: this.getProtocolName(),
							fee: fee / 10000, // Convert to percentage
							route: [this.options.tokenIn.symbol, this.options.tokenOut.symbol]
						};
					}
				} catch (error) {
					// This fee tier doesn't have a pool, continue to next
					continue;
				}
			}

			if (!bestQuote) {
				throw new Error('No valid pools found for this token pair');
			}

			// Calculate price impact (simplified)
			const inputValue = Number(this.options.input) / Math.pow(10, this.options.tokenIn.decimals);
			const outputValue = Number(bestQuote.amountOut) / Math.pow(10, this.options.tokenOut.decimals);

			// This is a simplified calculation, real price impact would need pool reserves
			bestQuote.priceImpact = 0;

			return bestQuote;
		} catch (error) {
			throw new Error(`Failed to get quote from Universal Router: ${(error as Error).message}`);
		}
	}

	public async buildSwapTransaction(): Promise<SwapParams> {
		this.validateInputs();

		const routerAddress = UNIVERSAL_ROUTER_ADDRESSES[this.options.tokenIn.chainId];
		if (!routerAddress) {
			throw new Error(`Universal Router not deployed on chain ${this.options.tokenIn.chainId}`);
		}

		// Get the best quote first
		const quote = await this.executeSimulation();

		// Build Universal Router swap command
		const deadline = this.options.deadline || Math.floor(Date.now() / 1000) + 1800; // 30 minutes

		// Encode the swap parameters
		const minAmountOut = this.applySlippage(quote.amountOut);

		// For simplicity, we'll use V3_SWAP_EXACT_IN command
		const commands = `0x${Commands.V3_SWAP_EXACT_IN.toString(16).padStart(2, '0')}` as `0x${string}`;

		// Build path: tokenIn -> tokenOut with fee tier
		const path = encodeAbiParameters(
			parseAbiParameters('address, uint24, address'),
			[
				this.options.tokenIn.address as Address,
				quote.fee ? quote.fee * 10000 : 3000,
				this.options.tokenOut.address as Address
			]
		);

		// Encode inputs for the command
		const inputs = [
			encodeAbiParameters(
				parseAbiParameters('address, uint256, uint256, bytes, bool'),
				[
					(this.options.recipient || '0x0000000000000000000000000000000000000000') as Address,
					this.options.input,
					minAmountOut,
					path as `0x${string}`,
					false // payerIsUser
				]
			)
		];

		// Encode the execute function call
		const data = encodeFunctionData({
			abi: UNIVERSAL_ROUTER_ABI,
			functionName: 'execute',
			args: [commands, inputs, BigInt(deadline)]
		});

		// Check if native ETH swap
		const isNativeETH = this.options.tokenIn.address.toLowerCase() === '0x0000000000000000000000000000000000000000';

		return {
			to: routerAddress,
			data,
			value: isNativeETH ? this.options.input : 0n,
			gasLimit: quote.gasEstimate * 120n / 100n // Add 20% buffer
		};
	}
}