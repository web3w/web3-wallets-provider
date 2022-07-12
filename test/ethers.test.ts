import secrets from '../../../secrets.json'

import {WalletsPovider} from "../src/connectors/walletsPovider";
import {ethers} from "ethers";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
(async () => {
    const wallet = new WalletsPovider({address: seller, chainId: 4, privateKeys: secrets.privateKeys})
    // const addressList = await wallet.enable()
    const provider = new ethers.providers.Web3Provider(wallet).getSigner()
    console.log(await provider.getAddress())
})()
