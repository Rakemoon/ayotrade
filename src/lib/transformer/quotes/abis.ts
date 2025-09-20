// Uniswap V3 Quoter ABI (minimal)
export const UNISWAP_QUOTER_ABI = [
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint24', name: 'fee', type: 'uint24' },
					{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
				],
				internalType: 'struct IQuoterV2.QuoteExactInputSingleParams',
				name: 'params',
				type: 'tuple'
			}
		],
		name: 'quoteExactInputSingle',
		outputs: [
			{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ internalType: 'uint160', name: 'sqrtPriceX96After', type: 'uint160' },
			{ internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
			{ internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
		],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint256', name: 'amount', type: 'uint256' },
					{ internalType: 'uint24', name: 'fee', type: 'uint24' },
					{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
				],
				internalType: 'struct IQuoterV2.QuoteExactOutputSingleParams',
				name: 'params',
				type: 'tuple'
			}
		],
		name: 'quoteExactOutputSingle',
		outputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'uint160', name: 'sqrtPriceX96After', type: 'uint160' },
			{ internalType: 'uint32', name: 'initializedTicksCrossed', type: 'uint32' },
			{ internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
		],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

// Uniswap V3 Router ABI (minimal)
export const UNISWAP_V3_ROUTER_ABI = [
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint24', name: 'fee', type: 'uint24' },
					{ internalType: 'address', name: 'recipient', type: 'address' },
					{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOutMinimum', type: 'uint256' },
					{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
				],
				internalType: 'struct ISwapRouter.ExactInputSingleParams',
				name: 'params',
				type: 'tuple'
			}
		],
		name: 'exactInputSingle',
		outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint24', name: 'fee', type: 'uint24' },
					{ internalType: 'address', name: 'recipient', type: 'address' },
					{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountInMaximum', type: 'uint256' },
					{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
				],
				internalType: 'struct ISwapRouter.ExactOutputSingleParams',
				name: 'params',
				type: 'tuple'
			}
		],
		name: 'exactOutputSingle',
		outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

// Uniswap V2 Router ABI (minimal)
export const UNISWAP_V2_ROUTER_ABI = [
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' }
		],
		name: 'getAmountsOut',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' }
		],
		name: 'getAmountsIn',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swapExactTokensForTokens',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swapTokensForExactTokens',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swapExactETHForTokens',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swapExactTokensForETH',
		outputs: [{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

// SushiSwap Router ABI (same as Uniswap V2)
export const SUSHISWAP_ROUTER_ABI = UNISWAP_V2_ROUTER_ABI;

// PancakeSwap Router ABI (same as Uniswap V2 with some additions)
export const PANCAKESWAP_ROUTER_ABI = [
	...UNISWAP_V2_ROUTER_ABI,
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{ internalType: 'address[]', name: 'path', type: 'address[]' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

// Curve Pool ABI (minimal)
export const CURVE_POOL_ABI = [
	{
		inputs: [
			{ internalType: 'int128', name: 'i', type: 'int128' },
			{ internalType: 'int128', name: 'j', type: 'int128' },
			{ internalType: 'uint256', name: 'dx', type: 'uint256' }
		],
		name: 'get_dy',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'int128', name: 'i', type: 'int128' },
			{ internalType: 'int128', name: 'j', type: 'int128' },
			{ internalType: 'uint256', name: 'dx', type: 'uint256' },
			{ internalType: 'uint256', name: 'min_dy', type: 'uint256' }
		],
		name: 'exchange',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

// Balancer Vault ABI (minimal)
export const BALANCER_VAULT_ABI = [
	{
		inputs: [
			{
				components: [
					{ internalType: 'bytes32', name: 'poolId', type: 'bytes32' },
					{ internalType: 'enum IVault.SwapKind', name: 'kind', type: 'uint8' },
					{ internalType: 'address', name: 'assetIn', type: 'address' },
					{ internalType: 'address', name: 'assetOut', type: 'address' },
					{ internalType: 'uint256', name: 'amount', type: 'uint256' },
					{ internalType: 'bytes', name: 'userData', type: 'bytes' }
				],
				internalType: 'struct IVault.SingleSwap',
				name: 'singleSwap',
				type: 'tuple'
			},
			{
				components: [
					{ internalType: 'address', name: 'sender', type: 'address' },
					{ internalType: 'bool', name: 'fromInternalBalance', type: 'bool' },
					{ internalType: 'address payable', name: 'recipient', type: 'address' },
					{ internalType: 'bool', name: 'toInternalBalance', type: 'bool' }
				],
				internalType: 'struct IVault.FundManagement',
				name: 'funds',
				type: 'tuple'
			},
			{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' }
		],
		name: 'swap',
		outputs: [{ internalType: 'uint256', name: 'amountCalculated', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

// ERC20 Token ABI (minimal for approvals)
export const ERC20_ABI = [
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' }
		],
		name: 'approve',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'address', name: 'spender', type: 'address' }
		],
		name: 'allowance',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

// Multicall ABI (for batching calls)
export const MULTICALL_ABI = [
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'target', type: 'address' },
					{ internalType: 'bytes', name: 'callData', type: 'bytes' }
				],
				internalType: 'struct Multicall3.Call[]',
				name: 'calls',
				type: 'tuple[]'
			}
		],
		name: 'aggregate',
		outputs: [
			{ internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
			{ internalType: 'bytes[]', name: 'returnData', type: 'bytes[]' }
		],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'target', type: 'address' },
					{ internalType: 'bool', name: 'allowFailure', type: 'bool' },
					{ internalType: 'bytes', name: 'callData', type: 'bytes' }
				],
				internalType: 'struct Multicall3.Call3[]',
				name: 'calls',
				type: 'tuple[]'
			}
		],
		name: 'aggregate3',
		outputs: [
			{
				components: [
					{ internalType: 'bool', name: 'success', type: 'bool' },
					{ internalType: 'bytes', name: 'returnData', type: 'bytes' }
				],
				internalType: 'struct Multicall3.Result[]',
				name: 'returnData',
				type: 'tuple[]'
			}
		],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

// WETH ABI (minimal)
export const WETH_ABI = [
	{
		inputs: [],
		name: 'deposit',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'wad', type: 'uint256' }],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	...ERC20_ABI
] as const;
