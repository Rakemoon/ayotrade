import type { Address } from 'viem';

export type Token = {
	chainId: number;
	address: Address;
	name: string;
	symbol: string;
	decimals: number;
	logoURI: string;
};

export type PortofolioResult = {
	portfolio: {
		balances?: {
			token: Token & {
				type: 'TOKEN_TYPE_NATIVE' | 'TOKEN_TYPE_ERC20';
				metadata: {
					projectName: string;
					logoUrl: string;
					protectionInfo: {
						result: 'PROTECTION_RESULT_BENIGN';
					};
					feeData: {
						blockaid: {};
						feeDetector: {
							buyFeeBps?: `${number}`;
							sellFeeBps?: `${number}`;
						};
					};
					safetyLevel: 'SAFETY_LEVEL_VERIFIED';
					spamCode: string;
				};
			};
			amount: {
				raw: `${number}`;
				amount: number;
			};
			priceUsd: number;
			pricePercentChange1d: number;
			valueUsd: number;
		}[];
		totalValueUsd?: number;
		totalValueAbsoluteChange1d?: number;
		totalValuePercentChange1d?: number;
	};
};
