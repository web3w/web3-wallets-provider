import {
    IEthereumProvider, ProviderAccounts, RequestArguments
} from '../types'
import EventEmitter from "events";

// https://github.com/metamask/test-dapp
// https://metamask.github.io/test-dapp/
export abstract class WalletsBase extends EventEmitter implements IEthereumProvider {
    address = ""
    walletName = ""
    chainId = 0
    provider: any

    async request(args: RequestArguments) {
        return this.provider.request(args)
    };

    //ProviderAccounts
    async enable(): Promise<ProviderAccounts> {
        return this.provider.request({method: 'eth_requestAccounts'}) // enable ethereum
    }
}
