import secrets from '../../../secrets.json'

import {Web3WalletsProvider} from "../src/index";

const seller = '0x0A56b3317eD60dC4E1027A63ffbE9df6fb102401';
(async () => {
    const wallet = new Web3WalletsProvider({address: seller, chainId: 4, privateKeys: secrets.privateKeys})
    // const addressList = await wallet.start()
    // console.log(wallet)
})()
