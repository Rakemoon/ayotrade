import { browser } from '$app/environment';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Address } from 'viem';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatAddress(address: Address) {
	return (
		'0x' +
		address[2] +
		address[3] +
		'...' +
		address[address.length - 4] +
		address[address.length - 3] +
		address[address.length - 2] +
		address[address.length - 1]
	);
}

const cacheRecord = {} as Record<
	string,
	{
		value: unknown;
		lastDeps: unknown[];
		promise: unknown;
	}
>;

export async function queryCache<Fn extends () => any>(props: {
	key: string;
	fn: Fn;
	deps: unknown[];
}): Promise<Awaited<ReturnType<Fn>> | null> {
	if (!browser) return null;
	const record = cacheRecord[props.key];
	if (record?.promise) {
		return record?.promise as never;
	}
	const isDepsSame = record?.lastDeps?.every((value, index) => props.deps[index] == value);
	if (isDepsSame && record.value !== undefined) {
		return record.value as never;
	}
	const promise = props.fn();
	cacheRecord[props.key] = { value: null, lastDeps: props.deps, promise };
	const result = await promise;
	if (browser) cacheRecord[props.key] = { value: result, lastDeps: props.deps, promise: null };
	return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
