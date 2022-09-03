import {
  BIP44CoinTypeNode,
  getBIP44AddressKeyDeriver
} from '@metamask/key-tree';
import {
  ethers,
  Wallet,
} from 'ethers';

export async function getSigners(provider: ethers.providers.Provider, amount: number): Promise<Wallet[]> {
    let wallets: Wallet[] = [];

    for (let i=0; i<amount; i++) {
        wallets.push(await getSigner(provider, i));
    }

    return wallets;
}

export function getAddresses(wallets: Wallet[]): string[] {
    let addresses: string[] = [];

    for (let i=0; i<wallets.length; i++) {
        addresses.push(wallets[i].address);
    }

    return addresses;
}

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