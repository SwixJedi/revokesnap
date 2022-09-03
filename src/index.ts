import { OnRpcRequestHandler } from '@metamask/snap-types';
import {
	getAddresses,
  getSigner,
  getSigners,
	notify
} from './helpers';
import {
  BigNumber,
  Contract,
  ethers,
  Wallet,
	utils
} from 'ethers';
import { ERC20 } from './constants';
import { actors } from './actors';
import { tokens } from './tokens';

export type AllowanceData = {
	account: string,
	approvals: {
		tokenContract: string,
		spender: string,
		amount: string 
	}[]
}[]

const revoke = async (params) => {
	const [account, tokenContract, spender] = params;

	// Get provider from metamask
	const provider = new ethers.providers.Web3Provider(wallet as any);
	if ((await provider.getNetwork()).name !== 'rinkeby') {
		throw new Error('networ is not Rinkeby');
	}
	// Get wallets
	const signers = await getSigners(provider, 3);

	// Find wallet for requested metamask address
	const signer = signers.find(w => w.address === account);
	if (signer === undefined) {
		throw new Error('Address not found in Metamask: '+account);
	}
	const token = new Contract(tokenContract, ERC20.abi, signer);
	await (
		await token.approve(spender, 0)
	).wait();
}

// Demo-only function to approve some accounts for presentation
const approveActors = async () => {
	let result = [];

	// Get provider from metamask
	const provider = new ethers.providers.Web3Provider(wallet as any);
	if ((await provider.getNetwork()).name !== 'rinkeby') {
		throw new Error('networ is not Rinkeby');
	}
	// Get wallets and addresses
	const wallets = await getSigners(provider, 2); // Only for 2 first addresses
	const addresses = getAddresses(wallets);
		
	// Approve addresses
	for (let i=0; i<addresses.length; i++) {
		for (let j=0; j < tokens.length; j++) {
			const tokenAddress: string = tokens[j].address;
			const token = new Contract(tokenAddress, ERC20.abi, wallets[i]);

			// Grant allowance to each actor
			for (let k=0; k<actors.length; k++) {
				const allowance = BigNumber.from("5000000000000000000");
				await (
					await token.approve(actors[k].address, allowance)
				).wait();
			}
		}
	}
}

const fetchApprovals = async () => {
	// Define container for result
	let result = [];

	// Get provider from metamask
	const provider = new ethers.providers.Web3Provider(wallet as any);
	// Get wallets
	const wallets = await getSigners(provider, 3);
	
	// Get address of wallets
	const addresses = getAddresses(wallets);

	if ((await provider.getNetwork()).name !== 'rinkeby') {
		throw new Error('networ is not Rinkeby');
	}

	// Define counters for loops
	let i: number,
		j: number,
		k: number;

		
	for (i=0; i<addresses.length; i++) {
		// Declare container for approvals for particular account
		let approvals = [];

		for (j=0; j < tokens.length; j++) {
			// Choose token
			const tokenAddress: string = tokens[j].address;
			const token = new Contract(tokenAddress, ERC20.abi, wallets[i]);

			for (k=0; k<actors.length; k++) {

				// Get allowance
				const allowance = (await token.allowance(addresses[i], actors[k].address));

				// Push entry to `approvals if there is leftover allowance
				if (allowance.gt(0)) {
					approvals.push({
						tokenContract: tokenAddress,
						spender: actors[k].address,
						amount: allowance.toString()
					});
				}
			}
		}

		// If current account has any leftover approvals push entry to `result`
		if (approvals.length > 0) {
			result.push({
				account: addresses[i],
				approvals: approvals
			})
		}
	}
	// await notify('here');

	return result;
}

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }): Promise<any> => {
  switch (request.method) {
	case 'approveActors':
		await approveActors();
		return true;

	case 'revoke':
		await revoke(request.params);
		return true;

    case 'fetchApprovals':
		return fetchApprovals();

    default:
      throw new Error('Method not found.');
  }
};
