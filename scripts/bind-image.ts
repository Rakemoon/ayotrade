import chains from '../hide/coingecko_assets.json';
const c = [1, 56, 8453, 42161];
const cd = chains
	.filter((x) => c.includes(x.chain_identifier ?? 0))
	.reduce((x, b) => {
        x[b.chain_identifier!] = b.image.small;
        return x;
    }, {} as any);
console.log(cd);
