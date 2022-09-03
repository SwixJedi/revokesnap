import { OnRpcRequestHandler } from '@metamask/snap-types';
import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver
} from '@metamask/key-tree';
import {
  BigNumber,
  Contract,
  ethers,
  Wallet,
	utils
} from 'ethers';
import { ERC20, RETURN_FAIL } from './constants';

export async function getSigner(provider: ethers.providers.Provider, index: number): Promise<Wallet> {
  // Metamask uses default HD derivation path
  // https://metamask.zendesk.com/hc/en-us/articles/360060331752-Importing-a-seed-phrase-from-another-wallet-software-derivation-path
  const ethereumNode = (await wallet.request({
    method: 'snap_getBip44Entropy_60',
  })) as unknown as BIP44CoinTypeNode;
  const deriveEthereumAccount = await getBIP44AddressKeyDeriver(ethereumNode);
  // A bug:
  // The current public version of @metamask/key-tree's derive function returns the private key and chain code in a single buffer
  // Ether.js also accepts a 64 byte buffer without errors and returns wrong keys
  // Related issue: https://github.com/ethers-io/ethers.js/issues/2926
  // TODO(ritave): Update to newest key-tree when available and use deriveEthereumAccount(0).privateKey
  const mainAccountKey = (await deriveEthereumAccount(index)).privateKey;
  return new Wallet(mainAccountKey, provider);
}

export async function notify(text: string) {
	await wallet.request({
		method: 'snap_notify',
		params: [
			{
				type: 'native',
				message: text,
			},
		],
	});
}

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
			await notify('1');

			// Get provider from metamask
			const provider = new ethers.providers.Web3Provider(wallet as any);
			// Create a wallet from account with given index
			const wallet0 = await getSigner(provider, 0);
			// Get address of created wallet
			const address0 = wallet0.address;
			await notify('2');

			if ((await provider.getNetwork()).name !== 'rinkeby') {
				return RETURN_FAIL;
			}
			await notify('3');

			const daiAddress: string = '0x6a9865ade2b6207daac49f8bcba9705deb0b0e6d';

			const DAI = new Contract(daiAddress, ERC20.abi, wallet0);
			const allowance: string = await DAI.allowance('0x246747844aa840352456ccb4e8ec2b5498ad08f2','0x8f668162a4c20599d02148a963752889ae3094df');

			// Show request for confirmation
      return await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello, ${origin}!`,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              allowance
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};
